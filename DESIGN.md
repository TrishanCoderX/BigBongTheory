# DESIGN.md — UI/UX Design Rationale

This document explains **why** BBT's frontend looks and behaves the way it does — the reasoning behind each visual and interaction decision, not just a description of what's on screen. For how the backend and data flow work, see `INTERNAL_DESIGN.md`.

---

## 1. The premise the design serves

BBT's own copy states the brief: *"A creative community, not a company."* Every visual decision below exists to make the site feel like a scrappy, high-energy collective putting on events — not a polished SaaS product. Where a typical ticketing site would default to clean/corporate/trustworthy, BBT deliberately leans into **loud, dark, chaotic-but-controlled** — because a sanitized design would contradict the brand it's selling.

---

## 2. Design tokens (`src/app/globals.css`)

```
--color-background: #08080b   (near-black, not pure black — a "stage" not a "void")
--color-on-background: #f3f0e7 (warm off-white "cream" — softer than pure white)
--color-lime:  #cbf23f         (primary accent — energy, "go", success)
--color-ember: #ff4d2e         (secondary accent — urgency, alerts, hover-danger)
--color-surface / surface-high  (near-black panel tones for cards)
```

**Why a two-accent system (lime + ember) instead of one brand color:** a single accent color used for everything (links, buttons, warnings, highlights) flattens the hierarchy — everything "important" looks the same. Splitting into lime (positive/primary action — "GET TICKETS", live indicators, success states) and ember (urgency/attention — sold-out, locked, error text) lets color alone communicate state at a glance, without needing to read the label.

**Why near-black instead of pure black:** `#08080b` still reads as "dark" but avoids the harsh, flat look of `#000`, and gives white text/borders somewhere to sit against without pure-contrast fatigue on long scroll pages.

**Three-font system:**
- `--font-display` (Anton) — huge, condensed, shouty. Used for every headline. This is the "poster" voice — BBT events are treated like gig posters, not app screens.
- `--font-mono` (Space Mono) — used for *all* labels, tags, metadata, nav hints, timestamps. Monospace signals "this is structural/system information," visually distinct from the display headlines' emotional voice.
- `--font-body` (Archivo) — reserved for actual paragraph copy where legibility over long lines matters more than personality.

This three-way split means a reader can tell what *kind* of text they're looking at (shout vs. label vs. read) without processing the words — the typography itself is the information architecture.

**`clamp()` everywhere for type size:** headlines use `clamp(min, vw-based-mid, max)` instead of fixed breakpoints, so type scales continuously with viewport width rather than jumping at breakpoints. This matters more here than on a typical site because headlines are often the single largest element on the page (`clamp(52px, 13.5vw, 260px)` on the homepage hero) — a fixed breakpoint jump at that scale would be visually jarring.

---

## 3. The interaction language

### Custom cursor + magnetic hover (`CustomCursor.tsx`, `data-mag="1"`)

Every clickable element that matters (buttons, cards, links, FAQ rows) carries a `data-mag="1"` attribute. `CustomCursor` replaces the OS pointer with a lime ring that snaps larger and shows a "GO" label whenever it's over one of these elements.

**Why:** a plain default cursor gives no feedback about what's interactive until the user is already hovering precisely over it. The custom cursor makes "this is clickable" a large, ambient, always-visible signal — reinforcing the brand's "everything here is alive" feeling rather than a static document.

**Why it's gated behind `(hover: hover) and (pointer: fine)`:** touch devices have no persistent cursor to replace, and forcing this on mobile would just break native tap behavior. The check ensures this is desktop-mouse-only, and native touch interaction is left completely untouched on phones/tablets.

### Scroll reveal (`Reveal.tsx` + `useReveal` hook)

Wraps content in an `IntersectionObserver` that fades + translates elements into place the first time they scroll into view, then stops observing (one-shot, not re-triggered on scroll-back).

**Why:** the homepage is one long single-page scroll (manifesto → universe → events → people → gallery → team → sponsors → join). Without staggered reveal, that's just a wall of content dumped on load. Revealing sections as they enter viewport gives the page rhythm and pacing — each section arrives as a small "beat" rather than everything competing for attention at once.

