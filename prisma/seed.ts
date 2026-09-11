import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Events with cat "MYSTERY" render as a locked/redacted card on the public
// site (see EventCard + events/page.tsx) instead of showing real details —
// used for slots that aren't ready to be announced yet.
const events = [
  {
    slug: "turf-day",
    name: "TURF DAY",
    city: "KOLKATA",
    date: "SAT, 12 SEP",
    cat: "SPORTS",
    tint: "#1C2B0D",
    time: "5:00 PM – 8:00 PM",
    venue: "GREENFIELD TURF, SALT LAKE",
    price: 0,
    ticketsLabel: "FREE — 20 SPOTS ONLY",
    status: "LIVE",
    capacity: 20,
    description:
      "BBT's first Turf Day — a Saturday built for people who'd rather sweat it out than sit around. It's part community meet, part sports day: show up solo or bring a squad, we'll sort teams either way. Cricket on one half, football on the other, and a rotating lineup of fun games and challenges filling every gap in between. Free entry, capped at 20 spots — once they're gone, registration closes.",
    image: "/events/turf-day.svg",
  },
  {
    slug: "bbt-adda-01",
    name: "BBT ADDA #01",
    city: "KOLKATA",
    date: "COMING SOON",
    cat: "ADDA",
    tint: "#1B1B22",
    time: "6:00 PM – 10:30 PM",
    venue: "A ROOFTOP IN SOUTH KOLKATA",
    price: 299,
    ticketsLabel: "TICKETS SOON",
    status: "DRAFT",
    description: "",
    image: "",
  },
  {
    slug: "midnight-reel",
    name: "TO BE REVEALED",
    city: "???",
    date: "REVEALING SOON",
    cat: "MYSTERY",
    tint: "#0B0B11",
    time: "TBA",
    venue: "LOCATION LOCKED",
    price: 349,
    ticketsLabel: "LOCKED",
    status: "DRAFT",
    description: "",
    image: "",
  },
  {
    slug: "noise-floor-02",
    name: "TO BE REVEALED",
    city: "???",
    date: "REVEALING SOON",
    cat: "MYSTERY",
    tint: "#0B0B11",
    time: "TBA",
    venue: "LOCATION LOCKED",
    price: 499,
    ticketsLabel: "LOCKED",
    status: "DRAFT",
    description: "",
    image: "",
  },
  {
    slug: "frame-rate",
    name: "TO BE REVEALED",
    city: "???",
    date: "REVEALING SOON",
    cat: "MYSTERY",
    tint: "#0B0B11",
    time: "TBA",
    venue: "LOCATION LOCKED",
    price: 199,
    ticketsLabel: "LOCKED",
    status: "DRAFT",
    description: "",
    image: "",
  },
  {
    slug: "warehouse-sessions",
    name: "TO BE REVEALED",
    city: "???",
    date: "REVEALING SOON",
    cat: "MYSTERY",
    tint: "#0B0B11",
    time: "TBA",
    venue: "LOCATION LOCKED",
    price: 299,
    ticketsLabel: "LOCKED",
    status: "DRAFT",
    description: "",
    image: "",
  },
];

const tiers = [
  { id: "EARLY" as const, label: "EARLY BIRD", price: 199, note: "FIRST 50 MISFITS", left: 12 },
  { id: "REGULAR" as const, label: "REGULAR", price: 299, note: "STANDARD ENTRY", left: 148 },
  { id: "VIP" as const, label: "VIP", price: 699, note: "FRONT ROW + AFTER-PARTY", left: 20 },
];

// Passcodes come from env vars so a real production value is never
// hardcoded/committed in this file — only the obviously-dev-only fallbacks
// are. Set SEED_SUPER_PASSCODE / SEED_MOD_PASSCODE / SEED_GATE_PASSCODE
// before seeding a non-local database.
const staff = [
  {
    staffId: "arko",
    name: "Arko Dutta",
    passcode: process.env.SEED_SUPER_PASSCODE || "SUPER-2026",
    role: "SUPER_ADMIN" as const,
  },
  {
    staffId: "riya",
    name: "Riya Sen",
    passcode: process.env.SEED_MOD_PASSCODE || "MOD-2026",
    role: "MODERATOR" as const,
  },
  {
    staffId: "gate",
    name: "Gate Crew",
    passcode: process.env.SEED_GATE_PASSCODE || "GATE-2026",
    role: "STAFF" as const,
  },
];

async function main() {
  for (const event of events) {
    await prisma.event.upsert({ where: { slug: event.slug }, create: event, update: event });
  }

  for (const tier of tiers) {
    await prisma.tier.upsert({ where: { id: tier.id }, create: tier, update: tier });
  }

  for (const s of staff) {
    const passcodeHash = await bcrypt.hash(s.passcode, 10);
    await prisma.staffAccount.upsert({
      where: { staffId: s.staffId },
      create: { staffId: s.staffId, name: s.name, passcodeHash, role: s.role },
      update: { name: s.name, passcodeHash, role: s.role },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
