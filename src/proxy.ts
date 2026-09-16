import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STAFF_COOKIE_NAME, verifyStaffToken } from "@/lib/staffToken";
import { isRateLimited } from "@/lib/rateLimit";

const AUTH_ATTEMPT_PATHS = ["/api/staff/login", "/api/auth/register", "/api/auth/callback/credentials"];
const AUTH_ATTEMPT_LIMIT = 10;
const AUTH_ATTEMPT_WINDOW_MS = 5 * 60_000;

// Generous — one legitimate ticket-page load makes one request here — but
// still caps how fast someone could enumerate ticket IDs looking for valid
// ones (the response no longer includes PII, but check-in status + name is
// still worth rate-limiting rather than leaving fully open).
const TICKET_LOOKUP_LIMIT = 60;
const TICKET_LOOKUP_WINDOW_MS = 60_000;

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

const CANONICAL_HOST = "bigbongtheory.co.in";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Force every request onto the one domain AUTH_URL is pinned to. Without
  // this, someone landing on the old railway.app URL (an old link, a
  // bookmark) starts the Google OAuth flow there — the PKCE cookie gets set
  // for that domain, but the callback always lands on bigbongtheory.co.in
  // (AUTH_URL is fixed), so the browser never sends the cookie back and
  // Google's token exchange fails with "Invalid code verifier". A 308
  // preserves the method, so a POST mid-flow (e.g. the sign-in submit)
  // redirects correctly instead of silently downgrading to a GET.
  // Only in production — this would otherwise redirect every local dev
  // request (host is localhost:3000) straight into a loop.
  if (process.env.RAILWAY_ENVIRONMENT) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host && host !== CANONICAL_HOST && !host.endsWith(".railway.internal")) {
      const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CANONICAL_HOST}`);
      return NextResponse.redirect(url, 308);
    }
  }

  // Throttle repeated attempts against login/signup endpoints — these had
  // zero protection against brute-forcing a passcode or password before this.
  if (request.method === "POST" && AUTH_ATTEMPT_PATHS.some((p) => pathname.startsWith(p))) {
    const key = `${pathname}:${clientKey(request)}`;
    if (isRateLimited(key, AUTH_ATTEMPT_LIMIT, AUTH_ATTEMPT_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429 }
      );
    }
  }

  if (request.method === "GET" && pathname.startsWith("/api/registrations/")) {
    const key = `ticket-lookup:${clientKey(request)}`;
    if (isRateLimited(key, TICKET_LOOKUP_LIMIT, TICKET_LOOKUP_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }
  }

  // Runs before /admin or /checkin ever reach the page — an unauthenticated
  // request never receives that page's code or data at all, closing the gap
  // a client-side-only gate leaves open (the page's JS bundle still shipping
  // to anyone who requests the URL directly).
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkin")) {
    const token = request.cookies.get(STAFF_COOKIE_NAME)?.value;
    const session = token ? await verifyStaffToken(token) : null;

    if (!session) {
      const loginUrl = new URL("/staff-login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Broad on purpose now — the canonical-host redirect at the top needs to
  // run on every route, not just the specific paths the other checks below
  // care about (those still gate themselves internally on pathname).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
