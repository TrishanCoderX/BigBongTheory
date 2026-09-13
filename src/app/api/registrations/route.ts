import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sendBookingConfirmation } from "@/lib/email";
import { TierId } from "@/generated/prisma/enums";

const VALID_TIERS = new Set<string>(Object.values(TierId));

function generateTicketId(tier: string) {
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `BBT-${tier.slice(0, 3).toUpperCase()}-${random}`;
}

export async function POST(request: Request) {
  const session = await auth();
  // Booking requires a Google sign-in specifically — enforced here too (not
  // just in the /book page UI) since this is the endpoint that actually
  // creates a ticket; the UI gate alone wouldn't stop a direct API call.
  if (!session?.user || session.user.provider !== "google") {
    return Response.json({ error: "Sign in with Google to book a ticket." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const eventSlug = String(body?.eventSlug ?? "");
  const tierRaw = String(body?.tier ?? "").toUpperCase();
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const phone = String(body?.phone ?? "").trim();
  const qtyRaw = Math.min(8, Math.max(1, Number(body?.qty) || 1));

  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email." }, { status: 400 });
  if (!/^[0-9+\s-]{7,15}$/.test(phone)) {
    return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  if (!VALID_TIERS.has(tierRaw)) {
    return Response.json({ error: "Invalid ticket tier." }, { status: 400 });
  }
  const tierInput = tierRaw as TierId;

  const [event, tier] = await Promise.all([
    prisma.event.findUnique({ where: { slug: eventSlug } }),
    prisma.tier.findUnique({ where: { id: tierInput } }),
  ]);
  if (!event) return Response.json({ error: "Event not found." }, { status: 404 });
  if (!tier) return Response.json({ error: "Invalid ticket tier." }, { status: 400 });

  const isFree = event.price === 0;
  // Free events are capped at one ticket per booking, and one booking per
  // person — otherwise a single visitor could claim several of a scarce,
  // limited-capacity free allocation (e.g. Turf Day's 20 spots).
  const qty = isFree ? 1 : qtyRaw;

  if (isFree) {
    // Keyed on the authenticated Google account, not the typed-in email —
    // otherwise the same person could re-enter a different email each time
    // and claim multiple spots on a capacity-limited free event.
    const existing = await prisma.registration.findFirst({ where: { eventSlug, userId: session.user.id } });
    if (existing) {
      return Response.json(
        { error: "You've already claimed a spot for this event with this account." },
        { status: 409 },
      );
    }
  }

  const registeredAgg = await prisma.registration.aggregate({
    where: { eventSlug },
    _sum: { qty: true },
  });
  const remaining = event.capacity - (registeredAgg._sum.qty ?? 0);
  if (remaining <= 0) {
    return Response.json({ error: "This event is sold out." }, { status: 409 });
  }
  if (qty > remaining) {
    return Response.json(
      { error: `Only ${remaining} spot${remaining === 1 ? "" : "s"} left.` },
      { status: 409 },
    );
  }

  // Free events (price 0) are free regardless of which tier a user picks —
  // tiers are global pricing tiers shared across all events, so this keeps
  // a $0 event actually free instead of charging a tier's list price.
  const amount = isFree ? 0 : tier.price * qty;

  let registration = null;
  for (let attempt = 0; attempt < 3 && !registration; attempt++) {
    const ticketId = generateTicketId(tierInput);
    try {
      registration = await prisma.registration.create({
        data: {
          ticketId,
          eventSlug,
          tier: tierInput,
          name,
          email,
          phone,
          qty,
          amount,
          userId: session.user.id,
        },
      });
    } catch (err) {
      // P2002 = unique constraint violation on ticketId; astronomically
      // unlikely with a random 24-bit suffix, but retry rather than fail.
      if (!(err && typeof err === "object" && "code" in err && err.code === "P2002")) throw err;
    }
  }

  if (!registration) {
    return Response.json({ error: "Could not generate a ticket. Try again." }, { status: 500 });
  }

  await sendBookingConfirmation({
    to: registration.email,
    name: registration.name,
    eventName: event.name,
    eventDate: event.date,
    eventVenue: event.venue,
    tierLabel: tier.label,
    ticketId: registration.ticketId,
    amount: registration.amount,
  });

  return Response.json({
    ticketId: registration.ticketId,
    eventSlug: registration.eventSlug,
    tier: registration.tier.toLowerCase(),
    name: registration.name,
    email: registration.email,
    amount: registration.amount,
  });
}
