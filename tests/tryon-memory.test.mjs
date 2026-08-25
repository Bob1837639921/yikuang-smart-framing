import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateColorMatchGains } from "../website/src/site/material-admin/texture-color.ts";
import { generateMaterialSku } from "../website/src/site/material-admin/material-sku.ts";
import { normalizeDimensionInput } from "../website/src/site/tryon/dimension-input.ts";
import { dewrinklePixels } from "../website/src/site/tryon/dewrinkle-core.ts";
import { fuzzyFilter, fuzzyMatchScore } from "../website/src/site/tryon/fuzzy-search.ts";
import { frameLineCategories, frameLineSubcategories } from "../website/src/site/tryon/model.ts";

const stageSource = await readFile(new URL("../website/src/site/tryon/ThreeFrameStage.tsx", import.meta.url), "utf8");
const previewSource = await readFile(new URL("../website/src/site/tryon/FramePreview.tsx", import.meta.url), "utf8");
const tryonModelSource = await readFile(new URL("../website/src/site/tryon/model.ts", import.meta.url), "utf8");
const storageSource = await readFile(new URL("../website/src/site/material-admin/model.ts", import.meta.url), "utf8");
const devSource = await readFile(new URL("../scripts/dev-supervisor.mjs", import.meta.url), "utf8");
const repairSource = await readFile(new URL("../website/src/site/tryon/dewrinkle.ts", import.meta.url), "utf8");
const repairCoreSource = await readFile(new URL("../website/src/site/tryon/dewrinkle-core.ts", import.meta.url), "utf8");
const repairWorkerSource = await readFile(new URL("../website/src/site/tryon/dewrinkle.worker.ts", import.meta.url), "utf8");
const tryonPageSource = await readFile(new URL("../website/src/site/tryon/TryOnPage.tsx", import.meta.url), "utf8");
const artworkPanelSource = await readFile(new URL("../website/src/site/tryon/ArtworkPanel.tsx", import.meta.url), "utf8");
const materialAdminSource = await readFile(new URL("../website/src/site/material-admin/MaterialAdminPage.tsx", import.meta.url), "utf8");
const inkCursorSource = await readFile(new URL("../website/src/site/InkCursorTrail.tsx", import.meta.url), "utf8");
const homePageSource = await readFile(new URL("../website/src/site/HomePage.tsx", import.meta.url), "utf8");
const framingControlsSource = await readFile(new URL("../website/src/site/tryon/FramingControls.tsx", import.meta.url), "utf8");
const tryonStylesSource = await readFile(new URL("../website/src/site/tryon/tryon.css", import.meta.url), "utf8");

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

test("mat administration needs one face texture and derives its edge color locally", () => {
  assert.match(storageSource, /MAT_STORE_NAME = "mat-materials"/);
  assert.match(storageSource, /frontTexture: string/);
  assert.match(storageSource, /deriveMatEdgeColor/);
  assert.match(storageSource, /edgeColor: string/);
  assert.match(storageSource, /defaultTopBottomMm: number/);
  assert.match(storageSource, /defaultLeftRightMm: number/);
  assert.match(materialAdminSource, /卡纸正面纹理 · 必传/);
  assert.match(materialAdminSource, /浏览器本地识别/);
  assert.doesNotMatch(materialAdminSource, /卡纸截面 · 必传/);
  assert.match(materialAdminSource, /封面展示图 · 必传/);
  assert.match(storageSource, /coverImage: string/);
  assert.doesNotMatch(stageSource, /material\.edgeTexture/);
  assert.match(stageSource, /material\.edgeColor \|\| material\.color/);
});

