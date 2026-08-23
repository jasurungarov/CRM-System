import { getDocumentsOverview } from "@/actions/documents.actions";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export default async function DocumentsPage() {
  const overview = await getDocumentsOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">Hujjatlar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Har bir mijozning hujjatlar to&apos;plami holati
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
              {o.pendingReview > 0 && <Badge variant="accent">{o.pendingReview} tekshiruvda</Badge>}
              {o.rejected > 0 && <Badge variant="destructive">{o.rejected} rad etilgan</Badge>}
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
