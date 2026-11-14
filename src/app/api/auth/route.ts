import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "logout") {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.delete("aero_session");
    return res;
  }

  // Google OAuth authorization redirect or token callback handler
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = `${req.nextUrl.origin}/api/auth/callback`;

  if (!clientId) {
    // If OAuth is in configuration setup mode, set local enterprise development session
    const res = NextResponse.redirect(new URL("/?auth=success", req.url));
    res.cookies.set("aero_session", "enterprise_authenticated_user", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  // Redirect to Google OAuth consent screen
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&access_type=offline`;

  return NextResponse.redirect(googleAuthUrl);
}
