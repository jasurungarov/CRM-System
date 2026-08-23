import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/lib/enums";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "7d";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

function getSecretKey() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET .env faylida belgilanmagan");
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as AuthTokenPayload;
  } catch {
    return null;
  }
}
