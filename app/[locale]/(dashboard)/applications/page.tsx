import { ApplicationsDashboard } from "@/components/applications/ApplicationsDashboard";
import { useTranslations } from 'next-intl'

export default function ApplicationsPage() {
  const t = useTranslations('applications')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">{t("title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>
      <ApplicationsDashboard />
    </div>
  );
}
