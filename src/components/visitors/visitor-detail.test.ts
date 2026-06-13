import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailPageSource = readFileSync(
  new URL("../../app/(protected)/workspace/visitors/[visitorId]/page.tsx", import.meta.url),
  "utf8",
);

test("visitor detail page includes a top back to search link", () => {
  assert.match(detailPageSource, /href="\/workspace\/visitors\/search"/);
  assert.match(detailPageSource, /Volver a la búsqueda/);
});
