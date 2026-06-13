import assert from "node:assert/strict";
import test from "node:test";

import {
  createVisitorWithInitialEntry,
  findVisitorDetailById,
  findVisitorSummaryByDni,
} from "./repository.ts";

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
      arrivedAt: new Date("2026-06-12T12:00:00.000Z"),
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

test("findVisitorSummaryByDni finds a visitor by normalized DNI without sensitive fields", async () => {
  const client = {
    visitor: {
      findUnique: async (args: {
        where: { dni: string };
        select: Record<string, true>;
      }) => {
        assert.deepEqual(args.where, {
          dni: "12345ABC",
        });
        assert.equal(args.select.id, true);
        assert.equal(args.select.name, true);
        assert.equal(args.select.dni, true);
        assert.equal(args.select.company, true);
        assert.equal(args.select.sector, true);
        assert.equal(args.select.createdAt, true);
        assert.equal(args.select.photoDataUrl, undefined);
        assert.equal(args.select.qrToken, undefined);

        return {
          id: "visitor_1",
          name: "Ada Lovelace",
          dni: "12345ABC",
          company: "Analytical Engines SA",
          sector: "Operations",
          createdAt: new Date("2026-06-12T12:00:00.000Z"),
        };
      },
    },
  };

  const visitor = await findVisitorSummaryByDni("12345ABC", client);

  assert.deepEqual(visitor, {
    id: "visitor_1",
    name: "Ada Lovelace",
    dni: "12345ABC",
    company: "Analytical Engines SA",
    sector: "Operations",
    createdAt: new Date("2026-06-12T12:00:00.000Z"),
  });
});

test("findVisitorSummaryByDni returns null when no visitor matches", async () => {
  const client = {
    visitor: {
      findUnique: async () => null,
    },
  };

  assert.equal(await findVisitorSummaryByDni("404", client), null);
});

test("findVisitorDetailById includes photo, qr token and newest entries first", async () => {
  const client = {
    visitor: {
      findUnique: async (args: {
        where: { id: string };
        select: {
          entries: {
            orderBy: { arrivedAt: "desc" };
            select: Record<string, true>;
          };
          [key: string]: unknown;
        };
      }) => {
        assert.deepEqual(args.where, {
          id: "visitor_1",
        });
        assert.equal(args.select.photoDataUrl, true);
        assert.equal(args.select.qrToken, true);
        assert.deepEqual(args.select.entries.orderBy, {
          arrivedAt: "desc",
        });
        assert.equal(args.select.entries.select.id, true);
        assert.equal(args.select.entries.select.arrivedAt, true);

        return {
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
              id: "entry_2",
              arrivedAt: new Date("2026-06-13T12:00:00.000Z"),
            },
            {
              id: "entry_1",
              arrivedAt: new Date("2026-06-12T12:00:00.000Z"),
            },
          ],
        };
      },
    },
  };

  const visitor = await findVisitorDetailById("visitor_1", client);

  assert.deepEqual(visitor, {
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
        id: "entry_2",
        arrivedAt: new Date("2026-06-13T12:00:00.000Z"),
      },
      {
        id: "entry_1",
        arrivedAt: new Date("2026-06-12T12:00:00.000Z"),
      },
    ],
  });
});

test("findVisitorDetailById returns null when no visitor matches", async () => {
  const client = {
    visitor: {
      findUnique: async () => null,
    },
  };

  assert.equal(await findVisitorDetailById("missing", client), null);
});
