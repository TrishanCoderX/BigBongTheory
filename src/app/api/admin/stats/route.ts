import { prisma } from "@/lib/prisma";
import { requireStaff, staffRoleAtLeast } from "@/lib/staffSession";

export async function GET() {
  const gate = await requireStaff("MODERATOR");
  if ("error" in gate) return gate.error;
  const { session } = gate;

  const [events, tiers, registrations, totalApplications, totalSponsorApplications] = await Promise.all([
    prisma.event.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.tier.findMany(),
    prisma.registration.findMany(),
    prisma.joinApplication.count(),
    prisma.sponsorApplication.count(),
  ]);

  const ticketsSold = registrations.reduce((sum, r) => sum + r.qty, 0);
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;

  const byEvent = events.map((event) => {
    const rowsForEvent = registrations.filter((r) => r.eventSlug === event.slug);
    return {
      slug: event.slug,
      name: event.name,
      status: event.status,
      sold: rowsForEvent.reduce((sum, r) => sum + r.qty, 0),
      checkedIn: rowsForEvent.filter((r) => r.checkedIn).length,
      capacity: event.capacity,
    };
  });

  const byTier = tiers.map((t) => ({
    id: t.id.toLowerCase(),
    label: t.label,
    count: registrations.filter((r) => r.tier === t.id).reduce((sum, r) => sum + r.qty, 0),
  }));

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const dayOffset = 6 - i;
    const date = new Date(Date.now() - dayOffset * 86400000);
    const label = date.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase();
    const count = registrations.filter(
      (r) => new Date(r.createdAt).toDateString() === date.toDateString()
    ).length;
    return { label, count };
  });

  const stats: Record<string, unknown> = {
    totalEvents: events.length,
    totalAttendees: registrations.length,
    ticketsSold,
    checkedInCount,
    checkedInPct: registrations.length ? Math.round((checkedInCount / registrations.length) * 100) : 0,
    byEvent,
    byTier,
    last7Days,
    totalApplications,
    totalSponsorApplications,
  };

  if (staffRoleAtLeast(session.role, "SUPER_ADMIN")) {
    stats.revenue = registrations.reduce((sum, r) => sum + r.amount, 0);
  }

  return Response.json(stats);
}
