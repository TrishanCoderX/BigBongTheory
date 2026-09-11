import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

export async function GET(request: Request) {
  const gate = await requireStaff("MODERATOR");
  if ("error" in gate) return gate.error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("query") ?? "").trim();

  const registrations = await prisma.registration.findMany({
    where: q
      ? {
          OR: [
            { ticketId: { contains: q.toUpperCase() } },
            { name: { contains: q } },
            { email: { contains: q.toLowerCase() } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return Response.json({
    registrations: registrations.map((r) => ({
      ticketId: r.ticketId,
      name: r.name,
      tier: r.tier.toLowerCase(),
      checkedIn: r.checkedIn,
    })),
  });
}
