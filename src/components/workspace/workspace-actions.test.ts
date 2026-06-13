import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { WORKSPACE_ACTIONS } from "./workspace-actions.ts";

describe("WORKSPACE_ACTIONS", () => {
  it("defines the protected workspace actions with registration and search enabled", () => {
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
      ["Available", "Available", "Available", "Coming next"],
    );
    assert.equal(WORKSPACE_ACTIONS[0]?.href, "/workspace/visitors/new");
    assert.equal(WORKSPACE_ACTIONS[0]?.ctaLabel, "Register visitor");
    assert.equal(WORKSPACE_ACTIONS[1]?.href, "/workspace/visitors/search");
    assert.equal(WORKSPACE_ACTIONS[1]?.ctaLabel, "Search visitor");
    assert.equal(WORKSPACE_ACTIONS[2]?.href, "/workspace/visitors/qr/validate");
    assert.equal(WORKSPACE_ACTIONS[2]?.ctaLabel, "Validate QR");
    assert.equal(WORKSPACE_ACTIONS[3]?.href, undefined);
  });
});
