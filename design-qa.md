# Design QA — 官网作品依次上墙与轻量聚焦

- source visual truth: `C:/Users/zephyr/.codex/generated_images/01a00afd-1c2f-7cd3-b967-530605918f11/exec-229e44d6-3366-4ef7-b8d2-99b9b1976fc6.png`
- original product screenshot: `C:/Users/zephyr/AppData/Local/Temp/codex-clipboard-59a7bc5f-b8e7-42d5-8b7b-6fed2a20bcc8.png`
- intermediate scroll screenshot: `C:/Users/zephyr/AppData/Local/Temp/codex-design-qa/oneframe-gallery-scroll/design-qa-gallery-scroll.png`
- completed wall screenshot: `C:/Users/zephyr/AppData/Local/Temp/codex-design-qa/oneframe-gallery-scroll/design-qa-gallery-final.png`
- focused-state screenshot: `C:/Users/zephyr/AppData/Local/Temp/codex-design-qa/oneframe-gallery-scroll/design-qa-gallery-focus.png`
- normalized side-by-side comparison: `C:/Users/zephyr/AppData/Local/Temp/codex-design-qa/oneframe-gallery-scroll/design-qa-gallery-comparison.png`
- CSS viewport: 1258 × 988 (captured pixels: 1243 × 976 after browser chrome exclusion)
- states: four works mounted during the automatic entrance sequence; all seven works mounted; `山河入画` focused
- final result: passed

## Full-view comparison evidence

- The chosen concept and implementation share the same warm gallery wall, salon-style two-row composition, numbered plaques, and one-work-at-a-time mounting narrative.
- The implementation intentionally omits persistent ceiling wires from the concept image. Each work instead descends and settles with `transform` and `opacity`, preserving the perceived hanging motion without adding always-painted decoration or layout animation.
- At the completed state, all seven real works fill the wall without clipping the collection mark, progress copy, skirting, floor, or frame labels.

## Focused-region comparison evidence

- Selecting a work opens a dedicated composited focus layer. The underlying wall stays fixed, so the browser does not recalculate seven `top`/`left`/`width` layouts.
- `山河入画`, its plaque copy, and previous/return/next controls all remain visible within the desktop viewport.
- The focused artwork retains its exact image ratio and transparent frame cutout. The backdrop reduces contrast without CSS blur, avoiding the previous expensive full-wall filter pass.

## Required fidelity surfaces

- Fonts and typography: the existing Chinese serif display system and compact Latin exhibit metadata remain unchanged; progress and plaques are legible at the verified desktop and 390 × 844 mobile viewports.
- Spacing and layout rhythm: the two-row wall keeps differentiated physical proportions for horizontal, square, fan, portrait, landscape, and long-scroll formats.
- Colors and visual tokens: the existing warm paper, walnut, ink, and restrained gold palette is preserved.
- Image quality and loading: the seven transparent source cutouts were transcoded from 7.69 MB of PNG to 0.41 MB of WebP (94.6% reduction), with intrinsic sizes, lazy loading, and asynchronous decoding.
- Copy and content: all seven existing titles, media types, framing treatments, sequence numbers, and focus descriptions are retained.

## Interaction and runtime checks

- The gallery is a normal 100svh section with no sticky extension or scroll-progress mapping. Once at least 72% of it is visible, it mounts works 1–7 automatically at 190 ms intervals; leaving and re-entering resets and replays the sequence so navigation never finishes the motion off-screen.
- Compact/mobile and reduced-motion modes show all works immediately, avoiding a long sticky scroll trap.
- Clicking a work exposes the focus dialog in approximately 294 ms in the local browser.
- Previous/next, return, Escape, Left Arrow, and Right Arrow behavior were verified. Opening and previous/next changes measure the selected work's real wall slot and use a 680 ms FLIP-style composited translate/scale animation to advance that exact work into the center; matching copy replays its short entrance.
- Desktop 1258 × 988 and mobile 390 × 844 were visually inspected; the mobile focus controls remain inside the viewport.
- Browser console returned no warnings or errors.
- TypeScript, production website build, Sites checks (4/4), and website memory tests (25/25) passed.

## Comparison history

1. First browser pass exposed a P1 clipping defect: `contain: paint` cut off the exhibit plaques below several frames.
2. Fix: changed work containment to `contain: layout style`, keeping layout isolation while allowing the plaques to render.
3. Second pass confirmed complete labels at intermediate and final scroll states. Focus opening stayed transform/opacity-only and no actionable P0/P1/P2 finding remained.

## Known repository baseline

- `npm run check:runtime` still reports the protected website/runtime lock as inconsistent on the freshly pulled `origin/main` baseline. No protected runtime file or lock hash was changed or bypassed for this feature.
