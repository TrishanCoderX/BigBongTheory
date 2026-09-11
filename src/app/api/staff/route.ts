import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";
import { StaffRole } from "@/generated/prisma/enums";

const VALID_ROLES = new Set<string>(Object.values(StaffRole));
const PASSCODE_PREFIX: Record<string, string> = {
  SUPER_ADMIN: "SUPER",
  MODERATOR: "MOD",
  STAFF: "GATE",
};

export async function GET() {
  const gate = await requireStaff("SUPER_ADMIN");
  if ("error" in gate) return gate.error;

  const roster = await prisma.staffAccount.findMany({
    select: { staffId: true, name: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ roster });
}

export async function POST(request: Request) {
  const gate = await requireStaff("SUPER_ADMIN");
  if ("error" in gate) return gate.error;

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const role = String(body?.role ?? "").toUpperCase();

  if (!name) return Response.json({ error: "Enter a name." }, { status: 400 });
  if (!VALID_ROLES.has(role)) return Response.json({ error: "Invalid role." }, { status: 400 });

  const staffId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!staffId) return Response.json({ error: "Enter a name." }, { status: 400 });

  const existing = await prisma.staffAccount.findUnique({ where: { staffId } });
  if (existing) {
    return Response.json({ error: "A staff member with this name already exists." }, { status: 409 });
  }

  const passcode = `${PASSCODE_PREFIX[role]}-${crypto.randomInt(1000, 9999)}`;
  const passcodeHash = await bcrypt.hash(passcode, 10);

  const account = await prisma.staffAccount.create({
    data: { staffId, name, role: role as StaffRole, passcodeHash },
  });

  return Response.json({
    staffId: account.staffId,
    name: account.name,
    role: account.role,
    passcode,
  });
}
