import { NextResponse } from "next/server";
import { readTokenFromRequest, verifyToken } from "@/app/lib/security";

const AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read custom JWT cookie
  const token = readTokenFromRequest(request);

  // Verify JWT
  const payload = token ? verifyToken(token) : null;
  const authed = Boolean(payload?.sub);

  // Protect API routes
  if (pathname.startsWith("/api")) {
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    if (!authed) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (
    AUTH_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    if (authed) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // Protect all other pages
  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
