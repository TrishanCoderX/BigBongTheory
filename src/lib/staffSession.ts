import { cookies } from "next/headers";
import type { StaffRole } from "@/generated/prisma/enums";
import {
  STAFF_COOKIE_NAME,
  STAFF_SESSION_MAX_AGE_SECONDS,
  signStaffToken,
  verifyStaffToken,
  type StaffSessionPayload,
} from "@/lib/staffToken";

export type { StaffSessionPayload };

export async function createStaffSessionCookie(payload: StaffSessionPayload) {
  const token = await signStaffToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STAFF_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearStaffSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
}

export async function getStaffSession(): Promise<StaffSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyStaffToken(token);
}

export const STAFF_ROLE_RANK: Record<StaffRole, number> = {
  STAFF: 1,
  MODERATOR: 2,
  SUPER_ADMIN: 3,
};

export function staffRoleAtLeast(role: StaffRole | null | undefined, min: StaffRole): boolean {
  if (!role) return false;
  return STAFF_ROLE_RANK[role] >= STAFF_ROLE_RANK[min];
}

/**
 * Checks the staff session cookie against a minimum role for use at the top
 * of a Route Handler: `const gate = await requireStaff("MODERATOR"); if
 * ("error" in gate) return gate.error;` — keeps every protected route's
 * server-side check identical instead of re-implemented per file.
 */
export async function requireStaff(
  min: StaffRole
): Promise<{ session: StaffSessionPayload } | { error: Response }> {
  const session = await getStaffSession();
  if (!staffRoleAtLeast(session?.role, min)) {
    return { error: Response.json({ error: "Forbidden" }, { status: session ? 403 : 401 }) };
  }
  return { session: session! };
}
