"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { ticketIdFromScan } from "@/lib/ticketFormat";

type ScanState = "idle" | "found" | "checked" | "already" | "invalid";

interface MatchedRegistration {
  ticketId: string;
  eventSlug?: string;
  eventName?: string;
  tier: string;
  name: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

interface RecentCheckIn {
  ticketId: string;
  name: string;
  checkedInAt: string;
}

const scanCopy: Record<ScanState, { hint: string; title: string; color: string }> = {
  idle: { hint: "[ POINT CAMERA AT PASS ]", title: "", color: "#CBF23F" },
  found: { hint: "PASS DETECTED", title: "VALID TICKET", color: "#CBF23F" },
  checked: { hint: "PASS DETECTED", title: "CHECKED IN", color: "#CBF23F" },
  already: { hint: "PASS DETECTED", title: "ALREADY CHECKED IN", color: "#FF4D2E" },
  invalid: { hint: "PASS DETECTED", title: "TICKET NOT FOUND", color: "#FF4D2E" },
};

export default function CheckinPage() {
  const { staff } = useStaffAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const lastCodeRef = useRef<string | null>(null);
  const lookupInFlightRef = useRef(false);

  const [scan, setScan] = useState<ScanState>("idle");
  const [match, setMatch] = useState<MatchedRegistration | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [code, setCode] = useState("");
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([]);

  const refreshRecent = () => {
    fetch("/api/checkin/recent")
      .then((res) => res.json())
      .then((data) => setRecentCheckIns(data.recent ?? []));
  };

  useEffect(() => {
    refreshRecent();
  }, []);

  const applyLookup = async (payload: { ticketId?: string; query?: string }) => {
    if (lookupInFlightRef.current) return;
    lookupInFlightRef.current = true;
    try {
      const res = await fetch("/api/checkin/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "not-found") {
        setScan("invalid");
        setMatch(null);
      } else {
        setScan(data.status === "already" ? "already" : "found");
        setMatch(data.registration);
      }
    } finally {
      lookupInFlightRef.current = false;
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        tick();
      } catch {
        if (!cancelled) setCameraError("Camera unavailable — use manual ticket ID lookup below.");
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const decoded = jsQR(frame.data, canvas.width, canvas.height);
          if (decoded) {
            const ticketId = ticketIdFromScan(decoded.data);
            if (ticketId && ticketId !== lastCodeRef.current) {
              lastCodeRef.current = ticketId;
              applyLookup({ ticketId });
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const confirmCheckIn = async () => {
    if (!match) return;
    const res = await fetch("/api/checkin/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: match.ticketId }),
    });
    const data = await res.json();
    if (data.status === "checked-in" || data.status === "already") {
      setScan(data.status === "checked-in" ? "checked" : "already");
      setMatch(data.registration);
      refreshRecent();
    }
  };

  const resetScanner = () => {
    setScan("idle");
    setMatch(null);
    lastCodeRef.current = null;
  };

  const findManually = () => {
    if (!code.trim()) return;
    lastCodeRef.current = null;
    applyLookup({ query: code });
  };

  const copy = scanCopy[scan];
  const eventName = match?.eventName ?? "AWAITING SCAN";

  return (
    <section className="relative min-h-[100vh] pt-10 pb-10 px-4.5 flex justify-center overflow-hidden">
      <div
        className="absolute -inset-y-[70px] inset-x-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(203,242,63,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(203,242,63,0.13) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          animation: "bbt-grid 4.5s linear infinite",
        }}
      />

      <div className="relative w-full max-w-[460px]">
        <div className="flex justify-between font-mono text-[10px] tracking-[0.18em] uppercase text-cream/50 pb-3.5 border-b border-cream/[0.16]">
          <span>GATE STAFF MODE · {staff?.name}</span>
          <span className="text-lime">{eventName}</span>
        </div>

        <div className="relative mt-5.5 aspect-square bg-[#0C0C12] border border-cream/[0.16] overflow-hidden">
          <video ref={videoRef} muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-[30px] pointer-events-none" style={{ border: `2px solid ${copy.color}` }} />
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center px-7.5 bg-[#0C0C12]/90">
              <p className="font-mono text-[11px] tracking-[0.16em] uppercase text-cream/50 text-center">
                {cameraError}
              </p>
            </div>
          ) : scan === "idle" ? (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-cream/60 text-center px-7.5 bg-[#08080B]/40 py-2">
                {copy.hint}
              </div>
            </div>
          ) : null}
        </div>

        {scan === "found" && (
          <button
            type="button"
            data-mag="1"
            onClick={confirmCheckIn}
            className="w-full mt-3.5 p-5.5 font-display text-[28px] uppercase text-center cursor-pointer min-h-[56px] transition-colors"
            style={{ background: copy.color, color: "#08080B" }}
          >
            CHECK IN →
          </button>
        )}
        {(scan === "checked" || scan === "already" || scan === "invalid") && (
          <button
            type="button"
            data-mag="1"
            onClick={resetScanner}
            className="w-full mt-3.5 p-5.5 font-display text-[28px] uppercase text-center cursor-pointer min-h-[56px] transition-colors"
            style={{ background: copy.color, color: "#08080B" }}
          >
            SCAN NEXT
          </button>
        )}

        {scan !== "idle" && (
          <div className="mt-4 p-5.5 bg-lime/[0.06]" style={{ border: `1px solid ${copy.color}` }}>
            <div className="font-display text-[38px] leading-[0.9] uppercase" style={{ color: copy.color }}>
              {copy.title}
            </div>
            {match && (
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-cream/45 mb-1.5">NAME</div>
                  <div className="font-mono text-sm uppercase">{match.name}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-cream/45 mb-1.5">
                    CATEGORY
                  </div>
                  <div className="font-mono text-sm uppercase">{match.tier}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-cream/45 mb-1.5">
                    TICKET ID
                  </div>
                  <div className="font-mono text-sm uppercase">{match.ticketId}</div>
                </div>
                {match.checkedInAt && (
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-cream/45 mb-1.5">
                      CHECKED IN
                    </div>
                    <div className="font-mono text-sm uppercase">
                      {new Date(match.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6.5 pt-5.5 border-t border-cream/[0.16]">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/45 mb-2.5">
            MANUAL TICKET ID
          </div>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BBT-XXXX-XXXX"
              className="flex-1 p-4 bg-surface-high border border-cream/20 text-cream font-mono text-sm outline-none min-h-[52px] focus:border-lime"
            />
            <button
              type="button"
              data-mag="1"
              onClick={findManually}
              className="px-5 border border-cream/30 font-mono text-[11px] tracking-[0.14em] uppercase cursor-pointer inline-flex items-center transition-colors hover:bg-lime hover:text-background"
            >
              FIND
            </button>
          </div>
          <div className="mt-3 font-mono text-[10px] tracking-[0.16em] uppercase text-cream/35">
            SEARCH BY NAME, PHONE OR EMAIL ALSO WORKS.
          </div>
        </div>

        {recentCheckIns.length > 0 && (
          <div className="mt-6.5 pt-5.5 border-t border-cream/[0.16]">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/45 mb-3">
              RECENT CHECK-INS
            </div>
            <div className="flex flex-col gap-2">
              {recentCheckIns.map((r) => (
                <div key={r.ticketId} className="flex justify-between font-mono text-[11px] text-cream/60">
                  <span>{r.name}</span>
                  <span className="text-cream/35">
                    {new Date(r.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
