import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { WORKSPACE_ACTIONS } from "./workspace-actions.ts";

describe("WORKSPACE_ACTIONS", () => {
  it("defines the protected workspace actions with visitor registration enabled", () => {
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
    assert.deepEqual(
      WORKSPACE_ACTIONS.map((action) => action.status),
      ["Available", "Coming next", "Coming next", "Coming next"],
    );
    assert.equal(WORKSPACE_ACTIONS[0]?.href, "/workspace/visitors/new");
    assert.ok(WORKSPACE_ACTIONS.slice(1).every((action) => !action.href));
  });
});
