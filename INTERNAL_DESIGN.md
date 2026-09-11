# INTERNAL_DESIGN.md — Backend & Frontend/Backend Correspondence

This document explains **why** the backend is structured the way it is, and how the frontend and backend actually talk to each other — the reasoning behind each architectural decision, not just a description of the code. For the UI/UX reasoning, see `DESIGN.md`.

---

## 1. What this actually is

Despite the theatrical frontend, this is a real ticketing platform with a real database, real authentication, real capacity enforcement, and a real (if lightweight) admin/gate-operations backend. Nothing about registrations, check-ins, or the admin dashboard is mocked — every number shown anywhere in the app is a live query against the database at request time. This matters because it shapes almost every decision below: correctness under concurrent access, honest empty states, and no client-side-only security were all treated as real requirements, not demo shortcuts.

**Stack:** Next.js (App Router, Next 16 — note the `proxy.ts` naming, see §7), Prisma ORM, SQLite in dev (via `better-sqlite3` driver adapter) with the schema explicitly designed to swap to Postgres for production, Auth.js v5 (NextAuth) for attendee sign-in, a hand-rolled JWT+cookie system for staff sign-in, Resend for transactional email.

---

## 2. Data model (`prisma/schema.prisma`)

```
User / Account / Session / VerificationToken   — attendee identity (Auth.js shape)
StaffAccount                                   — operational staff (gate/mod/admin)
Event ←→ Registration ←→ Tier                  — the core ticketing relationship
JoinApplication                                — membership applications
```

**Why `User` and `StaffAccount` are two entirely separate models, not one with a role field:** these represent fundamentally different trust models and lifecycles. A `User` is a public visitor who signs up with Google OAuth or email/password to book tickets — self-service, low-friction, no vetting. A `StaffAccount` is a small, hand-provisioned set of people (gate crew, moderators, organizers) authenticated by a short passcode issued by a super admin — closer to an internal ops credential than a customer account. Merging them into one model with a `role` column would mean every public sign-up flow needs to reason about staff permissions, and every staff-permission check needs to reason about OAuth/password edge cases. Keeping them separate means each system's logic stays simple and the attack surface of one can't leak into the other (see §4).

**Why `Registration.tier` references a global `Tier` model instead of per-event pricing:** the three ticket tiers (Early Bird / Regular / VIP) are shared pricing presets across all events, not something a new event owner needs to reconfigure each time. `Event.price` still exists independently as the event's *display* price (what shows in listings), while the actual charged `amount` at booking time is `tier.price * qty` — except for free events, where it's forced to `0` regardless of tier (see §5). This split exists because tiers are an operational/pricing-strategy concept while `Event.price` is a marketing/display concept, and they don't always need to move together.

**Why `Event` carries a free-text `status` and `cat` instead of enums:** both are used for *display branching* logic in the frontend (`cat === "MYSTERY"` renders a locked card, `status === "DRAFT"` shows a badge in the admin event list) rather than being enforced business rules with a fixed set of valid values. Keeping them as strings means new display states (e.g. a future "SOLD OUT" cat) can be introduced without a migration — the tradeoff is that correctness of these values isn't enforced by the database, only by convention in the code that writes them (seed data and `/api/admin/events`).

**Why `Registration.checkedInBy` uses `onDelete: SetNull` rather than `Cascade` or `Restrict`:** if a staff account that performed check-ins is later removed from the roster (via the admin Team panel), the check-in records themselves — `checkedIn`, `checkedInAt` — must survive as the source of truth for who actually attended. `SetNull` preserves the check-in event while just dropping the "who did it" attribution, rather than either destroying attendance history (`Cascade`) or blocking the staff deletion entirely (`Restrict`).

**Why SQLite in dev, and why the schema header explicitly calls out swapping to Postgres:** SQLite requires zero external services to develop against — clone the repo, run migrations, go. But it's a single-file, single-writer database, which is wrong for a real production deploy (concurrent writers, no separate DB process, and most hosts give containers ephemeral filesystems). The Prisma client is instantiated behind a driver adapter (`PrismaBetterSqlite3` in `src/lib/prisma.ts`) specifically so that swapping to a Postgres adapter later is a contained, mechanical change rather than a rewrite — see the Railway deployment prep notes for what that swap actually involves.

---

## 3. Server-only data access vs. API routes — the actual "gateway"

