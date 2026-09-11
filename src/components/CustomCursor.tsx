"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const box = boxRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !box || !label) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx;
    let ry = ty;
    let rot = 0;
    let hot = 0;
    let down = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      const target = (e.target as HTMLElement)?.closest?.("[data-mag]");
      hot = target ? 1 : 0;
      label.textContent = target ? "GO" : "";
    };
    const onDown = () => {
      down = 1;
    };
    const onUp = () => {
      down = 0;
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mousedown", onDown, { passive: true });
    document.addEventListener("mouseup", onUp, { passive: true });

    const tick = () => {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      rot += hot ? 2.6 : 0.5;
      const size = (hot ? 78 : 42) * (down ? 0.82 : 1);
      const half = size / 2;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.margin = `-${half}px 0 0 -${half}px`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) rotate(${rot}deg)`;
      box.style.borderColor = hot ? "#FF4D2E" : "rgba(203,242,63,0.75)";
      box.style.background = hot ? "rgba(255,77,46,0.14)" : "transparent";
      box.style.borderWidth = hot ? "2px" : "1px";
      label.style.opacity = hot ? "1" : "0";
      label.style.transform = `rotate(${-rot}deg)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -mt-[3.5px] -ml-[3.5px] w-[7px] h-[7px] bg-lime z-[9600] pointer-events-none hidden md:block"
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -mt-[21px] -ml-[21px] w-[42px] h-[42px] z-[9500] pointer-events-none hidden md:flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          ref={boxRef}
          className="absolute inset-0 border border-lime/75 transition-[border-color] duration-200"
        />
        <div
          ref={labelRef}
          className="font-mono text-[8px] font-bold tracking-[0.16em] uppercase text-ember opacity-0 transition-opacity duration-200 whitespace-nowrap"
        />
      </div>
    </>
  );
}
