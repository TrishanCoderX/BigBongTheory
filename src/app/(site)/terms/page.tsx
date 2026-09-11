import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing this site or attending a BBT event, you agree to comply with and be bound by the following conditions.",
  },
  {
    title: "2. Tickets & Booking",
    body: "A booking is confirmed only once payment is completed and a ticket ID is issued. Tickets are non-transferable unless stated otherwise for a specific event.",
  },
  {
    title: "3. Entry & Check-In",
    body: "Entry requires a valid digital pass and a matching photo ID at the gate. BBT reserves the right to refuse entry if capacity is reached or a pass appears duplicated or forged.",
  },
  {
    title: "4. Cancellations & Rescheduling",
    body: "Refund and rescheduling terms are specific to each event and stated at checkout. Costs already committed to vendors or venues may be non-refundable.",
  },
  {
    title: "5. Conduct & Safety",
    body: "Attendees participate under standard safety advisories. BBT reserves the right to remove anyone whose conduct compromises the safety of guests, crew, or venue.",
  },
  {
    title: "6. Creative Property",
    body: "Photos, films, and content produced at BBT events may be used for BBT's own promotion unless you opt out in writing in advance.",
  },
  {
    title: "7. Disclaimer of Liability",
    body: "BBT is not liable for incidental venue outages, third-party vendor failures, or circumstances beyond reasonable control (force majeure).",
  },
  {
    title: "8. Governing Law",
    body: "These terms are governed by the laws of India, subject to the exclusive jurisdiction of the courts in Kolkata.",
  },
  {
    title: "9. Changes to Terms",
    body: "These terms may be revised as BBT's operations evolve. The current version is always posted on this page.",
  },
];

export default function TermsPage() {
  return (
    <main className="w-full min-h-screen">
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b-4 border-lime px-5 md:px-6">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-xs text-lime bg-lime/10 border border-lime/20 px-3.5 py-1.5 inline-block mb-6 tracking-widest uppercase">
            {"// DOC.ID: LEGAL_02"}
          </span>
          <h1
            className="font-display uppercase leading-none tracking-tight"
            style={{ fontSize: "clamp(40px, 9vw, 100px)" }}
          >
            Terms of Service
          </h1>
          <p className="mt-6 max-w-2xl text-cream/70 text-base md:text-lg leading-relaxed">
            The conditions that govern every ticket, booking, and event you join through BBT.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 md:px-6 py-16 md:py-24">
        <div className="w-full bg-surface border border-cream/[0.16] p-8 md:p-12">
          <p className="font-mono text-xs text-ember font-bold tracking-widest uppercase mb-8">
            &gt; EFFECTIVE DATE: AUGUST 2026 // OPERATIONAL MANIFESTO CODE ACTIVE.
          </p>

          <div className="text-cream/70 space-y-8 text-sm md:text-base leading-relaxed">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-display text-xl uppercase mb-3">{section.title}</h2>
                <p>{section.body}</p>
              </div>
            ))}
          </div>

          <p className="font-mono text-xs text-cream/40 tracking-wider font-bold mt-12 pt-8 border-t border-cream/[0.16]">
            Questions about these terms?{" "}
            <Link href="/join" className="text-lime hover:text-ember transition-colors">
              Reach out to BBT
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
