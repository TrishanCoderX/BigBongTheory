import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

export async function GET() {
  const gate = await requireStaff("STAFF");
  if ("error" in gate) return gate.error;

  const recent = await prisma.registration.findMany({
    where: { checkedIn: true },
    orderBy: { checkedInAt: "desc" },
    take: 6,
    select: { ticketId: true, name: true, checkedInAt: true },
  });

  return Response.json({ recent });
}
