import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/crops/:path*",
    "/livestock/:path*",
    "/finance/:path*",
    "/compliance/:path*",
    "/ai-advisor/:path*",
    "/settings/:path*",
  ],
};
