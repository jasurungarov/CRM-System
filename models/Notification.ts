import { Schema, model, models, type Types, type Model } from "mongoose";
import type { NotificationType, NotificationPriority, UserRole } from "@/lib/enums";

export interface INotification {
  _id: string;
  recipientId: Types.ObjectId | "all";
  recipientRole?: UserRole | "all";
  clientId?: Types.ObjectId;
  clientName?: string;
  clientPin?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  link?: string;
  metadata?: {
    daysLeft?: number;
    deadlineDate?: string;
    universityName?: string;
    program?: string;
    missingDocsCount?: number;
    amountDue?: number;
    contractNumber?: string;
    triggeredBy?: string;
    [key: string]: unknown;
  };
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.Mixed, default: "all" },
    recipientRole: { type: String, default: "all" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    clientName: { type: String },
    clientPin: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true, default: "system_alert" },
    priority: { type: String, default: "orta" },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    link: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification =
  (models.Notification as Model<INotification>) || model<INotification>("Notification", NotificationSchema);