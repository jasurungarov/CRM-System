import { Schema, model, models, type Types, type Model } from "mongoose";
import type { ApplicationStatus, FailureReason } from "@/lib/enums";

export interface IRefund {
  isRefunded: boolean;
  refundedAmount: number;
  refundedBy?: Types.ObjectId;
  refundedAt?: Date;
  note?: string;
}

export interface IClientUniversity {
  _id: Types.ObjectId;
  universityName: string;
  country: string;
  program: string;
  submissionDeadline: Date;
  submissionStatus: ApplicationStatus;
  failureReason: FailureReason;
  refundEligible: boolean;
  refund?: IRefund;
  deadlineWarningSent: boolean;
}

export interface IClient {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  assignedTo: Types.ObjectId;
  tariffId: Types.ObjectId;
  // Types.DocumentArray beriladi (oddiy massiv emas) — shunda Mongoose'ning
  // .id(subDocId) kabi metodlari TypeScript uchun ham tanib olinadi.
  universities: Types.DocumentArray<IClientUniversity>;
  pin: string;
  profileCompletionPercent: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    isRefunded: { type: Boolean, default: false },
    refundedAmount: { type: Number, default: 0 },
    refundedBy: { type: Schema.Types.ObjectId, ref: "User" },
    refundedAt: { type: Date },
    note: { type: String },
  },
  { _id: false }
);

const ClientUniversitySchema = new Schema<IClientUniversity>({
  universityName: { type: String, required: true },
  country: { type: String, default: "Saudiya Arabistoni" },
  program: { type: String, required: true },
  submissionDeadline: { type: Date, required: true },
  submissionStatus: {
    type: String,
    enum: ["topshirilmagan", "topshirilgan", "rad_etildi", "qabul_qilindi"],
    default: "topshirilmagan",
  },
  failureReason: {
    type: String,
    enum: ["universitet_rad_etdi", "menejer_aybi", null],
    default: null,
  },
  refundEligible: { type: Boolean, default: false },
  refund: { type: RefundSchema },
  deadlineWarningSent: { type: Boolean, default: false },
});

const ClientSchema = new Schema<IClient>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tariffId: { type: Schema.Types.ObjectId, ref: "Tariff", required: true },
    universities: { type: [ClientUniversitySchema], default: [] },
    pin: { type: String, required: true, unique: true },
    profileCompletionPercent: { type: Number, default: 0, min: 0, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ClientSchema.index({ fullName: "text", phone: "text", email: "text", pin: "text" });
ClientSchema.index({ assignedTo: 1 });

export const Client = (models.Client as Model<IClient>) || model<IClient>("Client", ClientSchema);