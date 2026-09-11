# PHASES.md — Path to a Working Railway Deployment

Goal: by the end of the final phase, this app builds and runs on Railway with no build errors, no runtime errors, and every core flow (browse → book → join → admin → check-in) working against a real production database.

Each phase has a single verifiable exit condition — if that condition isn't met, later phases shouldn't start, because they'd be built on a broken assumption. Tasks are marked **[ME]** (code changes I make in this repo) or **[YOU]** (accounts/consoles only you can act on — Railway, Google Cloud, Resend).

---

## Phase 1 — Make the app buildable in a fresh environment ✅ DONE

**Why this is first:** everything downstream is pointless if the app can't even build somewhere that isn't this machine. Right now it can't, for a concrete reason below — this has to be fixed before anything Railway-specific is worth touching.

**Tasks**
- ✅ **[ME]** Added a `postinstall` script (`"postinstall": "prisma generate"`) to `package.json`. `src/generated/prisma` is gitignored — it's regenerated locally every time I run a Prisma command, which is why this hadn't been noticed yet. On a fresh Railway build (`npm install` → `npm run build`), that directory wouldn't have existed and every `@/generated/prisma/*` import would fail immediately. Verified the hook actually fires during `npm install`.
- ✅ **[ME]** Confirmed `npm run build` succeeds from a clean `node_modules` + no pre-existing `src/generated/prisma` (`rm -rf node_modules src/generated/prisma && npm install && npm run build`) — simulates what Railway actually does. Zero errors.
- ✅ **[ME]** Confirmed `npx tsc --noEmit` (via the build's inline TS check) and `npm run lint` are clean.
- ✅ **[ME, bonus]** `npm install` surfaced 3 dependency vulnerabilities (1 critical: a Next.js unauthenticated RCE affecting `16.0.0–16.3.2`). Patched `next` and `eslint-config-next` from `16.3.0` → `16.3.4` (same minor line, no breaking changes expected) and ran `npm audit fix` for the remaining `js-yaml` advisory. Re-verified build + lint clean afterward. `npm audit` now reports **0 vulnerabilities**. Not originally scoped in this phase, but shipping a public Railway URL on a framework version with a known unauthenticated RCE would undercut "error-free" in the way that matters most, so it was fixed now while cheap rather than deferred.

**Exit criteria:** `rm -rf node_modules src/generated/prisma && npm install && npm run build` succeeds locally with zero errors. **Met.**

---

## Phase 2 — Database: SQLite → Postgres

**Why this is second:** this is the biggest structural change and everything after it (migrations, seed data, deploy config) depends on knowing the final database shape. `schema.prisma`'s own header already flags this as required before any real multi-instance/production deploy — SQLite is a single file on a filesystem Railway doesn't guarantee persists across deploys.

**Why this is split into three sub-phases:** this isn't one atomic change — it's a provider swap, a full migration-history reset, and a from-scratch functional re-verification, each of which can independently go wrong in different ways (wrong adapter/package combo, a migration that doesn't apply cleanly, a code path that quietly assumed SQLite behavior). Doing all three in one pass makes it hard to tell which part broke if something fails. Each sub-phase below has its own exit condition; Phase 2 as a whole is only done once 2.3 passes.

**Not started — execute only on explicit instruction.**

---

### Phase 2.1 — Provision Postgres + point the codebase at it ✅ DONE

**Goal:** the app *targets* Postgres and compiles against it. Not yet required to hold real data or be functionally verified — that's 2.2 and 2.3.

**Tasks**
- ✅ **[ME, substituted]** Railway wasn't touched yet (no account access from here) — used the reachable local Postgres already running on this machine instead, per the phase's own fallback option. Created a dedicated throwaway database (`bbt_dev`, owned by the local user, isolated from other unrelated local databases already present on this Postgres instance) rather than reusing a shared/default one.
- ✅ **[ME]** Changed `datasource db { provider = "sqlite" }` → `"postgresql"` in `schema.prisma`.
- ✅ **[ME]** Swapped the Prisma adapter in `src/lib/prisma.ts` (and in `prisma/seed.ts`, which had its own separate instantiation) from `PrismaBetterSqlite3` to `PrismaPg` (`@prisma/adapter-pg`). Updated `package.json`: removed `@prisma/adapter-better-sqlite3`, `better-sqlite3`, `@types/better-sqlite3`; added `@prisma/adapter-pg`, `pg`, `@types/pg`.
- ✅ **[ME]** Updated `DATABASE_URL` in `.env` to `postgresql://user@localhost:5432/bbt_dev`, and rewrote the connection-string guidance comment in `.env.example` to cover both local Postgres and the future Railway plugin string.
- ✅ **[ME]** Ran `npm install` (postinstall hook fired `prisma generate` automatically, succeeded against the new provider) and confirmed `npx tsc --noEmit` clean, `npm run lint` clean, and `npm run build` clean.
- ✅ **[ME, beyond the stated exit bar]** Booted the dev server against the live Postgres connection as an extra sanity check (not required by this sub-phase). Confirmed the connection itself is genuinely live: the homepage renders fine, while `/api/events` correctly 500s because the `Event` table doesn't exist yet — exactly the expected boundary, and good evidence the adapter is really talking to Postgres rather than just satisfying the type checker.
- Leftover `better-sqlite3` still appears in `node_modules` — confirmed via `npm ls` it's an internal transitive dependency of the `prisma` CLI package itself (used for Prisma's own tooling), not something our code imports. No action needed.

**Exit criteria:** the Prisma client generates successfully against the Postgres provider and the project typechecks clean. The database itself doesn't need to have any tables yet — that's 2.2. **Met.**

**Note for Phase 4 (Railway deploy):** the connection string in `.env` currently points at this local Postgres instance, not Railway's. Before/during Phase 4, `DATABASE_URL` needs to be swapped to the real Railway Postgres plugin's connection string (in Railway's env var settings, not committed to `.env`) — Phase 2.2/2.3's migrations and seed data will need re-running against that instance too, since local Postgres and Railway's Postgres are separate databases.

---

### Phase 2.2 — Migration history reset + reference data seeded ✅ DONE

**Goal:** the live Postgres database actually has the real schema applied, correctly, from a clean migration history — and is seeded with the same reference data (events, tiers, staff accounts) the app expects.

**Tasks**
- ✅ **[ME]** Deleted the SQLite-flavored migration history under `prisma/migrations/`.
- ✅ **[ME]** Ran `prisma migrate dev --name init_postgres` fresh against `bbt_dev` — generated and applied a new baseline migration. `migration_lock.toml` now correctly reads `provider = "postgresql"`. Verified via `psql \dt` that all 9 model tables exist (`Event`, `Registration`, `Tier`, `User`, `Account`, `Session`, `VerificationToken`, `StaffAccount`, `JoinApplication`) plus Prisma's own `_prisma_migrations` tracking table.
- ✅ **[ME]** Ran `npm run db:seed` against Postgres — completed cleanly, no errors.
- ✅ **[ME]** Verified directly via `psql` queries (not just trusting the seed script's exit code): 6 events present with correct data (Turf Day free/20-cap/LIVE, BBT Adda coming-soon/DRAFT, 4 mystery-locked events), 3 tiers, 3 staff accounts (arko/riya/gate with correct roles) — and **0 rows** in both `Registration` and `JoinApplication`, confirming the earlier fix (stripping synthetic registration generation from the seed script) holds against the new database too.

**Exit criteria:** the Postgres database has the full schema applied via a clean migration history, and querying it shows the correct reference data with zero unexpected/fake rows. **Met.**

**Aside:** while checking `git status` for this phase, found the git repository root is actually `/Users/user` (the whole home directory), not this project folder — unrelated to this phase's work (no git operations were needed here), but worth your attention before anyone runs `git commit`/`git add -A` in this repo, since it would currently consider your entire home directory in scope, not just BBT_2.0.

---

### Phase 2.3 — Full functional verification against Postgres ✅ DONE

**Goal:** prove the app actually works end-to-end on Postgres, not just that it builds and the schema exists — this is the sub-phase that makes Phase 2 "done, error-free" for real.

**Tasks**
- ✅ **[ME]** Restarted the local dev server pointed fully at the Postgres `DATABASE_URL`.
- ✅ **[ME]** Re-ran `npm run build`, `npm run lint`, `npx tsc --noEmit` — all clean.
- ✅ **[ME]** Grepped the entire codebase for leftover SQLite references (`sqlite`, `.db"`) — zero hits, including `package.json`.
- ✅ **[ME]** Smoke-tested every core flow against live Postgres data, end-to-end, via real HTTP requests (not just reasoning about the code):
  - All core pages return 200: `/`, `/gallery`, `/events`, `/events/turf-day`, `/join`, `/login`, `/staff-login`.
  - `/api/events` returns the correct live data in the correct order (turf-day → bbt-adda-01 → mystery events).
  - Booked a real free ticket on Turf Day → ticket ID issued, `amount` correctly forced to `0`, ticket page and lookup API both resolve it correctly.
  - Submitted a real join application → confirmed present via the admin API.
  - Logged into `/admin` as staff (`arko`/`SUPER-2026`) → confirmed live stats correctly picked up both actions (`totalAttendees: 1`, `totalApplications: 1`, `turf-day sold: 1`) with no manual refresh/cache issue.
  - Full check-in flow: lookup → confirm → appeared in "recent check-ins" — all correct.
  - Confirmed the edge-middleware staff gate still works post-migration: unauthenticated requests to both `/checkin` and `/admin` correctly 307-redirect to `/staff-login?next=...`.
- ✅ **[ME]** Cleaned up all test data created during the smoke test (the one test registration and one test join application) — verified back to 0 rows in both tables afterward.

**Exit criteria:** the full local dev flow (browse → book a free ticket → join → admin dashboard shows it live → check-in confirms it) works end-to-end against real Postgres, with a clean build/lint pass and no leftover SQLite references anywhere in the codebase. **Met. Phase 2 is complete.**

---

## Phase 3 — Secrets & environment hygiene ✅ DONE

**Why this is third:** this can happen in parallel with Phase 2 once Postgres exists, but must be finished before any real deploy — shipping with dev secrets or guessable staff passcodes on a public URL is a real, not theoretical, risk the moment this is live.

**Tasks**
- ✅ **[ME, upgraded beyond the original task]** Rather than just swapping the hardcoded `SUPER-2026`/`MOD-2026`/`GATE-2026` for a different-but-still-hardcoded value (which would still bake a real secret into committed source), `prisma/seed.ts` now reads staff passcodes from `SEED_SUPER_PASSCODE` / `SEED_MOD_PASSCODE` / `SEED_GATE_PASSCODE` env vars, falling back to the obviously-fake local-dev defaults only when unset. A real passcode now never needs to exist in source at all. Verified end-to-end against the local database: seeded with generated values via env vars, confirmed the old passcode is rejected and the new one works.
- ✅ **[ME]** Generated a fresh production `AUTH_SECRET` — see below, not committed anywhere.
- ✅ **[YOU]** Decided: **Google OAuth disabled for launch** (email/password sign-in ships independently; Google can be turned on later with zero code changes).
- ✅ **[YOU]** Decided: **Resend disabled for launch** (app already degrades gracefully with no key set — confirmed in Phase 2.3's smoke test, bookings/join applications worked with no `RESEND_API_KEY` configured).
- ✅ **[ME]** Re-confirmed `.env.example` lists every variable the app reads (re-grepped `process.env` usage across `src/`, `prisma/`, and `prisma7.config.ts`) and added the three new `SEED_*` vars with guidance.
- ✅ **[ME, finding]** Because Google OAuth is deliberately unconfigured for launch, tested what actually happens if a real visitor clicks "Sign in with Google" on `/login` with empty credentials: Auth.js doesn't crash — it redirects to a controlled `/api/auth/error?error=Configuration` page rather than a raw Google error. Not a crash, but still a visibly dead button on a live site. **Not fixed in this phase** (it's a UI change, out of scope for "secrets hygiene") — tracked as a to-do for Phase 6 verification: either hide the Google button when unconfigured, or explicitly accept the dead-end state for this launch.

**Production values ready for Railway (Phase 4):**
- `AUTH_SECRET` — generated fresh via `openssl rand -hex 32`: `f026ca9baaa9ac0e0a4459a01a42e68f1cb0d153500e98438cf00b988fdfe655` (not written to any file in this repo — paste directly into Railway's env var settings)
- `DATABASE_URL` — pending: Railway's own Postgres plugin connection string (Phase 4), not the local one currently in `.env`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — intentionally omitted for this launch
- `RESEND_API_KEY` / `EMAIL_FROM` — intentionally omitted for this launch
- `SEED_SUPER_PASSCODE` / `SEED_MOD_PASSCODE` / `SEED_GATE_PASSCODE` — **you should generate your own real values** for the production seed run in Phase 4 (don't reuse the local test values printed in this session's transcript above, since those are now visible in this chat history)

**Exit criteria:** you have a complete, real list of production values for `DATABASE_URL`, `AUTH_SECRET`, and (if in scope) `GOOGLE_CLIENT_ID`/`SECRET`, `RESEND_API_KEY`/`EMAIL_FROM`, ready to paste into Railway. **Met** — Google/Resend explicitly out of scope for launch, `AUTH_SECRET` generated, `DATABASE_URL` deferred to Phase 4 by design (needs Railway's Postgres plugin to exist first).

---

## Phase 4 — Railway project setup & first deploy — [ME] DONE, blocked on [YOU]

**Why this is fourth:** everything before this was preparation; this is the first point where the actual Railway environment exists and can be tested against.

**Note:** I have no Railway account access, CLI, or MCP tool available in this session — confirmed (checked for a Railway tool and for a local `railway` CLI install; neither exists here). Every account-side action below genuinely has to be you. What I *could* do, I've done and verified as thoroughly as possible locally — see below.

**Tasks**
- ✅ **[ME]** Made the build self-sufficient rather than relying on `postinstall` alone: `"build": "prisma generate && next build"` in `package.json`. This removes the platform-dependent risk the original task flagged (some platforms skip devDependency postinstall scripts in production installs) — `prisma generate` now runs as an explicit, unconditional part of the build itself, not a hope that postinstall fires.
- ✅ **[ME]** Added `railway.json` at the project root, defining the deploy start command as `npx prisma migrate deploy && npm run start` — migrations apply to the production database automatically on every deploy, *before* the server starts accepting traffic, using `migrate deploy` (the non-interactive, production-safe command — distinct from `migrate dev`, which is local-only).
- ✅ **[ME]** Verified the entire sequence locally, exactly as Railway will run it: `npm run build` (clean) → `npx prisma migrate deploy` (correctly reports "No pending migrations to apply" against the already-migrated local Postgres) → `npm run start` (production server boots and correctly serves real data from Postgres, with the staff-gate middleware still redirecting unauthenticated `/admin` requests).
- ✅ **[ME]** Verified `next start` correctly respects the `PORT` environment variable (tested by launching with `PORT=4123` and confirming it actually bound there) — this is exactly the mechanism Railway uses to tell the container which port to listen on, and it works with no extra configuration needed.
- ⬜ **[YOU]** Create the Railway project, connect this repo.
- ⬜ **[YOU]** Add the Postgres plugin if you haven't already (Phase 2.1 covered this as optional at the time) and copy its connection string.
- ⬜ **[YOU]** Set environment variables in the Railway dashboard — from Phase 3: `DATABASE_URL` (Railway's Postgres plugin string, **not** the local one), `AUTH_SECRET` (`f026ca9baaa9ac0e0a4459a01a42e68f1cb0d153500e98438cf00b988fdfe655`, generated in Phase 3), `SEED_SUPER_PASSCODE` / `SEED_MOD_PASSCODE` / `SEED_GATE_PASSCODE` (generate your own real values now — don't reuse the local test ones from this session's transcript). `GOOGLE_CLIENT_ID`/`SECRET` and `RESEND_API_KEY`/`EMAIL_FROM` stay unset per the Phase 3 decisions.
- ⬜ **[YOU]** Trigger the first deploy.
- ⬜ **[YOU]** Run `npm run db:seed` once against the new production database (via Railway's shell/run command, with the `SEED_*` env vars set) — migrations apply automatically via `railway.json`'s start command, but seeding is a one-time manual step, same as it was locally in Phase 2.2.
- ⬜ **[ME + YOU]** Read the build and runtime logs together once a real deploy exists — this is where Phase 1/2 assumptions get tested against Railway's actual environment for the first time. Paste me the logs (or describe what you see) and I'll help diagnose anything that comes up.

**Exit criteria:** the Railway deploy succeeds, the app serves its homepage on the assigned `*.up.railway.app` domain, and the build/release logs show no errors (migrations applied, Prisma client generated, server started). **Not yet met — waiting on the [YOU] steps above.**

---

## Phase 5 — Domain-dependent finishing steps

**Why this is fifth, not third:** these steps genuinely can't happen earlier — they need a real, stable public URL to exist first.

**Tasks**
- **[YOU]** If using Google OAuth: register `https://<your-railway-domain>/api/auth/callback/google` (or your custom domain's equivalent) as an authorized redirect URI in Google Cloud Console, then confirm the sign-in flow works against the live site.
- **[YOU]** If using a custom domain instead of the default Railway one: point DNS, configure it in Railway, re-verify the OAuth redirect URI matches the final domain (not the intermediate `*.up.railway.app` one, if that changes).
- **[ME]** Confirm cookies behave correctly behind Railway's proxy — both the Auth.js session cookie and the staff session cookie (`bbt_staff_session`) need `secure: true` to actually get set over HTTPS, and `trustHost: true` (already set in `auth.ts`) needs to correctly resolve the real external URL rather than an internal one.

**Exit criteria:** Google sign-in (if in scope) completes successfully on the live domain, and both attendee and staff login/session cookies persist correctly across page loads on HTTPS.

---

## Phase 6 — Verification & sign-off

**Why this is last:** this is the actual definition of "error-free" — not "it deployed," but "it works."

**Tasks**
- **[ME + YOU]** Smoke-test every core flow on the live URL:
  - Browse homepage, gallery, events index and detail pages
  - Complete a real booking on a free event end-to-end (ticket ID issued, appears in `/ticket/[slug]`)
  - Submit a join application, confirm it appears in the admin "JOIN BBT APPLICATIONS" panel
  - Log into `/admin` as staff, confirm live stats reflect the real bookings just made (not stale/cached)
  - Load `/checkin`, confirm the staff-only gate actually blocks an unauthenticated visit (open in a private/incognito window), then confirm a manual ticket lookup + confirm works
- **[ME]** Check browser console on each page for errors/warnings (the same kind of check that caught the duplicate-nav-key bug earlier in this project).
- **[ME]** Confirm the flagged known limitation from `INTERNAL_DESIGN.md` §9 — the in-memory rate limiter only works correctly on a single instance — actually holds, i.e. Railway is running exactly one replica of this service. If it's ever scaled to multiple instances later, that limiter needs to move to a shared store (Redis/Upstash) first.
- **[YOU]** Final go/no-go: confirm you're satisfied with what's live before treating this as done.

**Exit criteria (= the whole document's exit criteria):** every flow above works on the live Railway URL, zero console errors, zero failed network requests, no stale/fake data visible anywhere in the admin dashboard.

---

## Sequencing summary

```
Phase 1 (buildable)  →  Phase 2.1 → 2.2 → 2.3 (Postgres, sequential)  ─┐
                                                                         ├─→ Phase 4 (deploy)  →  Phase 5 (domain steps)  →  Phase 6 (verify)
                                          Phase 3 (secrets)           ─┘
```
Phase 2's three sub-phases are strictly sequential (2.2 needs 2.1's schema/client in place; 2.3 needs 2.2's data seeded). Phase 3 can run in parallel with all of Phase 2 once Phase 1 is done. Phase 4 needs Phase 2.3 and Phase 3 both finished. Phases 5 and 6 are strictly sequential after that.

## Status

- Phase 1 — ✅ done
- Phase 2.1 — ✅ done
- Phase 2.2 — ✅ done
- Phase 2.3 — ✅ done (Phase 2 complete)
- Phase 3 — ✅ done
- Phase 4 — 🟡 [ME] done, blocked on [YOU] (Railway account steps)
- Phase 5 — not started
- Phase 6 — not started
