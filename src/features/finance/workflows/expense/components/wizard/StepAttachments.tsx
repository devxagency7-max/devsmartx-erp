import { useTranslation } from 'react-i18next';
import { FileUploader } from '@/shared/upload';
import type { UploadResult } from '@/shared/upload';
import { WizardNavigation } from '@/features/finance/workflows/shared/components/WizardNavigation';
import type { WorkflowFormData } from '@/features/finance/workflows/shared/types/workflow.types';

interface StepAttachmentsProps {
  data: WorkflowFormData;
  isFirstStep: boolean;
  onNext: (patch: Partial<WorkflowFormData>) => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepAttachments({ data, isFirstStep, onNext, onBack, onCancel }: StepAttachmentsProps) {
  const { t } = useTranslation();

  function handleUploadComplete(results: UploadResult[]) {
    onNext({ attachments: [...data.attachments, ...results] });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        {t('expense.wizard.attachmentsHint')}
      </p>

      <FileUploader
        onUploadComplete={handleUploadComplete}
        folder="expenses"
        label={t('upload.dropzone')}
        config={{ maxFiles: 5, maxFileSizeBytes: 10 * 1024 * 1024 }}
      />

      {data.attachments.length > 0 && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {data.attachments.length} {t('expense.wizard.filesAttached')}
        </p>
      )}

      <WizardNavigation
        isFirstStep={isFirstStep}
        isLastDataStep={false}
        isSubmitting={false}
        submitLabelKey="expense.wizard.createExpense"
        onBack={onBack}
        onCancel={onCancel}
        onNext={() => onNext({})}
      />
    </div>
  );
}
