# 一框智能装裱项目指南

## Confirmed Product Direction

- The target product is a WeChat Mini Program, not a generic website.
- The selected visual direction is a premium yellow-and-cream original anime world with a living frame character.
- Do not use a conventional bottom tab bar. Navigation is represented by animated frame-corner objects orbiting the hero.
- The main conversion action is photo/upload framing preview; artwork showcase and frame-material showcase are supporting destinations.
- Buttons should feel alive through rebound, corner-snapping, floating, and portal-style transitions.
- Mat design supports up to three ordered layers. The outer layer edits total border width; inner layers edit their visible reveal. Changes must update both the complete framed artwork and a magnified corner preview immediately.
- Mat materials do not affect the quoted price. Store thickness only to render visible depth and edge shadow.

## Workspace and preview instructions

The repository deliberately contains two separate products: `miniprogram/` is the native WeChat Mini Program and `website/` is the official React website. The old browser-based phone mock/simulation has been removed. Never add mini-program business screens back into the website; the website may explain the product and link users to the native app, but it is not a second mini-program implementation.

In Codex Desktop, run the local website server yourself and provide the clickable local preview URL. Do not deploy to Sites unless the user explicitly asks to share, publish, or deploy. Do not give the user server-start instructions when you can run it.

Before planning or implementing a mobile-app change, read this `AGENTS.md` in full. It is the source of truth for the native mini-program and shared tooling guidance.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

## Editing boundary and checks

- Build official website UI in `website/src/`; build native mini-program UI only in `miniprogram/`.
- Keep the website entrypoint conventional React (`website/src/App.tsx`, `website/src/main.tsx`, and `website/src/site/`). It must not import device frames, simulated keyboards, or mini-program page flows.
- The native mini-program assets and pages are independent from website assets. Do not reference `miniprogram/` files from website code or vice versa.
- Treat `website/src/App.tsx`, `website/src/main.tsx`, `website/src/styles.css`, `vite.config.ts`, `worker/index.js`, and `scripts/prepare-sites-build.mjs` as protected shared website/runtime files. For an explicit website runtime change, update the affected lock hashes only after verifying the new runtime behavior.
- Run `npm run check:runtime` before preview or handoff. If it fails, restore the protected website/runtime files instead of weakening or bypassing the check.
- `npm run build` builds the React website and prepares the static Cloudflare Worker output required by Sites. Before a Sites handoff, confirm `dist/client/index.html`, `dist/server/index.js`, `dist/.openai/hosting.json`, and source `.openai/hosting.json` exist, then run `npm run test:sites`.

## Durable Prototype Decisions

