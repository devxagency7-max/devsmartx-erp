import { useState, ReactNode } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { WizardProgress } from './WizardProgress';
import { FinancialWizardHeader } from './FinancialWizardHeader';
import { WorkflowCancelDialog } from './WorkflowCancelDialog';
import type { FinancialWorkflowDefinition, WorkflowStepId } from '../types/workflow.types';

interface FinancialWizardLayoutProps {
  definition: FinancialWorkflowDefinition;
  currentStepId: WorkflowStepId;
  isConfirmation: boolean;
  onExitRequest: () => void;
  children: ReactNode;
}

export function FinancialWizardLayout({
  definition,
  currentStepId,
  isConfirmation,
  onExitRequest,
  children,
}: FinancialWizardLayoutProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const indicatorSteps = definition.steps.filter((s) => s.showInIndicator);

  const handleCancelRequest = () => {
    if (isConfirmation) {
      onExitRequest();
    } else {
      setShowCancelDialog(true);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <FinancialWizardHeader
            definition={definition}
            onCancel={handleCancelRequest}
          />

          {!isConfirmation && (
            <WizardProgress steps={indicatorSteps} currentStepId={currentStepId} />
          )}

          <div className="min-h-[320px]">{children}</div>
        </CardContent>
      </Card>

      <WorkflowCancelDialog
        open={showCancelDialog}
        onConfirm={() => {
          setShowCancelDialog(false);
          onExitRequest();
        }}
        onDismiss={() => setShowCancelDialog(false)}
      />
    </>
  );
}
