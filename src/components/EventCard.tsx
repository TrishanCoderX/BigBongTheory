import Link from "next/link";
import type { BBTEvent } from "@/lib/events";

export default function EventCard({ event }: { event: BBTEvent }) {
  if (event.cat === "MYSTERY") {
    return (
      <div className="group relative flex-none w-[min(78vw,460px)] snap-start border border-dashed border-cream/[0.22] bg-[#0C0C10] overflow-hidden cursor-default">
        <div className="relative h-[460px] flex flex-col items-center justify-center gap-4 p-5 overflow-hidden bg-[repeating-linear-gradient(115deg,rgba(243,240,231,0.06)_0_2px,transparent_2px_14px)]">
          <span className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 bg-background text-ember">
            LOCKED
          </span>
          <span
            className="font-display text-transparent leading-none"
            style={{ WebkitTextStroke: "1.5px rgba(243,240,231,0.28)", fontSize: "clamp(90px, 15vw, 160px)" }}
          >
            ?
          </span>
          <span className="relative font-display uppercase tracking-[-0.02em] leading-[0.86] text-cream/45 text-center" style={{ fontSize: "clamp(24px, 3.6vw, 38px)" }}>
            REVEALING SOON
          </span>
        </div>
        <div className="flex justify-between items-center gap-3.5 px-5 py-4.5 font-mono text-[11px] tracking-[0.14em] uppercase text-cream/35">
          <span>???</span>
          <span>TBA</span>
          <span>LOCKED</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      data-mag="1"
      className="group relative flex-none w-[min(78vw,460px)] snap-start cursor-pointer border border-cream/[0.16] bg-[#0C0C10] overflow-hidden transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-2.5 hover:border-lime block"
    >
      <div
        className="relative h-[460px] flex items-end p-5 overflow-hidden bg-[repeating-linear-gradient(115deg,rgba(243,240,231,0.09)_0_2px,transparent_2px_11px)]"
        style={{ backgroundColor: event.tint }}
      >
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.2em] uppercase text-cream/40">
            [ EVENT POSTER ]
          </span>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <span className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1.5 bg-background text-lime">
          {event.cat}
        </span>
        <span
          className="relative font-display uppercase tracking-[-0.02em] leading-[0.86]"
          style={{ fontSize: "clamp(34px, 5vw, 62px)" }}
        >
          {event.name}
        </span>
      </div>
      <div className="flex justify-between items-center gap-3.5 px-5 py-4.5 font-mono text-[11px] tracking-[0.14em] uppercase text-cream/70">
        <span>{event.city}</span>
        <span>{event.date}</span>
        <span className="text-lime">EXPLORE →</span>
      </div>
    </Link>
  );
}
