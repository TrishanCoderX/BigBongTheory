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

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: [
    "/admin/:path*",
    "/checkin/:path*",
    "/api/staff/login",
    "/api/auth/register",
    "/api/auth/callback/credentials",
    "/api/registrations/:path*",
  ],
};
