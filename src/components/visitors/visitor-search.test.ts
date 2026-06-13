import assert from "node:assert/strict";
import test from "node:test";

import {
  buildVisitorSearchUrl,
  sanitizeVisitorSearchDni,
  validateVisitorSearchDni,
} from "./visitor-search-logic.ts";

test("sanitizeVisitorSearchDni removes alphabetic input", () => {
  assert.equal(sanitizeVisitorSearchDni("Hola"), "");
});

test("sanitizeVisitorSearchDni removes non-digits and keeps at most 8 digits", () => {
  assert.equal(sanitizeVisitorSearchDni("12abc3456789"), "12345678");
});

test("validateVisitorSearchDni returns an inline error for too-short input", () => {
  assert.equal(validateVisitorSearchDni("123456"), "DNI must contain 7 or 8 digits.");
});

test("buildVisitorSearchUrl returns null for invalid dni values", () => {
  assert.equal(buildVisitorSearchUrl("123456"), null);
});

test("buildVisitorSearchUrl returns the search endpoint for valid dni values", () => {
  assert.equal(buildVisitorSearchUrl("12345678"), "/api/visitors/search?dni=12345678");
});
