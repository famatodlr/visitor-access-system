import { NextResponse } from "next/server";

import { setGuardSessionCookie } from "@/server/auth/cookies";
import { authenticateGuard } from "@/server/auth/guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const pin =
    body && typeof body === "object" && "pin" in body
      ? (body as { pin: unknown }).pin
      : undefined;
  const result = authenticateGuard(pin);

  if (!result.ok) {
    return NextResponse.json(
      {
        authenticated: false,
        error: result.error,
      },
      { status: result.status },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  setGuardSessionCookie(response, result.token);

  return response;
}
