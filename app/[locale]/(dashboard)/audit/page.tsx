import { getAuditLogs } from "@/actions/audit.actions";
import { Suspense } from "react";
import { AuditLogList } from "@/components/audit/AuditLogList";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; severity?: string; search?: string }>;
}) {
  const { category = "all", severity = "all", search = "" } = await searchParams;
  const logs = await getAuditLogs({ category: category as never, severity: severity as never, search });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">Faoliyat tarixi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Yozuvlar 7 kundan so&apos;ng avtomatik o&apos;chib ketadi
        </p>
      </div>
      <Suspense fallback={<div className="h-40 w-full rounded-md bg-secondary animate-pulse" />}>
        <AuditLogList logs={logs as never} category={category} severity={severity} search={search} />
      </Suspense>
    </div>
  );
}
