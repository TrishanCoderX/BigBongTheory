"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ParticleSphere from "@/components/ParticleSphere";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import EventCard from "@/components/EventCard";
import {
  team,
  tribes,
  gallery,
  galleryFilters,
  crew,
  menuTicker,
} from "@/lib/content";
import type { BBTEvent } from "@/lib/events";

export default function HomePage() {
  const [galFilter, setGalFilter] = useState<(typeof galleryFilters)[number]>("ALL");
  const filteredGallery = gallery.filter((g) => galFilter === "ALL" || g.tag === galFilter);
  const [events, setEvents] = useState<BBTEvent[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setEvents(data.events));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen min-h-[620px] flex items-center justify-center overflow-hidden">
        <ParticleSphere />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%, rgba(8,8,11,0) 30%, rgba(8,8,11,0.82) 100%)",
          }}
        />
        <div className="relative text-center px-5 w-full">
          <div className="font-mono text-[11px] tracking-[0.34em] uppercase text-lime mb-5">
            A CREATIVE COMMUNITY / NOT A COMPANY
          </div>
          <h1
            className="font-display uppercase leading-[0.8] tracking-[-0.035em] text-balance"
            style={{ fontSize: "clamp(52px, 13.5vw, 260px)" }}
          >
            BIG BONG
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: "2px #F3F0E7" }}>
              THEORY
            </span>
          </h1>
          <div className="mt-6 text-cream/80 font-medium" style={{ fontSize: "clamp(15px, 2vw, 26px)" }}>
            Turning misfits into main characters.
          </div>
          <div className="mt-10 flex gap-3.5 justify-center flex-wrap">
            <Link
              href="/events"
              data-mag="1"
              className="inline-flex items-center gap-3 px-7 py-4.5 bg-lime text-background font-mono text-[13px] font-bold tracking-[0.16em] uppercase cursor-pointer min-h-[48px] transition-colors hover:bg-ember hover:text-cream"
            >
              ENTER THE CHAOS →
            </Link>
            <Link
              href="/join"
              data-mag="1"
              className="inline-flex items-center gap-3 px-7 py-4.5 border border-cream/35 text-cream font-mono text-[13px] tracking-[0.16em] uppercase cursor-pointer min-h-[48px] transition-colors hover:border-cream hover:bg-cream/[0.08]"
            >
              JOIN BBT
            </Link>
          </div>
        </div>
        <div className="absolute bottom-4.5 left-0 right-0 flex justify-between px-5.5 font-mono text-[10px] tracking-[0.2em] uppercase text-cream/40">
          <span>SCROLL / IF YOU DARE</span>
          <span>3,200 IDEAS IN ORBIT</span>
        </div>
      </section>

      {/* Marquee band */}
      <div className="border-y border-cream/[0.12] bg-lime text-background overflow-hidden py-3">
        <Marquee
          items={menuTicker}
          duration={26}
          renderItem={(m) => (
            <span className="font-display uppercase tracking-[0.01em] whitespace-nowrap" style={{ fontSize: 34 }}>
              {m} ⦿
            </span>
          )}
        />
      </div>

      {/* Manifesto */}
      <section className="py-[14vh] px-5.5 max-w-[1500px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-16">01 — MANIFESTO</div>
        <div className="flex flex-col gap-3">
          <Reveal className="font-display uppercase tracking-[-0.02em] leading-[0.88]" style={{ fontSize: "clamp(34px, 7.4vw, 132px)" }}>
            WE ARE NOT HERE JUST TO EXIST.
          </Reveal>
          <Reveal
            className="font-display uppercase tracking-[-0.02em] leading-[0.88] pl-[8vw] text-lime"
            style={{ fontSize: "clamp(34px, 7.4vw, 132px)" }}
          >
            WE ARE HERE TO CREATE.
          </Reveal>
          <Reveal
            className="font-display uppercase tracking-[-0.02em] leading-[0.88] text-transparent"
            style={{ fontSize: "clamp(34px, 7.4vw, 132px)", WebkitTextStroke: "1px #F3F0E7" }}
          >
            TO PERFORM.
          </Reveal>
          <Reveal className="font-display uppercase tracking-[-0.02em] leading-[0.88] pl-[22vw]" style={{ fontSize: "clamp(34px, 7.4vw, 132px)" }}>
            TO BUILD.
          </Reveal>
          <Reveal
            className="font-display uppercase tracking-[-0.02em] leading-[0.88] pl-[4vw] text-ember"
            style={{ fontSize: "clamp(34px, 7.4vw, 132px)" }}
          >
            TO EXPERIMENT.
          </Reveal>
          <Reveal className="font-display uppercase tracking-[-0.03em] leading-[0.86]" style={{ fontSize: "clamp(40px, 9.5vw, 172px)" }}>
            TO MAKE SOME NOISE.
          </Reveal>
        </div>
        <Reveal className="mt-16 max-w-[640px] ml-auto text-cream/60" style={{ fontSize: 17, lineHeight: 1.6 }}>
          BBT started the way most good things do — a stupid late-night conversation that
          nobody was supposed to take seriously.{" "}
          <span className="text-cream font-mono text-[15px]">&ldquo;Bro, sun… ek idea aaya hai.&rdquo;</span> We took
          it seriously. Now it&apos;s a community, a stage, a film set, a dance floor, and an excuse to
          build things that shouldn&apos;t exist.
        </Reveal>
      </section>

      {/* Universe / tribes */}
      <section className="relative py-[12vh] px-5.5 border-t border-cream/[0.12] overflow-hidden">
        <div className="flex justify-between items-end gap-6 flex-wrap mb-16">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4.5">
              02 — THE BBT UNIVERSE
            </div>
            <div
              className="font-display uppercase tracking-[-0.02em] leading-[0.9] max-w-[16em]"
              style={{ fontSize: "clamp(34px, 5.6vw, 96px)" }}
            >
              IF YOU DON&apos;T FIT INTO ONE BOX, YOU PROBABLY BELONG HERE.
            </div>
          </div>
          <div className="font-mono text-[12px] leading-[1.8] text-cream/50 max-w-[280px]">
            NOTHING HERE STAYS STILL.
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {tribes.map((label, i) => (
            <div
              key={label}
              className="font-display uppercase tracking-[-0.01em] px-5 py-2.5 border border-cream/[0.22] cursor-default transition-[background,color,transform] duration-300 hover:bg-lime hover:text-background hover:border-lime"
              style={{
                fontSize: `clamp(20px, ${(2.2 + (i % 4) * 0.9).toFixed(1)}vw, ${42 + (i % 4) * 16}px)`,
                color: i % 5 === 0 ? "#CBF23F" : i % 7 === 3 ? "#FF4D2E" : "#F3F0E7",
                transform: `rotate(${((i % 5) - 2) * 1.4}deg)`,
                animation: `bbt-float ${(5 + (i % 5) * 1.3).toFixed(1)}s ease-in-out infinite`,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Next chaos */}
      <section className="py-[12vh] border-t border-cream/[0.12]">
        <div className="flex justify-between items-end gap-6 flex-wrap px-5.5 mb-16">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4.5">03 — UPCOMING</div>
            <div className="font-display uppercase tracking-[-0.035em] leading-[0.82]" style={{ fontSize: "clamp(48px, 11vw, 200px)" }}>
              THE NEXT CHAOS
            </div>
          </div>
          <Link
            href="/events"
            data-mag="1"
            className="px-6.5 py-4 border border-lime text-lime font-mono text-xs tracking-[0.16em] uppercase cursor-pointer min-h-[48px] inline-flex items-center transition-colors hover:bg-lime hover:text-background"
          >
            ALL EVENTS →
          </Link>
        </div>
        <div className="flex gap-4.5 overflow-x-auto px-5.5 pb-6.5 snap-x snap-mandatory">
          {events.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      </section>

      {/* Community */}
      <section className="py-[12vh] px-5.5 border-t border-cream/[0.12]">
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4.5">04 — THE PEOPLE</div>
        <div className="font-display uppercase tracking-[-0.03em] leading-[0.86] mb-16" style={{ fontSize: "clamp(34px, 6vw, 108px)" }}>
          POWERED BY <span className="text-lime">MISFITS</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {crew.map((m) => (
            <Reveal
              key={m.name}
              className="group relative aspect-square bg-[#101015] overflow-hidden cursor-default bg-[repeating-linear-gradient(100deg,rgba(243,240,231,0.1)_0_2px,transparent_2px_9px)]"
            >
              {m.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.image}
                  alt={m.name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  style={m.imagePosition ? { objectPosition: m.imagePosition } : undefined}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.16em] uppercase text-cream/30 text-center p-3">
                  [ MEMBER PORTRAIT ]
                </div>
              )}
              <div className="absolute inset-0 bg-lime text-background flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-y-auto">
                <div className="font-display text-2xl leading-[0.94] uppercase">{m.name}</div>
                {m.role && (
                  <div className="font-mono text-[10px] tracking-[0.16em] uppercase mt-1.5">{m.role}</div>
                )}
                {m.line && (
                  <div className="text-[11px] leading-[1.45] mt-2 opacity-80">{m.line}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="py-[12vh] border-t border-cream/[0.12]">
        <div className="flex justify-between items-end gap-6 flex-wrap px-5.5 mb-12">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4.5">05 — GALLERY</div>
            <div className="font-display uppercase tracking-[-0.035em] leading-[0.82]" style={{ fontSize: "clamp(44px, 10vw, 180px)" }}>
              EVIDENCE OF
              <br />
              THE CHAOS
            </div>
          </div>
          <div className="flex gap-2 flex-wrap font-mono text-[11px] tracking-[0.16em] uppercase">
            {galleryFilters.map((g) => (
              <button
                key={g}
                type="button"
                data-mag="1"
                onClick={() => setGalFilter(g)}
                className={`px-4.5 py-3 min-h-[44px] cursor-pointer border transition-colors ${
                  galFilter === g ? "bg-lime text-background border-lime" : "border-cream/20 text-cream/70"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[150px] gap-2 px-5.5">
          {filteredGallery.map((s, i) => (
            <Reveal
              key={s.caption}
              className="group relative overflow-hidden cursor-pointer bg-[#101016] bg-[repeating-linear-gradient(112deg,rgba(243,240,231,0.1)_0_2px,transparent_2px_10px)]"
              style={{ gridColumn: `span ${s.cols}`, gridRow: `span ${s.rows}` }}
            >
              {s.img ? (
                <Image
                  src={s.img}
                  alt={s.caption}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.16em] uppercase text-cream/35 text-center p-3.5">
                  [ {s.tag} PHOTO {i + 1} ]
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-between p-4 bg-lime/[0.92] text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase">{s.tag}</div>
                <div className="font-display text-[28px] leading-[0.94] uppercase">{s.caption}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="flex justify-center mt-11">
          <Link
            href="/gallery"
            data-mag="1"
            className="px-6.5 py-4 border border-lime text-lime font-mono text-xs tracking-[0.16em] uppercase cursor-pointer min-h-[48px] inline-flex items-center transition-colors hover:bg-lime hover:text-background"
          >
            FULL GALLERY →
          </Link>
        </div>
      </section>

      {/* Team */}
      <section className="py-[12vh] px-5.5 border-t border-cream/[0.12] max-w-[1500px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4.5">06 — THE TEAM</div>
        <div className="font-display uppercase tracking-[-0.035em] leading-[0.84] mb-16" style={{ fontSize: "clamp(40px, 8vw, 148px)" }}>
          THE ONES WHO
          <br />
          <span className="text-transparent" style={{ WebkitTextStroke: "1px #F3F0E7" }}>
            START THE FIRE
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {team.map((t, i) => (
            <Reveal key={t.name} className="border border-cream/[0.16] bg-[#0B0B11] transition-[transform,border-color] duration-[400ms] hover:-translate-y-2 hover:border-lime">
              <div className="relative aspect-[4/5] bg-[#14141A] bg-[repeating-linear-gradient(var(--angle),rgba(243,240,231,0.12)_0_2px,transparent_2px_10px)] flex items-center justify-center overflow-hidden" style={{ ["--angle" as string]: `${104 + i * 21}deg` }}>
                {t.image ? (
                  <img
                    src={t.image}
                    alt={t.name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    style={t.imagePosition ? { objectPosition: t.imagePosition } : undefined}
                  />
                ) : (
                  <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-cream/35">[ PORTRAIT ]</span>
                )}
                <span className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] text-lime">{`0${i + 1}`}</span>
              </div>
              <div className="p-4.5">
                <div className="font-display text-[30px] leading-[0.94] uppercase">{t.name}</div>
                {t.role && <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-lime mt-2">{t.role}</div>}
                {t.line && <div className="text-[14px] leading-[1.55] text-cream/55 mt-3">{t.line}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <section className="relative py-[12vh] border-t border-cream/[0.12] overflow-hidden">
        <div className="flex justify-between items-end gap-6 flex-wrap px-5.5 mb-16">
          <div>
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4.5">07 — SPONSORS &amp; PARTNERS</div>
            <div className="font-display uppercase tracking-[-0.035em] leading-[0.82]" style={{ fontSize: "clamp(44px, 10vw, 180px)" }}>
              BACKED BY
              <br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px #F3F0E7" }}>
                BELIEVERS
              </span>
            </div>
          </div>
          <div className="font-mono text-[11px] leading-[1.8] text-cream/45 max-w-[270px]">
            NO ONE&apos;S LOCKED IN YET. BE THE FIRST BRAND ON THE WALL.
          </div>
        </div>
        <div className="mx-5.5 border border-dashed border-cream/[0.22] bg-[#0B0B11] py-[9vh] flex flex-col items-center justify-center text-center gap-3">
          <div className="font-display uppercase tracking-[-0.02em] leading-[0.9] text-cream/70" style={{ fontSize: "clamp(30px, 6vw, 84px)" }}>
            SPONSORSHIP SLOTS
            <br />
            COMING SOON
          </div>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-cream/40">
            THIS WALL IS EMPTY UNTIL YOU FILL IT
          </div>
        </div>
        <div className="flex justify-between items-center gap-5 flex-wrap px-5.5 pt-[6vh]">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-cream/45">
            WANT YOUR BRAND IN FRONT OF 2,000+ YOUNG CREATORS?
          </div>
          <Link
            href="/join"
            data-mag="1"
            className="px-7.5 py-5 border border-lime text-lime font-mono text-xs tracking-[0.16em] uppercase cursor-pointer min-h-[48px] inline-flex items-center transition-colors hover:bg-lime hover:text-background"
          >
            BECOME A SPONSOR →
          </Link>
        </div>
      </section>

      {/* Join CTA */}
      <section className="relative py-[18vh] px-5.5 border-t border-cream/[0.12] text-center overflow-hidden">
        <div className="flex flex-col gap-2 items-center">
          <Reveal className="font-display uppercase tracking-[-0.03em] leading-[0.86]" style={{ fontSize: "clamp(38px, 9vw, 150px)" }}>
            GOT AN IDEA?
          </Reveal>
          <Reveal
            className="font-display uppercase tracking-[-0.03em] leading-[0.86] text-transparent"
            style={{ fontSize: "clamp(38px, 9vw, 150px)", WebkitTextStroke: "1px #F3F0E7" }}
          >
            GOT TALENT?
          </Reveal>
          <Reveal
            className="font-display uppercase tracking-[-0.03em] leading-[0.86] text-ember"
            style={{ fontSize: "clamp(38px, 9vw, 150px)" }}
          >
            GOT THE AUDACITY TO TRY?
          </Reveal>
        </div>
        <Reveal>
          <Link
            href="/join"
            data-mag="1"
            className="inline-flex items-center gap-4 mt-14 px-10 py-6.5 bg-lime text-background font-display uppercase tracking-[-0.01em] cursor-pointer transition-[background,transform] duration-300 hover:bg-ember hover:text-cream hover:scale-[1.03]"
            style={{ fontSize: "clamp(24px, 4vw, 56px)" }}
          >
            JOIN BIG BONG THEORY →
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
