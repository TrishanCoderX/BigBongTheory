import { prisma } from "@/lib/prisma";
import { sendJoinConfirmation } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const city = String(body?.city ?? "").trim();
  const handle = String(body?.handle ?? "").trim();
  const idea = String(body?.idea ?? "").trim();
  const tags = Array.isArray(body?.tags) ? body.tags.map((t: unknown) => String(t)).filter(Boolean) : [];

  if (!name) return Response.json({ error: "Name is required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email." }, { status: 400 });
  if (!idea) return Response.json({ error: "Tell us the idea — even a bad one." }, { status: 400 });

  const application = await prisma.joinApplication.create({
    data: { name, email, city, handle, idea, tags: tags.join(",") },
  });

  await sendJoinConfirmation({ to: email, name });

  return Response.json({ id: application.id });
}
