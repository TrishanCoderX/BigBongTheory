"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  ph: number;
  col: string;
  sz: number;
}

export default function ParticleSphere({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ mx: 0, my: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mobile = window.innerWidth < 760;
    const count = Math.round((mobile ? 1400 : 3200) * Math.max(0.2, Math.min(2, density)));
    const points: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const halo = Math.random() < 0.22;
      const r = halo ? 1.35 + Math.random() * 0.9 : 0.94 + Math.random() * 0.14;
      const s = Math.sqrt(1 - u * u);
      const roll = Math.random();
      points.push({
        x: s * Math.cos(th) * r,
        y: u * r,
        z: s * Math.sin(th) * r,
        ph: Math.random() * Math.PI * 2,
        col: roll > 0.94 ? "203,242,63" : roll > 0.89 ? "255,77,46" : "243,240,231",
        sz: halo ? 1 : Math.random() > 0.93 ? 2 : 1,
      });
    }

    let t = 0;
    let rmx = 0;
    let rmy = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseRef.current.mx = e.clientX / window.innerWidth - 0.5;
      mouseRef.current.my = e.clientY / window.innerHeight - 0.5;
    };
    document.addEventListener("mousemove", onMove, { passive: true });

    let dpr = 1;
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = () => {
      t += 0.0032;
      rmx += (mouseRef.current.mx - rmx) * 0.05;
      rmy += (mouseRef.current.my - rmy) * 0.05;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h || !canvas.width) {
        raf = requestAnimationFrame(loop);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      const ry = t + rmx * 1.1;
      const rx = Math.sin(t * 0.5) * 0.28 + rmy * 0.7;
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const base = Math.min(w, h) * (window.innerWidth < 760 ? 0.42 : 0.34);
      const breathe = 1 + Math.sin(t * 1.4) * 0.05;
      for (const p of points) {
        const wob = 1 + Math.sin(t * 2.2 + p.ph) * 0.07;
        const X = p.x * wob * breathe;
        const Y = p.y * wob * breathe;
        const Z = p.z * wob * breathe;
        const x1 = X * cy - Z * sy;
        const z1 = X * sy + Z * cy;
        const y1 = Y * cx - z1 * sx;
        const z2 = Y * sx + z1 * cx;
        const persp = 3.1 / (3.1 + z2);
        if (persp <= 0) continue;
        const px = w / 2 + x1 * base * persp;
        const py = h / 2 + y1 * base * persp;
        const a = Math.max(0, Math.min(0.95, (persp - 0.55) * 1.5)) * (p.sz > 1 ? 1 : 0.78);
        ctx.fillStyle = `rgba(${p.col},${a.toFixed(3)})`;
        ctx.fillRect(px, py, p.sz * persp, p.sz * persp);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMove);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-hidden="true" />;
}
