import { prisma } from "@/lib/prisma";
import type { TierId } from "@/generated/prisma/enums";

// Server-only data access for events/tiers, backed by the real database —
// replaces the old static src/lib/content.ts events/tiers arrays so events
// created from the admin panel actually show up on the public site.

export interface BBTEvent {
  slug: string;
  name: string;
  city: string;
  date: string;
  cat: string;
  tint: string;
  time: string;
  venue: string;
  price: number;
  ticketsLabel: string;
  description: string;
  image: string;
  capacity: number;
}

export interface Tier {
  id: "early" | "regular" | "vip";
  label: string;
  price: number;
  note: string;
  left: number;
}

interface EventRow {
  slug: string;
  name: string;
  city: string;
  date: string;
  cat: string;
  tint: string;
  time: string;
  venue: string;
  price: number;
  ticketsLabel: string;
  description: string;
  image: string;
  capacity: number;
}

interface TierRow {
  id: TierId;
  label: string;
  price: number;
  note: string;
  left: number;
}

function toBBTEvent(e: EventRow): BBTEvent {
  return {
    slug: e.slug,
    name: e.name,
    city: e.city,
    date: e.date,
    cat: e.cat,
    tint: e.tint,
    time: e.time,
    venue: e.venue,
    price: e.price,
    ticketsLabel: e.ticketsLabel,
    description: e.description,
    image: e.image,
    capacity: e.capacity,
  };
}

function toTier(t: TierRow): Tier {
  return {
    id: t.id.toLowerCase() as Tier["id"],
    label: t.label,
    price: t.price,
    note: t.note,
    left: t.left,
  };
}

// Live/real events surface first, "coming soon" announcements (cat ADDA)
// come next, and locked/unannounced slots (cat MYSTERY) sink to the bottom —
// regardless of creation order.
function displayRank(cat: string): number {
  if (cat === "MYSTERY") return 2;
  if (cat === "ADDA") return 1;
  return 0;
}

export async function getEvents(): Promise<BBTEvent[]> {
  const rows = await prisma.event.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toBBTEvent).sort((a, b) => displayRank(a.cat) - displayRank(b.cat));
}

export async function getEventBySlug(slug: string): Promise<BBTEvent | null> {
  const row = await prisma.event.findUnique({ where: { slug } });
  return row ? toBBTEvent(row) : null;
}

export async function getTiers(): Promise<Tier[]> {
  const rows = await prisma.tier.findMany();
  return rows.map(toTier);
}

export async function getRegisteredQty(slug: string): Promise<number> {
  const agg = await prisma.registration.aggregate({
    where: { eventSlug: slug },
    _sum: { qty: true },
  });
  return agg._sum.qty ?? 0;
}
