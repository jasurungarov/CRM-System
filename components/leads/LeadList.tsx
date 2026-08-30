"use client";

import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/enums";
import { useTranslations } from "next-intl";
import { ConvertLeadModal } from "./ConvertLeadModal";
import { LeadStatusBadge } from "./lead-status-badge";
import { LeadEditModal } from "./LeadEditModal";

type LeadRow = {
  _id: string;
  fullName: string;
  phone: string;
  telegramUsername: string | null;
  telegramPhone: string | null;
  country: string;
  direction: string;
  status: LeadStatus;
  objection: string | null;
  lastResult: string | null;
  nextContactDate: string | null;
  assignedToName: string;
  convertedToClientId: string | null;
};

export function LeadList({
  leads,
  canAssign,
  currentUserId,
  tariffs,
  consultants,
}: {
  leads: LeadRow[];
  canAssign: boolean;
  currentUserId: string;
  tariffs: Array<{ _id: string; name: string; price: number }>;
  consultants: Array<{ id: string; name: string }>;
}) {
  const t = useTranslations("leads");

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {t("noLeads")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div
          key={lead._id}
          className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{lead.fullName}</p>
                <LeadStatusBadge status={lead.status} />
                {lead.convertedToClientId && (
                  <Badge variant="success">{t("convertedBadge")}</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {lead.phone}
                {lead.telegramUsername ? ` · ${lead.telegramUsername}` : ""}
                {lead.telegramPhone ? ` · ${lead.telegramPhone}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {[lead.country, lead.direction].filter(Boolean).join(" · ") ||
                  "—"}{" "}
                · {t("consultantLabel")}: {lead.assignedToName}
              </p>
              {lead.objection && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  <span className="font-medium">{t("objectionLabel")}:</span>{" "}
                  {lead.objection}
                </p>
              )}
              {lead.lastResult && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="font-medium">{t("resultLabel")}:</span>{" "}
                  {lead.lastResult}
                </p>
              )}
              {lead.nextContactDate && (
                <p className="mt-0.5 text-xs text-accent">
                  {t("nextContactLabel")}:{" "}
                  {new Date(lead.nextContactDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LeadEditModal
                lead={{
                  _id: lead._id,
                  status: lead.status,
                  objection: lead.objection,
                  lastResult: lead.lastResult,
                  nextContactDate: lead.nextContactDate,
                }}
              />
              {!lead.convertedToClientId && (
                <ConvertLeadModal
                  leadId={lead._id}
                  leadName={lead.fullName}
                  canAssign={canAssign}
                  currentUserId={currentUserId}
                  tariffs={tariffs}
                  consultants={consultants}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
