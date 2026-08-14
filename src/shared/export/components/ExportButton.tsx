import { useTranslation } from 'react-i18next';
import { Download, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface ExportButtonProps {
  onExportAll: () => void;
  onExportFiltered?: () => void;
  onExportSelected?: () => void;
  onExportPage?: () => void;
  isDisabled?: boolean;
  isExporting?: boolean;
  hasFilters?: boolean;
  hasSelection?: boolean;
  hasPagination?: boolean;
  selectedCount?: number;
  size?: 'sm' | 'default';
}

export function ExportButton({
  onExportAll,
  onExportFiltered,
  onExportSelected,
  onExportPage,
  isDisabled = false,
  isExporting = false,
  hasFilters = false,
  hasSelection = false,
  hasPagination = false,
  selectedCount = 0,
  size = 'default',
}: ExportButtonProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const disabled = isDisabled || isExporting;

  const showFiltered = hasFilters && onExportFiltered;
  const showSelected = hasSelection && selectedCount > 0 && onExportSelected;
  const showPage = hasPagination && onExportPage;
  const hasSeparator = showFiltered || showSelected || showPage;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} disabled={disabled}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ms-2">{t('export.button')}</span>
          <ChevronDown className="ms-1 h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isRtl ? 'start' : 'end'}>
        <DropdownMenuItem
          onClick={() => !disabled && onExportAll()}
          disabled={disabled}
        >
          {t('export.exportAll')}
        </DropdownMenuItem>

        {hasSeparator && <DropdownMenuSeparator />}

        {showFiltered && (
          <DropdownMenuItem
            onClick={() => !disabled && onExportFiltered?.()}
            disabled={disabled}
          >
            {t('export.exportFiltered')}
          </DropdownMenuItem>
        )}

        {showSelected && (
          <DropdownMenuItem
            onClick={() => !disabled && onExportSelected?.()}
            disabled={disabled}
          >
            {t('export.exportSelected', { count: selectedCount })}
          </DropdownMenuItem>
        )}

        {showPage && (
          <DropdownMenuItem
            onClick={() => !disabled && onExportPage?.()}
            disabled={disabled}
          >
            {t('export.exportPage')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
