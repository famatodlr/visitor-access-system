import { NextResponse } from "next/server";

import { getGuardSession } from "@/server/auth/guard";

export const runtime = "nodejs";

export async function GET() {
  const session = await getGuardSession();

  return NextResponse.json({ authenticated: session !== null });
}
