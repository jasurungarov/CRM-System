import { Schema, model, models, type Types, type Model } from "mongoose";
import type { LeadStatus, EducationLevel } from "@/lib/enums";

export interface ILead {
  _id: string;
  fullName: string;
  phone: string;
  telegramUsername?: string;
  telegramPhone?: string;
  country: string;
  direction: string;
  educationLevel: EducationLevel;
  educationLevelOther?: string;
  status: LeadStatus;
  objection?: string;
  lastResult?: string;
  nextContactDate?: Date;
  lastContactAt?: Date;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  convertedToClientId?: Types.ObjectId;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    telegramUsername: { type: String },
    telegramPhone: { type: String },
    country: { type: String, default: "" },
    direction: { type: String, default: "" },
    educationLevel: {
      type: String,
      enum: ["maktab_bitiruvchisi", "kollej_litsey", "bakalavriat", "magistratura", "boshqa"],
      default: "boshqa",
    },
    educationLevelOther: { type: String },
    status: {
      type: String,
      enum: ["yangi", "boglanildi", "qiziqmoqda", "tayyor", "rad_etdi"],
      default: "yangi",
    },
    objection: { type: String },
    lastResult: { type: String },
    nextContactDate: { type: Date },
    lastContactAt: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    convertedToClientId: { type: Schema.Types.ObjectId, ref: "Client" },
    convertedAt: { type: Date },
  },
  { timestamps: true }
);

LeadSchema.index({ fullName: "text", phone: "text" });
LeadSchema.index({ assignedTo: 1 });
LeadSchema.index({ nextContactDate: 1 });

export const Lead = (models.Lead as Model<ILead>) || model<ILead>("Lead", LeadSchema);