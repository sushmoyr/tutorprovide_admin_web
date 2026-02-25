import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const guestRoutes = ["/login"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // Redirect unauthenticated users from protected routes to login
  if (!guestRoutes.some((r) => pathname.startsWith(r)) && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from guest routes
  if (guestRoutes.some((r) => pathname.startsWith(r)) && accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
