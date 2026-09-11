"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStaffAuth } from "@/hooks/useStaffAuth";

export default function StaffLoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/checkin";
  const { authed, loading, enter } = useStaffAuth();

  const [staffId, setStaffId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && authed) router.replace(next);
  }, [loading, authed, next, router]);

  if (loading || authed) {
    return <section className="min-h-[100vh] bg-background" />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await enter(staffId, passcode);
    setSubmitting(false);
    if (!result.ok) setError(result.error);
    else router.replace(next);
  };

  return (
    <section className="min-h-[100vh] flex items-center justify-center px-5 py-16 bg-background">
      <div className="w-full max-w-[420px]">
        <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-ember mb-4">RESTRICTED</div>
        <h1 className="font-display uppercase leading-[0.86] tracking-[-0.02em] text-4xl mb-8 text-cream">
          STAFF ACCESS ONLY
        </h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            placeholder="STAFF ID"
            autoFocus
            className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
          />
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="PASSCODE"
            className="w-full p-4.5 bg-surface-high border border-cream/20 text-cream text-base outline-none focus:border-lime"
          />
          {error && <p className="text-ember text-sm font-mono">{error}</p>}
          <button
            type="submit"
            data-mag="1"
            disabled={submitting}
            className="p-4.5 bg-lime text-background font-mono text-sm font-bold tracking-[0.16em] uppercase cursor-pointer transition-colors hover:bg-ember hover:text-cream disabled:opacity-60 disabled:cursor-wait"
          >
            {submitting ? "CHECKING…" : "ENTER →"}
          </button>
        </form>
      </div>
    </section>
  );
}
