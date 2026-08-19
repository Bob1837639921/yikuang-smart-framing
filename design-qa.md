# Design QA

- Source visual truth paths:
  - `C:\Users\zephyr\AppData\Local\Temp\codex-clipboard-5bcfba54-2674-448f-94fd-1cab241ccc25.png`
  - `C:\Users\zephyr\AppData\Local\Temp\codex-clipboard-97bea1c9-9108-4841-a73c-fe3f60749aa0.png`
- Implementation target: `http://localhost:4173/`
- Source pixels: 2210 × 218 (header crop) and 642 × 694 (process-rail crop).
- Intended CSS viewport: current Codex Desktop in-app browser desktop viewport; source density is a direct desktop capture.
- State: homepage header and framing-story process rail.
- Implementation screenshot: unavailable. The in-app browser refused localhost capture under its URL security policy after the code change.

## Full-view comparison evidence

The two source crops were opened and inspected. They show a centered, capped header surface and a narrow vertical seven-step rail. The implementation was changed to a viewport-wide header surface with content aligned to a 1760px composition and a 1600px desktop story region whose seven steps are equal-width horizontal tabs above the linked stage.

## Focused region comparison evidence

Focused implementation evidence is unavailable because browser capture was blocked. Static CSS inspection confirms the intended structural changes, but static inspection is not sufficient for visual QA.

## Findings

- [P1] Browser-rendered implementation evidence is missing.
  - Location: homepage header and `.home-story-rail`.
  - Evidence: both reference crops are available, but the revised localhost page could not be captured.
  - Impact: exact header alignment, seven-column wrapping, typography, and sticky-stage proportions cannot be visually certified.
  - Fix: refresh the local preview in the user's in-app browser and capture the revised header, story rail, and one active stage for a same-state comparison.

- [P2] Earlier stage visuals were too generic for their copy.
  - Location: `.home-story-art` stage.
  - Evidence: the prior implementation only cross-faded three broad images across seven labels.
  - Impact: measurement, mounting, spacing, and final inspection were not visually legible as distinct operations.
  - Fix: map raw/material/finished assets to the relevant stages and add operation-specific visual states for measurement, support, spacing, glazing/backing, and final inspection.

## Required fidelity surfaces

- Fonts and typography: source inspected; revised implementation not visually captured.
- Spacing and layout rhythm: source inspected; CSS now uses a full-width header and equal seven-column rail, but visual confirmation is blocked.
- Colors and visual tokens: unchanged from the existing cream, ink, and gold system; visual confirmation is blocked.
- Image quality and asset fidelity: no image assets were changed in this iteration.
- Copy and content: seven existing process labels and linked stage content are preserved.

## Comparison history

- Iteration 1: identified capped header width and narrow vertical process rail from the user-provided screenshots.
- Fixes made: full-bleed header; 1760px content alignment; 1600px story section; seven equal-width horizontal desktop steps; horizontal scrolling at narrow breakpoints.
- Post-fix visual evidence: blocked by the in-app browser URL policy.

final result: blocked
