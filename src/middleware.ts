import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isAdminConfigured,
  isAdminRoute,
  isAdminTokenValid,
} from "@/lib/admin/gate";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminRoute(pathname)) {
    return NextResponse.next();
  }

  if (!isAdminConfigured()) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (isAdminTokenValid(token)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/access")) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/access";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/import/:path*",
    "/discover/:path*",
    "/saved/:path*",
    "/admin/:path*",
  ],
};