- The public-facing store and website brand name is “正好书画社”. “一框智能装裱” is the core product capability rather than the storefront name. The official website may use bolder, more cinematic web-native effects and freer spatial storytelling while maintaining a premium feel.
- The official website may provide its own web-native framing try-on experience for uploading artwork, choosing frame and mat materials, and previewing the result. Design this as a desktop/responsive web interaction rather than copying native mini-program screens, navigation, or page structure.
- The website try-on preview uses real WebGL frame geometry rather than CSS pseudo-3D: four independently textured extruded rails terminate in matching 45-degree mitres around flat artwork, layered mats, glass, lighting, and cast shadow.
- The root is a two-app workspace: `miniprogram/` is the WeChat Mini Program and `website/` is the official React website/preview. Keep their entrypoints and assets separate; shared generation services and repository tooling stay at the root.
- The WeChat frame preview must use the native 2D Canvas projection renderer for frame depth. Nested CSS 3D faces are flattened by the mini-program view layer and must not be used as the production 3D path.
- The WeChat mini-program uses `miniprogram/components/common-header` for every screen header and back action so navigation spacing and icon treatment stay consistent.
- Frame materials must become data-driven records managed outside the page code. The mini-program should consume one canonical material schema for catalog cards, swatches, pricing, and frame-preview assets; an admin workflow will own uploads, asset processing, publishing, and archival.
- The canonical frame geometry includes an admin-managed `sideWidthMm` preview field in addition to measured `depthMm`; Canvas uses `sideWidthMm` for visible extrusion width and falls back to `depthMm` for older records.
- Frame material prices are quoted per linear meter. Admin material creation must require a validated “框料单价（元/米）” field in the canonical material record. Catalog cards and selection summaries display it explicitly as “¥X/米”; final frame cost is derived from the required rail length for the entered artwork size rather than treating the catalog price as a per-item total.
- The 3D direction is frame-only: users rotate a realistic extruded frame with visible side depth, mat and glass, while the artwork remains a flat texture. The local generator caches a GLB scene by artwork/frame/config fingerprint so later use reuses the processed result.
- Admin material creation must keep appearance and geometry inputs separate: collect a front texture, an independent side texture, and a standardized cross-section/profile reference, plus manually entered width, depth, visible side width, inner lip, bevel, material type, profile type, and maximum profile relief. Front and side images control color/roughness only; the cross-section drives the large-scale surface contour and must never be reused as a visible texture. Miter-corner and carved-detail uploads are not part of the current configuration flow. A ruler is for the administrator's measurement; it is not an automatic size-recognition step. Frame color is derived from the texture uploads, so manual tone/edge color fields are not part of the configuration flow.
- Generated frame previews must keep the visual roles of the uploaded assets separate: front texture maps to the front-facing bars, side depth uses a controlled bevel/shadow treatment, and miter-corner imagery is reserved for the four corners. Do not stretch the front texture across extrusion faces, because it produces visibly incorrect grain direction and side seams.
- Frame-material administration uses one canonical record and produces channel-specific derivatives from the three distinct inputs. The website receives oriented rail textures, generated micro-height/detail maps, independent side texture, extracted profile points, and PBR tuning; the mini-program receives compressed front/side textures plus simplified profile points, shared geometry, and price fields for native Canvas. Local prototypes may export this bundle, while production should publish it through one material API and object storage rather than sharing browser or WeChat local caches.
- Frame preview proportions must be derived from the entered artwork size and profile width instead of a fixed 2:3 placeholder. The preview must expose button zoom plus touch pinch zoom without stealing the drag-to-rotate gesture.
- The frame Canvas treats artwork width/height as the clear opening dimensions: frame width expands the outer rectangle proportionally, measured depth controls the physical back plane, visible side width tunes the exposed side reference, and inner lip/bevel/profile settings affect the opening and edge treatment.
- The acceptance target for finished framing is a believable 70-80% real-product impression: coherent frame width/depth, continuous material grain, mitered joints, mat, glass highlight, lighting, and cast shadow. A corner reference photo must never be pasted onto all four corners as a visible overlay; accurate corners come from procedural or authored mesh geometry, while reference photos only guide texture and profile generation.
- A front frame-material upload represents one repeatable rail segment. Tile it at its natural aspect ratio along each rail; rotate the texture direction by 90 degrees for vertical rails, and terminate all four rails with matching 45-degree mitres. Never stretch one segment across the full rail length.
- Mat-board materials are also data-driven and admin-managed. A mat requires one front texture image plus name, base color, thickness, default border width, and publish state. Repeat the texture at its natural scale inside the mat area; mats do not require side, corner, or 3D-profile inputs and do not affect pricing. Thickness may be used only for visible preview layering.
- Interactive controls should feel like part of the anime world: buttons, tags, switches, material cards, and editor tabs use short spring press/release motion and a clear yellow selected state. The editor's bottom tabs animate their active highlight when switching.
- The mat editor reserves a scrollbar gutter so scrolling never covers cards or labels. Layer chips, material selection, width controls, the corner magnifier, and the complete frame preview stay synchronized immediately.
- The 3D preview's reset action must restore the initial rotation and zoom and clear any active pointer/pinch gesture state before the next interaction.
- Keep frame geometry metadata inline with the live-preview label so the artwork gets the largest possible stage; keep only the zoom readout and reset action around the preview because wheel and pinch already handle zooming.
- The mat corner magnifier is an active layer selector: tapping a visible mat edge selects that layer, while tapping the artwork center cycles through available layers; the mat toggle stays aligned to the trailing edge of its card.
- The collapsed mat rail must remain actionable: show a compact corner magnifier in the collapsed state using the same active-layer model as the expanded inspector, so tapping a visible mat edge selects that layer without opening the sheet.
- Collapsed and expanded mat corner previews must use the exact same nested layer markup and visual rules; the collapsed state must preserve the preview's working dimensions and must not override layer insets or the active highlight.
- Keep the compact corner preview at the expanded preview's working height and give every layer a fixed-size transparent hit zone independent of its visible thickness, so thin inner layers remain directly selectable on short screens.
- Keep the shared mat corner preview in `miniprogram/components/mat-corner-preview`; both editor states should pass the same layer data and emit the same cycle/layer-select events instead of maintaining duplicate preview markup.
- Mat layer order is system-defined from the frame toward the artwork; the editor only selects an existing layer and edits its material/reveal width, with no manual “move inward/outward” control.
- Keep common headers on a stable three-zone grid (back / centered title / step badge); render step values as a labeled progress badge and align editor metadata as left status / centered geometry / right artwork.
- The mat layer toolbar must reserve the add-layer and remove-layer columns even when only one action is rendered, so `移除` never collapses to a single visible character.
- Mat preview geometry must normalize cumulative reveals to the fixed preview viewport and reserve a visible minimum for every configured layer, even when a wider inner layer is selected; material thickness around 3mm must render as visible edge depth and shadow in the frame preview.
- Mat thickness should read as restrained paper-board side faces (light bevel on the upper/left edges and darker cut faces on the lower/right edges) that become apparent in oblique rotation; avoid stacking thick borders that make a front-facing mat look like a raised plastic frame.
- The artwork opening must remain above the full-panel mat layers in the 3D stacking order; mat depth may shape the visible border and side faces but must never cover the artwork texture.
- The editor's mat tab uses an expanded bottom-sheet snap point for layer, material, and width editing; it can be collapsed to return more space to the artwork preview.
- The editor's default state is preview-first: portrait and vertical 3D framed artwork must remain the dominant, fully visible hero. Keep the mat editor as a low summary rail by default and defer layer, material, corner-preview, and width details to an expanded sheet.
- The 3D preview canvas exclusively owns drag, pinch, and wheel gestures. It must never navigate to artwork selection; artwork selection is only triggered from the explicit compact “换作品” control with an isolated hit area.
- Each frame option card contains exactly one material/corner swatch. The adjacent area is plain readable copy for the frame name and `¥X/米`; reset legacy direct-child `view` thumbnail rules on that copy wrapper so it never renders as a second framed box or clips the labels.

