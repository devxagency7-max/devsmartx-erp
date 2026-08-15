import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal, Eye, Pencil, XCircle, CheckCircle,
  ThumbsDown, RotateCcw, Copy, Download, Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { ROUTE_PATHS } from '@/app/router/constants';
import { useTransactionActions } from '../hooks/useTransactionActions';
import type { TransactionRecord } from '../types/transaction.types';

interface TransactionActionsMenuProps {
  transaction: TransactionRecord;
}

export function TransactionActionsMenu({ transaction: tx }: TransactionActionsMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cancel, duplicate, remove, isLoadingId } = useTransactionActions();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const isBusy = isLoadingId === tx.id;

  const isTerminal =
    tx.status === TransactionStatus.Completed ||
    tx.status === TransactionStatus.Cancelled ||
    tx.status === TransactionStatus.Rejected;

  async function handleCancel() {
    const ok = await cancel(tx.id);
    if (ok) setConfirmCancelOpen(false);
  }

  async function handleDelete() {
    const ok = await remove(tx.id);
    if (ok) setConfirmDeleteOpen(false);
  }

  const isDeletable =
    tx.status === TransactionStatus.Cancelled ||
    tx.status === TransactionStatus.Draft;

  async function handleDuplicate() {
    const newId = await duplicate(tx.id);
    if (newId) navigate(`${ROUTE_PATHS.TRANSACTIONS}/${newId}/edit`);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isBusy}>
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => navigate(`${ROUTE_PATHS.TRANSACTIONS}/${tx.id}`)}
          >
            <Eye size={14} className="mr-2" />
            {t('transaction.actions.view')}
          </DropdownMenuItem>

          {!isTerminal && (
            <DropdownMenuItem
              onClick={() => navigate(`${ROUTE_PATHS.TRANSACTIONS}/${tx.id}/edit`)}
            >
              <Pencil size={14} className="mr-2" />
              {t('transaction.actions.edit')}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Placeholder actions */}
          <DropdownMenuItem disabled>
            <CheckCircle size={14} className="mr-2 text-emerald-600" />
            {t('transaction.actions.approve')}
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <ThumbsDown size={14} className="mr-2 text-red-500" />
            {t('transaction.actions.reject')}
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <RotateCcw size={14} className="mr-2" />
            {t('transaction.actions.reverse')}
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Download size={14} className="mr-2" />
            {t('transaction.actions.export')}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy size={14} className="mr-2" />
            {t('transaction.actions.duplicate')}
          </DropdownMenuItem>

          {!isTerminal && (
            <DropdownMenuItem
              onClick={() => setConfirmCancelOpen(true)}
              className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
            >
              <XCircle size={14} className="mr-2" />
              {t('transaction.actions.cancel')}
            </DropdownMenuItem>
          )}

          {isDeletable && (
            <DropdownMenuItem
              onClick={() => setConfirmDeleteOpen(true)}
              className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
            >
              <Trash2 size={14} className="mr-2" />
              حذف نهائي
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('transaction.actions.confirmCancel')}</DialogTitle>
            <DialogDescription>{t('transaction.actions.confirmCancelDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancelOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isBusy}>
              {t('transaction.actions.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المعاملة نهائياً</DialogTitle>
            <DialogDescription>
              هيتحذف {tx.referenceNumber} بشكل نهائي ومش هيرجع. متأكد؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isBusy}>
              <Trash2 size={14} className="mr-1" /> حذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
