import { useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/core/firebase/firestore';

interface PartnerRow { id: string; name: string; code: string; }
interface TxRow { id: string; ref: string; description: string; amount: number; currency: string; date: string; contribs: { personId: string; personName: string; amount: number; equalShare?: number }[]; allPartners: { personId: string; personName: string }[]; }
interface LedgerRow { id: string; personId: string; direction: string; amount: number; reason: string; transactionId: string | null; }

function generateRef() {
  return 'LDG-' + Date.now().toString(36).toUpperCase();
}

export default function PartnerMigrationPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [txs, setTxs] = useState<TxRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function addLog(msg: string) {
    setLog(prev => [...prev, msg]);
  }

  async function loadData() {
    setLoading(true);
    setLog([]);
    try {
      // Partners
      const pSnap = await getDocs(collection(db, 'partners'));
      const pRows: PartnerRow[] = pSnap.docs.map(d => ({ id: d.id, name: (d.data() as any).name, code: (d.data() as any).code }));
      setPartners(pRows);
      addLog(`✓ Partners: ${pRows.map(p => `${p.name} (${p.id})`).join(', ')}`);

      // Transactions
      const tSnap = await getDocs(collection(db, 'transactions'));
      const tRows: TxRow[] = [];
      tSnap.forEach(d => {
        const data = d.data() as any;
        if (data.partnerContributions && data.partnerContributions.length > 0) {
          tRows.push({
            id: d.id,
            ref: data.referenceNumber,
            description: data.description || data.referenceNumber,
            amount: data.amount,
            currency: data.currency,
            date: data.transactionDate,
            contribs: data.partnerContributions ?? [],
            allPartners: data.allPartners ?? [],
          });
        }
      });
      setTxs(tRows);
      addLog(`✓ Transactions with contributions: ${tRows.length}`);
      tRows.forEach(tx => {
        addLog(`  TX ${tx.ref} (${tx.id}): amount=${tx.amount}, contribs=${JSON.stringify(tx.contribs)}, allPartners=${JSON.stringify(tx.allPartners)}`);
      });

      // Ledger
      const lSnap = await getDocs(collection(db, 'personLedger'));
      const lRows: LedgerRow[] = lSnap.docs.map(d => {
        const data = d.data() as any;
        return { id: d.id, personId: data.personId, direction: data.direction, amount: data.amount, reason: data.reason, transactionId: data.transactionId ?? null };
      });
      setLedger(lRows);
      addLog(`✓ Existing ledger entries: ${lRows.length}`);
      lRows.forEach(e => addLog(`  Ledger ${e.id}: personId=${e.personId} dir=${e.direction} amt=${e.amount} txId=${e.transactionId}`));
    } catch (e: any) {
      addLog('ERROR: ' + e.message);
    }
    setLoading(false);
  }

  async function clearAllLedger() {
    if (!window.confirm(`هتمسح ${ledger.length} entries — متأكد؟`)) return;
    setLoading(true);
    let deleted = 0;
    for (const e of ledger) {
      await deleteDoc(doc(db, 'personLedger', e.id));
      deleted++;
    }
    addLog(`🗑 Deleted ${deleted} ledger entries`);
    await loadData();
    setLoading(false);
  }

  async function runMigration() {
    setLoading(true);
    let written = 0;
    let skipped = 0;

    for (const tx of txs) {
      const existingForTx = ledger.filter(e => e.transactionId === tx.id);
      const existingPersonIds = new Set(existingForTx.map(e => e.personId));

      const totalPartners = tx.allPartners.length || tx.contribs.length;
      const equalShare = tx.contribs[0]?.equalShare
        ?? Math.round((tx.amount / totalPartners) * 100) / 100;

      addLog(`\nProcessing TX ${tx.ref}: equalShare=${equalShare}, totalPartners=${totalPartners}`);

      // Partners who paid
      for (const c of tx.contribs) {
        if (existingPersonIds.has(c.personId)) {
          addLog(`  SKIP ${c.personName} (${c.personId}) — ledger entry exists`);
          skipped++;
          continue;
        }
        const diff = Math.round((c.amount - equalShare) * 100) / 100;
        if (Math.abs(diff) < 0.01) {
          addLog(`  SKIP ${c.personName} — settled (paid exactly equalShare)`);
          skipped++;
          continue;
        }
        const direction = diff < 0 ? 'PERSON_OWES_COMPANY' : 'COMPANY_OWES_PERSON';
        const amount = Math.abs(diff);
        const data = {
          personId: c.personId,
          direction,
          amount,
          currency: tx.currency,
          reason: direction === 'PERSON_OWES_COMPANY' ? `نصيب في مصروف: ${tx.description}` : `مساهمة في مصروف: ${tx.description}`,
          categoryId: null,
          transactionId: tx.id,
          relatedProjectId: null,
          reference: generateRef(),
          date: tx.date,
          status: 'Pending',
          notes: `${tx.ref} — دفع ${c.personName} ${c.amount}، نصيبه ${equalShare}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'personLedger'), data);
        addLog(`  WROTE ${c.personName} (${c.personId}): ${direction} ${amount}`);
        written++;
      }

      // Partners who didn't pay (in allPartners only)
      const paidIds = new Set(tx.contribs.map(c => c.personId));
      for (const p of tx.allPartners) {
        if (paidIds.has(p.personId)) continue;
        if (existingPersonIds.has(p.personId)) {
          addLog(`  SKIP ${p.personName} (${p.personId}) — ledger entry exists`);
          skipped++;
          continue;
        }
        const data = {
          personId: p.personId,
          direction: 'PERSON_OWES_COMPANY',
          amount: equalShare,
          currency: tx.currency,
          reason: `نصيب في مصروف: ${tx.description}`,
          categoryId: null,
          transactionId: tx.id,
          relatedProjectId: null,
          reference: generateRef(),
          date: tx.date,
          status: 'Pending',
          notes: `${tx.ref} — نصيب ${p.personName} ${equalShare} — لم يدفع شيئاً`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'personLedger'), data);
        addLog(`  WROTE ${p.personName} (${p.personId}): PERSON_OWES_COMPANY ${equalShare}`);
        written++;
      }
    }

    addLog(`\n✅ Done: ${written} written, ${skipped} skipped`);
    await loadData(); // reload
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Partner Ledger Migration</h1>
      <div className="flex gap-3 flex-wrap">
        <button onClick={loadData} disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          1. Load Data
        </button>
        <button onClick={clearAllLedger} disabled={loading || ledger.length === 0} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
          2. Clear All Ledger ({ledger.length})
        </button>
        <button onClick={runMigration} disabled={loading || txs.length === 0} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50">
          3. Run Migration
        </button>
      </div>

      {partners.length > 0 && (
        <div>
          <h2 className="font-semibold mb-1">Partners ({partners.length})</h2>
          <table className="w-full text-xs border">
            <thead><tr className="bg-muted"><th className="p-2 text-start">ID</th><th className="p-2 text-start">Name</th><th className="p-2 text-start">Code</th></tr></thead>
            <tbody>{partners.map(p => <tr key={p.id} className="border-t"><td className="p-2 font-mono">{p.id}</td><td className="p-2">{p.name}</td><td className="p-2">{p.code}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {log.length > 0 && (
        <div>
          <h2 className="font-semibold mb-1">Log</h2>
          <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">{log.join('\n')}</pre>
        </div>
      )}
    </div>
  );
}
