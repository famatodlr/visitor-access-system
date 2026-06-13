import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { WORKSPACE_ACTIONS } from "./workspace-actions.ts";

describe("WORKSPACE_ACTIONS", () => {
  it("defines the protected workspace actions with only real workflows", () => {
    assert.deepEqual(
      WORKSPACE_ACTIONS.map((action) => action.title),
      ["Registrar visitante", "Buscar por DNI", "Validar QR"],
    );

    assert.equal(WORKSPACE_ACTIONS.length, 3);
    assert.equal(WORKSPACE_ACTIONS[0]?.href, "/workspace/visitors/new");
    assert.equal(WORKSPACE_ACTIONS[0]?.ctaLabel, "Registrar");
    assert.equal(WORKSPACE_ACTIONS[1]?.href, "/workspace/visitors/search");
    assert.equal(WORKSPACE_ACTIONS[1]?.ctaLabel, "Buscar");
    assert.equal(WORKSPACE_ACTIONS[2]?.href, "/workspace/visitors/qr/validate");
    assert.equal(WORKSPACE_ACTIONS[2]?.ctaLabel, "Validar QR");
  });
});
