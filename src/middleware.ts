import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * SSR Route Protection Middleware.
 * Runs on the Edge — before the page is rendered.
 * Checks for auth-token cookie to determine authentication.
 */

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Unauthenticated user trying to access protected route → redirect to login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access login page → redirect to dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
