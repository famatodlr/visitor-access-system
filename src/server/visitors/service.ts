import { generateQrToken } from "./qr-token.ts";
import {
  createEntryForVisitor,
  createVisitorWithInitialEntry,
  findVisitorDetailById,
  findVisitorByQrToken,
  findVisitorSummaryByDni,
  type EntryConfirmation,
  isUniqueConstraintError,
  type SafeVisitor,
  type VisitorDetail,
  type VisitorQrLookup,
  type VisitorSummary,
  type VisitorWithQrTokenInput,
} from "./repository.ts";
import type { VisitorRegistrationInput } from "./validation.ts";

export type {
  EntryConfirmation,
  SafeVisitor,
  VisitorDetail,
  VisitorQrLookup,
  VisitorSummary,
} from "./repository.ts";

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

export type RegisterEntryFromQrTokenResult =
  | {
      ok: true;
      visitor: {
        id: string;
        fullName: string;
        dni: string;
        company: string;
      };
      entry: EntryConfirmation;
    }
  | {
      ok: false;
      reason: "unknown-qr-token";
    };

export interface RegisterEntryFromQrTokenDependencies {
  findVisitorByQrToken?: (qrToken: string) => Promise<VisitorQrLookup | null>;
  createEntryForVisitor?: (visitorId: string) => Promise<EntryConfirmation>;
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

export async function registerEntryFromQrToken(
  qrToken: string,
  dependencies: RegisterEntryFromQrTokenDependencies = {},
): Promise<RegisterEntryFromQrTokenResult> {
  const findVisitor = dependencies.findVisitorByQrToken ?? findVisitorByQrToken;
  const createEntry = dependencies.createEntryForVisitor ?? createEntryForVisitor;
  const visitor = await findVisitor(qrToken);

  if (!visitor) {
    return {
      ok: false,
      reason: "unknown-qr-token",
    };
  }

  const entry = await createEntry(visitor.id);

  return {
    ok: true,
    visitor: {
      id: visitor.id,
      fullName: visitor.name,
      dni: visitor.dni,
      company: visitor.company,
    },
    entry,
  };
}