**Why one-shot (`io.unobserve` after first reveal) instead of re-animating every scroll pass:** re-triggering on every scroll direction change would be distracting and cheapen the effect through repetition. It's meant to feel like a one-time reveal, not a persistent animation loop.

### Marquee ticker (`Marquee.tsx`)

A CSS-animation-driven infinite horizontal scroll, used for the homepage word ticker and both sponsor logo bands.

**Why duplicated content (`items` rendered twice, `a-${i}` / `b-${i}` keys):** a marquee loop needs the content to repeat seamlessly at the point the translateX animation wraps from `-50%` back to `0`. Rendering the list twice back-to-back and animating exactly half the total width is what makes the loop invisible — there's no jump-cut.

**Why `pauseOnHover` on the sponsor bands specifically:** sponsor logos are the one marquee use-case where a viewer might actually want to read a specific item rather than just absorb ambient motion — pausing on hover lets them do that without needing to chase a moving target.

### ParticleSphere hero (`ParticleSphere.tsx`)

A canvas-rendered, mouse-reactive 3D particle sphere used as the homepage hero background instead of a static photo or video.

**Why procedural canvas art instead of a hero image/video:** a photo hero would need a real photoshoot/asset and would date quickly; a looping video is heavy and static in feel. A procedurally generated, physics-driven particle field is lightweight, infinitely "fresh" (never repeats identically), reacts to the visitor's mouse (reinforcing "this site is alive/responsive"), and costs zero asset production — fitting a scrappy-community brand better than a polished stock hero would.

**Why `density` is a tunable prop with a mobile-halved particle count:** particle simulations are CPU/GPU-bound; halving density on screens under 760px keeps frame rate acceptable on weaker mobile hardware without a visually broken experience (the sphere still reads correctly at fewer particles, just less dense).

### Background theme music (`BackgroundAudio.tsx`)

A persistent, opt-in audio toggle, with the on/off preference saved to `localStorage`.

**Why it doesn't autoplay even if a returning visitor previously enabled it:** browsers block audio-with-sound from autoplaying without a fresh user gesture on the current page load — this is a platform constraint, not a design choice, so the component is written to reflect the *saved preference* in its UI state while still requiring a real click to actually start playback.

---

## 4. Page-by-page rationale

### Homepage — one continuous pitch, not a landing page with subpages

