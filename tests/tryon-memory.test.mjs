import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateColorMatchGains } from "../website/src/site/material-admin/texture-color.ts";
import { normalizeDimensionInput } from "../website/src/site/tryon/dimension-input.ts";

const stageSource = await readFile(new URL("../website/src/site/tryon/ThreeFrameStage.tsx", import.meta.url), "utf8");
const previewSource = await readFile(new URL("../website/src/site/tryon/FramePreview.tsx", import.meta.url), "utf8");
const tryonModelSource = await readFile(new URL("../website/src/site/tryon/model.ts", import.meta.url), "utf8");
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

test("mat borders expand the frame while preserving the entered artwork opening", () => {
  assert.match(stageSource, /frameInnerWidth = artworkWidth \+ totalLeftRightReveal \* 2/);
  assert.match(stageSource, /frameInnerHeight = artworkHeight \+ totalTopBottomReveal \* 2/);
  assert.match(stageSource, /let openingWidth = frameInnerWidth/);
  assert.match(stageSource, /let openingHeight = frameInnerHeight/);
});

test("frame lighting keeps dark materials from washing out to silver", () => {
  assert.match(stageSource, /HemisphereLight\(0xfff8e7, 0x51483d, 1\.7\)/);
  assert.match(stageSource, /DirectionalLight\(0xd9e5ff, 0\.72\)/);
  assert.match(stageSource, /props\.frame\.material === "铝合金" \? 0\.3 : 0\.025/);
  assert.match(stageSource, /props\.frame\.material === "铝合金" \? 0\.56 : 0\.64/);
});

test("only the gallery space exposes live rotation controls", () => {
  assert.match(previewSource, /const isInteractive = scene === "gallery"/);
  assert.match(tryonModelSource, /exhibition: \{ rotation:/);
  assert.match(tryonModelSource, /study: \{ rotation:/);
  assert.match(tryonModelSource, /wallWidthCm: 720, wallHeightCm: 420/);
  assert.match(tryonModelSource, /wallWidthCm: 420, wallHeightCm: 260/);
  assert.match(previewSource, /if \(event\.button !== 0 \|\| !event\.isPrimary\) return/);
  assert.match(previewSource, /mode: "move"/);
  assert.match(previewSource, /translate3d\(\$\{staticOffset\.x\}px, \$\{staticOffset\.y\}px, 0\)/);
  assert.match(previewSource, /参考墙面 \{staticView\?\.wallWidthCm\} × \{staticView\?\.wallHeightCm\} cm · 拖动画框平移/);
  assert.match(previewSource, /复位位置/);
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
