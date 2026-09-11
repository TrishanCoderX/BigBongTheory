"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { BBTEvent } from "@/lib/events";

export default function SuccessClient({ event }: { event: BBTEvent }) {
  const sp = useSearchParams();
  const email = sp.get("email") || "you@chaos.in";
  const ticketId = sp.get("ticketId") || "BBT-DEMO-000000";

  const ticketParams = new URLSearchParams();
  sp.forEach((v, k) => ticketParams.set(k, v));

  return (
    <section className="min-h-[100vh] flex flex-col justify-center px-5 md:px-6 pt-[120px] pb-[12vh] max-w-[1200px] mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime mb-5">
        PAYMENT CONFIRMED / ORDER {ticketId}
      </div>
      <h1
        className="font-display uppercase leading-[0.78] tracking-[-0.04em]"
        style={{ fontSize: "clamp(48px, 13vw, 210px)" }}
      >
        YOU&apos;RE IN.
        <br />
        <span className="text-ember">CHAOS AWAITS.</span>
      </h1>
      <p className="mt-8.5 text-lg leading-relaxed text-cream/70 max-w-[620px]">
        Your pass for <span className="text-lime">{event.name}</span> is live. We&apos;ve mailed a
        copy to {email} — but the pass in your dashboard is the one that gets scanned. Keep the
        tab open.
      </p>
      <div className="flex gap-3 mt-11 flex-wrap">
        <Link
          href={`/ticket/${event.slug}?${ticketParams.toString()}`}
          data-mag="1"
          className="px-8 py-5.5 bg-lime text-background font-display text-[28px] uppercase cursor-pointer transition-colors hover:bg-ember hover:text-cream"
        >
          VIEW MY PASS →
        </Link>
        <Link
          href="/events"
          data-mag="1"
          className="px-8 py-5.5 border border-cream/30 font-mono text-xs tracking-[0.16em] uppercase cursor-pointer inline-flex items-center transition-colors hover:border-cream hover:bg-cream/[0.08]"
        >
          BROWSE MORE CHAOS
        </Link>
      </div>
    </section>
  );
}
