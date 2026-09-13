import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getEventBySlug, getTiers, getRegisteredQty } from "@/lib/events";
import BookingWizard from "@/components/BookingWizard";

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, tiers, session] = await Promise.all([getEventBySlug(slug), getTiers(), auth()]);
  if (!event) notFound();

  // Booking requires a Google sign-in specifically (not the email/password
  // path) — Google gives every ticket a real, hard-to-fake identity behind
  // it, which matters most for scarce free-capacity events like Turf Day.
  if (!session?.user || session.user.provider !== "google") {
    return (
      <section className="pt-[140px] pb-[14vh] px-5 md:px-6 max-w-[700px] mx-auto text-center">
        <div className="font-mono text-[11px] tracking-[0.26em] uppercase text-ember mb-4">
          {event.name}
        </div>
        <h1 className="font-display uppercase leading-[0.86] tracking-[-0.03em] mb-6" style={{ fontSize: "clamp(34px, 7vw, 72px)" }}>
          SIGN IN TO BOOK
        </h1>
        <p className="text-cream/60 text-base mb-10 max-w-[520px] mx-auto">
          We ask for a Google sign-in before booking — it keeps this fair for everyone and stops one
          person from grabbing every spot on a limited free event.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: `/events/${slug}/book` });
          }}
        >
          <button
            type="submit"
            data-mag="1"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-cream text-[#08080B] font-mono text-sm font-bold tracking-[0.1em] uppercase cursor-pointer transition-colors hover:bg-cream/85 min-h-[48px]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            CONTINUE WITH GOOGLE
          </button>
        </form>
        <div className="mt-8">
          <Link
            href="/events"
            data-mag="1"
            className="inline-flex items-center gap-3 px-7 py-4.5 border border-cream/25 text-cream/70 font-mono text-[13px] tracking-[0.16em] uppercase cursor-pointer min-h-[48px]"
          >
            ← BACK TO EVENTS
          </Link>
        </div>
      </section>
    );
  }

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
