# Design QA

- source visual truth: selected yellow/cream animated framing concept, `exec-ca9ed254-71b6-4b18-98cf-92c0a0d0caea.png`
- implementation: local mobile prototype at `http://127.0.0.1:4173/`
- viewport: Product Design mobile runtime, iPhone app viewport 393 x 852 CSS px
- states checked: home, camera, edge correction, processing, editor

**Findings and history**

- P1 prior gap: photo entry did not produce an editable framing result. Fixed with a four-stage capture → correction → processing → live frame editor flow.
- P1 prior gap: no manual fallback when automatic edge detection is wrong. Fixed with four large draggable correction points, reset recognition and rotation controls.
- P2 prior gap: real camera permission cannot be demonstrated safely in a browser prototype. Fixed with a camera-view simulation and an explicit sample shutter; real local file selection follows the same correction flow.
- P2 prior gap: processing could appear instantaneous and unclear. Fixed with a short perspective-correction progress state that communicates edge correction and background removal.

**Required fidelity surfaces**

- Fonts and typography: modern Chinese sans-serif, high contrast on camera/correction states.
- Spacing/layout: large camera target, 28px drag handles, thumb-reachable actions, persistent editor preview.
- Colors/tokens: selected butter yellow/cream retained; dark capture surface increases camera legibility.
- Image quality/assets: real raster test art is used in capture, correction and preview states.
- Copy/content: task instructions are concise and stage-specific.

**Interactions tested**

- `拍照试装` opens camera view.
- Sample shutter opens the correction screen.
- Four correction controls render and are interactive; rotation/reset controls are present.
- `确认并拉正` starts the processing state.
- Processing automatically transitions to the live framing editor.
- Production build and protected runtime checks pass.
- Browser console: no errors.

**Follow-up polish**

- P3: production WeChat implementation must connect this flow to `camera`/`wx.chooseMedia`, OpenCV or equivalent perspective transform, and Canvas output.

## 2026-08-14 frame-corner pass

- source visual truth: user issue screenshot, `C:/Users/86159/AppData/Local/Temp/codex-clipboard-c7ad522d-0d9b-422b-9f51-1ffdc18bcc28.png`
- implementation capture: `test-results/frame-corner-implementation.png`
- side-by-side review: `test-results/frame-corner-qa-comparison.png`
- P1 fixed: vertical texture layers were longer than their frame rails and produced four exposed triangular spikes.
- P1 fixed: a single rail segment is now repeated without stretching, rotated for vertical rails, and clipped to four matching 45-degree mitres.
- P2 fixed: corner reference photography is no longer rendered as a square overlay; glass highlight, mat depth, and two-stage product shadow remain coherent.
- verification: React production build, protected runtime integrity check, mini-program page JavaScript syntax check, and local 3D cache tests pass.
- remaining fidelity boundary: CSS extrusion is suitable for the current front/limited-angle prototype; arbitrary close-up rotation and ornate profiles require the planned procedural WebGL mesh.

## 2026-08-14 native mini-program recheck

- The user's native screenshot exposed a remaining P1: the vertical texture strip was still hard-coded to 307px while the rendered portrait frame is 286px tall.
- Code fix: vertical strips now consume `--frame-model-height`, set to 286px for portrait and 201px for landscape.
- Static verification passed: mini-program JavaScript syntax and protected runtime integrity.
- Native visual verification was interrupted when Windows Computer Use was stopped, so the WeChat simulator could not be recompiled and captured in this pass.

## 2026-08-14 multi-layer mat designer

- source visual truth: user-supplied close-up showing a wide primary mat, narrow inner reveal and dark decorative line, `C:/Users/86159/AppData/Local/Temp/codex-clipboard-9ddf513b-e65b-43d4-b001-8e9f10d90fad.png`
- implementation capture: `test-results/multi-mat-implementation.png`
- side-by-side review: `test-results/multi-mat-design-qa.png`
- P1 fixed: the editor now supports one to three ordered mat layers instead of a single flat mat.
- P1 fixed: every layer change updates the complete framed artwork and the magnified corner preview in the same interaction.
- P2 fixed: the outer layer uses total border width while inner layers use reveal width; the decorative third layer supports 0.5 mm increments.
- P2 fixed: users can add, remove, select, reorder and change the material of an individual layer without changing the quote.
- visual QA: artwork remains visible after three nested layers; the outer cream mat, pale inner reveal and dark decorative line are legible in the live preview and corner magnifier.
- interaction QA: added layers two and three, changed the third layer from 2 mm to 2.5 mm, changed its material to charcoal, and confirmed the full preview retained three layer elements.
- verification: React production build, protected runtime integrity check and mini-program page JavaScript syntax check pass. Native mini-program rendering still requires the WeChat developer tool for a device screenshot, but the shared layer model and WXML/WXSS implementation are present.

final result: passed for the implemented multi-layer mat scope

## 2026-08-14 mat-tab width regression

