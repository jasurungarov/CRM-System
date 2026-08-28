import { getTranslations } from "next-intl/server";
import { getDocumentsOverview } from "@/actions/documents.actions";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

export default async function DocumentsPage() {
  const t = await getTranslations("documents");
  const overview = await getDocumentsOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="space-y-3">
        {overview.map((o) => (
          <Link
            key={o.clientId}
            href={`/clients/${o.clientId}`}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm hover:bg-secondary/40"
          >
            <div>
              <p className="font-medium">{o.clientName}</p>
              <p className="font-mono text-xs text-muted-foreground">{o.pin}</p>
            </div>
            <div className="flex items-center gap-3">
              {o.pendingReview > 0 && (
                <Badge variant="accent">
                  {t("pendingReview", { count: o.pendingReview })}
                </Badge>
              )}
              {o.rejected > 0 && (
                <Badge variant="destructive">
                  {t("rejectedCount", { count: o.rejected })}
                </Badge>
              )}
              <div className="w-24 text-right">
                <p className="text-sm font-semibold">{o.completionPercent}%</p>
                <p className="text-xs text-muted-foreground">
                  {o.requiredAccepted}/{o.requiredTotal}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}