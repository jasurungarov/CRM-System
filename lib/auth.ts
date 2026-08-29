import { connectDB } from "@/lib/db";
import type { UserRole } from "@/lib/enums";
import { verifyAuthToken } from "@/lib/jwt";
import { User } from "@/models/User";
import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  telegramChatId: string | null;
};

const SESSION_COOKIE = "session";
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (
    !payload ||
    typeof payload.userId !== "string" ||
    !OBJECT_ID_REGEX.test(payload.userId)
  ) {
    return null;
  }

  await connectDB();
  const user = await User.findById(payload.userId).lean();
  if (!user || !user.isActive) return null;

  return {
    id: String(user._id),
    email: user.email,
    fullName: user.name,
    role: user.role,
    telegramChatId: user.telegramChatId ?? null,
  };
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireRole(
  allowedRoles: UserRole[],
): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("AUTH_REQUIRED");
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
