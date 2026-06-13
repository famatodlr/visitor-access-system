import { NextResponse } from "next/server";

import { GuardSessionRequiredError, requireGuardSession } from "@/server/auth/guard";
import { searchVisitorByDni } from "@/server/visitors/service";
import { parseVisitorDniSearchInput } from "@/server/visitors/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const validation = parseVisitorDniSearchInput({
    dni: url.searchParams.get("dni"),
  });

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: validation.errors[0]?.message ?? "DNI is required.",
        fields: validation.errors,
      },
      { status: 400 },
    );
  }

  let visitor: Awaited<ReturnType<typeof searchVisitorByDni>>;

  try {
    visitor = await searchVisitorByDni(validation.data.dni);
  } catch (error) {
    console.error("Visitor DNI search failed.", error);

    return NextResponse.json(
      {
        error: "Could not search visitors. Please try again.",
      },
      { status: 500 },
    );
  }

  if (!visitor) {
    return NextResponse.json(
      {
        error: "No visitor found for this DNI.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    visitor,
  });
}
