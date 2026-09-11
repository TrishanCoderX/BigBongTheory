"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStaffAuth } from "@/hooks/useStaffAuth";

// proxy.ts already blocks unauthenticated requests to /admin and /checkin
// at the server, before this component (or the page around it) ever loads.
// This exists as a client-side backstop only — e.g. if a session cookie
// expires while someone is sitting on the page mid-visit.
export default function StaffGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authed, loading } = useStaffAuth();

  useEffect(() => {
    if (!loading && !authed) {
      router.replace(`/staff-login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, authed, pathname, router]);

  if (loading || !authed) {
    return <section className="min-h-[70vh]" />;
  }

  return <>{children}</>;
}
