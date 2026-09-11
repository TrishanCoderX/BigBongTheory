import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEventBySlug, getTiers } from "@/lib/events";
import TicketClient from "@/components/TicketClient";

export default async function TicketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, tiers] = await Promise.all([getEventBySlug(slug), getTiers()]);
  if (!event) notFound();

  return (
    <Suspense fallback={null}>
      <TicketClient event={event} tiers={tiers} />
    </Suspense>
  );
}
