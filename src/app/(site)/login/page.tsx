"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "up") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email or password is incorrect.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <section className="pt-[118px] pb-[14vh] px-5 max-w-[560px] mx-auto" />;
  }

  if (session?.user) {
    const user = session.user;
    return (
      <section className="pt-[118px] pb-[14vh] px-5 md:px-6 max-w-[700px] mx-auto text-center">
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-lime mb-5">
          SIGNED IN
        </div>
        <h1
          className="font-display uppercase leading-[0.84] tracking-[-0.03em]"
          style={{ fontSize: "clamp(36px, 8vw, 90px)" }}
        >
          HEY, {(user.name ?? user.email ?? "").split(" ")[0].toUpperCase()}
        </h1>
        <p className="mt-6 text-cream/60">{user.email}</p>
        <div className="flex gap-3 justify-center mt-11 flex-wrap">
          <Link
            href="/events"
            data-mag="1"
            className="px-7 py-4.5 bg-lime text-background font-mono text-[13px] font-bold tracking-[0.16em] uppercase cursor-pointer min-h-[48px] inline-flex items-center transition-colors hover:bg-ember hover:text-cream"
          >
            BROWSE EVENTS
          </Link>
          <button
            type="button"
            data-mag="1"
            onClick={() => signOut()}
            className="px-7 py-4.5 border border-cream/30 font-mono text-[13px] tracking-[0.16em] uppercase cursor-pointer min-h-[48px] transition-colors hover:border-cream hover:bg-cream/[0.08]"
          >
            SIGN OUT
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-[118px] pb-[14vh] px-5 md:px-6 max-w-[560px] mx-auto">
      <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4">
        {mode === "in" ? "WELCOME BACK" : "NEW HERE?"}
      </div>
      <h1
        className="font-display uppercase leading-[0.84] tracking-[-0.03em] mb-10"
        style={{ fontSize: "clamp(38px, 9vw, 80px)" }}
      >
        {mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}
      </h1>

      <button
        type="button"
        data-mag="1"
        onClick={() => signIn("google")}
        className="w-full flex items-center justify-center gap-3 p-4.5 bg-cream text-[#08080B] font-mono text-sm font-bold tracking-[0.1em] uppercase cursor-pointer transition-colors hover:bg-cream/85"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        CONTINUE WITH GOOGLE
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-cream/15" />
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/35">OR</span>
        <div className="h-px flex-1 bg-cream/15" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-5">
        {mode === "up" && (
          <label className="block">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">NAME</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="YOUR NAME"
              className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
            />
          </label>
        )}
        <label className="block">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">EMAIL</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@chaos.in"
            className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-cream/50 mb-2">PASSWORD</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
          />
        </label>

        {error && <p className="text-ember text-sm font-mono">{error}</p>}

        <button
          type="submit"
          data-mag="1"
          disabled={submitting}
          className="mt-2 p-5 bg-lime text-background font-display text-2xl uppercase cursor-pointer transition-colors hover:bg-ember hover:text-cream disabled:opacity-60 disabled:cursor-wait"
        >
          {submitting ? "ONE SEC…" : mode === "in" ? "SIGN IN →" : "CREATE ACCOUNT →"}
        </button>
      </form>

      <p className="mt-8 font-mono text-xs tracking-[0.1em] uppercase text-cream/45 text-center">
        {mode === "in" ? "New here?" : "Already in the chaos?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError("");
          }}
          className="text-lime hover:text-ember transition-colors underline underline-offset-4"
        >
          {mode === "in" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </section>
  );
}
