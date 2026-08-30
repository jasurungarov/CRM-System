"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LEAD_STATUS_LABELS } from "@/lib/lead-labels";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function LeadSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("leads");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => updateParam("search", e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="pl-9"
        />
      </div>
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateParam("status", v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder={t("statusPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allStatuses")}</SelectItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, jsonKey]) => (
            <SelectItem key={value} value={value}>
              {t(jsonKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
