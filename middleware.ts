import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookieValue } from "./lib/auth/aphrodite-auth";

function buildLoginUrl(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return loginUrl;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    const sessionCookie = request.cookies.get("aphrodite_session")?.value;
    const secret = process.env.APHRODITE_SESSION_SECRET;

    if (!sessionCookie || !secret) {
      return NextResponse.redirect(buildLoginUrl(request));
    }

    const isValid = await verifySessionCookieValue(sessionCookie, secret);
    
    if (!isValid) {
      const response = NextResponse.redirect(buildLoginUrl(request));
      response.cookies.delete("aphrodite_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
