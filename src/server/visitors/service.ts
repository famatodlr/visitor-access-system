import { generateQrToken } from "./qr-token.ts";
import {
  createVisitorWithInitialEntry,
  findVisitorDetailById,
  findVisitorSummaryByDni,
  isUniqueConstraintError,
  type SafeVisitor,
  type VisitorDetail,
  type VisitorSummary,
  type VisitorWithQrTokenInput,
} from "./repository.ts";
import type { VisitorRegistrationInput } from "./validation.ts";

export type { SafeVisitor, VisitorDetail, VisitorSummary } from "./repository.ts";

export type RegisterVisitorResult =
  | {
      ok: true;
      visitor: SafeVisitor;
    }
  | {
      ok: false;
      reason: "duplicate-dni" | "qr-token-collision";
    };

export interface RegisterVisitorDependencies {
  createVisitorWithInitialEntry?: (input: VisitorWithQrTokenInput) => Promise<SafeVisitor>;
  generateQrToken?: () => string;
}

export interface SearchVisitorDependencies {
  findVisitorSummaryByDni?: (dni: string) => Promise<VisitorSummary | null>;
}

export interface GetVisitorDetailDependencies {
  findVisitorDetailById?: (visitorId: string) => Promise<VisitorDetail | null>;
}

export async function registerVisitor(
  input: VisitorRegistrationInput,
  dependencies: RegisterVisitorDependencies = {},
): Promise<RegisterVisitorResult> {
  const persistVisitor = dependencies.createVisitorWithInitialEntry ?? createVisitorWithInitialEntry;
  const createQrToken = dependencies.generateQrToken ?? generateQrToken;

  try {
    return {
      ok: true,
      visitor: await persistVisitor({
        ...input,
        qrToken: createQrToken(),
      }),
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
      visitor: await persistVisitor({
        ...input,
        qrToken: createQrToken(),
      }),
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

export async function searchVisitorByDni(
  dni: string,
  dependencies: SearchVisitorDependencies = {},
): Promise<VisitorSummary | null> {
  const findVisitor = dependencies.findVisitorSummaryByDni ?? findVisitorSummaryByDni;

  return findVisitor(dni);
}

export async function getVisitorDetail(
  visitorId: string,
  dependencies: GetVisitorDetailDependencies = {},
): Promise<VisitorDetail | null> {
  const findVisitor = dependencies.findVisitorDetailById ?? findVisitorDetailById;

  return findVisitor(visitorId);
}
