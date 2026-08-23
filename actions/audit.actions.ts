"use server";

import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { requireRole } from "@/lib/auth";
import type { AuditCategory, AuditSeverity } from "@/lib/enums";

export type AuditFilters = {
  category?: AuditCategory | "all";
  severity?: AuditSeverity | "all";
  search?: string;
};

/** Faqat admin/menejer ko'ra oladi. Yozuvlar 7 kundan keyin bazadan avtomatik o'chib ketadi (TTL). */
export async function getAuditLogs(filters: AuditFilters = {}) {
  await requireRole(["admin", "manager"]);
  await connectDB();

  const query: Record<string, unknown> = {};
  if (filters.category && filters.category !== "all") query.category = filters.category;
  if (filters.severity && filters.severity !== "all") query.severity = filters.severity;
  if (filters.search?.trim()) {
    const regex = new RegExp(filters.search.trim(), "i");
    query.$or = [{ details: regex }, { actionTitle: regex }, { "performedBy.name": regex }, { "targetResource.name": regex }];
  }

  const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(300).lean();
  return logs.map((l) => ({
    _id: String(l._id),
    action: l.action,
    actionTitle: l.actionTitle,
    category: l.category,
    severity: l.severity,
    details: l.details,
    createdAt: l.createdAt.toISOString(),
    performedBy: { name: l.performedBy.name, role: l.performedBy.role },
    targetResource: { type: l.targetResource.type, name: l.targetResource.name ?? "" },
  }));
}
