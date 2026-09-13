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

type TeamMember = { name: string; role?: string; line?: string; image?: string; imagePosition?: string };

export const team: TeamMember[] = [
  {
    name: "Spandan",
    role: "Founder & CEO",
    line: "Started BBT with an idea. Now has the questionable responsibility of making it actually work.",
    image: "/crew/spandan-sarkar.jpg",
  },
  {
    name: "Zunaid",
    role: "CBO / COO",
    line: "Turns “bhai, kuch karte hain” into actual plans. Unfortunately, people expect him to execute them too.",
    image: "/crew/zunaid-hussain.jpg",
  },
  {
    name: "Trishan",
    role: "VP, Partnerships & Collaborations",
    line: "Professional connector of dots, people, brands, and occasionally completely unrelated ideas.",
    image: "/crew/trishan-manna.jpg",
  },
  {
    name: "Atig",
    role: "VP, Community Growth & Development",
    line: "Growing the community one human at a time. Basically collecting people, but professionally.",
    image: "/crew/atig-chandra.jpg",
  },
  {
    name: "Sunny",
    role: "Head of Creatives",
    line: "Makes things look cool while the rest of us try to explain what the idea was supposed to be.",
    image: "/crew/sunny-ghosh.jpg",
  },
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

type CrewMember = { name: string; role?: string; line?: string; image?: string; imagePosition?: string };

export const crew: CrewMember[] = [
  {
    name: "Aniruddha",
    role: "Head of Talent Acquisition",
    line: "Finding hidden talent like it’s a treasure hunt. Except the treasure has a CV.",
    image: "/crew/aniruddha-ghosh.jpg",
  },
  {
    name: "Sreyasi",
    role: "Head of Talent Acquisition",
    line: "On a never-ending mission to find people who are talented, creative, and willing to join this madness.",
    image: "/crew/sreyasi.png",
    imagePosition: "50% 60%",
  },
  {
    name: "Saptarshi",
    role: "General Manager, Finance",
    line: "The only person allowed to ask, “But what’s the budget?” while everyone else is busy dreaming.",
    image: "/crew/saptarshi-samanta.png",
  },
  {
    name: "Rajdeep",
    role: "General Manager, Logistics — Bangalore",
    line: "Making sure the Bangalore chaos reaches the right place, at the right time, with minimal disasters.",
    image: "/crew/rajdeep-rudra.jpg",
    imagePosition: "50% 65%",
  },
  {
    name: "Arkaprabha",
    role: "General Manager, Logistics — Kolkata",
    line: "Because apparently, “we’ll figure it out on the day” is not considered a logistics strategy.",
  },
  {
    name: "Annwesha",
    role: "Head of PR",
    line: "Making BBT look organised, even when the group chat says otherwise.",
    image: "/crew/annwesha-adhikari.jpg",
    imagePosition: "50% 60%",
  },
  {
    name: "Shaili Shaw",
    role: "Head of PR",
    line: "Turning events, ideas, and questionable decisions into something worth talking about.",
  },
  {
    name: "Atim",
    role: "Head of Influencer Relations",
    line: "Knows people who know people. Basically LinkedIn, but with better vibes.",
    image: "/crew/atim-ghosh.jpg",
  },
  {
    name: "Susmriti",
    role: "Head of Influencer Relations",
    line: "Connecting BBT with creators, influencers, and people who can make the internet pay attention.",
    image: "/crew/susmriti-chowdhury.jpg",
  },
  {
    name: "Tamajit",
    role: "Head of Creatives & Content",
    line: "Turns random ideas into content and somehow makes the chaos look intentional.",
    image: "/crew/tamajit-nayek.jpg",
  },
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
