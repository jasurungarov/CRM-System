import { Schema, model, models, type Model } from "mongoose";

export interface ILoginAttempt {
  _id: string;
  email: string;
  attempts: number;
  lockedUntil?: Date | null;
  updatedAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    attempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: { createdAt: false, updatedAt: true }, versionKey: false }
);

export const LoginAttempt =
  (models.LoginAttempt as Model<ILoginAttempt>) || model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema);