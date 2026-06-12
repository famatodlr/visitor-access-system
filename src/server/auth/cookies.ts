import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { GUARD_SESSION_DURATION_SECONDS } from "./session";

export const GUARD_SESSION_COOKIE_NAME = "guard_session";

export const guardSessionCookieOptions = {
  httpOnly: true,
  maxAge: GUARD_SESSION_DURATION_SECONDS,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function setGuardSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(GUARD_SESSION_COOKIE_NAME, token, guardSessionCookieOptions);
}

export function clearGuardSessionCookie(response: NextResponse): void {
  response.cookies.set(GUARD_SESSION_COOKIE_NAME, "", {
    ...guardSessionCookieOptions,
    maxAge: 0,
  });
}

export async function readGuardSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(GUARD_SESSION_COOKIE_NAME)?.value;
}