test("frame and mat material numbers are system-issued and collision-safe", () => {
  const now = new Date(2026, 7, 25, 12, 0, 0).getTime();
  const frameSku = generateMaterialSku("frame", [], now);
  const matSku = generateMaterialSku("mat", [], now);
  assert.match(frameSku, /^ZH-FR-260825-[0-9A-Z]{4}$/);
  assert.match(matSku, /^ZH-MAT-260825-[0-9A-Z]{4}$/);
  assert.equal(generateMaterialSku("frame", [frameSku], now), `${frameSku}-02`);
  assert.match(materialAdminSource, /材料编号 <em>系统生成<\/em>/);
  assert.doesNotMatch(materialAdminSource, /<span>SKU<\/span><input/);
});

test("admin preview uses the catalog cover and homepage ink trail renders only on demand", () => {
  assert.match(materialAdminSource, /cover\.url \? "material-cover-preview" : "material-cover-preview is-empty"/);
  assert.match(materialAdminSource, /src=\{cover\.url\}/);
  assert.match(materialAdminSource, /上传封面后显示/);
  assert.match(inkCursorSource, /const MAX_DABS = 280/);
  assert.match(inkCursorSource, /prefers-reduced-motion: reduce/);
  assert.match(inkCursorSource, /if \(!animationFrame\) animationFrame = window\.requestAnimationFrame/);
  assert.match(inkCursorSource, /if \(dabs\.length\) animationFrame = window\.requestAnimationFrame/);
  assert.match(homePageSource, /home-work-case-01\.jpg/);
  assert.match(homePageSource, /home-work-case-02\.jpg/);
  assert.match(homePageSource, /正好作品陈列/);
  assert.match(homePageSource, /查看上一件作品/);
  assert.match(homePageSource, /role="tablist" aria-label="作品案例目录"/);
  assert.doesNotMatch(homePageSource, /home-material-macro\.webp/);
});

test("material admin lists only managed records and supports selecting them for editing", () => {
  assert.doesNotMatch(materialAdminSource, /frameMaterials\.map/);
  assert.doesNotMatch(materialAdminSource, /matMaterials\.map/);
  assert.match(materialAdminSource, /const selectFrameRecord = \(record: ManagedFrameRecord\)/);
  assert.match(materialAdminSource, /const selectMatRecord = \(record: ManagedMatRecord\)/);
  assert.match(materialAdminSource, /selectedFrameId \?\? `managed-/);
  assert.match(materialAdminSource, /selectedMatId \?\? `managed-mat-/);
  assert.match(materialAdminSource, /还没有后台框料/);
  assert.match(materialAdminSource, /还没有后台卡纸/);
  assert.doesNotMatch(materialAdminSource, /sampleFront|sampleCover|sampleSide|sampleProfile/);
  assert.match(materialAdminSource, /已新建空白框料草稿/);
});

