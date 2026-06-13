import assert from "node:assert/strict";
import test from "node:test";

import { Prisma } from "@prisma/client";

import {
  getVisitorDetail,
  registerVisitor,
  registerEntryFromQrToken,
  searchVisitorByDni,
  type SafeVisitor,
  type VisitorDetail,
  type VisitorQrLookup,
  type VisitorSummary,
} from "./service.ts";
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

test("searchVisitorByDni returns visitor summary when found", async () => {
  const summary: VisitorSummary = {
    id: "visitor_1",
    name: "Ada Lovelace",
    dni: "12345ABC",
    company: "Analytical Engines SA",
    sector: "Operations",
    createdAt: new Date("2026-06-12T12:00:00.000Z"),
  };
  const calls: string[] = [];

  const result = await searchVisitorByDni("12345ABC", {
    findVisitorSummaryByDni: async (dni) => {
      calls.push(dni);
      return summary;
    },
  });

  assert.deepEqual(calls, ["12345ABC"]);
  assert.deepEqual(result, summary);
});

test("searchVisitorByDni returns null when visitor is missing", async () => {
  const result = await searchVisitorByDni("404", {
    findVisitorSummaryByDni: async () => null,
  });

  assert.equal(result, null);
});

test("getVisitorDetail returns visitor detail when found", async () => {
  const detail: VisitorDetail = {
    id: "visitor_1",
    name: "Ada Lovelace",
    dni: "12345ABC",
    company: "Analytical Engines SA",
    sector: "Operations",
    photoDataUrl: "data:image/png;base64,abc123",
    qrToken: "qr-token-1",
    createdAt: new Date("2026-06-12T12:00:00.000Z"),
    entries: [
      {
        id: "entry_1",
        arrivedAt: new Date("2026-06-12T12:00:00.000Z"),
      },
    ],
  };
  const calls: string[] = [];

  const result = await getVisitorDetail("visitor_1", {
    findVisitorDetailById: async (visitorId) => {
      calls.push(visitorId);
      return detail;
    },
  });

  assert.deepEqual(calls, ["visitor_1"]);
  assert.deepEqual(result, detail);
});

test("getVisitorDetail returns null when visitor is missing", async () => {
  const result = await getVisitorDetail("missing", {
    findVisitorDetailById: async () => null,
  });

  assert.equal(result, null);
});

test("registerEntryFromQrToken creates an entry and returns confirmation data", async () => {
  const visitor: VisitorQrLookup = {
    id: "visitor_1",
    name: "Ada Lovelace",
    dni: "12345678",
    company: "Analytical Engines SA",
  };
  const calls: string[] = [];
  const arrivedAt = new Date("2026-06-13T15:30:00.000Z");

  const result = await registerEntryFromQrToken("qr-token-1", {
    findVisitorByQrToken: async (qrToken) => {
      calls.push(`find:${qrToken}`);
      return visitor;
    },
    createEntryForVisitor: async (visitorId) => {
      calls.push(`entry:${visitorId}`);
      return {
        id: "entry_2",
        arrivedAt,
      };
    },
  });

  assert.deepEqual(calls, ["find:qr-token-1", "entry:visitor_1"]);
  assert.deepEqual(result, {
    ok: true,
    visitor: {
      id: "visitor_1",
      fullName: "Ada Lovelace",
      dni: "12345678",
      company: "Analytical Engines SA",
    },
    entry: {
      id: "entry_2",
      arrivedAt,
    },
  });
});

test("registerEntryFromQrToken returns unknown-qr-token when no visitor matches", async () => {
  const entryCalls: string[] = [];

  const result = await registerEntryFromQrToken("missing-token", {
    findVisitorByQrToken: async () => null,
    createEntryForVisitor: async (visitorId) => {
      entryCalls.push(visitorId);
      return {
        id: "entry_unexpected",
        arrivedAt: new Date("2026-06-13T15:30:00.000Z"),
      };
    },
  });

  assert.deepEqual(entryCalls, []);
  assert.deepEqual(result, {
    ok: false,
    reason: "unknown-qr-token",
  });
});

test("registerEntryFromQrToken propagates persistence errors", async () => {
  const persistenceError = new Error("database unavailable");

  await assert.rejects(
    registerEntryFromQrToken("qr-token-1", {
      findVisitorByQrToken: async () => {
        throw persistenceError;
      },
    }),
    persistenceError,
  );
});
