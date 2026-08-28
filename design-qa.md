# Design QA — 官网七件作品展墙与原位聚焦

- source visual truth: `C:/Users/86159/AppData/Local/Temp/codex-clipboard-4a763175-7ccb-467e-93a5-2ef7ce92e27c.png`
- implementation screenshot: `D:/桌面/work/project/yikuang-smart-framing/qa-gallery-wall-final.png`
- focused-state screenshot: `D:/桌面/work/project/yikuang-smart-framing/qa-gallery-focus-final.png`
- normalized comparison: `D:/桌面/work/project/yikuang-smart-framing/qa-gallery-comparison.png`
- source pixels: 1536 × 867
- implementation pixels: 1280 × 720
- CSS viewport: 1280 × 720
- device pixel ratio: browser-native capture; source was aspect-fit/cropped to 1280 × 720 only for comparison
- state: default seven-work wall, plus selected portrait work focus state
- final result: passed

## Full-view comparison evidence

- The source used one dominant work with cropped side works and carousel controls. The implementation intentionally preserves the same warm exhibition hall, track-light direction, wall tone, skirting and floor while replacing the carousel with all seven published works on one continuous wall.
- Every work keeps its real frame photograph, glazing reflection, transparent cutout and aspect ratio. Wide, landscape and portrait formats now read as intentionally different physical sizes instead of equal card slots.
- The seven-work composition fills the primary wall without covering the track lights, side-room openings or floor, and the wall remains fixed during all interactions.

## Focused-region comparison evidence

- Selecting a wall-mounted work moves that same element to the center; six surrounding works remain faintly visible in their original spatial positions.
- The selected work, descriptive plaque and previous/return/next controls remain inside the 1280 × 720 viewport without clipping.
- Wide and portrait works were both inspected. The portrait work measured 384 × 388 CSS px at x=440, y=73; its 358 × 177 copy panel remained separate at x=63, y=496.
- A focused keyboard outline remains visible, but was reduced from the global 2px treatment to a restrained 1px gold line with a 5px offset.

## Required fidelity surfaces

- Fonts and typography: existing Noto Serif SC and Inter/PingFang hierarchy is preserved. Wall plaques use 12px titles with smaller exhibit metadata; focused title and body copy remain readable.
- Spacing and layout rhythm: two-row salon composition maintains even breathing room around seven distinct frame proportions. Labels sit below frames and the focused detail/actions anchor opposite lower corners.
- Colors and visual tokens: existing warm paper, dark ink and restrained gold accent tokens are unchanged. Recessed works use opacity and saturation reduction instead of new color treatments.
- Image quality and asset fidelity: only existing verified RGBA case cutouts are used. No work, frame, seal, glazing reflection or artwork content was regenerated.
- Copy and content: all seven existing titles, media types, framing treatments, descriptions and sequence numbers are retained.

## Interaction and runtime checks

- Clicking any of seven works enters focused viewing.
- Previous and next controls update the selected work and copy atomically.
- “返回整面展墙” restores all seven works.
- Escape exits focused viewing; Left/Right Arrow changes focused works.
- Scroll snapping still places the exhibition section at the viewport top.
- Browser console contained no errors; only Vite connection and React DevTools informational messages were present.

## Comparison history

1. Initial implementation: default wall and wide-work focus state rendered correctly. A P2 polish issue remained because the global focus outline read as an overly strong selection box.
2. Fix: added a gallery-specific 1px semi-transparent gold focus treatment with a smaller offset.
3. Post-fix evidence: `qa-gallery-focus-final.png` confirms the outline is restrained while keyboard focus remains visible. No actionable P0/P1/P2 findings remain.

## Follow-up polish

- P3: After user review, individual wall slots can be tuned a few percent for preferred curatorial balance without changing the interaction model.
