import { NextRequest, NextResponse } from "next/server";

// Routes that don't require a session
const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths, static assets, and API routes
  if (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get("__session");

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
