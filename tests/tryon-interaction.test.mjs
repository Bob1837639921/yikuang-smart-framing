import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getCameraFitDistance, getDraggedRotation, getDragDegreesPerPixel, getPreviewPixelRatio, PREVIEW_PIXEL_BUDGET, INITIAL_PREVIEW_ROTATION } from "../website/src/site/tryon/interaction.ts";
import { defaultMatLayers, MAX_OUTER_MAT_WIDTH_MM } from "../website/src/site/tryon/model.ts";
import { calculateQuote, frameMaterials, removeMatLayer } from "../website/src/site/tryon/model.ts";
import { getPinchZoom } from "../website/src/site/tryon/interaction.ts";
import { isSavedFramingPlan } from "../website/src/site/tryon/plan-storage.ts";

test("quote includes both directional mat borders, without charging for mat materials", () => {
  const frame = frameMaterials[0];
  const layers = [{ id: "a", materialId: "ivory", topBottomMm: 80, leftRightMm: 25 }];
  const quote = calculateQuote(42, 56, frame, layers);
  assert.deepEqual(quote, { total: 507, railMeters: 3.02 });
  assert.deepEqual(calculateQuote(42, 56, frame, [{ ...layers[0], materialId: "charcoal" }]), quote);
  assert.ok(quote.total > calculateQuote(42, 56, frame).total);
  assert.deepEqual(calculateQuote(42, 56, frame, [
    { ...layers[0], topBottomMm: 75, leftRightMm: 20 },
    { id: "b", materialId: "oat", topBottomMm: 5, leftRightMm: 5 },
  ]), quote);
});

test("pinch zoom follows finger distance and stays inside preview bounds", () => {
  assert.equal(getPinchZoom(1, 100, 120), 1.2);
  assert.equal(getPinchZoom(1, 100, 1000), 1.55);
  assert.equal(getPinchZoom(1, 100, 10), 0.72);
  assert.ok(Number.isFinite(getPinchZoom(1, 0, 0)));
});

test("removing an outer mat promotes the next layer into valid directional borders", () => {
  const layers = [defaultMatLayers[0], { ...defaultMatLayers[1], leftRightMm: 20 }];
  const next = removeMatLayer(layers, 0);
  assert.equal(next[0].topBottomMm, 12);
  assert.equal(next[0].leftRightMm, 20);
  assert.equal(layers[1].topBottomMm, 5);
  assert.equal(removeMatLayer(next, 0), next);
});

test("saved drafts accept image blobs and reject invalid sizes, layers and arbitrary URLs", () => {
  const draft = { version: 1, artworkName: "作品", frameId: "oak", widthCm: 1, heightCm: 1000,
    matEnabled: true, matLayers: defaultMatLayers, repairLevel: "original", scene: "gallery", brightness: 100,
    artworkSource: new Blob(["pixels"]), artworkPreview: new Blob(["pixels"]) };
  assert.equal(isSavedFramingPlan(structuredClone(draft)), true);
  for (const change of [{ widthCm: NaN }, { heightCm: 1001 }, { matLayers: [] }, { artworkPreview: "https://example.com/private" },
    { repairLevel: "unknown" }, { matLayers: [{ ...defaultMatLayers[0], topBottomMm: 999 }] }]) {
    assert.equal(isSavedFramingPlan({ ...draft, ...change }), false);
  }
});

test("the initial and reset preview angle is a true front view", () => {
  assert.deepEqual(INITIAL_PREVIEW_ROTATION, { x: 0, y: 0 });
});

test("preview resolution stays bounded across high-DPI and ultrawide viewports", () => {
  for (const [width, height, dpr] of [[400, 600, 1], [1246, 962, 2], [3440, 1440, 2], [7680, 4320, 3]]) {
    const ratio = getPreviewPixelRatio(width, height, dpr);
    assert.ok(width * height * ratio * ratio <= PREVIEW_PIXEL_BUDGET + 1);
    assert.ok(ratio <= dpr);
  }
  assert.equal(getPreviewPixelRatio(400, 600, 1), 1);
});

test("horizontal and vertical drags share the same normalized angular sensitivity", () => {
  const sensitivity = getDragDegreesPerPixel(679, 654);
  const horizontal = getDraggedRotation(INITIAL_PREVIEW_ROTATION, -100, 0, sensitivity);
  const vertical = getDraggedRotation(INITIAL_PREVIEW_ROTATION, 0, -100, sensitivity);

  assert.ok(Math.abs((INITIAL_PREVIEW_ROTATION.y - horizontal.y) - (INITIAL_PREVIEW_ROTATION.x - vertical.x)) < 1e-10);
});

test("dragging the upper or left edge outward tilts that edge away", () => {
  const sensitivity = getDragDegreesPerPixel(679, 654);
  const upperEdge = getDraggedRotation(INITIAL_PREVIEW_ROTATION, 0, -80, sensitivity);
  const leftEdge = getDraggedRotation(INITIAL_PREVIEW_ROTATION, -80, 0, sensitivity);

  assert.ok(upperEdge.x < INITIAL_PREVIEW_ROTATION.x);
  assert.ok(leftEdge.y < INITIAL_PREVIEW_ROTATION.y);
});

test("pitch and yaw stop before the frame flips over", () => {
  const sensitivity = getDragDegreesPerPixel(320, 320);
  assert.deepEqual(getDraggedRotation(INITIAL_PREVIEW_ROTATION, 10_000, 10_000, sensitivity), { x: 18, y: 38 });
  assert.deepEqual(getDraggedRotation(INITIAL_PREVIEW_ROTATION, -10_000, -10_000, sensitivity), { x: -22, y: -38 });
});

test("camera fitting uses the viewport aspect for wide and tall artwork", () => {
  const wideInWideViewport = getCameraFitDistance(50, 6, 0.3, 28, 1.8);
  const wideInSquareViewport = getCameraFitDistance(50, 6, 0.3, 28, 1);
  const tallInWideViewport = getCameraFitDistance(6, 50, 0.3, 28, 1.8);
  assert.ok(wideInWideViewport < wideInSquareViewport);
  assert.ok(tallInWideViewport > wideInWideViewport);
});

test("mat layers keep independent symmetric dimensions and allow oversized outer borders", () => {
  assert.equal(MAX_OUTER_MAT_WIDTH_MM, 200);
  assert.equal(defaultMatLayers[0].topBottomMm, 32);
  assert.equal(defaultMatLayers[0].leftRightMm, 32);
  assert.notEqual(defaultMatLayers[0], defaultMatLayers[1]);
});

test("mini-program canvas and controls preserve directional mat dimensions", async () => {
  const source = await readFile(new URL("../miniprogram/pages/index/index.js", import.meta.url), "utf8");
  assert.match(source, /topBottomBorderMm/);
  assert.match(source, /leftRightBorderMm/);
  assert.match(source, /activeMatMax: isOuter \? MAX_OUTER_MAT_WIDTH_MM : 30/);
  assert.match(source, /const key = axis === 'leftRight' \? 'leftRightMm' : 'topBottomMm'/);
});
