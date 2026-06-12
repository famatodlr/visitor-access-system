import assert from "node:assert/strict";
import test from "node:test";

import { Prisma } from "@prisma/client";

import { registerVisitor, type SafeVisitor } from "./service.ts";
import type { VisitorRegistrationInput } from "./validation.ts";

const baseInput: VisitorRegistrationInput = {
  name: "Ada Lovelace",
  dni: "12345678",
  company: "Analytical Engines SA",
  sector: "Operations",
  photoDataUrl: "data:image/png;base64,abc123",
};

function safeVisitor(overrides: Partial<SafeVisitor> = {}): SafeVisitor {
  return {
    id: "visitor_1",
    name: baseInput.name,
    dni: baseInput.dni,
    company: baseInput.company,
    sector: baseInput.sector,
    qrToken: "qr-token-1",
    createdAt: new Date("2026-06-12T12:00:00.000Z"),
    ...overrides,
  };
}

function uniqueConstraintError(field: "dni" | "qrToken"): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed.", {
    code: "P2002",
    clientVersion: "test",
    meta: {
      target: [field],
    },
  });
}

test("registerVisitor returns safe visitor payload without photoDataUrl", async () => {
  const result = await registerVisitor(baseInput, {
    createVisitorWithInitialEntry: async () => safeVisitor(),
    generateQrToken: () => "qr-token-1",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected registration to succeed.");
  }

  assert.deepEqual(result.visitor, safeVisitor());
  assert.equal("photoDataUrl" in result.visitor, false);
});

test("registerVisitor passes required visitor fields including photoDataUrl to persistence", async () => {
  const calls: Array<VisitorRegistrationInput & { qrToken: string }> = [];

  await registerVisitor(baseInput, {
    createVisitorWithInitialEntry: async (data) => {
      calls.push(data);
      return safeVisitor({ qrToken: data.qrToken });
    },
    generateQrToken: () => "qr-token-1",
  });

  assert.deepEqual(calls, [
    {
      ...baseInput,
      qrToken: "qr-token-1",
    },
  ]);
});

test("registerVisitor maps duplicate DNI to duplicate-dni result", async () => {
  const result = await registerVisitor(baseInput, {
    createVisitorWithInitialEntry: async () => {
      throw uniqueConstraintError("dni");
    },
    generateQrToken: () => "qr-token-1",
  });

  assert.deepEqual(result, {
    ok: false,
    reason: "duplicate-dni",
  });
});

test("registerVisitor retries once when QR token collides and succeeds with second token", async () => {
  const receivedTokens: string[] = [];

  const result = await registerVisitor(baseInput, {
    createVisitorWithInitialEntry: async (data) => {
      receivedTokens.push(data.qrToken);

      if (data.qrToken === "qr-token-collision") {
        throw uniqueConstraintError("qrToken");
      }

      return safeVisitor({ qrToken: data.qrToken });
    },
    generateQrToken: (() => {
      const tokens = ["qr-token-collision", "qr-token-2"];

      return () => tokens.shift() ?? "unexpected-token";
    })(),
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected registration to succeed after retry.");
  }

  assert.deepEqual(receivedTokens, ["qr-token-collision", "qr-token-2"]);
  assert.equal(result.visitor.qrToken, "qr-token-2");
});

test("registerVisitor returns qr-token-collision after a second QR token collision", async () => {
  const result = await registerVisitor(baseInput, {
    createVisitorWithInitialEntry: async () => {
      throw uniqueConstraintError("qrToken");
    },
    generateQrToken: (() => {
      const tokens = ["qr-token-collision-1", "qr-token-collision-2"];

      return () => tokens.shift() ?? "unexpected-token";
    })(),
  });

  assert.deepEqual(result, {
    ok: false,
    reason: "qr-token-collision",
  });
});
