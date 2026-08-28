"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/lib/enums";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const t = useTranslations("statusBadge");

  const STATUS_CONFIG: Record<
    ApplicationStatus,
    { label: string; variant: "secondary" | "accent" | "success" | "destructive" }
  > = {
    topshirilmagan: { label: t("notSubmitted"), variant: "secondary" },
    topshirilgan: { label: t("submitted"), variant: "accent" },
    qabul_qilindi: { label: t("accepted"), variant: "success" },
    rad_etildi: { label: t("rejected"), variant: "destructive" },
  };

  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function UrgencyBadge({ urgency, daysLeft }: { urgency: string; daysLeft: number }) {
  const t = useTranslations("statusBadge");

  const URGENCY_CONFIG: Record<string, { label: string; variant: "secondary" | "accent" | "destructive" }> = {
    expired: { label: t("expired"), variant: "destructive" },
    urgent: { label: t("urgent"), variant: "destructive" },
    warning: { label: t("warning"), variant: "accent" },
    normal: { label: t("normal"), variant: "secondary" },
  };

  const config = URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.normal;
  return (
    <Badge variant={config.variant}>
      {urgency !== "expired" ? `${config.label} (${daysLeft} ${t("day")})` : config.label}
    </Badge>
  );
}