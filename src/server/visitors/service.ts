import { generateQrToken } from "./qr-token.ts";
import {
  createVisitorWithInitialEntry,
  isUniqueConstraintError,
  type SafeVisitor,
  type VisitorWithQrTokenInput,
} from "./repository.ts";
import type { VisitorRegistrationInput } from "./validation.ts";

export type { SafeVisitor } from "./repository.ts";

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