There are two distinct ways data reaches the frontend, and the choice between them is deliberate, not incidental:

### a) Server Components call `src/lib/events.ts` directly

Pages like the event detail page, the booking page, and the ticket page are **Server Components** — they run on the server, so they call `getEventBySlug`, `getEvents`, `getRegisteredQty`, etc. directly against Prisma, with no network hop and no API route involved. This file is explicitly commented as *"Server-only data access... replaces the old static content.ts events/tiers arrays so events created from the admin panel actually show up on the public site."* The reasoning: these pages need the freshest possible data (an event's capacity, description, live registration count) at the moment they're rendered, and a Server Component calling Prisma directly is both faster (no serialization round-trip) and impossible to call from a browser (it never ships to the client), which removes an entire class of "could this leak internal data" concerns.

### b) Client Components call `/api/*` routes over `fetch`

Anything that's interactive after the initial page load — the booking wizard submitting a registration, the join form submitting an application, the admin dashboard polling for live stats, the check-in page looking up and confirming tickets — is a **Client Component**, and client code can only ever reach the server through an API route. This is the real "gateway": every mutation, and every read that needs to happen *after* the page has already loaded, crosses through an explicit `route.ts` handler under `src/app/api/`. Those handlers are where input validation, capacity checks, rate limiting, and auth gating actually live — the client is never trusted to have done any of that correctly itself, it's just UI.

**Why this split matters as a design principle, not just a technical necessity:** every place in this codebase where "real" business logic exists (capacity enforcement, free-ticket pricing override, one-ticket-per-person, check-in race protection) lives in an API route, never in a Server Component's direct Prisma call and never in client-side code. The rule of thumb followed throughout: if it needs to be *correct*, it goes through an API route with server-side validation; if it just needs to be *fresh*, a Server Component reads it directly.

---

## 4. Two authentication systems, and why they don't share code

### Attendee auth — Auth.js v5 (`src/auth.ts`)

Standard NextAuth setup: Google OAuth + email/password Credentials provider, backed by `@auth/prisma-adapter` so a Google sign-in and a password account with the same email resolve to one `User` row. Sessions are **JWT-strategy**, not database-session-strategy — required because the Credentials provider can't be tied to a database session record the way OAuth can, so the whole app standardizes on stateless JWT sessions for consistency rather than mixing strategies per provider.

### Staff auth — a separate, hand-rolled JWT+cookie system (`src/lib/staffToken.ts`, `src/lib/staffSession.ts`)

Staff sign in with a `staffId` + short passcode (bcrypt-hashed at rest), and get a `bbt_staff_session` httpOnly cookie containing a `jose`-signed HS256 JWT, deliberately set to an **8-hour max-age** — sized to a single gate-staff shift, not a long-lived "remember me" session, because these are low-trust, walk-up-and-scan operational credentials rather than personal accounts.

**Why this isn't just another NextAuth provider:** the split between `staffToken.ts` (pure sign/verify, no Next.js request-context dependency) and `staffSession.ts` (wraps it with `cookies()` for use in Server Components/Route Handlers) exists because the *same token-verification logic* needs to run in **Edge Middleware** (`proxy.ts`, see §7), which only has access to `NextRequest.cookies`, not the `next/headers` API that Route Handlers use. NextAuth's own session machinery isn't structured for that dual context here, so staff auth is its own minimal system precisely so it can be verified at the edge, before a protected page is even served — see §7 for why that matters.

**The authorization pattern, repeated identically across every protected route:** `requireStaff(minRole)` returns either `{ session }` or `{ error: Response }`, and every admin/check-in API route starts with:
```ts
const gate = await requireStaff("MODERATOR");
if ("error" in gate) return gate.error;
```
This is a deliberately boring, copy-pasted pattern rather than middleware-based blanket protection, because the *minimum required role differs per route* (`STAFF` can look up and confirm check-ins; only `MODERATOR`+ can undo one; only `SUPER_ADMIN` can manage the staff roster or create events) — that granularity has to live at the route level, not in a single middleware matcher.

**Role hierarchy exists in two places on purpose:** `roles.ts` (a plain string-literal union, safe for client bundles) and `staffSession.ts` (using the Prisma-generated `StaffRole` enum, server-only). Duplicating the tiny `roleAtLeast` comparison rather than sharing one module means the client bundle never needs to import Prisma types just to render a "you don't have permission" state — client-side role checks are UX-only convenience (`can()` in `useStaffAuth`), never the actual security boundary, which is always re-checked server-side.

---

## 5. Business logic worth explaining (not just what, but why)

### Capacity enforcement (`/api/registrations`)

Originally there was **no** capacity check at all — any number of registrations could be created against any event regardless of its `capacity` field. This was added because a specific real need arose (Turf Day: cap at 20, free, first-come-first-served) and generalized to every event rather than special-cased:
```ts
const remaining = event.capacity - (registeredQtySum);
if (remaining <= 0) return 409 "sold out";
if (qty > remaining) return 409 "only N left";
```
This lives entirely server-side in the route handler — the booking wizard's UI-level "max quantity" stepper is a convenience, not the actual limit; the real limit is enforced at the moment of write, closing the race window where two people could otherwise both "see" the last spot available client-side and both submit.

### Free events override tier pricing, not the other way around

```ts
const amount = event.price === 0 ? 0 : tier.price * qty;
```
Since `Tier` pricing is global (shared across every event, see §2), a free event can't simply "have no tiers" — the booking flow still needs *a* tier value to satisfy the schema. Rather than teaching the `Tier` model about per-event overrides, the simpler and more robust fix was: if the *event* is priced at zero, the charged amount is always zero, full stop, regardless of which tier gets recorded. This guarantees a free event can never accidentally charge someone due to a stale or manipulated tier price on the client.

### One ticket per person, enforced server-side, not just hidden client-side

For free/capacity-limited events specifically:
```ts
if (isFree) {
  const existing = await prisma.registration.findFirst({ where: { eventSlug, email } });
  if (existing) return 409 "already claimed a spot";
}
const qty = isFree ? 1 : qtyRaw;
```
The client-side booking wizard simply hides the quantity stepper for free events — but that alone doesn't stop someone from calling the API directly with `qty: 8`, or submitting the form multiple times with the same email. Both are blocked server-side: quantity is silently clamped to `1` regardless of what's submitted, and a second booking attempt with an email that's already registered for that event is rejected outright. This is the same principle as capacity enforcement — the UI expresses the *intent*, the API route is the *actual rule*.

### Display ranking decouples "what order events show in" from "when they were created"

```ts
function displayRank(cat: string) {
  if (cat === "MYSTERY") return 2;
  if (cat === "ADDA") return 1;
  return 0;
}
// ...rows.map(toBBTEvent).sort((a, b) => displayRank(a.cat) - displayRank(b.cat))
```
Prisma's `findMany` naturally orders by `createdAt`, which is an implementation detail (whichever event happened to be inserted into the database first) with no relationship to what should actually appear first to a visitor (a live, real event should always lead; teased/unannounced slots should always trail). Sorting by a small display-priority function after the fetch, rather than trying to encode "curation order" into `createdAt` or adding a new `sortOrder` column, keeps the ordering logic readable and independent of insertion history.

### Check-in confirmation uses a conditional update as a concurrency guard

```ts
prisma.registration.updateMany({
  where: { ticketId, checkedIn: false },
  data: { checkedIn: true, checkedInAt: ..., checkedInById: ... },
});
```
At a real event, two gate staff could plausibly scan the same ticket within moments of each other. A plain `update` would let both succeed, silently overwriting each other's `checkedInAt`/`checkedInById`. Using `updateMany` with `checkedIn: false` in the `where` clause means only the *first* request to reach the database actually flips the flag — the second one matches zero rows and can report "already checked in" instead of silently double-processing.

### Email is always a best-effort side effect, never a blocking dependency

Both `sendBookingConfirmation` and `sendJoinConfirmation` follow the identical pattern: check for `RESEND_API_KEY`, skip with a warning log if absent, wrap the actual send in try/catch, and **never throw**. A booking or a join application is considered successful the moment its database row exists — email delivery is explicitly a nice-to-have layered on top, never something that can fail the primary action if the email provider is slow, misconfigured, or down. This also means local development works fully (registrations, check-ins, the whole flow) without ever configuring an email provider.

### Admin dashboard "live-ness" is client-side polling, not push

The admin dashboard refetches `/api/admin/stats`, `/api/admin/registrations`, and `/api/admin/join-applications` on a 5-second interval (`setInterval`, paused while `document.hidden`), rather than using WebSockets or Server-Sent Events. This was a deliberate simplicity choice: the app runs as a single Node process against a single database with no existing pub/sub infrastructure, so a genuine push-based system would need to poll the database internally anyway to detect changes (SQLite/Postgres have no built-in change-notification the app is wired to) — client-side polling gets the same practical result (numbers update within a few seconds of a real booking) with far less infrastructure and failure surface. If this app ever needs true sub-second updates across many simultaneous admin viewers, that's the point where SSE/WebSockets would earn their complexity — not before.

---

## 6. Seed data discipline

`prisma/seed.ts` originally auto-generated ~50 fabricated registrations (fake names, fake emails, fake check-ins) any time the `Registration` table was empty, so a fresh clone would "look populated" for demos. This was **deliberately removed** once real usage began — a seed script that silently repopulates fake attendee data on every reset is actively dangerous once the admin dashboard is being used to make real decisions (capacity, revenue, who's checked in). The seed script now only ever creates structural/reference data (events, tiers, staff accounts) — real activity data (registrations, applications) is left for the app itself to create, and never synthesized.

---

## 7. `src/proxy.ts` — Next 16's `middleware.ts`, and defense in depth

Next.js 16 renamed the middleware entry point from `middleware.ts` to `proxy.ts` (the same `matcher`-based Edge Runtime convention, just relocated — see `AGENTS.md` for why this repo calls that out explicitly for anyone working in it from prior Next.js knowledge). It does two independent jobs:

1. **Rate limiting** login/register/credentials-callback attempts (10 per 5 minutes per client) and ticket-ID lookups (60 per minute) via an in-memory fixed-window limiter (`src/lib/rateLimit.ts`). The limiter is explicitly documented as a **known, accepted limitation**: it's per-process memory, resets on restart, and doesn't share state across multiple instances — fine for a single Node process, but flagged in-code as something to replace with a shared store (Redis/Upstash) the moment this app runs behind more than one instance.
2. **Page-level staff gating** for `/admin` and `/checkin` — verifying the staff session cookie *before the page is ever served*, redirecting unauthenticated requests to `/staff-login?next=<path>`. This exists in addition to (not instead of) the client-side `useStaffAuth`/`StaffGate` checks and the per-route `requireStaff` calls, because a client-side-only gate still ships that page's full JS bundle (and would ship any embedded server-rendered data) to anyone who requests the URL directly — middleware is what actually prevents an unauthenticated request from reaching the page at all.

This three-layer pattern — **edge middleware** (can this request reach the page/route at all) → **client-side UI gating** (cosmetic, hides controls the user isn't allowed to use) → **per-route server authorization** (the actual, final authority on every read/write) — is the consistent security model across the whole staff-facing surface. No single layer is trusted alone; each exists because the layer "above" it can be bypassed by a sufficiently direct request.

---

## 8. QR ticket format — one source of truth for producer and consumer

Ticket QR codes are generated client-side in `TicketClient.tsx` (via the `qrcode` package, encoding `"BBT-TICKET:" + ticketId`) and decoded at the gate in the check-in page (via `jsqr`, scanning camera frames). Both sides import the same constant-producing/parsing logic from `src/lib/ticketFormat.ts` rather than each hardcoding the `"BBT-TICKET:"` prefix independently. This matters for two reasons: it guarantees the encoder and decoder can never silently drift out of sync, and the decoder's strict prefix check means a QR code that happens to contain some *other* unrelated text (a different app's ticket, a URL, anything) is safely ignored rather than misinterpreted as a malformed ticket ID.

---

## 9. Known, accepted tradeoffs (documented on purpose)

Being explicit about these rather than pretending they don't exist:

- **In-memory rate limiting** (§7) won't work correctly across multiple server instances — acceptable for the current single-instance deployment, called out in-code for whoever scales this later.
- **SQLite in development** is not production-appropriate (§2) — the schema and Prisma adapter are structured so swapping to Postgres is a contained change, not a rewrite, but it hasn't been done yet as of this writing.
- **Client-side role checks (`can()`) are cosmetic only** — every real authorization decision is re-verified server-side per route; the client-side version exists purely so the UI doesn't show controls a user can't actually use, and should never be treated as a security boundary by future contributors.
- **Admin dashboard "live" updates are polling, not push** (§5) — a reasonable simplicity tradeoff at current scale, with a clear signal (need for true real-time across many concurrent admin viewers) for when to revisit it.
