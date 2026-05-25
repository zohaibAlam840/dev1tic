import { NextRequest, NextResponse } from "next/server";

// Routes that don't require a session
const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/join"]);

// Routes that logged-in users should be redirected away from
const AUTH_PATHS = new Set(["/login", "/signup"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get("__session");

  // Logged-in user visiting login/signup → send to dashboard
  if (session && AUTH_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Public paths don't need a session
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // No session → send to login
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
