import { ShoppingCart, TrendingUp, ArrowLeftRight, Users, RotateCcw, SlidersHorizontal, Wallet } from 'lucide-react';
import { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import { ROUTE_PATHS } from '@/app/router/constants';
import type { FinancialWorkflowDefinition } from '../types/workflow.types';

export const EXPENSE_WORKFLOW: FinancialWorkflowDefinition = {
  id: 'expense',
  transactionType: TransactionType.Expense,
  titleKey: 'expense.title',
  descriptionKey: 'expense.description',
  icon: ShoppingCart,
  color: 'hsl(var(--destructive))',
  active: true,
  submitLabelKey: 'expense.wizard.createExpense',
  successTitleKey: 'expense.wizard.successTitle',
  successDescriptionKey: 'expense.wizard.successDescription',
  detailsRoute: ROUTE_PATHS.EXPENSE_DETAILS,
  queryKey: ['expenses'],
  extraDefaults: { vendor: '' },
  steps: [
    { id: 'category',     labelKey: 'expense.wizard.steps.category',    showInIndicator: true  },
    { id: 'paymentSource', labelKey: 'expense.wizard.steps.paymentSource', showInIndicator: true  },
    { id: 'payment',      labelKey: 'expense.wizard.steps.payment',      showInIndicator: true  },
    { id: 'details',      labelKey: 'expense.wizard.steps.details',      showInIndicator: true  },
    { id: 'attachments',  labelKey: 'expense.wizard.steps.attachments',  showInIndicator: true  },
    { id: 'review',       labelKey: 'expense.wizard.steps.review',       showInIndicator: true  },
    { id: 'confirmation', labelKey: 'expense.wizard.steps.confirmation', showInIndicator: false },
  ],
  extraReviewRows: [
    {
      labelKey: 'expense.fields.vendor',
      getValue: (data) => (data.extra.vendor as string) || '—',
    },
  ],
};

// ─── Placeholder definitions (inactive) ──────────────────────────────────────
// Each will be activated as its own phase is implemented.

export const REVENUE_WORKFLOW: FinancialWorkflowDefinition = {
  id: 'revenue',
  transactionType: TransactionType.Revenue,
  titleKey: 'revenue.title',
  descriptionKey: 'revenue.description',
  icon: TrendingUp,
  color: 'hsl(142 76% 36%)',
  active: true,
  submitLabelKey: 'revenue.wizard.createRevenue',
  successTitleKey: 'revenue.wizard.successTitle',
  successDescriptionKey: 'revenue.wizard.successDescription',
  detailsRoute: ROUTE_PATHS.REVENUE_DETAILS,
  queryKey: ['revenues'],
  extraDefaults: { source: '', relatedProject: '' },
  steps: [
    { id: 'category',     labelKey: 'revenue.wizard.steps.category',    showInIndicator: true  },
    { id: 'paymentSource', labelKey: 'revenue.wizard.steps.paymentSource', showInIndicator: true  },
    { id: 'payment',      labelKey: 'revenue.wizard.steps.payment',      showInIndicator: true  },
    { id: 'details',      labelKey: 'revenue.wizard.steps.details',      showInIndicator: true  },
    { id: 'attachments',  labelKey: 'revenue.wizard.steps.attachments',  showInIndicator: true  },
    { id: 'review',       labelKey: 'revenue.wizard.steps.review',       showInIndicator: true  },
    { id: 'confirmation', labelKey: 'revenue.wizard.steps.confirmation', showInIndicator: false },
  ],
  extraReviewRows: [
    {
      labelKey: 'revenue.fields.source',
      getValue: (data) => (data.extra.source as string) || '—',
    },
    {
      labelKey: 'revenue.fields.relatedProject',
      getValue: (data) => (data.extra.relatedProject as string) || '—',
    },
  ],
};

const TRANSFER_WORKFLOW: FinancialWorkflowDefinition = {
  id: 'transfer',
  transactionType: TransactionType.Transfer,
  titleKey: 'workflow.transfer.title',
  descriptionKey: 'workflow.transfer.description',
  icon: ArrowLeftRight,
  color: 'hsl(var(--primary))',
  active: false,
  submitLabelKey: 'workflow.transfer.submit',
  successTitleKey: 'workflow.transfer.successTitle',
  successDescriptionKey: 'workflow.transfer.successDescription',
  detailsRoute: ROUTE_PATHS.TRANSACTION_DETAILS ?? '/finance/transactions/:id',
  queryKey: ['transfers'],
  extraDefaults: {},
  steps: [
    { id: 'paymentSource',            labelKey: 'workflow.steps.paymentSource',            showInIndicator: true  },
    { id: 'destinationPaymentSource', labelKey: 'workflow.steps.destinationPaymentSource', showInIndicator: true  },
    { id: 'payment',           labelKey: 'workflow.steps.payment',           showInIndicator: true  },
    { id: 'details',           labelKey: 'workflow.steps.details',           showInIndicator: true  },
    { id: 'review',            labelKey: 'workflow.steps.review',            showInIndicator: true  },
    { id: 'confirmation',      labelKey: 'workflow.steps.confirmation',      showInIndicator: false },
  ],
};

const PARTNER_CONTRIBUTION_WORKFLOW: FinancialWorkflowDefinition = {
  id: 'partnerContribution',
  transactionType: TransactionType.PartnerContribution,
  titleKey: 'workflow.partnerContribution.title',
  descriptionKey: 'workflow.partnerContribution.description',
  icon: Users,
  color: 'hsl(var(--secondary))',
  active: false,
  submitLabelKey: 'workflow.partnerContribution.submit',
  successTitleKey: 'workflow.partnerContribution.successTitle',
  successDescriptionKey: 'workflow.partnerContribution.successDescription',
  detailsRoute: ROUTE_PATHS.TRANSACTION_DETAILS ?? '/finance/transactions/:id',
  queryKey: ['partnerContributions'],
  extraDefaults: {},
  steps: [
    { id: 'partner',      labelKey: 'workflow.steps.partner',      showInIndicator: true  },
    { id: 'paymentSource', labelKey: 'workflow.steps.paymentSource', showInIndicator: true  },
    { id: 'payment',      labelKey: 'workflow.steps.payment',      showInIndicator: true  },
    { id: 'details',      labelKey: 'workflow.steps.details',      showInIndicator: true  },
    { id: 'review',       labelKey: 'workflow.steps.review',       showInIndicator: true  },
    { id: 'confirmation', labelKey: 'workflow.steps.confirmation', showInIndicator: false },
  ],
};

const REFUND_WORKFLOW: FinancialWorkflowDefinition = {
  id: 'refund',
  transactionType: TransactionType.Refund,
  titleKey: 'workflow.refund.title',
  descriptionKey: 'workflow.refund.description',
  icon: RotateCcw,
  color: 'hsl(var(--warning))',
  active: false,
  submitLabelKey: 'workflow.refund.submit',
  successTitleKey: 'workflow.refund.successTitle',
  successDescriptionKey: 'workflow.refund.successDescription',
  detailsRoute: ROUTE_PATHS.TRANSACTION_DETAILS ?? '/finance/transactions/:id',
  queryKey: ['refunds'],
  extraDefaults: {},
  steps: [
    { id: 'category',     labelKey: 'workflow.steps.category',    showInIndicator: true  },
    { id: 'paymentSource', labelKey: 'workflow.steps.paymentSource', showInIndicator: true  },
    { id: 'payment',      labelKey: 'workflow.steps.payment',      showInIndicator: true  },
    { id: 'details',      labelKey: 'workflow.steps.details',      showInIndicator: true  },
    { id: 'review',       labelKey: 'workflow.steps.review',       showInIndicator: true  },
    { id: 'confirmation', labelKey: 'workflow.steps.confirmation', showInIndicator: false },
  ],
};

const ADJUSTMENT_WORKFLOW: FinancialWorkflowDefinition = {
  id: 'adjustment',
  transactionType: TransactionType.Adjustment,
  titleKey: 'workflow.adjustment.title',
  descriptionKey: 'workflow.adjustment.description',
  icon: SlidersHorizontal,
  color: 'hsl(var(--muted-foreground))',
  active: false,
  submitLabelKey: 'workflow.adjustment.submit',
  successTitleKey: 'workflow.adjustment.successTitle',
  successDescriptionKey: 'workflow.adjustment.successDescription',
  detailsRoute: ROUTE_PATHS.TRANSACTION_DETAILS ?? '/finance/transactions/:id',
  queryKey: ['adjustments'],
  extraDefaults: {},
  steps: [
    { id: 'category',     labelKey: 'workflow.steps.category',    showInIndicator: true  },
    { id: 'paymentSource', labelKey: 'workflow.steps.paymentSource', showInIndicator: true  },
    { id: 'details',      labelKey: 'workflow.steps.details',      showInIndicator: true  },
    { id: 'review',       labelKey: 'workflow.steps.review',       showInIndicator: true  },
    { id: 'confirmation', labelKey: 'workflow.steps.confirmation', showInIndicator: false },
  ],
};

const OPENING_BALANCE_WORKFLOW: FinancialWorkflowDefinition = {
  id: 'openingBalance',
  transactionType: TransactionType.OpeningBalance,
  titleKey: 'workflow.openingBalance.title',
  descriptionKey: 'workflow.openingBalance.description',
  icon: Wallet,
  color: 'hsl(var(--accent))',
  active: false,
  submitLabelKey: 'workflow.openingBalance.submit',
  successTitleKey: 'workflow.openingBalance.successTitle',
  successDescriptionKey: 'workflow.openingBalance.successDescription',
  detailsRoute: ROUTE_PATHS.TRANSACTION_DETAILS ?? '/finance/transactions/:id',
  queryKey: ['openingBalances'],
  extraDefaults: {},
  steps: [
    { id: 'paymentSource', labelKey: 'workflow.steps.paymentSource', showInIndicator: true  },
    { id: 'details',      labelKey: 'workflow.steps.details',      showInIndicator: true  },
    { id: 'review',       labelKey: 'workflow.steps.review',       showInIndicator: true  },
    { id: 'confirmation', labelKey: 'workflow.steps.confirmation', showInIndicator: false },
  ],
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const WORKFLOW_REGISTRY: ReadonlyArray<FinancialWorkflowDefinition> = [
  EXPENSE_WORKFLOW,
  REVENUE_WORKFLOW,
  TRANSFER_WORKFLOW,
  PARTNER_CONTRIBUTION_WORKFLOW,
  REFUND_WORKFLOW,
  ADJUSTMENT_WORKFLOW,
  OPENING_BALANCE_WORKFLOW,
] as const;

export function getWorkflowById(id: string): FinancialWorkflowDefinition | undefined {
  return WORKFLOW_REGISTRY.find((w) => w.id === id);
}

export function getActiveWorkflows(): ReadonlyArray<FinancialWorkflowDefinition> {
  return WORKFLOW_REGISTRY.filter((w) => w.active);
}
