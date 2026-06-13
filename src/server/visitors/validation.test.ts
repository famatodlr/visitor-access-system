import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeDni,
  parseVisitorQrValidationInput,
  parseVisitorDniSearchInput,
  parseVisitorRegistrationInput,
} from "./validation.ts";

test("parseVisitorRegistrationInput trims fields and normalizes dni", () => {
  const result = parseVisitorRegistrationInput({
    name: "  Ada Lovelace  ",
    dni: "  12 345 678  ",
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
    dni: "12345678",
    company: "Analytical Engines SA",
    sector: "Operations",
    photoDataUrl: "data:image/png;base64,abc123",
  });
});

test("parseVisitorRegistrationInput accepts 7 digit dni values", () => {
  const result = parseVisitorRegistrationInput({
    name: "Ada Lovelace",
    dni: "1234567",
    company: "Analytical Engines SA",
    sector: "Operations",
    photoDataUrl: "data:image/png;base64,abc123",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected a valid registration payload.");
  }

  assert.equal(result.data.dni, "1234567");
});

test("parseVisitorRegistrationInput rejects alphabetic dni values", () => {
  const result = parseVisitorRegistrationInput({
    name: "Ada Lovelace",
    dni: "12abc34",
    company: "Analytical Engines SA",
    sector: "Operations",
    photoDataUrl: "data:image/png;base64,abc123",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "dni", message: "DNI must contain 7 or 8 digits." },
  ]);
});

test("parseVisitorRegistrationInput rejects too-short and too-long dni values", () => {
  const shortResult = parseVisitorRegistrationInput({
    name: "Ada Lovelace",
    dni: "123456",
    company: "Analytical Engines SA",
    sector: "Operations",
    photoDataUrl: "data:image/png;base64,abc123",
  });
  const longResult = parseVisitorRegistrationInput({
    name: "Ada Lovelace",
    dni: "123456789",
    company: "Analytical Engines SA",
    sector: "Operations",
    photoDataUrl: "data:image/png;base64,abc123",
  });

  assert.equal(shortResult.ok, false);
  assert.equal(longResult.ok, false);

  if (shortResult.ok || longResult.ok) {
    throw new Error("Expected validation errors.");
  }

  assert.deepEqual(shortResult.errors, [
    { field: "dni", message: "DNI must contain 7 or 8 digits." },
  ]);
  assert.deepEqual(longResult.errors, [
    { field: "dni", message: "DNI must contain 7 or 8 digits." },
  ]);
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

test("parseVisitorQrValidationInput trims valid qr tokens", () => {
  const result = parseVisitorQrValidationInput({
    qrToken: "  qr-token-1  ",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    throw new Error("Expected a valid QR validation payload.");
  }

  assert.deepEqual(result.data, {
    qrToken: "qr-token-1",
  });
});

test("parseVisitorQrValidationInput rejects non-object payloads", () => {
  const result = parseVisitorQrValidationInput(null);

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected QR token validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "qrToken", message: "QR token is required." },
  ]);
});

test("parseVisitorQrValidationInput rejects missing and empty qr tokens", () => {
  const result = parseVisitorQrValidationInput({
    qrToken: "   ",
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected QR token validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "qrToken", message: "QR token is required." },
  ]);
});

test("parseVisitorQrValidationInput rejects qr tokens longer than 128 characters", () => {
  const result = parseVisitorQrValidationInput({
    qrToken: "a".repeat(129),
  });

  assert.equal(result.ok, false);

  if (result.ok) {
    throw new Error("Expected QR token validation errors.");
  }

  assert.deepEqual(result.errors, [
    { field: "qrToken", message: "QR token must be 128 characters or fewer." },
  ]);
});
