"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_LABELS } from "@/lib/lead-labels";
import type { LeadStatus } from "@/lib/enums";

const VARIANT_MAP: Record<
  LeadStatus,
  "secondary" | "accent" | "success" | "destructive"
> = {
  yangi: "secondary",
  boglanildi: "accent",
  qiziqmoqda: "accent",
  tayyor: "success",
  rad_etdi: "destructive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const t = useTranslations("leads");
  const jsonKey = LEAD_STATUS_LABELS[status];

  return <Badge variant={VARIANT_MAP[status]}>{t(jsonKey)}</Badge>;
}