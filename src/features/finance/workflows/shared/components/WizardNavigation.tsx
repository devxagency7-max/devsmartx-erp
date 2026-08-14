import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface WizardNavigationProps {
  isFirstStep: boolean;
  isLastDataStep: boolean;
  isSubmitting: boolean;
  submitLabelKey: string;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  nextDisabled?: boolean;
}

export function WizardNavigation({
  isFirstStep,
  isLastDataStep,
  isSubmitting,
  submitLabelKey,
  onBack,
  onNext,
  onCancel,
  nextDisabled = false,
}: WizardNavigationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Button>
        )}
        {isFirstStep && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
        )}
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || isSubmitting}
        size="sm"
      >
        {isLastDataStep ? t(submitLabelKey) : t('common.next')}
      </Button>
    </div>
  );
}
