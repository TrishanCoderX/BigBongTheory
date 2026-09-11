"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useSearchParams } from "next/navigation";
import type { BBTEvent, Tier } from "@/lib/events";
import { qrPayload } from "@/lib/ticketFormat";
import DotGrid from "@/components/DotGrid";

interface RegistrationLookup {
  name: string;
  tier: string;
  checkedIn: boolean;
}

export default function TicketClient({ event, tiers }: { event: BBTEvent; tiers: Tier[] }) {
  const sp = useSearchParams();
  const ticketIdParam = sp.get("ticketId");
  const tierParam = sp.get("tier") || "regular";
  const nameParam = sp.get("name") || "RIYA SEN";

  const [registration, setRegistration] = useState<RegistrationLookup | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketIdParam) return;
    let cancelled = false;
    fetch(`/api/registrations/${ticketIdParam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data) setRegistration({ name: data.name, tier: data.tier, checkedIn: data.checkedIn });
        else setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ticketIdParam]);

  const ticketId = ticketIdParam || "BBT-DEMO-000000";
  const tier = tiers.find((t) => t.id === (registration?.tier ?? tierParam)) ?? tiers[1];
  const name = (registration?.name ?? nameParam).toUpperCase();
  const checkedIn = registration?.checkedIn ?? false;

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrPayload(ticketId), {
      margin: 0,
      color: { dark: "#08080B", light: "#00000000" },
      width: 264,
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  const passRows = [
    { k: "ATTENDEE", v: name },
    { k: "CATEGORY", v: tier.label },
    { k: "DATE", v: event.date },
    { k: "TIME", v: event.time },
    { k: "VENUE", v: event.venue },
    { k: "STATUS", v: checkedIn ? "CHECKED IN" : "VALID / NOT CHECKED IN" },
  ];

  if (ticketIdParam && notFound) {
    return (
      <section className="min-h-[100vh] flex items-center justify-center px-5 text-center">
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4">NOT FOUND</div>
          <h1 className="font-display uppercase text-4xl">THIS PASS DOESN&apos;T EXIST</h1>
          <p className="font-mono text-xs text-cream/45 mt-4">Ticket ID {ticketIdParam} isn&apos;t in our records.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center gap-6.5 pt-[118px] pb-[60px] px-4.5 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <DotGrid
          dotSize={5}
          gap={26}
          baseColor="#1c2b0d"
          activeColor="#CBF23F"
          proximity={140}
          speedTrigger={80}
          shockRadius={220}
          shockStrength={4}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div
        className="absolute z-[1] w-[620px] h-[620px] max-w-none rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(203,242,63,0.16) 0%, rgba(203,242,63,0) 68%)",
          animation: "bbt-halo 6s ease-in-out infinite",
        }}
      />

      <div
        className="relative z-[1] w-full max-w-[460px] bg-cream text-[#08080B]"
        style={{ boxShadow: "0 40px 90px rgba(0,0,0,0.6)", transform: "rotate(-0.6deg)" }}
      >
        <div className="absolute top-0 bottom-0 left-3 w-11 bg-ember flex items-center justify-center">
          <span
            className="font-display text-[27px] tracking-[0.22em] uppercase text-cream"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            TICKET
          </span>
        </div>
        <div className="absolute top-0 bottom-0 right-3 w-11 bg-lime flex items-center justify-center">
          <span
            className="font-display text-[27px] tracking-[0.22em] uppercase text-[#08080B]"
            style={{ writingMode: "vertical-rl" }}
          >
            TICKET
          </span>
        </div>
        <div
          className="absolute top-0 bottom-0 left-0 w-3"
          style={{
            backgroundImage: "radial-gradient(circle at 0 50%, #08080B 6px, transparent 6.5px)",
            backgroundSize: "12px 26px",
            backgroundRepeat: "repeat-y",
          }}
        />
        <div
          className="absolute top-0 bottom-0 right-0 w-3"
          style={{
            backgroundImage: "radial-gradient(circle at 100% 50%, #08080B 6px, transparent 6.5px)",
            backgroundSize: "12px 26px",
            backgroundRepeat: "repeat-y",
          }}
        />

        <div className="relative px-17 py-6.5">
          <div className="flex justify-between items-start gap-3">
            <div>
              <div className="font-display text-[25px] leading-[0.9] uppercase tracking-[-0.01em]">
                BIG BONG
                <br />
                THEORY
              </div>
              <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#08080B]/55 mt-2">
                OFFICIAL EVENT PASS
              </div>
            </div>
            <div className="font-mono text-[8px] tracking-[0.18em] uppercase bg-[#08080B] text-lime px-2.5 py-1.5 text-right">
              ADMIT ONE
              <br />
              NON-TRANSFERABLE
            </div>
          </div>

          <div
            className="h-1.5 my-5"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, #FF4D2E 3px, transparent 3.5px)",
              backgroundSize: "14px 6px",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div
            className="font-display uppercase leading-[0.86] tracking-[-0.02em] text-balance"
            style={{ fontSize: "clamp(32px, 8vw, 50px)" }}
          >
            {event.name}
          </div>

          <div className="grid grid-cols-2 gap-x-3.5 gap-y-4 mt-5.5">
            {passRows.map((r) => (
              <div key={r.k}>
                <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#08080B]/50 mb-1.5">
                  {r.k}
                </div>
                <div className="font-mono text-xs tracking-[0.03em] uppercase font-bold">{r.v}</div>
              </div>
            ))}
          </div>

          <div
            className="h-1.5 my-5.5"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(8,8,11,0.35) 3px, transparent 3.5px)",
              backgroundSize: "14px 6px",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div className="flex gap-4.5 items-center">
            <div className="w-[132px] h-[132px] flex-none bg-cream flex items-center justify-center">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt={`QR code for ticket ${ticketId}`} width={132} height={132} />
              ) : (
                <div className="w-full h-full bg-[#08080B]/[0.06] animate-pulse" />
              )}
            </div>
            <div>
              <div className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#08080B]/50">TICKET ID</div>
              <div className="font-display text-[22px] tracking-[0.02em] mt-1">{ticketId}</div>
              <div className="inline-block mt-3 px-2.5 py-1.5 bg-lime font-mono text-[9px] tracking-[0.18em] uppercase">
                SCAN AT GATE
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-[1] font-mono text-[10px] tracking-[0.2em] uppercase text-cream/40 text-center max-w-[420px]">
        SCREENSHOTS WORK. HONESTY DOESN&apos;T.
      </div>
    </section>
  );
}
