import { useNavigate } from 'react-router-dom';
import { useFinancialWizard } from '@/features/finance/workflows/shared/hooks/useFinancialWizard';
import { FinancialWizardLayout } from '@/features/finance/workflows/shared/components/FinancialWizardLayout';
import { WorkflowCompleteScreen } from '@/features/finance/workflows/shared/components/WorkflowCompleteScreen';
import { EXPENSE_WORKFLOW } from '@/features/finance/workflows/shared/config/WorkflowRegistry';
import { ROUTE_PATHS } from '@/app/router/constants';
import { StepWallet } from './wizard/StepWallet';
import { StepPayment } from './wizard/StepPayment';
import { StepDetails } from './wizard/StepDetails';
import { StepAttachments } from './wizard/StepAttachments';
import { StepPartnerContributions } from './wizard/StepPartnerContributions';
import { StepReview } from './wizard/StepReview';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';

export function ExpenseWizard() {
  const navigate = useNavigate();
  const wizard = useFinancialWizard(EXPENSE_WORKFLOW);

  const {
    currentStepId,
    data,
    createdTransactionId,
    isConfirmation,
    isFirstStep,
    next,
    prev,
    patch,
    setCreatedId,
    reset,
  } = wizard;

  function handleNext(partial: Partial<WorkflowFormData>) {
    patch(partial);
    next();
  }

  function handleSuccess(id: string) {
    setCreatedId(id);
    next();
  }

  function handleExit() {
    navigate(ROUTE_PATHS.EXPENSES);
  }

  function handleCreateAnother() {
    reset();
  }

  const stepProps = {
    data,
    isFirstStep,
    onNext: handleNext,
    onBack: prev,
    onCancel: handleExit,
  };

  return (
    <FinancialWizardLayout
      definition={EXPENSE_WORKFLOW}
      currentStepId={currentStepId}
      isConfirmation={isConfirmation}
      onExitRequest={handleExit}
    >
      {currentStepId === 'paymentSource' && <StepWallet      {...stepProps} />}
      {currentStepId === 'payment'      && <StepPayment     {...stepProps} />}
      {currentStepId === 'details'      && <StepDetails     {...stepProps} />}
      {currentStepId === 'partnerContributions' && <StepPartnerContributions {...stepProps} />}
      {currentStepId === 'attachments'  && <StepAttachments {...stepProps} />}
      {currentStepId === 'review'       && (
        <StepReview
          data={data}
          isFirstStep={isFirstStep}
          onSuccess={handleSuccess}
          onBack={prev}
          onCancel={handleExit}
        />
      )}
      {currentStepId === 'confirmation' && (
        <WorkflowCompleteScreen
          definition={EXPENSE_WORKFLOW}
          transactionId={createdTransactionId}
          onCreateAnother={handleCreateAnother}
        />
      )}
    </FinancialWizardLayout>
  );
}
