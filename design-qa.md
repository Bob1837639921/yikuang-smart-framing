# Design QA — 正好书画社首页

## Source visual truth

- Source: `C:\Users\86159\.codex\generated_images\01a018ba-298e-7fd3-8820-1d6768d4512a\exec-06afc51b-4229-42e2-b650-770670de4ef1.png`
- Source pixels: 1536 × 1024.
- Selected state: the light ink-gallery homepage concept with the framed landscape centered in a misty water space.

## Implementation evidence

- Desktop first viewport: `qa-implementation-home-1440.png`.
- Scroll-story viewport: `qa-implementation-home-story.png`.
- Materials viewport: `qa-implementation-home-materials.png`.
- Experience/studio viewport: `qa-implementation-home-studio.png`.
- Portal transition state: `qa-implementation-home-portal.png`.
- Mobile first viewport: `qa-implementation-home-mobile.png`.
- Water-ripple interaction state: `qa-implementation-home-ripple.png` (desktop) and `qa-implementation-home-ripple-mobile.png` (mobile).
- Hero entrance states: `qa-implementation-home-entry-early.png`, `qa-implementation-home-entry-final.png`, plus mobile early/final captures.
- Story scroll theatre states: `qa-story-scroll-initial.png`, `qa-story-scroll-middle.png`, `qa-story-scroll-final.png`, `qa-story-mobile.png`, and `qa-story-mobile-chapter3.png`.
- Side-by-side source/implementation comparison: `qa-comparison-home.png`.
- Desktop CSS viewport: 1440 × 1024; browser capture pixels: 1425 × 1013 because of the vertical scrollbar.
- Mobile CSS viewport: 390 × 844.
- Source and implementation were normalized to a common 768px comparison height in `qa-comparison-home.png`.

## State and interaction checks

- Initial desktop homepage at `/`, scroll position 0.
- Pointer movement changes the hero artwork transform for a restrained parallax response.
- On first entry, the kicker fades in, the three hero title columns reveal from the side in sequence, then the description and actions settle in underneath; the mobile layout keeps the same stagger without the vertical writing mode.
- Desktop story scroll pins the stage while progress moves through three chapters; the art layer crossfades from ink scene to frame/material macro, and the active chapter can also be reached by clicking its tab.
- Mobile story removes the long sticky scroll, keeps the chapter rail horizontally scrollable, and switches the same stage through the active tab without horizontal page overflow.
- Story tabs switch between all three narrative chapters and update the active progress line.
- Header and material-story anchors scroll to the correct sections.
- Primary “进入试装空间” CTA opens a full-screen portal transition; close and “先看体验流程” actions work.
- Water surface responds to a desktop click or mobile tap in the lower hero: an impact ripple expands through three soft rings and fades after roughly 1.5s; ambient rings and a low glimmer continue breathing underneath.
- The permanent oversized gold ring treatment was removed; the water plane now uses a low-contrast reflection, while the brighter ripple exists only during the short interaction state.
- Mobile menu opens and closes at 390px; desktop navigation remains inline.
- Browser console contained no error-level entries after desktop and mobile checks.

## Comparison history

### Pass 1

- Finding: desktop headline was horizontal while the selected reference uses a vertical editorial title treatment.
- Fix: changed the desktop hero headline to three vertical writing-mode columns and preserved a horizontal layout below 720px.
- Evidence after fix: `qa-comparison-home.png`, `qa-implementation-home-1440.png`.

### Pass 2

- Finding: story section had a static tab list and copy panel, so the brand narrative stopped before the material detail could be felt.
- Fix: introduced a sticky scroll theatre on desktop, a progress ink rail, three chapter-driven image/mat/glass layers, and a mobile tabbed fallback.
- Evidence after fix: `qa-story-scroll-initial.png`, `qa-story-scroll-middle.png`, `qa-story-scroll-final.png`, and `qa-story-mobile-chapter3.png`.

## Required fidelity surfaces

- Fonts and typography: serif display hierarchy, compact sans-serif labels, vertical desktop title, responsive mobile fallback, and visible focus outlines are present.
- Spacing and layout rhythm: large hero stage, restrained left copy column, full-bleed artwork, generous section intervals, and compact editorial rails match the source direction.
- Colors and visual tokens: cream, fog gray, walnut, ink charcoal, and signature gold/yellow are centralized in homepage tokens.
- Image quality and asset fidelity: hero and material imagery are raster assets generated for this visual direction; the supplied ink artwork identity is preserved inside the frame scene. No placeholder image is used.
- Copy and content: storefront is consistently branded as “正好书画社”; “一框智能装裱” is treated as the service signature.

## Residual polish notes

- The clean hero asset intentionally keeps more negative space on the left than the selected mock, so editable copy remains readable and the page works responsively.
- The homepage CTA opens a branded handoff layer; the full web try-on workspace remains a separate next page by design.

final result: passed
