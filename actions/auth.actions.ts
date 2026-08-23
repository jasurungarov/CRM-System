"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { LoginAttempt } from "@/models/LoginAttempt";
import { AuditLog } from "@/models/AuditLog";
import { signAuthToken } from "@/lib/jwt";
import { setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const signInSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(1, "Parol kiritilishi shart"),
});

export type SignInState = {
  error?: string;
};

/**
 * Login server action.
 *
 * Eski loyihadagi "5 marta xato kirishdan keyin 15 daqiqa bloklash" mantig'i
 * saqlanadi, lekin holat endi in-memory Map emas, MongoDB'dagi LoginAttempt
 * hujjatida saqlanadi — shunda serverless muhitda (Vercel) qayta ishga
 * tushganda ham bloklash yo'qolib qolmaydi.
 */
export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;

  await connectDB();

  const attemptRecord = await LoginAttempt.findOne({ email });
  const now = new Date();

  if (attemptRecord?.lockedUntil && attemptRecord.lockedUntil > now) {
    const remainingMinutes = Math.ceil(
      (attemptRecord.lockedUntil.getTime() - now.getTime()) / 60000
    );
    return {
      error: `Juda ko'p noto'g'ri urinish. ${remainingMinutes} daqiqadan so'ng qayta urinib ko'ring.`,
    };
  }

  const user = await User.findOne({ email });
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatches || !user.isActive) {
    const attempts = (attemptRecord?.attempts ?? 0) + 1;
    const shouldLock = attempts >= MAX_ATTEMPTS;

    await LoginAttempt.updateOne(
      { email },
      {
        $set: {
          attempts: shouldLock ? 0 : attempts,
          lockedUntil: shouldLock ? new Date(now.getTime() + LOCK_MINUTES * 60000) : null,
        },
      },
      { upsert: true }
    );

    if (!user) {
      return { error: "Foydalanuvchi nomi yoki parol noto'g'ri" };
    }
    if (!user.isActive) {
      return { error: "Sizning hisobingiz faol emas. Administratorga murojaat qiling." };
    }
    return {
      error: shouldLock
        ? `Juda ko'p noto'g'ri urinish. ${LOCK_MINUTES} daqiqaga bloklandi.`
        : "Foydalanuvchi nomi yoki parol noto'g'ri",
    };
  }

  // Muvaffaqiyatli kirish — urinishlar hisobini tozalaymiz
  await LoginAttempt.deleteOne({ email });

  const token = await signAuthToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });
  await setSessionCookie(token);

  await AuditLog.create({
    action: "auth.login",
    actionTitle: "Tizimga kirish",
    category: "auth",
    severity: "info",
    performedBy: { userId: user._id, name: user.name, email: user.email, role: user.role },
    targetResource: { type: "User", id: String(user._id), name: user.name },
    details: `${user.name} tizimga kirdi`,
  });

  redirect("/");
}

export async function signOutAction() {
  const session = await getSession();
  if (session) {
    await connectDB();
    await AuditLog.create({
      action: "auth.logout",
      actionTitle: "Tizimdan chiqish",
      category: "auth",
      severity: "info",
      performedBy: {
        userId: session.id,
        name: session.fullName,
        email: session.email,
        role: session.role,
      },
      targetResource: { type: "User", id: session.id, name: session.fullName },
      details: `${session.fullName} tizimdan chiqdi`,
    });
  }
  await clearSessionCookie();
  redirect("/login");
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parolni kiriting"),
  newPassword: z.string().min(8, "Yangi parol kamida 8 belgidan iborat bo'lishi kerak"),
});

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getSession();
  if (!session) return { error: "Sessiya tugagan, qayta kiring" };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await connectDB();
  const user = await User.findById(session.id);
  if (!user) return { error: "Foydalanuvchi topilmadi" };

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) return { error: "Joriy parol noto'g'ri" };

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await user.save();

  await AuditLog.create({
    action: "auth.password_change",
    actionTitle: "Parol almashtirildi",
    category: "auth",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "User", id: session.id, name: session.fullName },
    details: `${session.fullName} o'z parolini almashtirdi`,
  });

  return { success: true };
}
