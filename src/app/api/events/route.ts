import { getEvents, getTiers } from "@/lib/events";

export async function GET() {
  const [events, tiers] = await Promise.all([getEvents(), getTiers()]);
  return Response.json({ events, tiers });
}
