"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BBTEvent, Tier } from "@/lib/events";

export default function BookingWizard({
  event,
  tiers,
  remaining,
}: {
  event: BBTEvent;
  tiers: Tier[];
  remaining: number;
}) {
  const router = useRouter();
  const isFree = event.price === 0;
  const maxQty = Math.max(1, Math.min(8, remaining));
  const lastStep = isFree ? 2 : 3;
  const steps = isFree
    ? [
        ["01", "YOUR SPOT"],
        ["02", "YOUR DETAILS"],
      ]
    : [
        ["01", "SELECT TICKET"],
        ["02", "YOUR DETAILS"],
        ["03", "PAYMENT"],
      ];

  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<Tier["id"]>("regular");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CREATOR");
  const [payMode, setPayMode] = useState("UPI / GPAY");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedTier = tiers.find((t) => t.id === tier) ?? tiers[1];
  const subtotal = isFree ? 0 : selectedTier.price * qty;
  const fee = isFree ? 0 : 19;
  const total = subtotal + fee;

  const bookHead = isFree
    ? step === 1
      ? "CLAIM YOUR SPOT"
      : "WHO IS COMING?"
    : step === 1
      ? "PICK YOUR PASS"
      : step === 2
        ? "WHO IS COMING?"
        : "PAY UP";
  const nextLabel = step < lastStep ? "CONTINUE →" : isFree ? "CONFIRM FREE SPOT →" : `PAY ₹${total} →`;

  const validateStep2 = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (!/^[0-9+\s-]{7,15}$/.test(phone)) next.phone = "Enter a valid phone number";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = async () => {
    if (step === 2 && !validateStep2()) return;
    if (step >= lastStep) {
      setSubmitError("");
      setSubmitting(true);
      try {
        const res = await fetch("/api/registrations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSlug: event.slug, tier, name, email, phone, qty }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSubmitError(data.error ?? "Something went wrong. Try again.");
          return;
        }
        const params = new URLSearchParams({
          tier,
          qty: String(qty),
          name,
          email,
          total: String(total),
          ticketId: data.ticketId,
        });
        router.push(`/events/${event.slug}/success?${params.toString()}`);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep((s) => s + 1);
  };

  const prev = () => {
    if (step <= 1) {
      router.push(`/events/${event.slug}`);
      return;
    }
    setStep((s) => s - 1);
  };

  return (
    <section className="pt-[118px] pb-[12vh] px-5 md:px-6 max-w-[1000px] mx-auto">
      <div className="flex gap-2 flex-wrap mb-11 font-mono text-[10px] tracking-[0.18em] uppercase">
        {steps.map(([n, label], i) => {
          const active = step === i + 1;
          return (
            <div
              key={n}
              className={`flex-1 min-w-[160px] px-4 py-3.5 border ${
                active ? "bg-lime text-background border-lime" : "border-cream/20 text-cream/60"
              }`}
            >
              {n} — {label}
            </div>
          );
        })}
      </div>

      <div className="font-mono text-[11px] tracking-[0.26em] uppercase text-ember mb-3">
        {event.name} / {event.city}
      </div>
      <h1
        className="font-display uppercase leading-[0.84] tracking-[-0.03em] mb-12"
        style={{ fontSize: "clamp(38px, 8vw, 108px)" }}
      >
        {bookHead}
      </h1>

      {step === 1 && (
        <>
          {isFree ? (
            <div className="p-6.5 border border-lime bg-lime/[0.08]">
              <div className="font-display text-[34px] uppercase text-lime">FREE ENTRY</div>
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase mt-1.5 text-cream/60">
                {remaining} OF {event.capacity} SPOTS LEFT / NO PAYMENT NEEDED
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase mt-3 text-cream/40">
                LIMIT 1 TICKET PER PERSON
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tiers.map((t) => {
                const active = tier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    data-mag="1"
                    onClick={() => setTier(t.id)}
                    className={`flex justify-between items-center gap-5 flex-wrap p-6.5 text-left cursor-pointer border transition-colors ${
                      active ? "bg-lime border-lime text-background" : "border-cream/[0.18] text-cream"
                    }`}
                  >
                    <div>
                      <div className="font-display text-[34px] uppercase">{t.label}</div>
                      <div className={`font-mono text-[11px] tracking-[0.14em] uppercase mt-1.5 ${active ? "text-background/60" : "text-cream/50"}`}>
                        {t.note} / {t.left} LEFT
                      </div>
                    </div>
                    <div className="font-display text-[34px]">₹{t.price}</div>
                  </button>
                );
              })}
            </div>
          )}
          {!isFree && (
            <div className="flex items-center gap-4.5 mt-7.5">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-cream/55">QUANTITY</div>
              <button
                type="button"
                data-mag="1"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center border border-cream/30 cursor-pointer text-xl transition-colors hover:bg-lime hover:text-background"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <div className="font-display text-[30px] min-w-[40px] text-center">{qty}</div>
              <button
                type="button"
                data-mag="1"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="w-12 h-12 flex items-center justify-center border border-cream/30 cursor-pointer text-xl transition-colors hover:bg-lime hover:text-background"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">FULL NAME</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="WHO ARE WE LETTING IN"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
            {errors.name && <p className="text-ember text-xs font-mono mt-1.5">{errors.name}</p>}
          </label>
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">EMAIL</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@chaos.in"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
            {errors.email && <p className="text-ember text-xs font-mono mt-1.5">{errors.email}</p>}
          </label>
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">PHONE</div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
            {errors.phone && <p className="text-ember text-xs font-mono mt-1.5">{errors.phone}</p>}
          </label>
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">I AM A</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            >
              <option>CREATOR</option>
              <option>ARTIST</option>
              <option>FILMMAKER</option>
              <option>MUSICIAN</option>
              <option>JUST CURIOUS</option>
            </select>
          </label>
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            {["UPI / GPAY", "CARD", "NETBANKING"].map((pm) => (
              <button
                key={pm}
                type="button"
                data-mag="1"
                onClick={() => setPayMode(pm)}
                className={`p-5 text-left border font-mono text-xs tracking-[0.14em] uppercase cursor-pointer transition-colors ${
                  payMode === pm ? "border-lime bg-lime/10" : "border-cream/20"
                }`}
              >
                {pm}
              </button>
            ))}
          </div>
          <div className="p-6 border border-cream/20 bg-surface-high">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-4">
              ORDER SUMMARY
            </div>
            <div className="flex justify-between text-[15px] py-2">
              <span>
                {selectedTier.label} × {qty}
              </span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-[15px] py-2 text-cream/60">
              <span>PLATFORM FEE</span>
              <span>₹{fee}</span>
            </div>
            <div className="flex justify-between items-baseline pt-4.5 mt-3 border-t border-cream/[0.18]">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase">TOTAL</span>
              <span className="font-display text-4xl text-lime">₹{total}</span>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <p className="text-ember text-sm font-mono mt-6">{submitError}</p>
      )}
      <div className="flex gap-3 mt-4 flex-wrap">
        <button
          type="button"
          data-mag="1"
          onClick={prev}
          disabled={submitting}
          className="px-7 py-5 border border-cream/[0.28] font-mono text-xs tracking-[0.16em] uppercase cursor-pointer min-h-[48px] inline-flex items-center transition-colors hover:border-cream hover:bg-cream/[0.08] disabled:opacity-50"
        >
          ← BACK
        </button>
        <button
          type="button"
          data-mag="1"
          onClick={next}
          disabled={submitting}
          className="flex-1 min-w-[240px] px-7 py-5 bg-lime text-background font-display text-2xl uppercase cursor-pointer text-center min-h-[48px] transition-colors hover:bg-ember hover:text-cream disabled:opacity-60 disabled:cursor-wait"
        >
          {submitting ? "ONE SEC…" : nextLabel}
        </button>
      </div>
    </section>
  );
}
