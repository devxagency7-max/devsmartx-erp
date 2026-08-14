import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';
import { SectionHeader } from '@/shared/components/ui/section-header';
import { Button } from '@/shared/components/ui/button';

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

interface QuickActionsWidgetProps {
  actions: QuickAction[];
}

export function QuickActionsWidget({ actions }: QuickActionsWidgetProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="pt-6">
        <SectionHeader title={t('dashboard.quickActions')} className="pb-3" />
        {actions.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('dashboard.noActions')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                <action.icon size={14} />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
