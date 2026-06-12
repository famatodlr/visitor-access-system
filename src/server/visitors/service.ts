import { Prisma, type Visitor } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { generateQrToken } from "./qr-token";
import type { VisitorRegistrationInput } from "./validation";

export type SafeVisitor = Omit<Visitor, "photoDataUrl">;

export type RegisterVisitorResult =
  | {
      ok: true;
      visitor: SafeVisitor;
    }
  | {
      ok: false;
      reason: "duplicate-dni" | "qr-token-collision";
    };

function isUniqueConstraintError(error: unknown, field: "dni" | "qrToken"): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.includes(field);
  }

  return target === field;
}

async function createVisitor(input: VisitorRegistrationInput): Promise<SafeVisitor> {
  const visitor = await prisma.visitor.create({
    data: {
      ...input,
      qrToken: generateQrToken(),
    },
    select: {
      id: true,
      name: true,
      dni: true,
      company: true,
      sector: true,
      qrToken: true,
      createdAt: true,
    },
  });

  return visitor;
}

export async function registerVisitor(
  input: VisitorRegistrationInput,
): Promise<RegisterVisitorResult> {
  try {
    return {
      ok: true,
      visitor: await createVisitor(input),
    };
  } catch (error) {
    if (isUniqueConstraintError(error, "dni")) {
      return {
        ok: false,
        reason: "duplicate-dni",
      };
    }

    if (!isUniqueConstraintError(error, "qrToken")) {
      throw error;
    }
  }

  try {
    return {
      ok: true,
      visitor: await createVisitor(input),
    };
  } catch (error) {
    if (isUniqueConstraintError(error, "dni")) {
      return {
        ok: false,
        reason: "duplicate-dni",
      };
    }

    if (isUniqueConstraintError(error, "qrToken")) {
      return {
        ok: false,
        reason: "qr-token-collision",
      };
    }

    throw error;
  }
}
