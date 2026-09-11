export type StaffRole = "STAFF" | "MODERATOR" | "SUPER_ADMIN";

export const ROLE_RANK: Record<StaffRole, number> = {
  STAFF: 1,
  MODERATOR: 2,
  SUPER_ADMIN: 3,
};

export const ROLE_LABEL: Record<StaffRole, string> = {
  STAFF: "STAFF",
  MODERATOR: "MODERATOR",
  SUPER_ADMIN: "SUPER ADMIN",
};

export function roleAtLeast(role: StaffRole | null | undefined, min: StaffRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
