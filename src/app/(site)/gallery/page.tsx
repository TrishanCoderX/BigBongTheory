"use client";

import Image from "next/image";
import { useState } from "react";
import Reveal from "@/components/Reveal";
import { gallery, galleryExtra, galleryFilters } from "@/lib/content";

const allFrames = [...gallery, ...galleryExtra];

export default function GalleryPage() {
  const [filter, setFilter] = useState<(typeof galleryFilters)[number]>("ALL");
  const filtered = allFrames.filter((g) => filter === "ALL" || g.tag === filter);

  return (
    <section className="pt-[120px] pb-[14vh] px-5 md:px-6 max-w-[1500px] mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-3.5">
        VISUAL ARCHIVE / KOLKATA &amp; BEYOND
      </div>
      <h1
        className="font-display uppercase leading-[0.78] tracking-[-0.04em]"
        style={{ fontSize: "clamp(56px, 15vw, 260px)" }}
      >
        GALLERY
      </h1>
      <p className="mt-6 max-w-[560px] text-lg leading-relaxed text-cream/65">
        Evidence of the chaos — every adda, screening, and noise floor BBT has thrown, in one
        scrollable wall.
      </p>

      <div className="flex gap-2 flex-wrap font-mono text-[11px] tracking-[0.16em] uppercase mt-11 mb-8">
        {galleryFilters.map((g) => (
          <button
            key={g}
            type="button"
            data-mag="1"
            onClick={() => setFilter(g)}
            className={`px-4.5 py-3 min-h-[44px] cursor-pointer border transition-colors ${
              filter === g ? "bg-lime text-background border-lime" : "border-cream/20 text-cream/70"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[150px] gap-2">
        {filtered.map((s, i) => (
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
    </section>
  );
}
