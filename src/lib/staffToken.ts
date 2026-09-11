import { SignJWT, jwtVerify } from "jose";
import type { StaffRole } from "@/generated/prisma/enums";

// Pure JWT sign/verify helpers with no dependency on next/headers, so this
// module can be imported from both Route Handlers/Server Components (via
// staffSession.ts) AND proxy.ts, which only has access to NextRequest's
// cookie API rather than the next/headers cookies() function.

export const STAFF_COOKIE_NAME = "bbt_staff_session";
export const STAFF_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hour shift

export interface StaffSessionPayload {
  id: string;
  staffId: string;
  name: string;
  role: StaffRole;
}

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  return new TextEncoder().encode(secret);
}

export async function signStaffToken(payload: StaffSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STAFF_SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyStaffToken(token: string): Promise<StaffSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as StaffSessionPayload;
  } catch {
    return null;
  }
}
