import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const path = String(body?.path ?? "/").slice(0, 200);

  // Best-effort — a tracking failure should never surface to the visitor or
  // block anything, it's purely for the admin dashboard's benefit.
  try {
    await prisma.pageView.create({ data: { path } });
  } catch (err) {
    console.error("[track-visit] failed to record page view:", err);
  }

  return new Response(null, { status: 204 });
}
