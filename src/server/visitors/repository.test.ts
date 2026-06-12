import assert from "node:assert/strict";
import test from "node:test";

import { createVisitorWithInitialEntry } from "./repository.ts";

test("createVisitorWithInitialEntry creates one visitor and one linked entry in a transaction", async () => {
  const operations: string[] = [];

  const visitorCreate = async (args: {
    data: {
      name: string;
      dni: string;
      company: string;
      sector: string;
      photoDataUrl: string;
      qrToken: string;
    };
    select: Record<string, true>;
  }) => {
    operations.push("visitor.create");

    assert.deepEqual(args.data, {
      name: "Ada Lovelace",
      dni: "12345678",
      company: "Analytical Engines SA",
      sector: "Operations",
      photoDataUrl: "data:image/png;base64,abc123",
      qrToken: "qr-token-1",
    });
    assert.equal(args.select.photoDataUrl, undefined);

    return {
      id: "visitor_1",
      name: args.data.name,
      dni: args.data.dni,
      company: args.data.company,
      sector: args.data.sector,
      qrToken: args.data.qrToken,
      createdAt: new Date("2026-06-12T12:00:00.000Z"),
    };
  };

  const entryCreate = async (args: { data: { visitorId: string } }) => {
    operations.push("entry.create");
    assert.deepEqual(args.data, {
      visitorId: "visitor_1",
    });

    return {
      id: "entry_1",
      visitorId: args.data.visitorId,
      createdAt: new Date("2026-06-12T12:00:00.000Z"),
    };
  };

  const transactionClient = {
    visitor: {
      create: visitorCreate,
    },
    entry: {
      create: entryCreate,
    },
  };

  const client = {
    $transaction: async <T>(callback: (transaction: typeof transactionClient) => Promise<T>) => {
      operations.push("transaction.start");
      const result = await callback(transactionClient);
      operations.push("transaction.end");
      return result;
    },
  };

  const visitor = await createVisitorWithInitialEntry(
    {
      name: "Ada Lovelace",
      dni: "12345678",
      company: "Analytical Engines SA",
      sector: "Operations",
      photoDataUrl: "data:image/png;base64,abc123",
      qrToken: "qr-token-1",
    },
    client,
  );

  assert.deepEqual(operations, [
    "transaction.start",
    "visitor.create",
    "entry.create",
    "transaction.end",
  ]);
  assert.deepEqual(visitor, {
    id: "visitor_1",
    name: "Ada Lovelace",
    dni: "12345678",
    company: "Analytical Engines SA",
    sector: "Operations",
    qrToken: "qr-token-1",
    createdAt: new Date("2026-06-12T12:00:00.000Z"),
  });
  assert.equal("photoDataUrl" in visitor, false);
});
