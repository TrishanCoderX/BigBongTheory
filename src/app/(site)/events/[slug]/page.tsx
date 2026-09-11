import Link from "next/link";
import { notFound } from "next/navigation";
import { expect, schedule, guests, faqs } from "@/lib/content";
import { getEventBySlug, getRegisteredQty } from "@/lib/events";
import FAQAccordion from "@/components/FAQAccordion";

const DEFAULT_DESCRIPTION =
  "An evening built for people who talk too much and create too little. Bring the idea you keep postponing. We'll bring the mic, the projector, the speakers, and roughly two hundred strangers who will absolutely interrupt you. No panels. No networking. Just noise, work-in-progress, and chai at 2 AM.";

const TURF_EXPECT = ["CRICKET", "FOOTBALL", "FUN GAMES", "COMMUNITY MEET", "TEAM DRAFT", "SNACKS & CHAI"];

const TURF_SCHEDULE = [
  { t: "17:00", what: "Check-in, jerseys/bibs, team draft" },
  { t: "17:20", what: "Football block — round robin" },
  { t: "18:15", what: "Cricket block — quick overs" },
  { t: "19:15", what: "Fun games & mixed challenges" },
  { t: "20:00", what: "Cool down, chai, photos" },
];

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const isTurf = event.slug === "turf-day";
  const expectItems = isTurf ? TURF_EXPECT : expect;
  const scheduleItems = isTurf ? TURF_SCHEDULE : schedule;

  const registered = await getRegisteredQty(event.slug);
  const remaining = Math.max(0, event.capacity - registered);
  const soldOut = remaining <= 0;
  const isFree = event.price === 0;

  return (
    <div>
      <section
        className="relative min-h-[78vh] flex items-end px-5 md:px-6 pt-[130px] pb-11 overflow-hidden bg-[repeating-linear-gradient(108deg,rgba(243,240,231,0.09)_0_2px,transparent_2px_12px)]"
        style={{ backgroundColor: event.tint }}
      >
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute top-[40%] left-0 right-0 text-center font-mono text-[11px] tracking-[0.24em] uppercase text-cream/35">
            [ KEY EVENT VISUAL — 1600×900 ]
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/92 via-background/25 to-transparent" />
        <div className="relative w-full max-w-[1500px] mx-auto">
          <div className="font-mono text-[11px] tracking-[0.26em] uppercase text-lime mb-4">
            {event.cat} / BBT PRESENTS
          </div>
          <h1
            className="font-display uppercase leading-[0.8] tracking-[-0.04em]"
            style={{ fontSize: "clamp(48px, 11vw, 190px)" }}
          >
            {event.name}
          </h1>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-cream/[0.14]">
        {[
          { k: "DATE", v: event.date },
          { k: "TIME", v: event.time },
          { k: "VENUE", v: event.venue },
          { k: "CITY", v: event.city },
        ].map((m) => (
          <div key={m.k} className="p-5.5 border-r border-cream/[0.14] last:border-r-0">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/45 mb-2.5">{m.k}</div>
            <div className="font-display text-2xl uppercase">{m.v}</div>
          </div>
        ))}
      </div>

      <section className="max-w-[1500px] mx-auto px-5 md:px-6 py-[10vh] grid grid-cols-1 md:grid-cols-2 gap-14">
        <div>
          <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-ember mb-5">THE PLOT</div>
          <p className="text-[19px] leading-relaxed text-cream/80">
            {event.description || DEFAULT_DESCRIPTION}
          </p>
          <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-ember my-11">
            WHAT TO EXPECT
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {expectItems.map((x) => (
              <div
                key={x}
                className="p-4 border border-cream/[0.16] font-display text-xl uppercase transition-colors hover:bg-lime hover:text-background hover:border-lime"
              >
                {x}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-ember mb-5">RUN OF SHOW</div>
          <div className="flex flex-col">
            {scheduleItems.map((sl) => (
              <div key={sl.t} className="flex gap-5 py-3.5 border-t border-cream/[0.14]">
                <div className="font-mono text-xs text-lime min-w-[82px]">{sl.t}</div>
                <div className="text-base text-cream/80">{sl.what}</div>
              </div>
            ))}
          </div>
          {!isTurf && (
            <>
              <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-ember my-11">
                ON THE LINEUP
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {guests.map((g) => (
                  <div
                    key={g}
                    className="px-4 py-3 bg-surface-high border border-cream/[0.16] font-mono text-[11px] tracking-[0.14em] uppercase"
                  >
                    {g}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-ember my-11">FAQS</div>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      <section className="px-5 md:px-6 py-[12vh] border-t border-cream/[0.14] text-center">
        <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-cream/50 mb-6.5">
          {isFree
            ? soldOut
              ? "ALL 20 SPOTS CLAIMED"
              : `FREE ENTRY / ${remaining} OF ${event.capacity} SPOTS LEFT`
            : `FROM ₹${event.price} / LIMITED CAPACITY`}
        </div>
        {soldOut ? (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-4 px-11 py-6.5 border border-cream/25 text-cream/40 font-display uppercase cursor-not-allowed"
            style={{ fontSize: "clamp(28px, 6vw, 78px)" }}
          >
            REGISTRATION CLOSED
          </span>
        ) : (
          <Link
            href={`/events/${event.slug}/book`}
            data-mag="1"
            className="inline-flex items-center gap-4 px-11 py-6.5 bg-lime text-background font-display uppercase cursor-pointer transition-[background,transform] duration-300 hover:bg-ember hover:text-cream hover:scale-[1.03]"
            style={{ fontSize: "clamp(28px, 6vw, 78px)" }}
          >
            {isFree ? "RESERVE YOUR SPOT →" : "GET TICKETS →"}
          </Link>
        )}
      </section>
    </div>
  );
}
