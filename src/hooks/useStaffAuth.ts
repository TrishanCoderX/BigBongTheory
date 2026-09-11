"use client";

import { useEffect, useState } from "react";
import { roleAtLeast, type StaffRole } from "@/lib/roles";

export interface StaffSession {
  staffId: string;
  name: string;
  role: StaffRole;
}

async function fetchStaffSession(): Promise<StaffSession | null> {
  const res = await fetch("/api/staff/me");
  const data = await res.json();
  return data.staff ? { staffId: data.staff.staffId, name: data.staff.name, role: data.staff.role } : null;
}

export function useStaffAuth() {
  const [staff, setStaff] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchStaffSession().then((session) => {
      if (!cancelled) {
        setStaff(session);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const enter = async (staffId: string, passcode: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    const res = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ staffId, passcode }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? "Sign-in failed." };
    setStaff(await fetchStaffSession());
    return { ok: true };
  };

  const exit = async () => {
    await fetch("/api/staff/logout", { method: "POST" });
    setStaff(null);
  };

  const can = (min: StaffRole) => roleAtLeast(staff?.role, min);

  return { staff, authed: !!staff, loading, enter, exit, can };
}
