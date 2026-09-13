import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staffSession";

export async function GET(request: Request) {
  const gate = await requireStaff("MODERATOR");
  if ("error" in gate) return gate.error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("query") ?? "").trim();

  const applications = await prisma.sponsorApplication.findMany({
    where: q
      ? {
          OR: [
            { brandName: { contains: q } },
            { contactName: { contains: q } },
            { email: { contains: q.toLowerCase() } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return Response.json({
    applications: applications.map((a) => ({
      id: a.id,
      brandName: a.brandName,
      contactName: a.contactName,
      email: a.email,
      phone: a.phone,
      website: a.website,
      interests: a.interests ? a.interests.split(",") : [],
      message: a.message,
      status: a.status,
      createdAt: a.createdAt,
    })),
  });
}
