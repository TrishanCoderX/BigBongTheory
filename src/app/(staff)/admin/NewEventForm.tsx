"use client";

import { useState } from "react";

interface NewEventFormProps {
  onCreated: () => void;
  onClose: () => void;
}

export default function NewEventForm({ onCreated, onClose }: NewEventFormProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [cat, setCat] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [price, setPrice] = useState("299");
  const [capacity, setCapacity] = useState("400");
  const [ticketsLabel, setTicketsLabel] = useState("TICKETS LIVE");
  const [status, setStatus] = useState<"LIVE" | "DRAFT">("LIVE");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          date,
          cat,
          time,
          venue,
          price: Number(price),
          capacity: Number(capacity),
          ticketsLabel,
          status,
          description,
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create event.");
        return;
      }
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#14141A]/[0.12] mt-3.5">
      <div className="p-4.5 border-b border-[#14141A]/[0.12] flex justify-between items-center">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase">NEW EVENT</div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#14141A]/50 cursor-pointer"
        >
          CLOSE
        </button>
      </div>
      <form onSubmit={submit} className="p-4.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">NAME</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. WAREHOUSE SESSIONS"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">CATEGORY</div>
          <input
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            required
            placeholder="e.g. MUSIC"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">CITY</div>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="e.g. KOLKATA"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">DATE</div>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            placeholder="e.g. 12 JAN"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">TIME</div>
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 8:00 PM – LATE"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">VENUE</div>
          <input
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. WAREHOUSE 9, DOCK ROAD"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">
            PRICE (₹)
          </div>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">CAPACITY</div>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">
            TICKETS LABEL
          </div>
          <input
            value={ticketsLabel}
            onChange={(e) => setTicketsLabel(e.target.value)}
            placeholder="e.g. TICKETS LIVE"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">STATUS</div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "LIVE" | "DRAFT")}
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          >
            <option value="LIVE">LIVE</option>
            <option value="DRAFT">DRAFT</option>
          </select>
        </label>

        <label className="block sm:col-span-2">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">
            IMAGE PATH (OPTIONAL)
          </div>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="e.g. /events/turf-day.svg"
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A]"
          />
        </label>
        <label className="block sm:col-span-2">
          <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#14141A]/50 mb-1.5">
            DESCRIPTION (OPTIONAL)
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Shown as 'THE PLOT' on the event page. Leave blank to use the default copy."
            className="w-full p-3 border border-[#14141A]/20 bg-cream font-mono text-xs outline-none focus:border-[#14141A] resize-y"
          />
        </label>

        {error && <p className="text-[#FF4D2E] text-xs font-mono sm:col-span-2">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 mt-1 px-4 py-3.5 bg-[#14141A] text-cream font-mono text-[11px] tracking-[0.14em] uppercase cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          {submitting ? "CREATING…" : "+ CREATE EVENT"}
        </button>
      </form>
    </div>
  );
}
