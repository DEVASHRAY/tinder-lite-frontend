import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const proxy = (request: NextRequest): NextResponse => {
  if (!request.cookies.has("token")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/feed",
    "/profile",
    "/connections",
    "/people/:path*",
    "/chat/:path*",
  ],
};
/*
 * Learning notes
 *
 * Optimistic authentication
 * - Proxy runs before matched routes and redirects immediately when the token
 *   cookie is absent.
 * - It deliberately checks only cookie presence. Database access, JWT
 *   verification, and authorization remain close to Express data access.
 * - The static matcher prevents Proxy from running for assets, API requests,
 *   login, and unrelated public pages.
 *
 * Next.js versions
 * - Next.js 14.1 called this convention `middleware.ts`.
 * - Next.js 16 renamed it to `proxy.ts` to emphasize its network-boundary role.
 */
