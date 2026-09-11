"use client";

import { useState } from "react";
import { joinTags } from "@/lib/content";

export default function JoinPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [handle, setHandle] = useState("");
  const [idea, setIdea] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; email?: string; idea?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggleTag = (t: string) => {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email";
    if (!idea.trim()) next.idea = "Tell us the idea — even a bad one";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, city, handle, idea, tags }),
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
          APPLICATION RECEIVED
        </div>
        <h1
          className="font-display uppercase leading-[0.82] tracking-[-0.04em]"
          style={{ fontSize: "clamp(40px, 10vw, 140px)" }}
        >
          NOISE LOGGED.
        </h1>
        <p className="mt-8 text-lg text-cream/70 max-w-[560px] mx-auto">
          We read every application. If your dangerous idea is as interesting as it sounds, someone
          from BBT will reply within a few days.
        </p>
      </section>
    );
  }

  return (
    <section className="pt-[118px] pb-[12vh] px-5 md:px-6 max-w-[1000px] mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4">
        MEMBERSHIP APPLICATION / NO CV NEEDED
      </div>
      <h1
        className="font-display uppercase leading-[0.8] tracking-[-0.04em]"
        style={{ fontSize: "clamp(46px, 12vw, 190px)" }}
      >
        JOIN THE
        <br />
        <span className="text-lime">CHAOS</span>
      </h1>
      <p className="mt-8.5 mb-13 text-lg leading-relaxed text-cream/65 max-w-[620px]">
        Tell us what you make, or what you&apos;d make if nobody was watching. We read everything.
        We reply to the interesting ones fast.
      </p>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">NAME</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="YOUR NAME"
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
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">CITY</div>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="KOLKATA"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
          </label>
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">
              INSTAGRAM / PORTFOLIO
            </div>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@handle or link"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
          </label>
        </div>

        <div className="mt-8.5">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-3">
            WHAT KIND OF MISFIT ARE YOU? (PICK ANY)
          </div>
          <div className="flex flex-wrap gap-2">
            {joinTags.map((j) => {
              const active = tags.includes(j);
              return (
                <button
                  key={j}
                  type="button"
                  data-mag="1"
                  onClick={() => toggleTag(j)}
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
            THE DANGEROUS IDEA
          </div>
          <textarea
            rows={5}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Bro, sun… ek idea aaya hai."
            className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none resize-y focus:border-lime"
          />
          {errors.idea && <p className="text-ember text-xs font-mono mt-1.5">{errors.idea}</p>}
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
