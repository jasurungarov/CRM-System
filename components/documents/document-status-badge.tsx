"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/enums";

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const t = useTranslations("documents");

  const CONFIG: Record<
    DocumentStatus,
    { label: string; variant: "secondary" | "accent" | "success" | "destructive" }
  > = {
    yuklanmagan: { label: t("statusNotUploaded"), variant: "secondary" },
    kutilmoqda: { label: t("statusPending"), variant: "accent" },
    qabul_qilindi: { label: t("statusAccepted"), variant: "success" },
    rad_etildi: { label: t("statusRejected"), variant: "destructive" },
  };

  const c = CONFIG[status];
  return <Badge variant={c.variant}>{c.label}</Badge>;
}