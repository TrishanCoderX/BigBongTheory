import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

function escapeCsv(value: string | number | boolean | null) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  const gate = await requireStaff("MODERATOR");
  if ("error" in gate) return gate.error;

  const rows = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: { checkedInBy: { select: { name: true } } },
  });

  const header = [
    "ticketId",
    "eventSlug",
    "tier",
    "name",
    "email",
    "phone",
    "qty",
    "amount",
    "checkedIn",
    "checkedInAt",
    "checkedInBy",
    "createdAt",
  ];

  const lines = rows.map((r) =>
    [
      r.ticketId,
      r.eventSlug,
      r.tier,
      r.name,
      r.email,
      r.phone,
      r.qty,
      r.amount,
      r.checkedIn,
      r.checkedInAt?.toISOString() ?? "",
      r.checkedInBy?.name ?? "",
      r.createdAt.toISOString(),
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [header.join(","), ...lines].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bbt-registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
