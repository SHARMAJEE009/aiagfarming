import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { hasRouteAccess, isValidRole, type UserRole } from "@/lib/permissions";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Default export works as the proxy entry point (Next.js 16 accepts default or named "proxy")
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  const rawRole = (session.user as { role?: string }).role ?? "FARMHAND";
  const userRole: UserRole = isValidRole(rawRole) ? rawRole : "FARMHAND";

  if (!hasRouteAccess(pathname, userRole)) {
    const url = req.nextUrl.clone();
    url.pathname = "/overview";
    url.searchParams.set("forbidden", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/overview/:path*",
    "/settings/:path*",
    "/crops/:path*",
    "/livestock/:path*",
    "/finance/:path*",
    "/compliance/:path*",
    "/safety/:path*",
    "/whs-gate/:path*",
    "/ai-advisor/:path*",
    "/agronomist-reports/:path*",
    "/benchmark/:path*",
  ],
};
