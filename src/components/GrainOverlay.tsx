"use client";

import { useEffect, useRef } from "react";

export default function GrainOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canvas = document.createElement("canvas");
    canvas.width = 140;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.createImageData(140, 140);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = 120 + Math.random() * 135;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
      data.data[i + 3] = 26 + Math.random() * 40;
    }
    ctx.putImageData(data, 0, 0);
    el.style.backgroundImage = `url(${canvas.toDataURL()})`;

    let frame = 0;
    const timer = setInterval(() => {
      frame = (frame + 1) % 6;
      el.style.transform = `translate3d(${(frame * 13) % 31}px, ${(frame * 21) % 27}px, 0)`;
    }, 90);

    return () => clearInterval(timer);
  }, []);

  return <div ref={ref} className="bbt-grain" aria-hidden="true" />;
}
