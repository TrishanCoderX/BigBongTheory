import Link from "next/link";

const sections = [
  {
    title: "1. Information Collection",
    body: "We collect personal details (name, city, contact credentials) when voluntarily submitted through event booking, the join form, or WhatsApp communication.",
  },
  {
    title: "2. Utilization of Data",
    body: "Collected details are used strictly to manage bookings, issue tickets, run check-in, and share updates about BBT events. We do not use your data for anything beyond delivering the experience.",
  },
  {
    title: "3. Cookies & Tracking",
    body: "The site may use minimal session storage to remember your booking progress. No data collected this way is sold or shared with advertising brokers.",
  },
  {
    title: "4. Payment Data",
    body: "Payments are processed through trusted third-party gateways. BBT does not store your card or UPI credentials.",
  },
  {
    title: "5. Data Retention",
    body: "Booking and check-in records are kept only as long as necessary to run the event and resolve disputes, then purged from active systems.",
  },
  {
    title: "6. Your Rights",
    body: "You may request access to, correction of, or deletion of the personal data we hold on you at any time by contacting us directly.",
  },
  {
    title: "7. Changes to This Policy",
    body: "This policy may be revised as BBT grows. The current version is always posted on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="w-full min-h-screen">
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 border-b-4 border-lime px-5 md:px-6">
        <div className="max-w-4xl mx-auto">
          <span className="font-mono text-xs text-lime bg-lime/10 border border-lime/20 px-3.5 py-1.5 inline-block mb-6 tracking-widest uppercase">
            {"// DOC.ID: LEGAL_01"}
          </span>
          <h1
            className="font-display uppercase leading-none tracking-tight"
            style={{ fontSize: "clamp(40px, 9vw, 100px)" }}
          >
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-2xl text-cream/70 text-base md:text-lg leading-relaxed">
            How we capture, manage, and protect data collected through our booking and community
            channels.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 md:px-6 py-16 md:py-24">
        <div className="w-full bg-surface border border-cream/[0.16] p-8 md:p-12">
          <p className="font-mono text-xs text-ember font-bold tracking-widest uppercase mb-8">
            &gt; LAST REVISED: AUGUST 2026 // SECURITY PROTOCOL ALPHA ACTIVE.
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
            Questions about this policy?{" "}
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
