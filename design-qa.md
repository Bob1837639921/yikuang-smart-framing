# Selected paper homepage QA

final result: passed

Source: `output/studio-redesign/paper-selected-reference.png`, user-selected first design.

Compared source and final desktop captures together in `paper-compare-hero.jpg` and `paper-compare-wall.jpg`. Additional inspected states: `paper-craft-desktop.png`, `paper-tryon-desktop.png`, `paper-hero-mobile.png`, `paper-wall-mobile.png` in the same output directory.

Fixed during comparison: hero title lacked visual weight (increased responsive scale and recaptured); original gold gallery room and permanent labels diverged from reference (replaced with neutral continuous plaster/low walnut ledge, rebalanced seven slots, tightened contact shadows and reveal labels only on hover/focus). Final wall retains all actual customer case pixels and aspect ratios, with empty background photography independent of case count.

Intentional differences: existing ordered SVG stroke glyphs retained for the working writing entrance instead of copying raster lettering; canonical material names and prices used; process has five stages with explanatory text rather than contradictory seven-stage caption in reference. Mobile stacks content and displays all works immediately. Reference imagery is recreated atmosphere photography, not an exact original-photo duplicate.

Verified browser interactions: process selection updates panel; artwork focus and return to wall; material modal shows canonical price/details and closes; upload CTA reaches original framing workspace. Desktop and mobile screenshots inspected, no console errors in final tab. Runtime integrity and production build pass (existing lazy Three.js chunk size warning remains). No protected runtime modifications. No new continuous animation or full-screen filter added. Original gallery transition code unchanged.

P3: commissioned imagery and custom authored calligraphy could further match reference texture. No remaining actionable P0/P1/P2 in inspected states.
