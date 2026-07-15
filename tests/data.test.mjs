import assert from "node:assert/strict";
import test from "node:test";
import { REGIONS } from "../data.js";

test("region registry is complete, stable, and bilingual", () => {
  assert.equal(REGIONS.length, 34);
  assert.equal(new Set(REGIONS.map((region) => region.id)).size, 34);
  for (const region of REGIONS) {
    assert.ok(region.zh && region.en && region.shortEn);
    assert.ok(region.shortEn.length >= 3 && region.shortEn.length <= 7);
    assert.ok(region.type && region.search?.zh && region.search?.en);
    assert.ok(Number.isFinite(region.label.x) && Number.isFinite(region.label.y));
  }
});
