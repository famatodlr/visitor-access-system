import { NextResponse } from "next/server";

import { GuardSessionRequiredError, requireGuardSession } from "@/server/auth/guard";
import { registerVisitor } from "@/server/visitors/service";
import { parseVisitorRegistrationInput } from "@/server/visitors/validation";

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

  const validation = parseVisitorRegistrationInput(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: "Visitor registration payload is invalid.",
        fields: validation.errors,
      },
      { status: 400 },
    );
  }

  let result: Awaited<ReturnType<typeof registerVisitor>>;

  try {
    result = await registerVisitor(validation.data);
  } catch (error) {
    console.error("Visitor registration failed.", error);

    return NextResponse.json(
      {
        error: "Could not register visitor. Please try again.",
      },
      { status: 500 },
    );
  }

  if (!result.ok) {
    if (result.reason === "duplicate-dni") {
      return NextResponse.json(
        {
          error: "A visitor with this DNI already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Could not generate a unique visitor credential. Please try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      visitor: result.visitor,
    },
    { status: 201 },
  );
}
