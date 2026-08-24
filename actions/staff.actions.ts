"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { requireRole } from "@/lib/auth";

export async function getStaffList() {
  await requireRole(["admin"]);
  await connectDB();
  const users = await User.find({ email: { $ne: "system@ansoredu.internal" } }).sort({ createdAt: -1 }).lean();
  return users.map((u) => ({
      _id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));
}

const createStaffSchema = z.object({
  name: z.string().min(3, "Ism kamida 3 belgidan iborat bo'lishi kerak"),
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(8, "Parol kamida 8 belgidan iborat bo'lishi kerak"),
  role: z.enum(["admin", "manager", "consultant"]),
});

export type StaffFormState = { error?: string; success?: boolean };

export async function createStaffAction(
  _prev: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  const session = await requireRole(["admin"]);

  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" };

  await connectDB();
  const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (existing) return { error: "Bu email bilan foydalanuvchi allaqachon mavjud" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await User.create({
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    passwordHash,
    role: parsed.data.role,
    isActive: true,
  });

  await AuditLog.create({
    action: "staff.create",
    actionTitle: "Yangi xodim qo'shildi",
    category: "staff",
    severity: "info",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "User", id: String(user._id), name: user.name },
    details: `${user.name} (${user.role}) qo'shildi`,
  });

  revalidatePath("/staff");
  return { success: true };
}

export async function toggleStaffActiveAction(userId: string) {
  const session = await requireRole(["admin"]);
  if (userId === session.id) throw new Error("O'zingizni deaktivatsiya qila olmaysiz");

  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  user.isActive = !user.isActive;
  await user.save();

  await AuditLog.create({
    action: "staff.toggle_active",
    actionTitle: user.isActive ? "Xodim faollashtirildi" : "Xodim deaktivatsiya qilindi",
    category: "staff",
    severity: user.isActive ? "info" : "warning",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "User", id: userId, name: user.name },
    details: `${user.name} ${user.isActive ? "faollashtirildi" : "deaktivatsiya qilindi"}`,
  });

  revalidatePath("/staff");
  return { success: true, isActive: user.isActive };
}

export async function changeStaffRoleAction(userId: string, newRole: "admin" | "manager" | "consultant") {
  const session = await requireRole(["admin"]);

  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const prevRole = user.role;
  user.role = newRole;
  await user.save();

  await AuditLog.create({
    action: "staff.role_change",
    actionTitle: "Xodim roli o'zgartirildi",
    category: "staff",
    severity: "warning",
    performedBy: { userId: session.id, name: session.fullName, email: session.email, role: session.role },
    targetResource: { type: "User", id: userId, name: user.name },
    details: `${user.name}: "${prevRole}" → "${newRole}"`,
    changes: [{ field: "role", oldValue: prevRole, newValue: newRole }],
  });

  revalidatePath("/staff");
  return { success: true };
}
