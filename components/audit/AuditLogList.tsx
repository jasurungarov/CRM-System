"use client";

import { useState, useTransition } from "react";
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

const CATEGORY_LABELS: Record<string, string> = {
  auth: "Kirish/Chiqish",
  client: "Mijoz",
  payment: "To'lov",
  application: "Ariza",
  document: "Hujjat",
  confirmation: "Shartnoma",
  staff: "Xodim",
  system: "Tizim",
};

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
            placeholder="Qidirish..."
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => updateParams({ category: v })}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Kategoriya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kategoriyalar</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severity} onValueChange={(v) => updateParams({ severity: v })}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Daraja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha darajalar</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Ogohlantirish</SelectItem>
            <SelectItem value="danger">Xavfli</SelectItem>
            <SelectItem value="critical">Kritik</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {logs.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Yozuvlar topilmadi
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
                <Badge variant="outline">{CATEGORY_LABELS[log.category] ?? log.category}</Badge>
                <Badge variant={SEVERITY_CONFIG[log.severity]?.variant ?? "secondary"}>{log.severity}</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {log.performedBy.name} ({log.performedBy.role}) · {new Date(log.createdAt).toLocaleString("uz-UZ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
