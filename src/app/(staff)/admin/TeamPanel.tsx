"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLE_LABEL, type StaffRole } from "@/lib/roles";
import { useStaffAuth } from "@/hooks/useStaffAuth";

interface RosterEntry {
  staffId: string;
  name: string;
  role: StaffRole;
}

const ROLE_OPTIONS: StaffRole[] = ["STAFF", "MODERATOR", "SUPER_ADMIN"];

export default function TeamPanel() {
  const { staff } = useStaffAuth();
  const [roster, setRoster] = useState<RosterEntry[] | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("STAFF");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/staff")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRoster(data?.roster ?? []));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotice(data.error ?? "Could not add staff member.");
    } else {
      setNotice(`Added ${data.name} — passcode ${data.passcode} (shown once, share it securely)`);
      setName("");
      setRole("STAFF");
      refresh();
    }
  };

  const changeRole = async (staffId: string, nextRole: StaffRole) => {
    setBusyId(staffId);
    const res = await fetch(`/api/staff/${staffId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    setBusyId(null);
    if (res.ok) refresh();
    else setNotice((await res.json()).error ?? "Could not update role.");
  };

  const remove = async (staffId: string) => {
    setBusyId(staffId);
    const res = await fetch(`/api/staff/${staffId}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) refresh();
    else setNotice((await res.json()).error ?? "Could not remove staff member.");
  };

  return (
    <div className="bg-white border border-[#14141A]/[0.12]">
      <div className="p-4.5 border-b border-[#14141A]/[0.12] font-mono text-[11px] tracking-[0.18em] uppercase">
        TEAM &amp; ROLES
      </div>

      {roster === null && <div className="p-6 font-mono text-xs text-[#14141A]/45">LOADING…</div>}

      {roster?.map((s) => (
        <div
          key={s.staffId}
          className="grid grid-cols-[minmax(0,1fr)_130px_90px_70px] gap-2.5 items-center px-5 py-3.5 border-b border-[#14141A]/[0.08] text-sm"
        >
          <div>
            <div className="font-semibold">{s.name}</div>
            <div className="font-mono text-[10px] text-[#14141A]/50 mt-0.5">{s.staffId}</div>
          </div>
          <select
            value={s.role}
            onChange={(e) => changeRole(s.staffId, e.target.value as StaffRole)}
            disabled={s.staffId === staff?.staffId || busyId === s.staffId}
            className="font-mono text-[10px] tracking-[0.1em] uppercase px-2 py-1.5 border border-[#14141A]/20 bg-cream disabled:opacity-50"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#14141A]/45">
            {s.staffId === staff?.staffId ? "YOU" : ""}
          </div>
          <button
            type="button"
            disabled={s.staffId === staff?.staffId || busyId === s.staffId}
            onClick={() => remove(s.staffId)}
            className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#FF4D2E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            REMOVE
          </button>
        </div>
      ))}

      <form onSubmit={submit} className="p-4.5 flex gap-2.5 flex-wrap items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="NEW STAFF NAME"
          className="flex-1 min-w-[160px] p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          className="p-3 border border-[#14141A]/20 bg-cream font-mono text-[10px] tracking-[0.1em] uppercase"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-3 bg-[#14141A] text-cream font-mono text-[11px] tracking-[0.14em] uppercase cursor-pointer"
        >
          + ADD STAFF
        </button>
      </form>
      {notice && (
        <div className="px-4.5 pb-4 font-mono text-[10px] tracking-[0.08em] uppercase text-[#14141A]/60">{notice}</div>
      )}
    </div>
  );
}
