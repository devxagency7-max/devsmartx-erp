import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Eye, Pencil, Copy, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ROUTE_PATHS } from '@/app/router/constants';
import { TransactionStatus } from '@/features/finance/domain/enums/TransactionStatus';
import { cancelTransactionUseCase, duplicateTransactionUseCase } from '@/features/finance/application/use-cases/impl';
import { useQueryClient } from '@tanstack/react-query';
import { EXPENSES_QUERY_KEY } from '../hooks/useExpenses';
import toast from 'react-hot-toast';

interface ExpenseActionsMenuProps {
  id: string;
  status: TransactionStatus;
}

const EDITABLE = new Set([TransactionStatus.Draft]);
const CANCELLABLE = new Set([TransactionStatus.Draft, TransactionStatus.Pending, TransactionStatus.Approved]);

export function ExpenseActionsMenu({ id, status }: ExpenseActionsMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function handleDuplicate() {
    const result = await duplicateTransactionUseCase.execute({
      _type: 'DuplicateTransaction',
      transactionId: id,
      actorId: 'current-user',
    });
    if (result.success) {
      qc.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      toast.success(t('expense.duplicateSuccess'));
    } else {
      toast.error(result.error.message);
    }
  }

  async function handleCancel() {
    const result = await cancelTransactionUseCase.execute({
      _type: 'CancelTransaction',
      transactionId: id,
      reason: 'Cancelled by user',
      actorId: 'current-user',
    });
    if (result.success) {
      qc.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      toast.success(t('expense.cancelSuccess'));
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.EXPENSE_DETAILS.replace(':id', id))}>
          <Eye className="mr-2 h-4 w-4" />
          {t('common.actions.view')}
        </DropdownMenuItem>

        {EDITABLE.has(status) && (
          <DropdownMenuItem onClick={() => navigate(ROUTE_PATHS.EXPENSE_EDIT.replace(':id', id))}>
            <Pencil className="mr-2 h-4 w-4" />
            {t('common.actions.edit')}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          {t('transaction.actions.duplicate')}
        </DropdownMenuItem>

        {CANCELLABLE.has(status) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCancel}
              className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t('transaction.actions.cancel')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
