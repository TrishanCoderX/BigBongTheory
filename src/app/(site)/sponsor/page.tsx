"use client";

import { useState } from "react";
import { sponsorInterests } from "@/lib/content";

export default function SponsorPage() {
  const [brandName, setBrandName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ brandName?: string; contactName?: string; email?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleInterest = (t: string) => {
    setInterests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!brandName.trim()) next.brandName = "Brand / organisation name is required";
    if (!contactName.trim()) next.contactName = "Contact person name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (!message.trim()) next.message = "Tell us what you're looking to sponsor";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, contactName, email, phone, website, interests, message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSubmitError(data?.error ?? "Something went wrong. Try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="pt-[140px] pb-[14vh] px-5 md:px-6 max-w-[1000px] mx-auto text-center">
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime mb-5">
          INQUIRY RECEIVED
        </div>
        <h1
          className="font-display uppercase leading-[0.82] tracking-[-0.04em]"
          style={{ fontSize: "clamp(40px, 10vw, 140px)" }}
        >
          ON THE WALL SOON.
        </h1>
        <p className="mt-8 text-lg text-cream/70 max-w-[560px] mx-auto">
          We read every inquiry. Someone from BBT will reach out within a few days to talk details.
        </p>
      </section>
    );
  }

  return (
    <section className="pt-[118px] pb-[12vh] px-5 md:px-6 max-w-[1000px] mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4">
        SPONSORSHIP INQUIRY / NO DECK NEEDED
      </div>
      <h1
        className="font-display uppercase leading-[0.8] tracking-[-0.04em]"
        style={{ fontSize: "clamp(46px, 12vw, 190px)" }}
      >
        BACK THE
        <br />
        <span className="text-lime">CHAOS</span>
      </h1>
      <p className="mt-8.5 mb-13 text-lg leading-relaxed text-cream/65 max-w-[620px]">
        Get your brand in front of the room. Tell us who you are and what you&apos;re looking to back —
        we&apos;ll reach out to talk specifics.
      </p>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">
              BRAND / ORGANISATION
            </div>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="YOUR BRAND"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
            {errors.brandName && <p className="text-ember text-xs font-mono mt-1.5">{errors.brandName}</p>}
          </label>
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">
              CONTACT PERSON
            </div>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="YOUR NAME"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
            {errors.contactName && <p className="text-ember text-xs font-mono mt-1.5">{errors.contactName}</p>}
          </label>
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">EMAIL</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.in"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
            {errors.email && <p className="text-ember text-xs font-mono mt-1.5">{errors.email}</p>}
          </label>
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">PHONE</div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 00000 00000"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
          </label>
          <label className="block sm:col-span-2">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">
              WEBSITE / INSTAGRAM
            </div>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="@handle or link"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
          </label>
        </div>

        <div className="mt-8.5">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-3">
            WHAT KIND OF SPONSORSHIP? (PICK ANY)
          </div>
          <div className="flex flex-wrap gap-2">
            {sponsorInterests.map((j) => {
              const active = interests.includes(j);
              return (
                <button
                  key={j}
                  type="button"
                  data-mag="1"
                  onClick={() => toggleInterest(j)}
                  className={`px-4 py-3 min-h-[44px] border font-mono text-[11px] tracking-[0.12em] uppercase cursor-pointer transition-colors ${
                    active ? "bg-lime text-background border-lime" : "border-cream/[0.22] text-cream"
                  }`}
                >
                  {j}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8.5">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">
            WHAT DO YOU WANT TO BACK?
          </div>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your brand and what kind of sponsorship you're picturing."
            className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none resize-y focus:border-lime"
          />
          {errors.message && <p className="text-ember text-xs font-mono mt-1.5">{errors.message}</p>}
        </div>

        {submitError && <p className="text-ember text-sm font-mono mt-6">{submitError}</p>}

        <button
          type="submit"
          data-mag="1"
          disabled={submitting}
          className="w-full mt-10 p-6.5 bg-lime text-background font-display uppercase text-center cursor-pointer transition-colors hover:bg-ember hover:text-cream disabled:opacity-60 disabled:cursor-wait"
          style={{ fontSize: "clamp(26px, 5vw, 52px)" }}
        >
          {submitting ? "SENDING…" : "SEND IT →"}
        </button>
      </form>
    </section>
  );
}
