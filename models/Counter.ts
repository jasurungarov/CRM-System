import { Schema, model, models, type Model } from "mongoose";

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  { _id: { type: String, required: true }, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

export const Counter = (models.Counter as Model<ICounter>) || model<ICounter>("Counter", CounterSchema);