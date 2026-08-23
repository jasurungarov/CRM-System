import { Schema, model, models, type Model } from "mongoose";

export interface ICronJobLog {
  _id: string;
  executedAt: Date;
  triggeredBy: "vercel_cron" | "manual" | "system";
  status: "success" | "warning" | "failed";
  notificationsCreated: number;
  deadlinesScanned: number;
  urgentCount: number;
  approachingCount: number;
  details: string;
  logs: string[];
}

const CronJobLogSchema = new Schema<ICronJobLog>(
  {
    executedAt: { type: Date, default: () => new Date() },
    triggeredBy: {
      type: String,
      enum: ["vercel_cron", "manual", "system"],
      default: "manual",
    },
    status: { type: String, enum: ["success", "warning", "failed"], default: "success" },
    notificationsCreated: { type: Number, default: 0 },
    deadlinesScanned: { type: Number, default: 0 },
    urgentCount: { type: Number, default: 0 },
    approachingCount: { type: Number, default: 0 },
    details: { type: String, default: "" },
    logs: { type: [String], default: [] },
  },
  { versionKey: false }
);

export const CronJobLog =
  (models.CronJobLog as Model<ICronJobLog>) || model<ICronJobLog>("CronJobLog", CronJobLogSchema);