import { Schema, model, models, type Model } from "mongoose";

export interface ITariff {
  _id: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

const TariffSchema = new Schema<ITariff>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Tariff = (models.Tariff as Model<ITariff>) || model<ITariff>("Tariff", TariffSchema);