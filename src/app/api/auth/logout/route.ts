import { NextResponse } from "next/server";

import { clearGuardSessionCookie } from "@/server/auth/cookies";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  clearGuardSessionCookie(response);

  return response;
}
