"use client";

import { useState } from "react";

export default function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(-1);

  return (
    <div>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            data-mag="1"
            onClick={() => setOpen(isOpen ? -1 : i)}
            className="border-t border-cream/[0.14] py-4 cursor-pointer"
          >
            <div className="flex justify-between gap-3.5 font-display text-lg uppercase">
              <span>{f.q}</span>
              <span className="text-lime">{isOpen ? "–" : "+"}</span>
            </div>
            <div
              className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
              style={{ maxHeight: isOpen ? "220px" : "0px", opacity: isOpen ? 1 : 0 }}
            >
              <p className="text-sm leading-relaxed text-cream/65 pt-2">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
