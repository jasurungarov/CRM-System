import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";

const SYSTEM_EMAIL = "system@ansoredu.internal";

/**
 * Avtomatik amallar (kunlik skanerlar va h.k.) uchun "Tizim" nomli maxsus
 * hisob. isActive=false bo'lgani uchun bu hisob bilan hech kim tizimga
 * kira olmaydi — u faqat Audit log yozuvlarida "kim bajardi" maydonini
 * to'ldirish uchun ishlatiladi.
 */
export async function getOrCreateSystemUser() {
  let user = await User.findOne({ email: SYSTEM_EMAIL });
  if (!user) {
    const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
    user = await User.create({
      name: "Tizim (avtomatik)",
      email: SYSTEM_EMAIL,
      passwordHash,
      role: "admin",
      isActive: false,
    });
  }
  return user;
}