import { prisma } from "@/lib/prisma";
import { sendSponsorConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const brandName = String(body?.brandName ?? "").trim();
  const contactName = String(body?.contactName ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const phone = String(body?.phone ?? "").trim();
  const website = String(body?.website ?? "").trim();
  const message = String(body?.message ?? "").trim();
  const interests = Array.isArray(body?.interests)
    ? body.interests.map((t: unknown) => String(t)).filter(Boolean)
    : [];

  if (!brandName) return Response.json({ error: "Brand / organisation name is required." }, { status: 400 });
  if (!contactName) return Response.json({ error: "Contact person name is required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email." }, { status: 400 });
  if (!message) return Response.json({ error: "Tell us what you're looking to sponsor." }, { status: 400 });

  const application = await prisma.sponsorApplication.create({
    data: { brandName, contactName, email, phone, website, interests: interests.join(","), message },
  });

  await sendSponsorConfirmation({ to: email, brandName, contactName });

  return Response.json({ id: application.id });
}
