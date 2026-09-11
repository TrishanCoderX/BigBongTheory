import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

export async function POST(request: Request) {
  const gate = await requireStaff("STAFF");
  if ("error" in gate) return gate.error;
  const { session } = gate;

  const body = await request.json().catch(() => null);
  const ticketId = String(body?.ticketId ?? "").toUpperCase();
  if (!ticketId) return Response.json({ error: "ticketId is required." }, { status: 400 });

  const existing = await prisma.registration.findUnique({ where: { ticketId } });
  if (!existing) return Response.json({ status: "not-found" });

  // Conditional update (only where still un-checked-in) instead of a plain
  // update, so two staff scanning the same ticket at once can't both "win".
  const result = await prisma.registration.updateMany({
    where: { ticketId, checkedIn: false },
    data: { checkedIn: true, checkedInAt: new Date(), checkedInById: session.id },
  });

  const final = await prisma.registration.findUnique({ where: { ticketId }, include: { event: true } });

  return Response.json({
    status: result.count > 0 ? "checked-in" : "already",
    registration: {
      ticketId: final!.ticketId,
      eventSlug: final!.eventSlug,
      eventName: final!.event.name,
      name: final!.name,
      tier: final!.tier.toLowerCase(),
      checkedIn: final!.checkedIn,
      checkedInAt: final!.checkedInAt,
    },
  });
}
