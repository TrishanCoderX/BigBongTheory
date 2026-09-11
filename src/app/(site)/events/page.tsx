"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pastEvents } from "@/lib/content";
import type { BBTEvent } from "@/lib/events";

export default function EventsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<BBTEvent[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setEvents(data.events));
  }, []);

  return (
    <section className="pt-[120px] pb-[14vh] px-5 md:px-6 max-w-[1500px] mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-3.5">
        EVENT INDEX / KOLKATA &amp; BEYOND
      </div>
      <h1
        className="font-display uppercase leading-[0.78] tracking-[-0.04em]"
        style={{ fontSize: "clamp(56px, 15vw, 260px)" }}
      >
        EVENTS
      </h1>

      <div className="flex gap-2 my-11 font-mono text-xs tracking-[0.16em] uppercase">
        <button
          type="button"
          data-mag="1"
          onClick={() => setTab("upcoming")}
          className={`px-5.5 py-3.5 min-h-[46px] cursor-pointer border transition-colors ${
            tab === "upcoming" ? "bg-lime text-background border-lime" : "border-cream/20 text-cream/70"
          }`}
        >
          UPCOMING
        </button>
        <button
          type="button"
          data-mag="1"
          onClick={() => setTab("past")}
          className={`px-5.5 py-3.5 min-h-[46px] cursor-pointer border transition-colors ${
            tab === "past" ? "bg-lime text-background border-lime" : "border-cream/20 text-cream/70"
          }`}
        >
          PAST
        </button>
      </div>

      <div className="flex flex-col">
        {tab === "upcoming"
          ? events.map((e, i) =>
              e.cat === "MYSTERY" ? (
                <div
                  key={e.slug}
                  className="relative grid grid-cols-[64px_minmax(0,1fr)_auto] gap-4.5 items-center py-6.5 px-1.5 border-t border-dashed border-cream/[0.14] cursor-default"
                >
                  <span className="font-mono text-[11px] text-cream/25">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span
                      className="block font-display uppercase tracking-[-0.02em] leading-[0.9] text-cream/35"
                      style={{ fontSize: "clamp(28px, 5.4vw, 78px)" }}
                    >
                      REVEALING SOON
                    </span>
                    <span className="flex gap-4 flex-wrap mt-2.5 font-mono text-[11px] tracking-[0.14em] uppercase text-cream/35">
                      <span>???</span>
                      <span>TBA</span>
                      <span className="text-ember">LOCKED</span>
                    </span>
                  </span>
                  <span className="w-[92px] h-[118px] flex items-center justify-center bg-[#14141A] font-display text-transparent text-3xl" style={{ WebkitTextStroke: "1px rgba(243,240,231,0.25)" }}>
                    ?
                  </span>
                </div>
              ) : (
                <Link
                  key={e.slug}
                  href={`/events/${e.slug}`}
                  data-mag="1"
                  className="group relative grid grid-cols-[64px_minmax(0,1fr)_auto] gap-4.5 items-center py-6.5 px-1.5 border-t border-cream/[0.14] cursor-pointer transition-[background,padding] duration-300 hover:bg-lime/[0.07] hover:pl-5 block"
                >
                  <span className="font-mono text-[11px] text-cream/40">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span
                      className="block font-display uppercase tracking-[-0.02em] leading-[0.9]"
                      style={{ fontSize: "clamp(28px, 5.4vw, 78px)" }}
                    >
                      {e.name}
                    </span>
                    <span className="flex gap-4 flex-wrap mt-2.5 font-mono text-[11px] tracking-[0.14em] uppercase text-cream/55">
                      <span>{e.date}</span>
                      <span>{e.city}</span>
                      <span className="text-lime">{e.cat}</span>
                      <span>{e.ticketsLabel}</span>
                    </span>
                  </span>
                  <span className="relative w-[92px] h-[118px] flex-none overflow-hidden bg-[#14141A] bg-[repeating-linear-gradient(112deg,rgba(243,240,231,0.12)_0_2px,transparent_2px_10px)]">
                    {e.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.image} alt={e.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[8px] tracking-[0.12em] uppercase text-cream/35 text-center">
                        [ POSTER ]
                      </span>
                    )}
                  </span>
                </Link>
              )
            )
          : pastEvents.map((e, i) => (
              <div
                key={e.slug}
                className="relative grid grid-cols-[64px_minmax(0,1fr)_auto] gap-4.5 items-center py-6.5 px-1.5 border-t border-cream/[0.14]"
              >
                <span className="font-mono text-[11px] text-cream/40">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span
                    className="block font-display uppercase tracking-[-0.02em] leading-[0.9]"
                    style={{ fontSize: "clamp(28px, 5.4vw, 78px)" }}
                  >
                    {e.name}
                  </span>
                  <span className="flex gap-4 flex-wrap mt-2.5 font-mono text-[11px] tracking-[0.14em] uppercase text-cream/55">
                    <span>{e.date}</span>
                    <span>{e.city}</span>
                    <span className="text-lime">{e.cat}</span>
                    <span>ARCHIVED</span>
                  </span>
                </span>
                <span className="w-[92px] h-[118px] flex items-center justify-center bg-[#14141A] font-mono text-[8px] tracking-[0.12em] uppercase text-cream/35 text-center bg-[repeating-linear-gradient(112deg,rgba(243,240,231,0.12)_0_2px,transparent_2px_10px)]">
                  [ POSTER ]
                </span>
              </div>
            ))}
        <div className="border-t border-cream/[0.14]" />
      </div>
    </section>
  );
}
