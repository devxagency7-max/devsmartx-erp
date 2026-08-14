import type { TransactionType } from '@/features/finance/domain/enums/TransactionType';
import type { LucideIcon } from 'lucide-react';
import type { TransactionDTO } from '@/features/finance/application/queries/TransactionQueries';
import type { UploadResult } from '@/shared/upload';

// ─── Core field shape shared by all workflows ────────────────────────────────

export interface WorkflowFormData {
  categoryId: string;
  categoryName: string;
  paymentSourceId: string;
  paymentSourceName: string;
  currency: string;
  paymentMethod: string;
  amount: number | '';
  transactionDate: string;
  description: string;
  notes: string;
  attachments: UploadResult[];
  /** Destination payment source for Transfer workflows */
  destinationPaymentSourceId?: string;
  destinationPaymentSourceName?: string;
  /** Partner for PartnerContribution workflows */
  partnerId?: string;
  partnerName?: string;
  /** Original transaction for Refund workflows */
  originalTransactionId?: string;
  /** Workflow-specific extra fields (e.g. vendor for Expense) */
  extra: Record<string, string | number | boolean>;
}

// ─── Step definition ──────────────────────────────────────────────────────────

export type WorkflowStepId =
  | 'category'
  | 'paymentSource'
  | 'destinationPaymentSource'
  | 'partner'
  | 'payment'
  | 'details'
  | 'attachments'
  | 'review'
  | 'confirmation';

export interface FinancialWorkflowStep {
  readonly id: WorkflowStepId;
  /** i18n key for label */
  readonly labelKey: string;
  /** Whether this step appears in the progress indicator */
  readonly showInIndicator: boolean;
}

// ─── Workflow result ──────────────────────────────────────────────────────────

export type WorkflowOutcome = 'success' | 'cancelled' | 'failed';

export interface FinancialWorkflowResult {
  readonly outcome: WorkflowOutcome;
  readonly transactionId?: string;
  readonly errorMessage?: string;
}

// ─── State held per active workflow ──────────────────────────────────────────

export interface FinancialWorkflowState {
  currentStepId: WorkflowStepId;
  data: WorkflowFormData;
  createdTransactionId: string;
  isSubmitting: boolean;
}

// ─── Workflow definition (registered once per transaction type) ───────────────

export interface FinancialWorkflowDefinition {
  readonly id: string;
  readonly transactionType: TransactionType;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly icon: LucideIcon;
  readonly color: string;
  readonly steps: ReadonlyArray<FinancialWorkflowStep>;
  readonly active: boolean;
  /** i18n key for the "create" button on the review step */
  readonly submitLabelKey: string;
  /** i18n key for success title */
  readonly successTitleKey: string;
  /** i18n key for success description */
  readonly successDescriptionKey: string;
  /** Route to the details page (with :id placeholder) */
  readonly detailsRoute: string;
  /** QueryKey to invalidate on success */
  readonly queryKey: readonly string[];
  /** Extra fields to include in this workflow's form data defaults */
  readonly extraDefaults: Record<string, string | number | boolean>;
  /** Review rows beyond the standard set. Each row is a {labelKey, getValue(data)} pair */
  readonly extraReviewRows?: ReadonlyArray<{
    labelKey: string;
    getValue: (data: WorkflowFormData) => string;
  }>;
}

// ─── Submit function signature ────────────────────────────────────────────────

export type WorkflowSubmitFn = (
  data: WorkflowFormData,
  actorId: string,
) => Promise<TransactionDTO>;
