import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeDni,
  parseVisitorDniSearchInput,
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

test("parseVisitorDniSearchInput accepts 7 digit dni values", () => {
  const result = parseVisitorDniSearchInput({
    dni: "1234567",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected a valid DNI search payload.");
  }

  assert.deepEqual(result.data, {
    dni: "1234567",
  });
});

test("parseVisitorDniSearchInput accepts 8 digit dni values", () => {
  const result = parseVisitorDniSearchInput({
    dni: "12345678",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected a valid DNI search payload.");
  }

  assert.deepEqual(result.data, {
    dni: "12345678",
  });
});

test("parseVisitorDniSearchInput removes whitespace before numeric validation", () => {
  const result = parseVisitorDniSearchInput({
    dni: "  12 345 678  ",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected a valid DNI search payload.");
  }

  assert.deepEqual(result.data, {
    dni: "12345678",
  });
});

test("parseVisitorDniSearchInput rejects missing and empty dni", () => {
  const result = parseVisitorDniSearchInput({
    dni: "   ",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected DNI validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "dni", message: "DNI is required." },
  ]);
});

test("parseVisitorDniSearchInput rejects alphabetic dni values", () => {
  const result = parseVisitorDniSearchInput({
    dni: "Hola",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected DNI validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "dni", message: "DNI must contain 7 or 8 digits." },
  ]);
});

test("parseVisitorDniSearchInput rejects mixed alphanumeric dni values", () => {
  const result = parseVisitorDniSearchInput({
    dni: "12abc34",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected DNI validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "dni", message: "DNI must contain 7 or 8 digits." },
  ]);
});

test("parseVisitorDniSearchInput rejects too-short dni values", () => {
  const result = parseVisitorDniSearchInput({
    dni: "123456",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected DNI validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "dni", message: "DNI must contain 7 or 8 digits." },
  ]);
});

test("parseVisitorDniSearchInput rejects too-long dni values", () => {
  const result = parseVisitorDniSearchInput({
    dni: "123456789",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected DNI validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "dni", message: "DNI must contain 7 or 8 digits." },
  ]);
});
