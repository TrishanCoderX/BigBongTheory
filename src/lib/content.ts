// Events and tiers used to be hardcoded here. They now live in the database
// (src/lib/events.ts, backed by Prisma) so events created from the admin
// panel actually appear on the public site. Past/archived events below are
// genuinely static — closed events with no booking flow, not meant to be
// admin-created — so they stay here.

export const pastEvents = [
  { slug: "chaos-open-mic", name: "CHAOS OPEN MIC", city: "KOLKATA", date: "AUG 2026", cat: "PERFORMANCE" },
  { slug: "bbt-shorts-lab", name: "BBT SHORTS LAB", city: "KOLKATA", date: "JUL 2026", cat: "FILM" },
  { slug: "paint-the-wall", name: "PAINT THE WALL", city: "KOLKATA", date: "MAY 2026", cat: "ART" },
  { slug: "first-noise", name: "FIRST NOISE", city: "KOLKATA", date: "MAR 2026", cat: "MUSIC" },
];

export const team = [
  { name: "ARKO DUTTA", role: "FOUNDER / CHAOS DIRECTOR", line: "Started BBT on a rooftop with two speakers and no permission." },
  { name: "RIYA SEN", role: "FILM & CONTENT", line: "Shoots everything. Deletes nothing. Edits at 4 AM." },
  { name: "DEBJYOTI M.", role: "EVENTS & PRODUCTION", line: "Knows every venue owner in the city, somehow." },
  { name: "MOU BANERJEE", role: "COMMUNITY", line: "Remembers your name and what you were building." },
  { name: "TUHIN ROY", role: "DESIGN & IDENTITY", line: "Responsible for every poster you screenshotted." },
];

export const tribes = [
  "CREATORS",
  "ARTISTS",
  "FILMMAKERS",
  "MUSICIANS",
  "PERFORMERS",
  "EVENT FREAKS",
  "DESIGNERS",
  "PHOTOGRAPHERS",
  "VIDEOGRAPHERS",
  "MARKETERS",
  "PEOPLE WITH DANGEROUS IDEAS",
];

export const galleryFilters = ["ALL", "EVENTS", "BTS", "PERFORMANCES"] as const;

type GalleryFrame = { tag: string; caption: string; cols: number; rows: number; img?: string };

export const gallery: GalleryFrame[] = [
  { tag: "EVENTS", caption: "FIRST COMMUNITY MEET, THE WHOLE CREW", cols: 2, rows: 2, img: "/gallery/community-meet-group.jpg" },
  { tag: "EVENTS", caption: "FIRST COMMUNITY MEET, HANDS UP", cols: 2, rows: 1, img: "/gallery/community-meet-cheers.jpg" },
  { tag: "EVENTS", caption: "FIRST COMMUNITY MEET, FIRST HELLO", cols: 1, rows: 1, img: "/gallery/community-meet-welcome.jpg" },
  { tag: "PERFORMANCES", caption: "FIRST COMMUNITY MEET, CENTER STAGE", cols: 1, rows: 2, img: "/gallery/community-meet-duo.jpg" },
  { tag: "PERFORMANCES", caption: "FIRST COMMUNITY MEET, THE DIP", cols: 1, rows: 1, img: "/gallery/community-meet-dip.jpg" },
  { tag: "BTS", caption: "FIRST COMMUNITY MEET, MINGLING", cols: 2, rows: 1, img: "/gallery/community-meet-mingle.jpg" },
  { tag: "BTS", caption: "FIRST COMMUNITY MEET, MIC CHECK", cols: 1, rows: 1, img: "/gallery/community-meet-mic.jpg" },
  { tag: "BTS", caption: "FIRST COMMUNITY MEET, THE HUDDLE", cols: 1, rows: 2, img: "/gallery/community-meet-crowd.jpg" },
  { tag: "PERFORMANCES", caption: "FIRST COMMUNITY MEET, THE INTRODUCTION", cols: 1, rows: 2, img: "/gallery/community-meet-portrait.jpg" },
];

