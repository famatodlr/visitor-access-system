import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldUseSecureGuardSessionCookie } from "./cookie-options.ts";

describe("shouldUseSecureGuardSessionCookie", () => {
  it("keeps production cookies secure by default", () => {
    assert.equal(
      shouldUseSecureGuardSessionCookie({
        nodeEnv: "production",
      }),
      true,
    );
  });

  it("allows local Docker to disable secure cookies over http", () => {
    assert.equal(
      shouldUseSecureGuardSessionCookie({
        nodeEnv: "production",
        sessionCookieSecure: "false",
      }),
      false,
    );
  });

  it("does not use secure cookies in development", () => {
    assert.equal(
      shouldUseSecureGuardSessionCookie({
        nodeEnv: "development",
      }),
      false,
    );
  });
});
