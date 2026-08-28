"use client";

import { useState, useTransition } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search } from "lucide-react";

type AuditRow = {
  _id: string;
  actionTitle: string;
  category: string;
  severity: string;
  details: string;
  createdAt: string;
  performedBy: { name: string; role: string };
  targetResource: { type: string; name?: string };
};

const SEVERITY_CONFIG: Record<string, { variant: "secondary" | "accent" | "destructive" }> = {
  info: { variant: "secondary" },
  warning: { variant: "accent" },
  danger: { variant: "destructive" },
  critical: { variant: "destructive" },
};

const CATEGORIES = [
  { key: "auth", translationKey: "categoryAuth" },
  { key: "client", translationKey: "categoryClient" },
  { key: "payment", translationKey: "categoryPayment" },
  { key: "application", translationKey: "categoryApplication" },
  { key: "document", translationKey: "categoryDocument" },
  { key: "confirmation", translationKey: "categoryConfirmation" },
  { key: "staff", translationKey: "categoryStaff" },
  { key: "system", translationKey: "categorySystem" },
] as const;

const SEVERITIES = [
  { key: "info", translationKey: "severityInfo" },
  { key: "warning", translationKey: "severityWarning" },
  { key: "danger", translationKey: "severityDanger" },
  { key: "critical", translationKey: "severityCritical" },
] as const;

export function AuditLogList({
  logs,
  category,
  severity,
  search,
}: {
  logs: AuditRow[];
  category: string;
  severity: string;
  search: string;
}) {
  const tAudit = useTranslations("audit");
  const tRoles = useTranslations("roles");
  const format = useFormatter();

  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(search);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams({ category, severity, search, ...next });
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === "all") params.delete(k);
    });
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  const getCategoryLabel = (catKey: string) => {
    const match = CATEGORIES.find((c) => c.key === catKey);
    return match ? tAudit(match.translationKey as never) : catKey;
  };

  const getSeverityLabel = (sevKey: string) => {
    const match = SEVERITIES.find((s) => s.key === sevKey);
    return match ? tAudit(match.translationKey as never) : sevKey;
  };

  const getRoleLabel = (roleKey: string) => {
    return tRoles.has(roleKey) ? tRoles(roleKey) : roleKey;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onBlur={() => updateParams({ search: localSearch })}
            onKeyDown={(e) => e.key === "Enter" && updateParams({ search: localSearch })}
            placeholder={tAudit("searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <Select value={category} onValueChange={(v) => updateParams({ category: v })}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={tAudit("categoryLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tAudit("allCategories")}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.key} value={cat.key}>
                {tAudit(cat.translationKey as never)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severity} onValueChange={(v) => updateParams({ severity: v })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={tAudit("severityLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tAudit("allSeverities")}</SelectItem>
            {SEVERITIES.map((sev) => (
              <SelectItem key={sev.key} value={sev.key}>
                {tAudit(sev.translationKey as never)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {logs.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {tAudit("noEntries")}
          </div>
        )}
        {logs.map((log) => (
          <div key={log._id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{log.actionTitle}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{log.details}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline">{getCategoryLabel(log.category)}</Badge>
                <Badge variant={SEVERITY_CONFIG[log.severity]?.variant ?? "secondary"}>
                  {getSeverityLabel(log.severity)}
                </Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {log.performedBy.name} ({getRoleLabel(log.performedBy.role)}) ·{" "}
              {format.dateTime(new Date(log.createdAt), {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}