## Native mini-program interaction rules

- Use `miniprogram/components/common-header` for every native page header and back action; do not create a second header style per page.
- Keep the native Canvas preview as the only production 3D path. Drag rotates, pinch/wheel zooms where supported, and reset clears the active gesture state.
- Keep upload, material, mat, and admin data in the canonical records already used by the mini-program. Do not duplicate those records in the website.
- Validate native page interactions in the WeChat developer tools. The website has no simulated phone shell, simulated keyboard, `FlowStack`, `MobileScroll`, or browser mini-program regression suite.

## Website interaction rules

- Keep the website a conventional responsive React site. It may contain marketing interactions such as anchored navigation, responsive menus, and links into the native mini-program, but it must not reproduce native mini-program screens.
- The website try-on experience is a dedicated, desktop-first framing workspace rather than a phone mock. Keep its route, page components, framing domain model, pricing logic, and responsive controls separated from the marketing homepage; on narrow screens preserve preview-first ordering.
- Website 3D dragging follows a consistent “press the grabbed edge away” model on both axes: dragging the upper edge upward tilts it back just as dragging the left edge left tilts it back. Normalize horizontal and vertical angular sensitivity to the preview's short side, and constrain pitch before the frame flips over.
- Keep the website WebGL renderer, camera, lighting, and animation loop alive while try-on options change. Preload every texture for the next frame scene and atomically swap complete scene content only after it is ready, leaving the previous frame visible during preparation so material, mat, artwork, and dimension changes never flash a black intermediate state.
- Website 3D shadows represent the complete opaque framed object rather than only the four rails. Derive the turntable preview's soft contact shadow from the fully composited transparent WebGL canvas silhouette so artwork, mats, and frame form one filled shape; keep it visibly offset but restrained, and do not reintroduce a fixed wall receiver that stretches into clipped hard polygons during rotation.
- Keep website controls keyboard-accessible and preserve visible focus states. Avoid browser-native image dragging for decorative images.
- The website's framing story should expose seven customer-facing stages: condition check, measurement, frame and mat selection, mounting to a support, mat or spacer isolation, glazing/backing/hardware assembly, then final inspection and hanging. Present conservation details as guidance that can vary by artwork rather than as a universal recipe.
- Keep the website hero composition stable across desktop aspect ratios: show the complete framed artwork with `object-fit: contain`, use a subdued cover-filled backdrop to preserve a full-bleed atmosphere, and reserve `object-fit: cover` for the mobile hero where intentional cropping is acceptable.
- Keep the official-site header background full-bleed across the viewport while aligning its brand and navigation content to the wide hero composition. Present the seven framing-story stages as an equal-width horizontal process rail above the large linked demonstration stage on desktop; use horizontal scrolling only at narrower breakpoints.
- Keep each framing-story stage visually specific: condition and measurement use the raw artwork, frame/mat selection and spacing use the material close-up, mounting uses a visible support boundary, glazing/backing uses the finished framed scene with a glass treatment, and final inspection uses a finished scene with a completion state. Stage labels may reinforce the operation but must not substitute for the corresponding visual state.
