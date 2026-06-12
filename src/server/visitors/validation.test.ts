import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeDni,
  parseVisitorRegistrationInput,
} from "./validation.ts";

test("parseVisitorRegistrationInput trims fields and normalizes dni", () => {
  const result = parseVisitorRegistrationInput({
    name: "  Ada Lovelace  ",
    dni: "  12 345 abc  ",
    company: "  Analytical Engines SA  ",
    sector: "  Operations  ",
    photoDataUrl: "  data:image/png;base64,abc123  ",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected a valid registration payload.");
  }

  assert.deepEqual(result.data, {
    name: "Ada Lovelace",
    dni: "12345ABC",
    company: "Analytical Engines SA",
    sector: "Operations",
    photoDataUrl: "data:image/png;base64,abc123",
  });
});

test("parseVisitorRegistrationInput rejects missing and empty required fields", () => {
  const result = parseVisitorRegistrationInput({
    name: "Grace Hopper",
    dni: "   ",
    company: "Navy",
    photoDataUrl: "data:image/png;base64,abc123",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "dni", message: "DNI is required." },
    { field: "sector", message: "Sector is required." },
  ]);
});

test("normalizeDni removes whitespace and uppercases letters", () => {
  assert.equal(normalizeDni("  ab 123 cd "), "AB123CD");
});