/** Extra frames shown only on the dedicated /gallery page, beyond the home-page teaser grid. */
export const galleryExtra: GalleryFrame[] = [
  { tag: "PERFORMANCES", caption: "FIRST COMMUNITY MEET, THE HANDOFF", cols: 1, rows: 2, img: "/gallery/community-meet-dance.jpg" },
  { tag: "EVENTS", caption: "FIRST COMMUNITY MEET, GRIP AND GRIN", cols: 1, rows: 1, img: "/gallery/community-meet-handshake.jpg" },
  { tag: "PERFORMANCES", caption: "FIRST COMMUNITY MEET, TAKE TWO", cols: 1, rows: 2, img: "/gallery/community-meet-duo2.jpg" },
  { tag: "PERFORMANCES", caption: "FIRST COMMUNITY MEET, ANOTHER ANGLE", cols: 1, rows: 2, img: "/gallery/community-meet-portrait2.jpg" },
  { tag: "EVENTS", caption: "FIRST COMMUNITY MEET, ONE MORE FOR THE ROOM", cols: 2, rows: 2, img: "/gallery/community-meet-group2.jpg" },
];

type CrewMember = { name: string; role?: string; image?: string; imagePosition?: string };

export const crew: CrewMember[] = [
  { name: "RIYA", role: "FILMMAKER" },
  { name: "ARKO", role: "MUSICIAN" },
  { name: "DEB", role: "PHOTOGRAPHER" },
  { name: "NEEL", role: "PERFORMER" },
  { name: "TUHIN", role: "DESIGNER" },
  { name: "MOU", role: "CREATOR" },
  { name: "SAM", role: "VIDEOGRAPHER" },
  { name: "JOY", role: "EVENT FREAK" },
  { name: "ANI", role: "DANGEROUS IDEAS" },
  { name: "PIU", role: "MARKETER" },
  { name: "RAJDEEP RUDRA", image: "/crew/rajdeep-rudra.jpg", imagePosition: "50% 65%" },
  { name: "ATIG CHANDRA", image: "/crew/atig-chandra.jpg" },
  { name: "ANIRUDDHA GHOSH", image: "/crew/aniruddha-ghosh.jpg" },
  { name: "SUSMRITI CHOWDHURY", image: "/crew/susmriti-chowdhury.jpg" },
  { name: "SAPTARSHI SAMANTA", image: "/crew/saptarshi-samanta.png" },
  { name: "ANNWESHA ADHIKARI", image: "/crew/annwesha-adhikari.jpg", imagePosition: "50% 60%" },
  { name: "SREYASI", image: "/crew/sreyasi.png", imagePosition: "50% 60%" },
  { name: "ATIM GHOSH", image: "/crew/atim-ghosh.jpg" },
  { name: "SUNNY GHOSH", image: "/crew/sunny-ghosh.jpg" },
];

export const expect = ["LIVE SETS", "OPEN MIC", "SHORT FILMS", "JAM CORNER", "ZINE TABLE", "CHAI AT 2AM"];

export const schedule = [
  { t: "18:00", what: "Doors open, badges, awkward introductions" },
  { t: "18:45", what: "Adda round one — pitch your idea in 90 seconds" },
  { t: "20:00", what: "Live set / open mic block" },
  { t: "21:15", what: "Short film screening + brutal feedback" },
  { t: "22:00", what: "Collab board — find your people, leave with a project" },
];

export const guests = ["DJ MOHOL", "THE TIN ROOF BAND", "RIYA S. (FILM)", "ARKO + FRIENDS"];

export const faqs = [
  { q: "DO I NEED TO BE A CREATOR?", a: "No. Curiosity qualifies. Bring one question you actually care about." },
  { q: "CAN I COME ALONE?", a: "Most people do. You will not stay alone for long — the format makes that impossible." },
  { q: "IS THERE ENTRY AT THE GATE?", a: "Only if capacity remains. Pre-booked passes always get in first." },
  { q: "WHAT SHOULD I BRING?", a: "Your pass, an ID, and the idea you keep postponing." },
];

export const joinTags = [
  "CREATOR",
  "ARTIST",
  "FILMMAKER",
  "MUSICIAN",
  "PERFORMER",
  "EVENT FREAK",
  "DESIGNER",
  "PHOTOGRAPHER",
  "VIDEOGRAPHER",
  "MARKETER",
  "DANGEROUS IDEAS",
];

export const menuTicker = ["CREATE", "PERFORM", "BUILD", "EXPERIMENT", "MAKE SOME NOISE"];

export const navItems = [
  { label: "HOME", href: "/", hint: "THE CHAOS" },
  { label: "EVENTS", href: "/events", hint: "WHAT’S NEXT" },
  { label: "GALLERY", href: "/gallery", hint: "THE EVIDENCE" },
  { label: "JOIN", href: "/join", hint: "APPLY" },
  { label: "MY PASS", href: "/events", hint: "FIND YOURS" },
  { label: "ACCOUNT", href: "/login", hint: "SIGN IN" },
];
