import { Schema, model, models, type Model } from "mongoose";
import type { UserRole } from "@/lib/enums";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "consultant"],
      required: true,
      default: "consultant",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);