# Studio homepage design QA

final result: passed

## Scope and visual truth

- Selected third concept: `output/studio-redesign/selected-reference.png` (916×1717 pixels).
- Local implementation: `http://127.0.0.1:4173/`.
- Desktop CSS viewport: 1440×900, DPR 1. Browser captures are 1425×891 usable pixels after browser scrollbar/capture bounds. Mobile: 390×844 CSS viewport.
- Reference is a generated scrollable concept, not a pixel-exact browser capture. Compare corresponding craft and daylight sections, preserving aspect ratios at 720px comparison width. Responsive desktop sections deliberately occupy one viewport; the source sections are taller relative to their width. No images were distorted to match that ratio.
- Full regional comparisons: `output/studio-redesign/comparison-craft-final.jpg`, `comparison-tryon-final.jpg`.
- Focused typography comparison: `output/studio-redesign/comparison-type-final.jpg`.
- Final screenshots: `craft-desktop-final.png`, `tryon-desktop-final.png`, `closing-desktop.png`, `craft-mobile.png`, `tryon-mobile-final.png`, `material-dialog-desktop.png`, `material-dialog-mobile.png`, `gallery-preserved.png`, all under `output/studio-redesign/`.

## Findings and iteration history

1. [P1, fixed] Native material dialog closed immediately during Strict Mode's effect replay. Ignore the queued close event when the dialog has already reopened. Retested opening, details, Escape, and navigation into the existing try-on. Dialog remains open and functional.
2. [P2, fixed] Mobile daylight crop clipped the frame's right rail. Changed the mobile image focal point to the right. `tryon-mobile-final.png` shows the complete framed work and vase, with text in a separate readable block.
3. [P2, fixed] First desktop comparison had weaker heading hierarchy and undersized process copy. Increased craft heading scale, daylight heading scale, stage names and descriptions. Recaptured and compared the final files above; no clipping or collisions at 1440×900.
4. [P2, fixed] Returning from the separately mounted try-on to a homepage anchor could leave the visitor at the hero. Mount now resolves known marketing anchors after the DOM exists.

## Required fidelity surfaces

- Typography: locally served Noto Serif SC variable subset, readable body text, two-line serif headings, restrained gold rules. Subset refreshed for the new copy and canonical material names. Hero uses its original ordered SVG strokes.
- Spacing/layout: large still photography, left-aligned copy, five equal desktop process columns, separate material shelf, compact centered closing. Mobile uses stacked copy/photography and horizontal sample scrolling without document overflow.
- Colors: near-black walnut craft, warm mineral daylight and cream paper, restrained ochre accents. Photo lighting supplies depth; no new animated blur, blend modes, or continuous effects.
- Assets: two individually generated photographs follow the selected reference and ship as WebP (82,696 + 67,330 bytes). Source PNGs remain outside public assets. Operation detail uses the existing real process atlas. Material thumbnails read existing canonical catalog records.
- Copy: selected principal headings retained. Explanatory copy describes actual functions and variable conservation needs. No invented store address, contact channel or appointment completion. Prices in the detail dialog remain per meter.

## Intentional adaptations

- The user's original hero and seven-work gallery stay in place; the gallery sits between craft and daylight sections.
- Added a compact operation photo and explanation so five tabs do something useful and each process stage remains visually specific.
- Material shelf uses the product's actual six fallback catalog records rather than inventing the mock's wood types; clicking opens real catalog details. It does not pretend the static interior photo changes its frame.
- Mobile composition stacks instead of shrinking desktop text onto a photo.

## Verification

- Runtime integrity and production build passed; no protected runtime hashes changed.
- Browser tested: process click and arrow-key selection; material opening, price/details, Escape; material CTA reaches the existing working try-on; gallery mounting, work focus, next work and Escape back to wall.
- Viewport overflow check: at 390 CSS px, document scroll width is 375px (scrollbar excluded); at 3840 CSS px, 3825px. Ink backing store remains 1333×750 at 4K.
- The 4K capture provider produced a cropped image, so that file was not used for visual acceptance. 4K geometry/pixel budget were inspected; desktop and mobile visual acceptance use valid captures above. No hardware FPS claims.
- Console review found one historical Vite HMR reload error during creation of the new stylesheet. Final reloads/builds showed no corresponding application failure; no other runtime errors appeared in the inspected log.
- Reduced-motion rules disable new transitions/animations; a physical reduced-motion browser session was not separately exercised.

## Follow-up polish

- P3: replace generated atmosphere photographs with commissioned studio photography if available later; the layout already keeps copy and controls separate from image pixels.
- No remaining actionable P0/P1/P2 findings in the inspected desktop/mobile states.

## Hero-to-craft continuity refinement — 2026-09-05

User feedback supersedes the selected concept's near-black treatment: the first two scenes must feel like one website. Replaced the craft photograph with a warm daylight/linen derivative, changed its copy and process rail to dark ink on warm paper, and reduced the desktop heading cap from 88px to 72px. Hero entrance and gallery code remain unchanged.

Compared the actual hero and updated craft side by side in `output/studio-redesign/hero-craft-continuity.jpg`: both now share warm ivory light, walnut subjects and dark text; the workbench retains its distinct purpose without a black visual break. Desktop capture: `craft-warm-desktop.png`; mobile: `craft-warm-mobile.png`. Mobile text stays on a solid paper surface with the hands/frame photograph below, without overlapping copy. This intentionally departs from the earlier dark reference according to the new feedback.

Runtime integrity and production build passed. Existing large Three.js chunk warning remains. No animation/rendering loop added; photographic asset uses WebP and lazy asynchronous decoding. This scoped visual iteration did not alter process selection or gallery behavior.
