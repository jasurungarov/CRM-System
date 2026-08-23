import { Schema, model, models, type Types, type Model } from "mongoose";

export interface IPasswordResetToken {
  _id: string;
  token: string;
  userId: Types.ObjectId;
  email: string;
  expiresAt: Date;
  used: boolean;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { versionKey: false }
);

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken =
  (models.PasswordResetToken as Model<IPasswordResetToken>) ||
  model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);