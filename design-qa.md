# Design QA

- User issue screenshot: `C:\Users\86159\AppData\Local\Temp\codex-clipboard-973da1f8-8390-4e11-a5fc-d41e360a6d85.png`
- Desktop implementation: `D:\桌面\work\project\yikuang-smart-framing\tmp\audits\cta-signature\05-poem-final-wide.png`
- Mobile menu implementation: `D:\桌面\work\project\yikuang-smart-framing\tmp\audits\cta-signature\03-mobile-menu.png`
- Desktop viewport and pixels: 1618 × 682 CSS px at 1:1 capture density.
- Mobile viewport and pixels: 390 × 844 CSS px at 1:1 capture density.
- State: homepage hero after entry animation; mobile navigation open.

## Full-view comparison evidence

The revised desktop hero removes the duplicate header try-on control and keeps one primary try-on action in the hero. The former low-contrast functional label at the lower right is replaced by a paper-white poetic inscription containing the full store name. The composition, artwork, navigation links, hero copy, and primary conversion path otherwise remain unchanged.

## Focused region comparison evidence

The final full-width capture clearly shows the requested right-side detail: `正好书画社 / 一框纳山河` in two equal five-character vertical columns. The plaque measures about 71 × 110px, uses 14px Noto Serif SC, 700/600 weights, 94% paper opacity, and dark ink/ochre text. The complete detail is readable without depending on the background image for contrast.

## Findings

- No actionable P0/P1/P2 findings remain for the duplicate above-fold CTA or right-side inscription.
- [P3] The inscription is intentionally hidden below 720px because the mobile hero already contains title, copy, CTA, story link, and artwork in a narrow composition.

## Required fidelity surfaces

- Fonts and typography: the inscription now uses the established serif family at 14px with deliberate two-column vertical rhythm; the hero title and remaining CTA are unchanged.
- Spacing and layout rhythm: removing the header CTA gives navigation even spacing. The inscription stays aligned to the wide hero composition and does not overlap the frame or scroll cue.
- Colors and visual tokens: paper, ink, and ochre remain within the existing palette, with sufficient opaque backing to stay readable across the split image/background boundary.
- Image quality and asset fidelity: no image, crop, overlay, or logo changes.
- Copy and content: the inscription is now `正好书画社，一框纳山河`; the full brand name is present and the poetic line directly references framing.

## Interaction and runtime checks

- Visible above-fold try-on action count: one.
- Remaining hero action navigates to `#try-on`: passed.
- Desktop and mobile horizontal overflow: none.
- Mobile navigation contains no duplicate try-on action: passed.
- Browser console errors: none.
- Production build and protected runtime integrity check: passed.

## Comparison history

1. Earlier findings: [P1] the lower-right text was too transparent and crossed two backgrounds; [P2] header and hero repeated the same try-on action in one viewport.
2. First fix: removed the header CTA and placed both vertical lines on an opaque paper plaque with stronger type.
3. Content refinement: replaced the functional phrase with the balanced five-character pairing `正好书画社 / 一框纳山河`, increased it to 14px, and retained a complete accessible label.
4. Post-fix evidence: 1618 × 682 capture shows one hero CTA and a fully readable inscription; 390px capture confirms the decorative plaque is removed and navigation remains uncluttered.

final result: passed
