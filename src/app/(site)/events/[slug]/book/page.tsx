import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventBySlug, getTiers, getRegisteredQty } from "@/lib/events";
import BookingWizard from "@/components/BookingWizard";

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, tiers] = await Promise.all([getEventBySlug(slug), getTiers()]);
  if (!event) notFound();

  const registered = await getRegisteredQty(event.slug);
  const remaining = Math.max(0, event.capacity - registered);

  if (remaining <= 0) {
    return (
      <section className="pt-[140px] pb-[14vh] px-5 md:px-6 max-w-[700px] mx-auto text-center">
        <div className="font-mono text-[11px] tracking-[0.26em] uppercase text-ember mb-4">
          {event.name}
        </div>
        <h1 className="font-display uppercase leading-[0.86] tracking-[-0.03em] mb-6" style={{ fontSize: "clamp(34px, 7vw, 72px)" }}>
          REGISTRATION CLOSED
        </h1>
        <p className="text-cream/60 text-base mb-10">
          All spots for this event have been claimed. Keep an eye on the events page for what&apos;s next.
        </p>
        <Link
          href="/events"
          data-mag="1"
          className="inline-flex items-center gap-3 px-7 py-4.5 border border-lime text-lime font-mono text-[13px] tracking-[0.16em] uppercase cursor-pointer min-h-[48px]"
        >
          ← BACK TO EVENTS
        </Link>
      </section>
    );
  }

  return <BookingWizard event={event} tiers={tiers} remaining={remaining} />;
}
