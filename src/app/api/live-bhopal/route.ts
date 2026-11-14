import { NextRequest, NextResponse } from "next/server";

// Redirect backwards compatibility to universal live telemetry
export async function GET(req: NextRequest) {
  const url = new URL("/api/live-telemetry", req.url);
  return NextResponse.rewrite(url);
}
