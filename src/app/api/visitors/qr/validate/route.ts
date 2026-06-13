import { NextResponse } from "next/server";

import { GuardSessionRequiredError, requireGuardSession } from "@/server/auth/guard";
import { registerEntryFromQrToken } from "@/server/visitors/service";
import { parseVisitorQrValidationInput } from "@/server/visitors/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const validation = parseVisitorQrValidationInput(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: validation.errors[0]?.message ?? "QR token is required.",
        fields: validation.errors,
      },
      { status: 400 },
    );
  }

  let result: Awaited<ReturnType<typeof registerEntryFromQrToken>>;

  try {
    result = await registerEntryFromQrToken(validation.data.qrToken);
  } catch (error) {
    console.error("Visitor QR validation failed.", error);

    return NextResponse.json(
      {
        error: "Could not validate QR credential. Please try again.",
      },
      { status: 500 },
    );
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        error: "No visitor found for this QR credential.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      visitor: result.visitor,
      entry: result.entry,
    },
    { status: 201 },
  );
}
