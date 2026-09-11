import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";
import { ticketIdFromScan } from "@/lib/ticketFormat";

export async function POST(request: Request) {
  const gate = await requireStaff("STAFF");
  if ("error" in gate) return gate.error;

  const body = await request.json().catch(() => null);
  const raw = String(body?.ticketId ?? body?.raw ?? "");
  const query = String(body?.query ?? "").trim();

  let registration = null;

  if (raw) {
    const ticketId = (ticketIdFromScan(raw) ?? raw).toUpperCase();
    registration = await prisma.registration.findUnique({ where: { ticketId }, include: { event: true } });
  } else if (query) {
    const upper = query.toUpperCase();
    registration = await prisma.registration.findFirst({
      where: {
        OR: [
          { ticketId: upper },
          { name: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query.toLowerCase() } },
        ],
      },
      include: { event: true },
    });
  } else {
    return Response.json({ error: "Provide a ticketId or query." }, { status: 400 });
  }

  if (!registration) {
    return Response.json({ status: "not-found" });
  }

  return Response.json({
    status: registration.checkedIn ? "already" : "found",
    registration: {
      ticketId: registration.ticketId,
      eventSlug: registration.eventSlug,
      eventName: registration.event.name,
      tier: registration.tier.toLowerCase(),
      name: registration.name,
      checkedIn: registration.checkedIn,
      checkedInAt: registration.checkedInAt,
    },
  });
}
