import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateColorMatchGains } from "../website/src/site/material-admin/texture-color.ts";
import { normalizeDimensionInput } from "../website/src/site/tryon/dimension-input.ts";

const stageSource = await readFile(new URL("../website/src/site/tryon/ThreeFrameStage.tsx", import.meta.url), "utf8");
const storageSource = await readFile(new URL("../website/src/site/material-admin/model.ts", import.meta.url), "utf8");
const devSource = await readFile(new URL("../scripts/dev-supervisor.mjs", import.meta.url), "utf8");

test("3D preview uses abortable deduplicated texture batches", () => {
  assert.match(stageSource, /class StageTextureCache/);
  assert.match(stageSource, /new Set\(urls\)/);
  assert.match(stageSource, /AbortController/);
  assert.match(stageSource, /textureLease\.dispose\(\)/);
});

test("3D preview renders on demand and updates mat selection without rebuilding", () => {
  assert.match(stageSource, /if \(unsettled\) runtime\.animationFrame/);
  assert.match(stageSource, /document\.hidden/);
  assert.match(stageSource, /runtime\.matFaceMaterials\.forEach/);
  const sceneDependencies = stageSource.match(/\}, \[(props\.artworkUrl[^\]]+)\]\);/)?.[1] || "";
  assert.doesNotMatch(sceneDependencies, /activeLayerIndex/);
});

test("large generated material assets stay out of localStorage", () => {
  assert.match(storageSource, /indexedDB\.open/);
  assert.doesNotMatch(storageSource, /localStorage\.setItem\(MATERIAL_STORAGE_KEY/);
});

test("development Vite process has a heap cap and clean restart guards", () => {
  assert.match(devSource, /--max-old-space-size=2048/);
  assert.match(devSource, /six-hour development-session limit reached/);
  assert.match(devSource, /dependencies or Vite configuration changed/);
});

test("side-texture white balance is matched to the front texture", () => {
  const gains = calculateColorMatchGains(
    { r: 228.9, g: 204.9, b: 171.4 },
    { r: 228.7, g: 195.5, b: 149.4 },
  );
  assert.ok(Math.abs(gains.r - 1.001) < 0.002);
  assert.ok(Math.abs(gains.g - 1.048) < 0.002);
  assert.ok(Math.abs(gains.b - 1.147) < 0.002);
});

test("dimension editing allows an empty draft and clamps only on commit", () => {
  assert.equal(normalizeDimensionInput("", 42), 42);
  assert.equal(normalizeDimensionInput("86.25", 42), 86.3);
  assert.equal(normalizeDimensionInput("0", 42), 1);
  assert.equal(normalizeDimensionInput("900", 42), 500);
});
