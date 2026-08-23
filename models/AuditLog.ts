import { Schema, model, models, type Types, type Model } from "mongoose";
import type { AuditCategory, AuditSeverity } from "@/lib/enums";

export interface IAuditFieldChange {
  field: string;
  fieldLabel?: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface IAuditLog {
  _id: string;
  action: string;
  actionTitle: string;
  category: AuditCategory;
  severity: AuditSeverity;
  performedBy: {
    userId: Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  targetResource: {
    type: string;
    id: string;
    name?: string;
  };
  details: string;
  changes?: IAuditFieldChange[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditFieldChangeSchema = new Schema<IAuditFieldChange>(
  {
    field: { type: String, required: true },
    fieldLabel: { type: String },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    actionTitle: { type: String, required: true },
    category: {
      type: String,
      enum: ["auth", "client", "payment", "application", "document", "confirmation", "staff", "system"],
      default: "system",
    },
    severity: { type: String, enum: ["info", "warning", "danger", "critical"], default: "info" },
    performedBy: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
    },
    targetResource: {
      type: { type: String, required: true },
      id: { type: String, required: true },
      name: { type: String },
    },
    details: { type: String, default: "" },
    changes: { type: [AuditFieldChangeSchema], default: [] },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
AuditLogSchema.index({ category: 1, createdAt: -1 });

export const AuditLog = (models.AuditLog as Model<IAuditLog>) || model<IAuditLog>("AuditLog", AuditLogSchema);