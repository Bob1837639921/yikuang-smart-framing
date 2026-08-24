import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getDraggedRotation, getDragDegreesPerPixel, INITIAL_PREVIEW_ROTATION } from "../website/src/site/tryon/interaction.ts";
import { defaultMatLayers, MAX_OUTER_MAT_WIDTH_MM } from "../website/src/site/tryon/model.ts";

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
