import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";
import { StaffRole } from "@/generated/prisma/enums";

const VALID_ROLES = new Set<string>(Object.values(StaffRole));

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ staffId: string }> }
) {
  const gate = await requireStaff("SUPER_ADMIN");
  if ("error" in gate) return gate.error;
  const { session } = gate;

  const { staffId } = await params;
  if (staffId === session.staffId) {
    return Response.json({ error: "You can't change your own role." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const role = String(body?.role ?? "").toUpperCase();
  if (!VALID_ROLES.has(role)) return Response.json({ error: "Invalid role." }, { status: 400 });

  const existing = await prisma.staffAccount.findUnique({ where: { staffId } });
  if (!existing) return Response.json({ error: "Staff member not found." }, { status: 404 });

  const updated = await prisma.staffAccount.update({
    where: { staffId },
    data: { role: role as StaffRole },
  });

  return Response.json({ staffId: updated.staffId, name: updated.name, role: updated.role });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ staffId: string }> }
) {
  const gate = await requireStaff("SUPER_ADMIN");
  if ("error" in gate) return gate.error;
  const { session } = gate;

  const { staffId } = await params;
  if (staffId === session.staffId) {
    return Response.json({ error: "You can't remove your own account." }, { status: 400 });
  }

  const existing = await prisma.staffAccount.findUnique({ where: { staffId } });
  if (!existing) return Response.json({ error: "Staff member not found." }, { status: 404 });

  await prisma.staffAccount.delete({ where: { staffId } });
  return Response.json({ ok: true });
}