- source visual truth: user screenshots showing the card-paper tab widening past the phone viewport, `C:/Users/86159/AppData/Local/Temp/codex-clipboard-7dd06f14-1e7f-476e-803b-39e4f4b0f81c.png` and `C:/Users/86159/AppData/Local/Temp/codex-clipboard-ab056324-5d9b-486d-8ecb-ea8e874399e8.png`
- implementation capture: `test-results/mat-tab-fix.png`
- side-by-side review: `test-results/mat-tab-qa.png`
- P1 fixed: the horizontal material row no longer contributes its intrinsic width to the editor grid; the drawer stays inside the calibrated phone viewport.
- P2 fixed: parent controls now have an explicit `min-width: 0`/`max-width: 100%` boundary, while only the material card rail is allowed to scroll horizontally.
- interaction QA: opened the card-paper tab from a fresh editor route and confirmed the drawer, corner preview and summary all stay within the phone bounds; the vertical control area remains scrollable.
- verification: React production build, protected runtime integrity check, mini-program JavaScript syntax check and side-by-side visual review pass.

## 2026-08-14 anime controls and reset pass

- source visual truth: user control references, including `C:/Users/zephyr/AppData/Local/Temp/codex-clipboard-14977787-8978-4f66-a355-fe58bcd74846.png`
- implementation screenshot: `C:/Users/zephyr/Documents/Codex/2026-08-12/x/work/oneframe-mobile/.product-design-audit/02-revised-mat.png`
- focused state: editor route with 卡纸 tab, live corner preview, layer chips and material rail visible.
- P2 fixed: the mat editor now reserves a scrollbar gutter and uses a dedicated narrow thumb so scrolling no longer covers labels or cards.
- P2 fixed: buttons, chips, switches, material cards and bottom tabs share a short spring press/release motion and a clear yellow selected treatment.
- P2 fixed: reset clears pointer/pinch state, restores the initial `-4° / -5°` rotation and `100%` zoom, and gives a short confirmation pulse.
- interaction QA: switched 画框 / 卡纸 tabs, added a second mat layer, changed material, dragged the frame, pressed 复位, and verified the computed transform returned to the initial transform.
- verification: `npm run check:runtime`, `npm run build`, `npm run test:sites`, and browser console checks pass.

final result: passed

## 2026-08-15 portrait-first 3D stage

- source visual truth: selected Product Design concept 3, `C:/Users/zephyr/.codex/generated_images/01a000d4-a3c6-75b1-90f5-cc0d4dfd0ccb/exec-4e0b2e51-b64e-411b-9b35-26eeba3ae0d3.png`
- implementation: native WeChat Mini Program editor in `miniprogram/pages/index/index.wxml` and `miniprogram/pages/index/index.wxss`
- intended viewport: portrait mobile app viewport; default state keeps the complete 3D frame as the hero, with a compact mat summary rail and an expanded detail sheet
- implementation screenshot: unavailable; WeChat Developer Tools is not installed in this environment, so the native simulator cannot be opened or captured
- static verification: mini-program JavaScript syntax, protected runtime integrity, 3D service tests, Sites package tests, and production build all pass
- comparison status: blocked because the native rendered implementation could not be captured for the required source/implementation comparison

final result: blocked

## 2026-08-15 frame option copy regression

- source visual truth: `C:/Users/zephyr/AppData/Local/Temp/codex-clipboard-3cff51b4-4f80-4fab-9450-1a27cd38fe55.png`
- implementation: native WeChat Mini Program frame picker in `miniprogram/pages/index/index.wxml` and `miniprogram/pages/index/index.wxss`
- root cause fixed: the legacy direct-child `view` thumbnail rule also styled `.frame-option-copy`, turning the name/price wrapper into a second bordered swatch and clipping both labels
- verified state: WeChat Developer Tools, iPhone 12/13 simulator, editor route, 画框 tab
- visual result: every material card now has one corner swatch plus readable material name and `¥X/米`; the active check remains visible without covering the copy
- verification: protected runtime integrity, TypeScript, production build, frame 3D service tests, and Sites packaging tests pass

final result: passed

## 2026-08-15 frame-material swatch book

- source visual truth: selected revised Product Design option 2, `C:/Users/zephyr/.codex/generated_images/01a000d4-a3c6-75b1-90f5-cc0d4dfd0ccb/exec-5bdb13b4-5365-41f9-bd0b-f21abd9fe49a.png`
- implementation: native WeChat Mini Program material library in `miniprogram/pages/index/index.wxml`, `index.wxss`, and `index.js`
- intended viewport/state: portrait material-library route with the 推荐 filter active, 原木时光 selected, two-column corner-sample grid, and fixed 3D-preview action bar
- source assets: six independent photographic 45-degree corner samples in `miniprogram/assets/frame-catalog/`, compressed to 237 KB total for the mini-program package
- interaction implementation: category filtering, card selection without premature navigation, explicit 3D-preview CTA, selected-state animation, and fallback rendering for admin-uploaded materials
- pricing implementation: canonical `pricePerMeter`, explicit `¥X/米` catalog/editor display, required admin “框料单价（元/米）” validation, and perimeter-derived final frame cost
- static verification: mini-program JavaScript syntax, catalog interaction harness, WXSS brace balance, protected runtime integrity, 3D service tests, and `git diff --check` pass
- implementation screenshot: intentionally not captured because the user asked that the WeChat Developer Tools not be operated for page testing
- comparison status: blocked from visual side-by-side QA by the requested no-simulator-testing constraint

final result: blocked