test("frame taxonomy keeps redwood under solid wood and oil-painting moulding under plaster", () => {
  assert.deepEqual(frameLineCategories, ["实木线条", "石膏线条", "塑料线条"]);
  assert.ok(frameLineSubcategories["实木线条"].includes("红木"));
  assert.ok(frameLineSubcategories["石膏线条"].includes("油画线条"));
  assert.ok(!frameLineSubcategories["实木线条"].includes("油画线条"));
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

test("desktop try-on stays within one viewport and edits artwork size with framing controls", () => {
  assert.match(tryonStylesSource, /height: 100svh; min-height: 0; overflow: hidden/);
  assert.match(tryonStylesSource, /grid-template-rows: auto auto auto minmax\(0, 1fr\)/);
  assert.match(framingControlsSource, /<ArtworkDimensions widthCm=\{props\.widthCm\}/);
  assert.doesNotMatch(artworkPanelSource, /try-size-fields/);
});

test("mat library supports ranked partial and non-contiguous fuzzy search", () => {
  const materials = [
    { name: "暖白棉纹", sku: "ZH-MAT-101" },
    { name: "雾绿麻纹", sku: "ZH-MAT-208" },
    { name: "炭黑绒面", sku: "ZH-MAT-309" },
  ];
  assert.deepEqual(fuzzyFilter(materials, "棉纹", (item) => `${item.name} ${item.sku}`).map((item) => item.name), ["暖白棉纹"]);
  assert.deepEqual(fuzzyFilter(materials, "雾麻", (item) => `${item.name} ${item.sku}`).map((item) => item.name), ["雾绿麻纹"]);
  assert.equal(fuzzyFilter(materials, "208", (item) => `${item.name} ${item.sku}`)[0].name, "雾绿麻纹");
  assert.ok(fuzzyMatchScore("暖白", "暖白棉纹") > fuzzyMatchScore("暖棉", "暖白棉纹"));
  assert.match(framingControlsSource, /placeholder="搜索名称、SKU、颜色…"/);
});

test("website artwork repair uses a cancellable worker pipeline and keeps the original available", () => {
  assert.match(repairSource, /new Worker\(new URL\("\.\/dewrinkle\.worker\.ts", import\.meta\.url\)/);
  assert.match(repairSource, /OffscreenCanvas/);
  assert.match(repairSource, /AbortSignal/);
  assert.match(repairSource, /repairLevels/);
  assert.match(repairCoreSource, /export function dewrinklePixels/);
  assert.match(repairCoreSource, /inkProtection/);
  assert.match(repairWorkerSource, /convertToBlob/);
  assert.match(tryonPageSource, /processArtwork\(artworkSource, repairLevel/);
  assert.match(tryonPageSource, /setArtworkUrl\(URL\.createObjectURL\(blob\)\)/);
  assert.match(tryonPageSource, /originalArtworkUrl/);
  assert.match(tryonPageSource, /setRepairLevel\("original"\)/);
});

test("dewrinkle correction lifts neutral fold shadows without fading dark ink", () => {
  const width = 32;
  const height = 32;
  const source = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const wrinkle = x === 15 || x === 16 ? 120 : 230;
      const ink = x > 11 && x < 21 && y > 11 && y < 21 ? 35 : wrinkle;
      source[index] = ink;
      source[index + 1] = ink - 5;
      source[index + 2] = ink - 15;
      source[index + 3] = 255;
    }
  }
  const corrected = dewrinklePixels(source, width, height, 0.78);
  const wrinkleIndex = (4 * width + 15) * 4;
  const inkIndex = (16 * width + 16) * 4;
  assert.ok(corrected[wrinkleIndex] > source[wrinkleIndex]);
  assert.equal(corrected[inkIndex], source[inkIndex]);
  assert.equal(corrected[inkIndex + 1], source[inkIndex + 1]);
  assert.equal(corrected[inkIndex + 2], source[inkIndex + 2]);
});

test("dewrinkle correction reduces the shaded interior of a broad fold", () => {
  const width = 160;
  const height = 96;
  const source = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const distance = Math.abs(x - 80);
      const foldShadow = distance < 32 ? Math.round(50 * (1 - distance / 32)) : 0;
      const value = 232 - foldShadow;
      source[index] = value;
      source[index + 1] = value;
      source[index + 2] = value;
      source[index + 3] = 255;
    }
  }

  const corrected = dewrinklePixels(source, width, height, 0.92);
  const center = (48 * width + 80) * 4;
  const unaffected = (48 * width + 15) * 4;
  const beforeContrast = source[unaffected] - source[center];
  const afterContrast = corrected[unaffected] - corrected[center];
  assert.ok(afterContrast < beforeContrast * 0.72, `broad fold contrast should drop (${beforeContrast} -> ${afterContrast})`);
});

test("dewrinkle comparison can be dragged across the complete image and has a wrinkle demo", () => {
  assert.match(artworkPanelSource, /className="try-repair-compare-input"/);
  assert.match(artworkPanelSource, /min="0" max="100"/);
  assert.match(artworkPanelSource, /onPointerDown/);
  assert.doesNotMatch(artworkPanelSource, /try-repair-range/);
  assert.match(artworkPanelSource, /onDemoArtworkChange/);
  assert.match(tryonPageSource, /sample-ink-wrinkled-demo\.png/);
});
