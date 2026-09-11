"use client";

import Link from "next/link";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { ROLE_LABEL } from "@/lib/roles";
import StaffGate from "@/components/StaffGate";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { staff, authed, exit, can } = useStaffAuth();

  return (
    <div className="min-h-full flex flex-col bg-background text-on-background">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-cream/[0.14] bg-[#0B0B11] font-mono text-[11px] tracking-[0.16em] uppercase">
        <span className="text-cream/50 flex items-center gap-2">
          BBT STAFF TOOLS
          {staff && <span className="px-1.5 py-0.5 bg-lime text-background">{ROLE_LABEL[staff.role]}</span>}
        </span>
        <nav className="flex items-center gap-4">
          <Link href="/checkin" className="text-cream/70 hover:text-lime transition-colors">
            Check-in
          </Link>
          {can("MODERATOR") && (
            <Link href="/admin" className="text-cream/70 hover:text-lime transition-colors">
              Admin
            </Link>
          )}
          {authed && (
            <button type="button" onClick={exit} className="text-cream/70 hover:text-ember transition-colors">
              Sign out
            </button>
          )}
          <Link
            href="/"
            className="text-cream/50 hover:text-cream transition-colors border-l border-cream/20 pl-4"
          >
            ← Exit to site
          </Link>
        </nav>
      </div>
      <main className="flex-grow">
        <StaffGate>{children}</StaffGate>
      </main>
    </div>
  );
}
