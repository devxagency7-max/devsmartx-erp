import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

interface WorkflowCancelDialogProps {
  open: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function WorkflowCancelDialog({
  open,
  onConfirm,
  onDismiss,
}: WorkflowCancelDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('workflow.cancelDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('workflow.cancelDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>{t('common.no')}</Button>
          <Button variant="destructive" onClick={onConfirm}>{t('common.yes')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
