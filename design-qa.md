# Design QA — 官网作品展览长廊与右侧展签

- final result: passed
- reference source: `C:/Users/86159/AppData/Local/Temp/codex-clipboard-e12bcec8-403b-40cd-a338-df3ae5386bb1.png`
- focused control source: `C:/Users/86159/AppData/Local/Temp/codex-clipboard-30412986-b328-42f8-9384-edb4590d07bc.png`
- implementation: `website/src/site/HomePage.tsx`, `website/src/site/homepage.css`, `website/public/assets/home-gallery-hall-v1.png`, `website/public/assets/cases/cutouts/`
- implementation screenshot: `.codex-design-qa/gallery-right-control-final.png`
- comparison screenshot: `.codex-design-qa/gallery-right-control-comparison.png`
- primary viewport: 1440 × 900
- responsive viewport: 390 × 844
- verified state: default case 06 / 07, “山河入画”

## Visual comparison

- Central work is presented as a real framed object on one continuous warm exhibition wall.
- The wall now belongs to a complete gallery interior with track lighting, side-room depth, walnut skirting and a limestone floor.
- Source-photo wall rectangles are removed with seven tightly extracted 32-bit RGBA PNG frame assets; their transparent safety margin is preserved, while frame, mat, artwork, reflection and physical proportions remain intact.
- The showcase references only the verified `cases/cutouts/` assets. The earlier `gallery-ready/` RGB exports are not used because their checkerboard preview was baked into the pixels, not an alpha channel.
- Work 05 uses a rounded-silhouette alpha cleanup so the pale wall residue at the four outer corners is transparent; the original glazing reflection and interior mat remain intact. Work 06 now loads the owner's exact original RGBA file without pixel-level recropping; CSS positions its transparent canvas and applies a `-0.52deg` counter-rotation to neutralize the photographed slope.
- The hall uses a cleaned wall plate with the generated square-like wall texture smoothed only inside the central exhibition plane. Ceiling track, side-room depth, skirting and floor remain unchanged.
- Glass reflections remain visible as part of the photographed finished object; only the surrounding wall/background is transparent.
- Each work has an independent leveling correction, preventing slightly tilted source photos from hanging crooked in the gallery.
- The mountain long-scroll keeps the owner-supplied 1448 × 1086 transparent canvas unchanged; CSS derives the visible 2.7421 frame slot from its alpha bounds and counter-rotates it by `-0.52deg` so the displayed frame reads level.
- CSS adds restrained animated wall-light breathing, glass shimmer and contact shadows on top of the photographic hall backdrop. Dragging moves only the framed works; the exhibition hall background is locked in place.
- All seven selected gallery works now use the approved prepared cutouts from `website/public/assets/cases/cutouts/`; baked checkerboard margins are cropped outside the physical frame while original glass reflections remain intact.
- Track-light pools are aligned to the wall, with separate near-contact and longer falloff shadows so each frame reads as mounted rather than pasted over the hall image.
- Adjacent works are partially visible and recessed at different vertical positions, creating corridor depth instead of a card carousel.
- Title, media type and framing specification sit beneath the selected work; the count and controls remain on the right wall.
- Exhibition labels, captions, count, navigation controls and index use a strengthened readable type scale; wide and portrait captions receive independent vertical placement so text no longer collides with the frame or skirting.
- The restrained three-item floor index mirrors the reference hierarchy without auto-advance.

## Interaction and accessibility

- Previous/next buttons switch works and preserve the active count/title.
- Pointer drag switches works after the horizontal threshold; controls are excluded from drag capture.
- The right-side control is now a compact exhibition placard: it shows the current/total count plus the actual previous and next work titles, so navigation no longer reads as two anonymous utility buttons.
- Real buttons and tabs retain keyboard semantics and accessible labels.
- Portrait, landscape and wide works use separate physical display widths.
- Mobile layout was checked at 390 × 844 and remains readable without horizontal overflow.
- Reduced-motion behavior remains governed by the existing homepage media query.
- The pointer ink trail clears and pauses inside the exhibition corridor, so decorative strokes cannot cross finished works.

## Runtime checks

- Browser console warnings/errors: none.
- All seven work states were visually checked together in `.codex-design-qa/gallery-all-states.png`.
- `npm run check:runtime`: passed.
- `npm run build`: passed (existing Three.js chunk-size advisory only).

## Focused comparison history — 2026-08-27

- Source pixels: 1826 × 622. Implementation pixels: 1265 × 712. The focused right-control crops were normalized to a shared 360px comparison height in `.codex-design-qa/gallery-right-control-comparison.png`; density is 1× CSS pixels in both captures.
- State: case 06 / 07, “山河入画”; desktop exhibition corridor.
- Earlier P2 finding: the narrow vertical control exposed only `06 / 07` and generic `前一件 / 后一件`, leaving excessive empty space and no preview of where either action leads.
- Fix: converted only that control into a bordered wall placard with a compact count header and two titled navigation rows. The artwork, caption, gallery label, background lighting, depth treatment and three-item floor index were restored unchanged after scope correction.
- Post-fix evidence: the control hierarchy and target titles are readable in the focused comparison; previous/next clicks update the active work and surrounding titles. No focused typography, spacing, color, image-quality, or copy P0/P1/P2 issues remain.
- Background-drag regression: removed the `--gallery-parallax` binding and fixed the hall image at `background-position: center`; the inline drag state now contains only `--gallery-drag`.
- Focused region comparison was required because the full-view screenshots used different desktop viewport sizes and the requested change was isolated to the right wall control.
- final result: passed
