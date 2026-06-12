import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { WORKSPACE_ACTIONS } from "./workspace-actions.ts";

describe("WORKSPACE_ACTIONS", () => {
  it("defines the protected workspace placeholders without feature routes", () => {
    assert.deepEqual(
      WORKSPACE_ACTIONS.map((action) => action.title),
      [
        "Register visitor",
        "Search visitor by DNI",
        "Validate QR / repeat entry",
        "Visitor entries/history",
      ],
    );

    assert.equal(WORKSPACE_ACTIONS.length, 4);
    assert.ok(
      WORKSPACE_ACTIONS.every((action) => action.status === "Coming next"),
    );
    assert.ok(WORKSPACE_ACTIONS.every((action) => !("href" in action)));
  });
});
