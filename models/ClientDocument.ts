import { Schema, model, models, type Types, type Model } from "mongoose";
import type { DocumentType, DocumentStatus } from "@/lib/enums";

export interface IClientDocument {
  _id: string;
  clientId: Types.ObjectId;
  docType: DocumentType;
  title: string;
  description: string;
  isRequired: boolean;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  r2Key?: string;
  fileUrl?: string;
  uploadedAt?: Date;
  uploadedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  rejectionReason?: string;
  version: number;
}

const ClientDocumentSchema = new Schema<IClientDocument>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    docType: {
      type: String,
      enum: [
        "pasport",
        "attestat_diplom",
        "metrika",
        "tibbiy_malumotnoma",
        "sudlanmaganlik",
        "foto_3x4",
        "tavsiyanoma_1",
        "tavsiyanoma_2",
        "tarjimai_hol",
        "til_sertifikati",
        "boshqa",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    isRequired: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["yuklanmagan", "kutilmoqda", "qabul_qilindi", "rad_etildi"],
      default: "yuklanmagan",
    },
    fileName: { type: String },
    fileSize: { type: Number },
    mimeType: { type: String },
    r2Key: { type: String },
    fileUrl: { type: String },
    uploadedAt: { type: Date },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
    version: { type: Number, default: 1 },
  },
  { timestamps: false }
);

ClientDocumentSchema.index({ clientId: 1, docType: 1 });

export const ClientDocument =
  (models.ClientDocument as Model<IClientDocument>) || model<IClientDocument>("ClientDocument", ClientDocumentSchema);