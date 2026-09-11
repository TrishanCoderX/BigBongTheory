"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { menuTicker, navItems } from "@/lib/content";

function pageLabelFor(pathname: string) {
  const exact = navItems.find((n) => n.href === pathname);
  if (exact) return exact.label;
  if (pathname.startsWith("/events/") && pathname.endsWith("/book")) return "BOOKING";
  if (pathname.startsWith("/events/")) return "EVENT";
  if (pathname.startsWith("/ticket")) return "YOUR PASS";
  if (pathname === "/success" || pathname.includes("/success")) return "SUCCESS";
  return "";
}

export default function SiteChrome() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[8200] flex items-center justify-between gap-3.5 px-4 py-4 pointer-events-none">
        <Link
          href="/"
          data-mag="1"
          onClick={closeMenu}
          className="pointer-events-auto flex items-stretch cursor-pointer bg-background border border-cream/20"
        >
          <span className="w-10 flex items-center justify-center bg-ember text-background font-display text-xl">
            B!
          </span>
          <span className="flex items-center px-3.5 py-2.5 font-display text-[17px] tracking-[0.02em] uppercase">
            BIG BONG THEORY
          </span>
        </Link>
        <div className="pointer-events-auto flex items-stretch gap-2">
          <span className="hidden sm:flex items-center px-3.5 bg-background border border-cream/20 font-mono text-[10px] tracking-[0.2em] uppercase text-cream/55 whitespace-nowrap">
            {pageLabelFor(pathname)}
          </span>
          <button
            type="button"
            data-mag="1"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="bbt-fullscreen-menu"
            className="flex items-center gap-3 px-4.5 py-3 bg-lime text-background font-mono text-[11px] font-bold tracking-[0.2em] uppercase cursor-pointer min-h-[46px] transition-colors hover:bg-ember hover:text-cream"
          >
            <span>{menuOpen ? "CLOSE" : "MENU"}</span>
            <span className="flex flex-col gap-[3px] w-[18px]">
              <span className="h-[2px] bg-current block" />
              <span className="h-[2px] bg-current block" />
              <span className="h-[2px] bg-current block w-3/5" />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="bbt-fullscreen-menu"
          className="fixed inset-0 z-[8100] bg-background flex flex-col justify-start px-5 pb-10 overflow-y-auto"
        >
          <div className="flex-none -mx-5 mt-[78px] overflow-hidden py-2 bg-ember text-background">
            <div className="flex w-max gap-6 animate-[bbt-marquee_18s_linear_infinite] font-mono text-[11px] tracking-[0.24em] uppercase">
              {[...menuTicker, ...menuTicker].map((m, i) => (
                <span key={i} className="whitespace-nowrap">
                  {m} ⦿
                </span>
              ))}
            </div>
          </div>
          <div className="max-w-[1400px] mx-auto w-full pt-6">
            {navItems.map((item, i) => {
              const isAccount = item.href === "/login";
              const label =
                isAccount && user
                  ? (user.name ?? user.email ?? "ACCOUNT").split(" ")[0].toUpperCase()
                  : item.label;
              const hint = isAccount && user ? "SIGNED IN" : item.hint;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  data-mag="1"
                  onClick={closeMenu}
                  className="grid grid-cols-[62px_minmax(0,1fr)_auto] items-center gap-4 py-3.5 px-2.5 border-t border-cream/[0.14] cursor-pointer transition-[background,padding] duration-300 hover:bg-lime/10 hover:pl-6 hover:border-lime"
                >
                  <span className="font-mono text-[11px] text-cream/40">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className="font-display uppercase tracking-[-0.03em] leading-[0.9]"
                    style={{
                      fontSize: "clamp(34px, 8vw, 104px)",
                      color: i % 2 === 0 ? "#F3F0E7" : "#CBF23F",
                    }}
                  >
                    {label}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-cream/40">{hint}</span>
                </Link>
              );
            })}
            <div className="border-t border-cream/[0.14]" />
            <div className="flex justify-between gap-4 flex-wrap mt-8 font-mono text-[10px] tracking-[0.2em] uppercase text-cream/40">
              <span>KOLKATA / EVERYWHERE</span>
              <span className="text-lime">TURNING MISFITS INTO MAIN CHARACTERS.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
