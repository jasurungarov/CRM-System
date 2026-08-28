import { getAuditLogs } from "@/actions/audit.actions";
import { AuditLogList } from "@/components/audit/AuditLogList";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    severity?: string;
    search?: string;
  }>;
}) {
  const tAudit = await getTranslations("audit");
  const {
    category = "all",
    severity = "all",
    search = "",
  } = await searchParams;
  const logs = await getAuditLogs({
    category: category as never,
    severity: severity as never,
    search,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold sm:text-2xl">
          {tAudit("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tAudit("subtitle")}
        </p>
      </div>
      <Suspense
        fallback={
          <div className="h-40 w-full rounded-md bg-secondary animate-pulse" />
        }>
        <AuditLogList
          logs={logs as never}
          category={category}
          severity={severity}
          search={search}
        />
      </Suspense>
    </div>
  );
}
