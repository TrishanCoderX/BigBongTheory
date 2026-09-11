"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [pct, setPct] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const t0 = performance.now();
    const dur = 1500;
    let raf = 0;
    const ramp = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      setPct(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(ramp);
        return;
      }
      setTimeout(() => setOpacity(0), 260);
      setTimeout(() => setMounted(false), 1000);
    };
    ramp();
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[9800] bg-background flex flex-col justify-between p-7 transition-opacity duration-[800ms]"
      style={{ opacity, transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
      aria-hidden="true"
    >
      <div className="flex justify-between font-mono text-[11px] tracking-[0.18em] uppercase text-cream/55">
        <span>BIG BONG THEORY</span>
        <span>EST. YOUTH / KOLKATA</span>
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-display uppercase leading-[0.84] tracking-[-0.02em]" style={{ fontSize: "clamp(40px, 9vw, 148px)" }}>
          CALCULATING
          <br />
          <span className="text-transparent" style={{ WebkitTextStroke: "1px #CBF23F" }}>
            THE CHAOS
          </span>
          <span className="text-ember">...</span>
        </div>
        <div className="flex items-end gap-5">
          <div className="flex-1 h-[3px] bg-cream/[0.14]">
            <div className="h-full bg-lime transition-[width] duration-200 ease-linear" style={{ width: `${pct}%` }} />
          </div>
          <div className="font-mono text-[13px] text-lime min-w-[62px] text-right">
            {String(pct).padStart(3, "0")}%
          </div>
        </div>
      </div>
      <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-cream/35">
        TURNING MISFITS INTO MAIN CHARACTERS.
      </div>
    </div>
  );
}
