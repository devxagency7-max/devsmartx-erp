# Future Expansion — Financial Module

**Status:** APPROVED (reserved design decisions)  
**Last Updated:** 2026-08-02

---

## Purpose

This document captures design decisions that are deliberately deferred. Each item has been considered and has a reserved slot in the architecture — but implementation is blocked until the core transaction engine is stable and used in production.

Nothing in this document requires code today. It exists so that future developers don't accidentally paint themselves into a corner.

---

## 1. Accounts Receivable (AR) / Invoicing

**What it is:** Formal invoices sent to clients with payment tracking.

**Design intent:**
- An `Invoice` entity will link to one or more `REVENUE` transactions via `referenceId`
- Invoice status: `DRAFT → SENT → PARTIALLY_PAID → PAID → OVERDUE → CANCELLED`
- Payment records against an invoice create `REVENUE` transactions automatically via the engine
- `IInvoiceService` will be a new service interface, not a modification to `ITransactionEngine`

**Blocker:** Requires CRM module (client entity) to be implemented first.

---

## 2. Accounts Payable (AP) / Bill Management

**What it is:** Bills received from vendors, tracked until paid.

**Design intent:**
- A `Bill` entity links to one or more `EXPENSE` transactions
- Bill status mirrors Invoice status
- Payment schedules generate `PENDING` transactions automatically
- `IBillService` is a separate interface

**Blocker:** Requires vendor/supplier entity (CRM module or standalone).

---

## 3. Multi-Currency Conversion

**What it is:** Automatic conversion when reporting across currencies.

**Design intent:**
- Exchange rates stored as a `CurrencyRate` entity: `{ from, to, rate, effectiveDate, source }`
- `ICurrencyConverter` interface: `convert(money: Money, toCurrency: Currency, date: Date): Money`
- Reports request a "reporting currency" and all amounts are converted at the transaction date's rate
- Original transaction amounts are never modified — conversion is presentation-only

**Blocker:** Need an exchange rate data source (manual entry or third-party API).

---

## 4. Budget Management

**What it is:** Set spending limits per category per period and track actuals vs. budget.

**Design intent:**
- `Budget` entity: `{ categoryId, period, limit: Money, companyId }`
- `IBudgetService` provides `getBudgetVsActual(categoryId, period)` → `{ budget: Money, actual: Money, variance: Money }`
- Actual is derived from the transaction engine (no stored "spent" field)
- Budget alerts trigger when actual exceeds X% of budget (configurable threshold)

**Blocker:** Category system must be stable and in production use first.

---

## 5. Financial Reports

**What it is:** Standard financial statements generated from transaction history.

**Planned reports:**

| Report | Description |
|--------|-------------|
| Profit & Loss (P&L) | Revenue vs. expenses over a period |
| Cash Flow Statement | Inflows and outflows by period |
| Balance Sheet | Assets, liabilities, equity snapshot |
| Trial Balance | All accounts with debit/credit totals |
| Category Breakdown | Spending/income by category tree |
| Wallet Reconciliation | Ledger vs. bank statement comparison |

All reports are derived from transactions — no report-specific stored aggregates.

**Blocker:** Transaction engine must be complete and production-tested.

---

## 6. Payroll Integration

**What it is:** Automated salary transaction generation from a payroll schedule.

**Design intent:**
- `PayrollRun` entity groups multiple `SALARY` transactions
- Single-click posting creates all salary transactions in a batch
- Payroll history is queryable separately from regular expense history
- Integration with external payroll systems via webhook (future)

**Blocker:** Employee management module.

---

## 7. Loan Tracking

**What it is:** Full loan lifecycle — disbursement, amortization schedule, repayment tracking.

**Design intent:**
- `Loan` entity: principal, interest rate, term, repayment schedule
- Each repayment creates a `LOAN_REPAYMENT` transaction (already supported)
- `ILoanService` generates the amortization schedule and auto-creates `PENDING` repayment transactions on due dates
- Outstanding balance = principal - Σ(completed LOAN_REPAYMENT transactions)

**Blocker:** Core transaction engine only. Can implement relatively early.

---

## 8. Tax Calculations

**What it is:** Tax (VAT/GST) tracking on transactions.

**Design intent:**
- `taxAmount: Money` field added to `Transaction` entity
- Tax rate stored on `TransactionCategory` (e.g., VAT-14%)
- Tax reporting: sum of `taxAmount` over a period per tax type
- No integration with external tax authorities in scope (manual filing)

**Blocker:** Tax requirements vary by country — implement after understanding tenant's jurisdiction needs.

---

## 9. Domain Events

The following domain events are reserved for future implementation. When fired, they will enable notifications, automation, and third-party integrations without coupling to the transaction engine.

| Event | Trigger |
|-------|---------|
| `TransactionCompleted` | Transaction posted to COMPLETED |
| `TransactionCancelled` | Transaction status → CANCELLED |
| `LowBalanceAlert` | Wallet balance falls below threshold |
| `InvoicePaid` | Invoice status → PAID |
| `InvoiceOverdue` | Invoice due date passed without payment |
| `BudgetExceeded` | Category spend > budget limit |
| `LoanPaymentDue` | Loan repayment due in N days |
| `RecurringTransactionFired` | Recurring template generates new transaction |

Events are published by the service layer, consumed by a separate notification/automation module.

---

## 10. Expansion Principles

When implementing any item from this document:

1. **Never modify `ITransactionEngine`** to accommodate a new feature. Add a new service interface instead.
2. **Never add a stored balance field** to any entity. All balances remain derived.
3. **All new transaction types** must be added to the `TransactionType` enum before implementation begins.
4. **Backwards compatibility**: historical transactions must display correctly in new reports — never assume they have new fields.
5. **Write the domain first**: entity, value objects, and interfaces before any UI or Firebase code.
