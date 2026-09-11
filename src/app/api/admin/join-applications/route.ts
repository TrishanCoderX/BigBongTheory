import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

export async function GET(request: Request) {
  const gate = await requireStaff("MODERATOR");
  if ("error" in gate) return gate.error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("query") ?? "").trim();

  const applications = await prisma.joinApplication.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q.toLowerCase() } },
            { city: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return Response.json({
    applications: applications.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      city: a.city,
      handle: a.handle,
      idea: a.idea,
      tags: a.tags ? a.tags.split(",") : [],
      status: a.status,
      createdAt: a.createdAt,
    })),
  });
}
