import assert from "node:assert/strict";
import fs from "node:fs";

const src = fs.readFileSync("src/lib/tour/adventures.ts", "utf8");

const expectedIds = ["meet-sarah", "build-audience", "tracking-plan", "cart-rescue"];
for (const id of expectedIds) {
  assert.ok(
    src.includes(`id: "${id}"`),
    `adventures.ts missing id: "${id}"`,
  );
}

// Every adventure block ends with a recap beat
const recapCount = (src.match(/kind:\s*"recap"/g) ?? []).length;
assert.equal(recapCount, 4, `expected 4 recap beats, got ${recapCount}`);

// Every onEvent reference names a known event we use in seeds or user actions
const onEventMatches = [...src.matchAll(/onEvent:\s*"([^"]+)"/g)].map((m) => m[1]);
const knownEvents = new Set([
  "Deal Viewed",
  "Product Added",
  "Audience Entered",
]);
for (const name of onEventMatches) {
  assert.ok(knownEvents.has(name), `unknown onEvent "${name}"`);
}

console.log("ok: adventure script structure");
