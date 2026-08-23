import { Schema, model, models, type Types, type Model } from "mongoose";
import type { ConfirmationStatus } from "@/lib/enums";

export interface IContractSnapshot {
  fullName: string;
  phone: string;
  email: string;
  pin: string;
  tariffName: string;
  tariffPrice: number;
  totalPaid: number;
  remainingDebt: number;
  assignedConsultantName: string;
  universities: Array<{ name: string; program: string; deadline: Date }>;
}

export interface ITermsAccepted {
  serviceScopeAccepted: boolean;
  paymentObligationsAccepted: boolean;
  refundPolicyAccepted: boolean;
  dataProcessingAccepted: boolean;
}

export interface IClientConfirmation {
  _id: string;
  contractNumber: string;
  clientId: Types.ObjectId;
  token: string;
  status: ConfirmationStatus;
  sentAt: Date;
  expiresAt: Date;
  confirmedAt?: Date;
  clientIp?: string;
  clientUserAgent?: string;
  telegramChatId?: string;
  telegramSentAt?: Date;
  createdBy: Types.ObjectId;
  notes?: string;
  clientData: IContractSnapshot;
  termsAccepted?: ITermsAccepted;
  clientAcceptedName?: string;
}

const ContractSnapshotSchema = new Schema<IContractSnapshot>(
  {
    fullName: String,
    phone: String,
    email: String,
    pin: String,
    tariffName: String,
    tariffPrice: Number,
    totalPaid: Number,
    remainingDebt: Number,
    assignedConsultantName: String,
    universities: [
      { name: String, program: String, deadline: Date, _id: false },
    ],
  },
  { _id: false }
);

const TermsAcceptedSchema = new Schema<ITermsAccepted>(
  {
    serviceScopeAccepted: { type: Boolean, default: false },
    paymentObligationsAccepted: { type: Boolean, default: false },
    refundPolicyAccepted: { type: Boolean, default: false },
    dataProcessingAccepted: { type: Boolean, default: false },
  },
  { _id: false }
);

const ClientConfirmationSchema = new Schema<IClientConfirmation>(
  {
    contractNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["yuborildi", "tasdiqlandi", "muddati_otgan", "bekor_qilingan"],
      default: "yuborildi",
    },
    sentAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date, required: true },
    confirmedAt: { type: Date },
    clientIp: { type: String },
    clientUserAgent: { type: String },
    telegramChatId: { type: String },
    telegramSentAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
    clientData: { type: ContractSnapshotSchema, required: true },
    termsAccepted: { type: TermsAcceptedSchema },
    clientAcceptedName: { type: String },
  },
  { timestamps: false }
);

export const ClientConfirmation =
  (models.ClientConfirmation as Model<IClientConfirmation>) ||
  model<IClientConfirmation>("ClientConfirmation", ClientConfirmationSchema);