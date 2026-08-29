"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search } from "lucide-react";
import { LEAD_STATUS_LABELS } from "@/lib/lead-labels";

export function LeadSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

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
          placeholder="Ism yoki telefon"
          className="pl-9"
        />
      </div>
      <Select defaultValue={searchParams.get("status") ?? "all"} onValueChange={(v) => updateParam("status", v)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Holat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barcha holatlar</SelectItem>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}