import { NextResponse } from "next/server";

import { GuardSessionRequiredError, requireGuardSession } from "@/server/auth/guard";
import { getVisitorDetail } from "@/server/visitors/service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ visitorId: string }> },
) {
  try {
    await requireGuardSession();
  } catch (error) {
    if (error instanceof GuardSessionRequiredError) {
      return NextResponse.json(
        {
          error: "Guard authentication is required.",
        },
        { status: 401 },
      );
    }

    throw error;
  }

  const { visitorId } = await params;
  let visitor: Awaited<ReturnType<typeof getVisitorDetail>>;

  try {
    visitor = await getVisitorDetail(visitorId);
  } catch (error) {
    console.error("Visitor detail lookup failed.", error);

    return NextResponse.json(
      {
        error: "Could not load visitor details. Please try again.",
      },
      { status: 500 },
    );
  }

  if (!visitor) {
    return NextResponse.json(
      {
        error: "Visitor was not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    visitor,
  });
}
