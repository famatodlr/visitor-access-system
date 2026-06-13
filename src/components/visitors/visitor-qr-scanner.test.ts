import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyQrScannerError,
  formatQrEntryTimestamp,
  normalizeScannedQrToken,
  parseQrValidationResponse,
} from "./visitor-qr-scanner-logic.ts";

test("normalizeScannedQrToken reads string scan results", () => {
  assert.equal(normalizeScannedQrToken("  qr-token-1  "), "qr-token-1");
});

test("normalizeScannedQrToken reads detailed scan results", () => {
  assert.equal(
    normalizeScannedQrToken({
      data: "  qr-token-2  ",
    }),
    "qr-token-2",
  );
});

test("normalizeScannedQrToken returns null for empty or unsupported scan results", () => {
  assert.equal(normalizeScannedQrToken("   "), null);
  assert.equal(normalizeScannedQrToken({ data: "   " }), null);
  assert.equal(normalizeScannedQrToken({ value: "qr-token" }), null);
});

test("parseQrValidationResponse keeps success response data", () => {
  const response = parseQrValidationResponse({
    visitor: {
      id: "visitor_1",
      fullName: "Ada Lovelace",
      dni: "12345678",
      company: "Analytical Engines SA",
    },
    entry: {
      id: "entry_2",
      arrivedAt: "2026-06-13T15:30:00.000Z",
    },
  });

  assert.deepEqual(response, {
    visitor: {
      id: "visitor_1",
      fullName: "Ada Lovelace",
      dni: "12345678",
      company: "Analytical Engines SA",
    },
    entry: {
      id: "entry_2",
      arrivedAt: "2026-06-13T15:30:00.000Z",
    },
  });
});

test("parseQrValidationResponse keeps only string errors", () => {
  assert.deepEqual(parseQrValidationResponse({ error: "Unknown QR token." }), {
    error: "Unknown QR token.",
  });
  assert.deepEqual(parseQrValidationResponse({ error: 404 }), {});
});

test("classifyQrScannerError returns useful camera messages", () => {
  assert.equal(
    classifyQrScannerError(new DOMException("Permission denied", "NotAllowedError")),
    "Camera access was denied. Allow camera permission and try again.",
  );
  assert.equal(
    classifyQrScannerError(new DOMException("No camera", "NotFoundError")),
    "No camera was found on this device.",
  );
  assert.equal(
    classifyQrScannerError(new Error("Video stream unavailable")),
    "Camera access was denied or unavailable. Please try again.",
  );
});

test("formatQrEntryTimestamp formats valid timestamps and falls back for invalid values", () => {
  assert.equal(formatQrEntryTimestamp("not-a-date"), "not-a-date");
  assert.match(formatQrEntryTimestamp("2026-06-13T15:30:00.000Z"), /2026|13|jun/i);
});
