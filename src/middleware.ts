import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Protected enterprise API routes
const PROTECTED_PREFIXES = ["/api/briefings", "/api/live-telemetry", "/api/live-bhopal"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const authHeader = req.headers.get("authorization");
    const sessionCookie = req.cookies.get("aero_session") || req.cookies.get("next-auth.session-token");

    const oauthEnabled = process.env.ENABLE_OAUTH === "true";
    const apiKeyRequired = process.env.AERO_ENTERPRISE_API_KEY;

    if (oauthEnabled && !sessionCookie && !authHeader) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Active enterprise OAuth session or Bearer token required to access Aero telemetry services.",
          authUrl: "/api/auth/signin",
        },
        { status: 401 }
      );
    }

    if (apiKeyRequired && authHeader !== `Bearer ${apiKeyRequired}` && !sessionCookie) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Valid Aero Enterprise Bearer token required.",
        },
        { status: 401 }
      );
    }
  }

  // Attach enterprise defense-in-depth security headers
  const res = NextResponse.next();
  res.headers.set("X-Aero-System", "Aero Enterprise Intelligence Engine");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export const config = {
  matcher: ["/api/briefings/:path*", "/api/live-telemetry/:path*", "/api/live-bhopal/:path*"],
};
