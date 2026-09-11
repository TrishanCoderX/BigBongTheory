"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { ROLE_LABEL } from "@/lib/roles";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import LineChart from "@/components/charts/LineChart";
import TeamPanel from "./TeamPanel";
import NewEventForm from "./NewEventForm";

interface EventStat {
  slug: string;
  name: string;
  status: string;
  sold: number;
  checkedIn: number;
  capacity: number;
}

interface TierStat {
  id: string;
  label: string;
  count: number;
}

interface DayStat {
  label: string;
  count: number;
}

interface Stats {
  totalEvents: number;
  totalAttendees: number;
  ticketsSold: number;
  checkedInCount: number;
  checkedInPct: number;
  byEvent: EventStat[];
  byTier: TierStat[];
  last7Days: DayStat[];
  totalApplications: number;
  revenue?: number;
}

interface RegistrationRow {
  ticketId: string;
  name: string;
  tier: string;
  checkedIn: boolean;
}

interface ApplicationRow {
  id: string;
  name: string;
  email: string;
  city: string;
  handle: string;
  idea: string;
  tags: string[];
  status: string;
  createdAt: string;
}

const POLL_MS = 5000;

export default function AdminPage() {
  const { staff, can } = useStaffAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [query, setQuery] = useState("");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const queryRef = useRef(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const refreshStats = useCallback(() => {
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats(data);
          setLastUpdated(new Date());
        }
      });
  }, []);

  const refreshRows = useCallback((q: string) => {
    const params = q ? `?query=${encodeURIComponent(q)}` : "";
    fetch(`/api/admin/registrations${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRows(data?.registrations ?? []));
  }, []);

  const refreshApplications = useCallback(() => {
    fetch("/api/admin/join-applications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setApplications(data?.applications ?? []));
  }, []);

  useEffect(() => {
    if (!can("MODERATOR")) return;
    refreshStats();
    refreshRows("");
    refreshApplications();
  }, [can, refreshStats, refreshRows, refreshApplications]);

  useEffect(() => {
    if (!can("MODERATOR")) return;
    const timeout = setTimeout(() => refreshRows(query), 250);
    return () => clearTimeout(timeout);
  }, [query, can, refreshRows]);

  // Live dashboard: poll for fresh stats + registrations + applications on
  // an interval instead of only refreshing on manual actions, so numbers
  // move as real bookings/check-ins/applications happen elsewhere. Skips
  // fetches while the tab is backgrounded to avoid pointless polling.
  useEffect(() => {
    if (!can("MODERATOR")) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      refreshStats();
      refreshRows(queryRef.current);
      refreshApplications();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [can, refreshStats, refreshRows, refreshApplications]);

  const undo = async (ticketId: string) => {
    const res = await fetch("/api/checkin/undo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    });
    if (res.ok) {
      refreshRows(query);
      refreshStats();
    }
  };

  if (!can("MODERATOR")) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-6.5 text-center">
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#FF4D2E] mb-4">
            MODERATOR+ ONLY
          </div>
          <h1 className="font-display uppercase text-3xl">DASHBOARD IS LOCKED FOR YOUR ROLE</h1>
          <p className="font-mono text-xs text-[#14141A]/50 mt-4 max-w-[420px]">
            {staff?.name} is signed in as {ROLE_LABEL[staff?.role ?? "STAFF"]}. Gate crew use Check-in — ask a
            moderator or super admin for dashboard access.
          </p>
        </div>
      </section>
    );
  }

  if (!stats) {
    return <section className="min-h-screen bg-cream pt-10 px-6.5" />;
  }

  const statCards = [
    { k: "TOTAL EVENTS", v: String(stats.totalEvents), d: `${stats.totalEvents} LISTED` },
    { k: "TOTAL ATTENDEES", v: stats.totalAttendees.toLocaleString("en-IN"), d: `${stats.ticketsSold} TICKETS SOLD` },
    { k: "CHECKED IN", v: `${stats.checkedInCount}`, d: `${stats.checkedInPct}% OF ATTENDEES` },
    { k: "APPLICATIONS", v: String(stats.totalApplications), d: "JOIN BBT SUBMISSIONS" },
    {
      k: "REVENUE",
      v: stats.revenue !== undefined ? `₹${stats.revenue.toLocaleString("en-IN")}` : "",
      d: "ALL EVENTS",
      hide: stats.revenue === undefined,
    },
  ];

  return (
    <section className="min-h-screen bg-cream text-[#14141A] pt-10 pb-[60px] px-6.5 font-body">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center gap-5 flex-wrap pb-5.5 border-b border-[#14141A]/[0.14]">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#14141A]/50">
              BBT OPERATIONS
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="font-display text-[38px] uppercase">ADMIN DASHBOARD</div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#3B7A20]/[0.12]" title={`Auto-refreshes every ${POLL_MS / 1000}s`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-[#3B7A20] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 bg-[#3B7A20]" />
                </span>
                <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#2E6119]">LIVE</span>
              </div>
            </div>
            {staff && (
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="text-[#14141A]/50">SIGNED IN AS {staff.name}</span>
                <span className="px-1.5 py-0.5 bg-[#14141A] text-lime">{ROLE_LABEL[staff.role]}</span>
                {lastUpdated && (
                  <span className="text-[#14141A]/35">
                    UPDATED {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap font-mono text-[11px] tracking-[0.14em] uppercase">
            {can("SUPER_ADMIN") ? (
              <button
                type="button"
                onClick={() => setShowNewEvent((v) => !v)}
                className="px-4 py-3 bg-[#14141A] text-cream cursor-pointer min-h-[44px] inline-flex items-center hover:bg-[#2a2a35] transition-colors"
              >
                {showNewEvent ? "CANCEL" : "+ NEW EVENT"}
              </button>
            ) : (
              <button
                type="button"
                title="Super admin only"
                disabled
                className="px-4 py-3 bg-[#14141A] text-cream cursor-not-allowed min-h-[44px] inline-flex items-center opacity-50"
              >
                + NEW EVENT
              </button>
            )}
            <a
              href="/api/admin/export"
              className="px-4 py-3 border border-[#14141A]/25 min-h-[44px] inline-flex items-center cursor-pointer hover:bg-[#14141A] hover:text-cream transition-colors"
            >
              EXPORT CSV
            </a>
          </div>
        </div>

        {showNewEvent && can("SUPER_ADMIN") && (
          <NewEventForm
            onClose={() => setShowNewEvent(false)}
            onCreated={() => {
              setShowNewEvent(false);
              refreshStats();
            }}
          />
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6.5">
          {statCards.map((s) =>
            s.hide ? (
              <div key={s.k} className="bg-white border border-[#14141A]/[0.12] p-5.5 flex flex-col justify-center">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#14141A]/40">{s.k}</div>
                <div className="font-mono text-xs uppercase text-[#14141A]/35 mt-2.5">SUPER ADMIN ONLY</div>
              </div>
            ) : (
              <div key={s.k} className="bg-white border border-[#14141A]/[0.12] p-5.5">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#14141A]/50">{s.k}</div>
                <div className="font-display text-[46px] leading-[1.05] mt-2.5">{s.v}</div>
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#3B7A20] mt-1">{s.d}</div>
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mt-3.5">
          <div className="bg-white border border-[#14141A]/[0.12] p-4.5 lg:col-span-2">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">TICKETS SOLD / EVENT</div>
            <BarChart data={stats.byEvent.map((e) => ({ label: e.name.split(" ")[0], value: e.sold }))} />
          </div>
          <div className="bg-white border border-[#14141A]/[0.12] p-4.5">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">TIER SPLIT</div>
            <DonutChart data={stats.byTier.map((t) => ({ label: t.label, value: t.count }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mt-3.5">
          <div className="bg-white border border-[#14141A]/[0.12] p-4.5 lg:col-span-2">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase mb-4">BOOKINGS, LAST 7 DAYS</div>
            <LineChart data={stats.last7Days.map((d) => ({ label: d.label, value: d.count }))} />
          </div>
          <div className="bg-white border border-[#14141A]/[0.12]">
            <div className="p-4.5 border-b border-[#14141A]/[0.12] font-mono text-[11px] tracking-[0.18em] uppercase">
              EVENTS
            </div>
            {stats.byEvent.map((e) => (
              <div
                key={e.slug}
                className="grid grid-cols-[minmax(0,1fr)_70px_60px] gap-2 items-center px-4.5 py-3 border-b border-[#14141A]/[0.08] text-xs"
              >
                <div className="font-semibold truncate">{e.name}</div>
                <div className="font-mono text-[10px] text-[#14141A]/60">
                  {e.sold}/{e.capacity}
                </div>
                <div
                  className={`font-mono text-[9px] tracking-[0.08em] uppercase px-1.5 py-1 text-center ${
                    e.status === "DRAFT"
                      ? "bg-[#14141A]/[0.08] text-[#14141A]/60"
                      : "bg-[#3B7A20]/[0.14] text-[#2E6119]"
                  }`}
                >
                  {e.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#14141A]/[0.12] mt-3.5">
          <div className="p-4.5 border-b border-[#14141A]/[0.12] flex justify-between items-center gap-3 flex-wrap">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase">REGISTRATIONS</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH NAME, EMAIL OR TICKET ID"
              className="p-2.5 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A] min-w-[220px]"
            />
          </div>
          {rows.map((r) => (
            <div
              key={r.ticketId}
              className="grid grid-cols-[minmax(0,1fr)_80px_96px_90px] gap-2.5 items-center px-5 py-3.5 border-b border-[#14141A]/[0.08] text-sm"
            >
              <div>
                <div className="font-semibold">{r.name}</div>
                <div className="font-mono text-[10px] text-[#14141A]/50 mt-0.5">{r.ticketId}</div>
              </div>
              <div className="font-mono text-[11px] uppercase">{r.tier}</div>
              <div
                className={`font-mono text-[10px] tracking-[0.1em] uppercase ${
                  r.checkedIn ? "text-[#2E6119]" : "text-[#14141A]/45"
                }`}
              >
                {r.checkedIn ? "CHECKED IN" : "PENDING"}
              </div>
              <button
                type="button"
                onClick={() => undo(r.ticketId)}
                disabled={!r.checkedIn}
                className="font-mono text-[9px] tracking-[0.08em] uppercase text-[#FF4D2E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer justify-self-end"
              >
                UNDO
              </button>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="p-6 font-mono text-xs text-[#14141A]/45 text-center">NO MATCHES.</div>
          )}
        </div>

        <div className="bg-white border border-[#14141A]/[0.12] mt-3.5">
          <div className="p-4.5 border-b border-[#14141A]/[0.12] font-mono text-[11px] tracking-[0.18em] uppercase">
            JOIN BBT APPLICATIONS
          </div>
          {applications.map((a) => (
            <div key={a.id} className="px-5 py-4 border-b border-[#14141A]/[0.08]">
              <div className="flex justify-between items-start gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-sm">{a.name}</div>
                  <div className="font-mono text-[10px] text-[#14141A]/50 mt-0.5">
                    {a.email}
                    {a.city && ` / ${a.city}`}
                    {a.handle && ` / ${a.handle}`}
                  </div>
                </div>
                <div className="font-mono text-[9px] text-[#14141A]/40">
                  {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </div>
              </div>
              {a.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {a.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-[#14141A]/[0.06] font-mono text-[9px] tracking-[0.08em] uppercase text-[#14141A]/60">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="text-sm text-[#14141A]/75 mt-2 leading-relaxed">{a.idea}</div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className="p-6 font-mono text-xs text-[#14141A]/45 text-center">NO APPLICATIONS YET.</div>
          )}
        </div>

        {can("SUPER_ADMIN") && (
          <div className="mt-3.5">
            <TeamPanel />
          </div>
        )}
      </div>
    </section>
  );
}
