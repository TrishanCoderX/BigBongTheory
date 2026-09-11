import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

export async function POST(request: Request) {
  const gate = await requireStaff("MODERATOR");
  if ("error" in gate) return gate.error;

  const body = await request.json().catch(() => null);
  const ticketId = String(body?.ticketId ?? "").toUpperCase();
  if (!ticketId) return Response.json({ error: "ticketId is required." }, { status: 400 });

  const existing = await prisma.registration.findUnique({ where: { ticketId } });
  if (!existing) return Response.json({ error: "Ticket not found." }, { status: 404 });

  await prisma.registration.update({
    where: { ticketId },
    data: { checkedIn: false, checkedInAt: null, checkedInById: null },
  });

  return Response.json({ ok: true });
}
