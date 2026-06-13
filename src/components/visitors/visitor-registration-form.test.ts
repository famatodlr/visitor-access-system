import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const registrationFormSource = readFileSync(
  new URL("./visitor-registration-form.tsx", import.meta.url),
  "utf8",
);

test("visitor registration uses webcam capture without file upload UI", () => {
  assert.doesNotMatch(registrationFormSource, /type="file"/);
  assert.doesNotMatch(registrationFormSource, /FileReader/);
  assert.doesNotMatch(registrationFormSource, /Upload photo/);
  assert.doesNotMatch(registrationFormSource, /handlePhotoUpload/);
  assert.match(registrationFormSource, /Iniciar cámara/);
  assert.match(registrationFormSource, /Capturar foto/);
});
