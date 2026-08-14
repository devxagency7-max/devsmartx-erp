import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/shared/components/ui/card';

interface WelcomeWidgetProps {
  userName?: string | null;
}

export function WelcomeWidget({ userName }: WelcomeWidgetProps) {
  const { t } = useTranslation();
  const name = userName?.split(' ')[0];
  const greeting = name
    ? `${t('dashboard.welcomeBack')}، ${name}`
    : t('dashboard.welcomeBack');

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">{greeting}</h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t('dashboard.workspaceIntro')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
