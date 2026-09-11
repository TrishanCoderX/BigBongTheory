import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createStaffSessionCookie } from "@/lib/staffSession";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const staffId = String(body?.staffId ?? "").trim().toLowerCase();
  const passcode = String(body?.passcode ?? "");

  if (!staffId || !passcode) {
    return Response.json({ error: "Staff ID and passcode are required." }, { status: 400 });
  }

  const account = await prisma.staffAccount.findUnique({ where: { staffId } });
  if (!account) {
    return Response.json({ error: "Staff ID or passcode is incorrect." }, { status: 401 });
  }

  const valid = await bcrypt.compare(passcode, account.passcodeHash);
  if (!valid) {
    return Response.json({ error: "Staff ID or passcode is incorrect." }, { status: 401 });
  }

  await createStaffSessionCookie({
    id: account.id,
    staffId: account.staffId,
    name: account.name,
    role: account.role,
  });

  return Response.json({ ok: true, staff: { staffId: account.staffId, name: account.name, role: account.role } });
}