Sections are explicitly numbered (`01 — MANIFESTO`, `02 — THE BBT UNIVERSE`, ... `07 — SPONSORS & PARTNERS`) and flow top-to-bottom as a single scroll. This is deliberately structured like a **pitch deck or manifesto document**, not a conventional marketing site with a hero + scattered feature blocks. The numbering signals "this is a sequence to read in order," reinforcing that BBT is telling a story (who we are → what we do → what's next → who's involved → proof it's real → who backs us → join us) rather than presenting disconnected modules.

### Events: index vs. detail vs. booking are three distinct rhythms

- **`/events`** (index) is a dense, scannable list — numbered rows, minimal chrome — because a visitor here is comparing options, not being sold to.
- **`/events/[slug]`** (detail) switches to a full hero + "THE PLOT" narrative copy — because a visitor here has already chosen this event and is being sold on *attending*, so it earns cinematic treatment.
- **`/events/[slug]/book`** (`BookingWizard.tsx`) is a stripped-down, numbered multi-step form (SELECT TICKET → YOUR DETAILS → PAYMENT, or a shortened 2-step flow for free events — see §5) — because a visitor here has already decided to attend; the job now is to get them through with minimum friction, so all narrative/persuasion copy is dropped in favor of a linear progress indicator.

### Gallery — variable-span grid instead of a uniform thumbnail wall

Each photo entry carries its own `cols`/`rows` span (`{ cols: 2, rows: 2 }` etc.), producing a masonry/cork-board layout rather than a uniform square grid.

**Why:** a uniform grid reads as a stock photo library; variable sizing (some images large/featured, others small) reads as a curated wall of memories — closer to how someone would actually pin up event photos, and it lets the best shots (e.g. the full-crew group photo) claim visual weight instead of being sized identically to a minor candid.

**Why hover-reveal captions instead of always-visible labels:** the raw photo is the point; captions (tag + moment name) are secondary context that would clutter the grid if always shown. Revealing them only on hover keeps the wall visually clean while still making the information available.

### The "mystery box" pattern (`EventCard.tsx`, `events/page.tsx`, `cat: "MYSTERY"`)

Events the team isn't ready to announce yet render as a locked card — a large stroked "?", "REVEALING SOON," a "LOCKED" badge, dashed border, not clickable — instead of either (a) not appearing at all, or (b) showing placeholder/fake details.

**Why this exists as a distinct third state:** omitting the slot entirely wastes the momentum of "something's coming"; showing fabricated details risks misleading a real visitor into thinking a concrete event exists. The mystery box lets BBT signal *"there's more, stay tuned"* honestly — it's a deliberate teaser state, not a placeholder standing in for missing content.

### Placeholder-block convention (site-wide)

Anywhere a real asset isn't ready — event posters, sponsor logos, member portraits — the site renders a dark panel with a repeating diagonal-stripe pattern and bracketed mono label (`[ EVENT POSTER ]`, `[ SPONSOR LOGO ]`, `[ MEMBER PORTRAIT ]`) rather than a blank box or a generic icon.

**Why:** a blank/empty box reads as *broken*; a generic stock icon reads as *lazy*. The diagonal-stripe treatment is deliberately styled *as* a design element (matches the site's angular, poster-collage aesthetic) so an unfinished area still looks intentional — "designed-empty," not "broken-empty" — while being unmistakably a placeholder rather than real content.

### Join page — one scrappy form, no multi-step friction

Unlike the ticket booking wizard, `/join` is a single-page form with no step-by-step flow, styled with the same "Bro, sun… ek idea aaya hai" Hinglish voice as the rest of the copy.

**Why single-step here but multi-step for booking:** booking involves a genuine sequence of distinct concerns (what ticket → who's coming → payment) where breaking it up reduces cognitive load. A join application is one conceptual act — "tell us about yourself" — so splitting it into steps would just add friction without adding clarity, contradicting the page's own promise ("no CV needed").

---

## 5. Adaptive UI: the free-event booking flow

`BookingWizard.tsx` renders a different step count depending on `event.price === 0`:
- **Paid events:** 3 steps (SELECT TICKET → YOUR DETAILS → PAYMENT), full tier picker with prices, a fee line, and a "PAY ₹X" final button.
- **Free events:** 2 steps (YOUR SPOT → YOUR DETAILS), no tier picker (just a "FREE ENTRY" panel), no quantity stepper (capped to 1 per person), and a "CONFIRM FREE SPOT" final button.

**Why collapse the flow rather than just hiding the price:** showing a payment step with "₹0" would still visually imply a transaction is happening (card entry, a "pay" button) — actively misleading for something that's genuinely free. Removing the step entirely, rather than defanging it, keeps the UI honest about what's actually about to happen.

---

## 6. Copy voice

- **Labels/metadata are always uppercase mono** (`FIRST HELLO`, `TICKETS LIVE`, `SPOTS LEFT`) — deliberately terse, system-feeling.
- **Headlines are shouty and informal** ("WE ARE NOT HERE JUST TO EXIST," "GOT THE AUDACITY TO TRY?") — first-person community voice, not third-person marketing voice.
- **Body copy leans into local, specific, sometimes-Hinglish phrasing** ("Bro, sun… ek idea aaya hai") rather than generic startup copy — this is what makes the "community, not a company" premise actually land in the text itself, not just the visuals.

---

## 7. Accessibility & responsiveness

- **`prefers-reduced-motion`** is respected globally (`globals.css`) — all animation/transition durations collapse to near-zero for users who've requested it at the OS level, overriding every custom animation (marquee, reveal, particle sphere motion, cursor) without needing per-component logic.
- **Mobile base font-size reduction** (`html { font-size: 15px }` under 820px) scales every `rem`-based measurement down proportionally in one place, rather than needing per-component mobile overrides.
- **Cursor/hover-only effects are feature-detected**, not just viewport-width-gated (`pointer: fine`) — so a touch-capable laptop with a mouse still gets the custom cursor, while a wide-screen tablet in touch mode correctly falls back to native tap behavior.
