import { Schema, model, models, type Types, type Model } from "mongoose";
import type { PaymentMethod, PaymentStatus } from "@/lib/enums";

export interface IPayment {
  _id: string;
  clientId: Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receiptNumber: string;
  pin: string;
  createdBy: Types.ObjectId;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["naqd", "karta", "bank_otkazma", "payme", "click", "boshqa"],
      required: true,
    },
    status: {
      type: String,
      enum: ["tasdiqlangan", "kutilmoqda", "bekor_qilingan"],
      default: "tasdiqlangan",
    },
    receiptNumber: { type: String, required: true, unique: true },
    pin: { type: String, required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export const Payment = (models.Payment as Model<IPayment>) || model<IPayment>("Payment", PaymentSchema);