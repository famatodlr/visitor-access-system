import { Prisma, type Visitor } from "@prisma/client";

import { prisma } from "../../lib/prisma.ts";
import type { VisitorRegistrationInput } from "./validation.ts";

export type SafeVisitor = Omit<Visitor, "photoDataUrl">;

export type VisitorWithQrTokenInput = VisitorRegistrationInput & {
  qrToken: string;
};

const safeVisitorSelect = {
  id: true,
  name: true,
  dni: true,
  company: true,
  sector: true,
  qrToken: true,
  createdAt: true,
} satisfies Prisma.VisitorSelect;

const visitorSummarySelect = {
  id: true,
  name: true,
  dni: true,
  company: true,
  sector: true,
  createdAt: true,
} satisfies Prisma.VisitorSelect;

const visitorDetailSelect = {
  id: true,
  name: true,
  dni: true,
  company: true,
  sector: true,
  photoDataUrl: true,
  qrToken: true,
  createdAt: true,
  entries: {
    orderBy: {
      arrivedAt: "desc",
    },
    select: {
      id: true,
      arrivedAt: true,
    },
  },
} satisfies Prisma.VisitorSelect;

export type VisitorSummary = Prisma.VisitorGetPayload<{
  select: typeof visitorSummarySelect;
}>;

export type VisitorDetail = Prisma.VisitorGetPayload<{
  select: typeof visitorDetailSelect;
}>;

export interface VisitorTransactionClient {
  visitor: {
    create(args: { data: VisitorWithQrTokenInput; select: typeof safeVisitorSelect }): Promise<SafeVisitor>;
  };
  entry: {
    create(args: { data: { visitorId: string } }): Promise<unknown>;
  };
}

export interface VisitorPersistenceClient {
  $transaction<T>(callback: (transaction: VisitorTransactionClient) => Promise<T>): Promise<T>;
}

export interface VisitorSummaryPersistenceClient {
  visitor: {
    findUnique(args: {
      where: { dni: string };
      select: typeof visitorSummarySelect;
    }): Promise<VisitorSummary | null>;
  };
}

export interface VisitorDetailPersistenceClient {
  visitor: {
    findUnique(args: {
      where: { id: string };
      select: typeof visitorDetailSelect;
    }): Promise<VisitorDetail | null>;
  };
}

export function isUniqueConstraintError(error: unknown, field: "dni" | "qrToken"): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.includes(field);
  }

  return target === field;
}

export async function createVisitorWithInitialEntry(
  input: VisitorWithQrTokenInput,
  client: VisitorPersistenceClient = prisma as unknown as VisitorPersistenceClient,
): Promise<SafeVisitor> {
  return client.$transaction(async (transaction) => {
    const visitor = await transaction.visitor.create({
      data: input,
      select: safeVisitorSelect,
    });

    await transaction.entry.create({
      data: {
        visitorId: visitor.id,
      },
    });

    return visitor;
  });
}

export async function findVisitorSummaryByDni(
  dni: string,
  client: VisitorSummaryPersistenceClient = prisma as unknown as VisitorSummaryPersistenceClient,
): Promise<VisitorSummary | null> {
  return client.visitor.findUnique({
    where: {
      dni,
    },
    select: visitorSummarySelect,
  });
}

export async function findVisitorDetailById(
  visitorId: string,
  client: VisitorDetailPersistenceClient = prisma as unknown as VisitorDetailPersistenceClient,
): Promise<VisitorDetail | null> {
  return client.visitor.findUnique({
    where: {
      id: visitorId,
    },
    select: visitorDetailSelect,
  });
}
