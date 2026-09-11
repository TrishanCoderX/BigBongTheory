import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params;
  const registration = await prisma.registration.findUnique({
    where: { ticketId: ticketId.toUpperCase() },
  });

  if (!registration) {
    return Response.json({ error: "Ticket not found." }, { status: 404 });
  }

  // This endpoint is intentionally unauthenticated (viewing a ticket only
  // requires the link) — keep the response to what the ticket page actually
  // displays, not the attendee's email/phone/amount, so a guessed or
  // enumerated ticket ID can't be used to harvest attendee PII.
  return Response.json({
    ticketId: registration.ticketId,
    tier: registration.tier.toLowerCase(),
    name: registration.name,
    checkedIn: registration.checkedIn,
  });
}
