# Design QA — official homepage hero and header

## Evidence

- Source hero visual: `C:\Users\86159\.codex\generated_images\01a018ba-298e-7fd3-8820-1d6768d4512a\exec-0df54d93-1903-4b03-8fd2-c34a628a3820.png` (1536 × 1024).
- User navigation feedback crop: `C:\Users\86159\AppData\Local\Temp\codex-clipboard-6ee6bd37-5419-4d09-9da2-e1db56b021b8.png` (682 × 170).
- Divider/selection feedback crop: `C:\Users\86159\AppData\Local\Temp\codex-clipboard-b2177d4f-2734-4634-b108-d47f7811b4f7.png`.
- Header/hero integration feedback: the user identified the remaining top strip as a mask-like interruption; the follow-up target is a continuous hero surface with no separate header panel.
- Navigation legibility crop: `C:\Users\86159\AppData\Local\Temp\codex-clipboard-ddcc7f51-cd43-485b-9397-c26ae2a9f09a.png`; the last character in “试装体验” overlaps a dark foreground leaf.
- Navigation outline feedback: `C:\Users\86159\AppData\Local\Temp\codex-clipboard-2943aa72-25c5-42c8-adc8-847d6c4c2323.png`; the temporary high-contrast halo made the type look outlined and visually noisy.
- Navigation balance/ink direction: `C:\Users\86159\AppData\Local\Temp\codex-clipboard-8bacd0a8-8690-475a-b935-b254a3bf1991.png`; the user requested restoring centered balance and testing a real ink-brush backing with white type.
- Try-on layout feedback: `C:\Users\86159\AppData\Local\Temp\codex-clipboard-83e3811e-0038-4d23-8832-239e41625828.png`; the original three columns were too widely separated and the controls lacked a shared visual structure.
- Implementation capture: Codex in-app browser capture from `http://127.0.0.1:4173/#top` at the current desktop viewport. The browser surface did not expose a filesystem export path, so the capture was inspected inline in the task.

## Visual comparison

- Full view: the selected warm ivory wall, right-aligned walnut frame, broad left-side copy space, natural daylight, and sparse foreground leaves are preserved without stretching or cropping the framed work.
- Header focus: removed the boxed navigation treatment, stray full-width divider, persistent underline, and the header's translucent fill. The selected hero now reaches the top edge; the balanced brand/navigation layout remains unchanged and the active destination is marked by a restrained vermilion dot.
- Navigation contrast: the temporary left offset and outlined treatment were removed. A real generated dry-brush ink asset now sits directly behind the centered navigation, and warm-white type remains readable across every underlying tone without a geometric panel. The project asset was verified as `Format32bppArgb`, with corner alpha `0` and opaque ink at the center.
- Try-on workspace: the intro, live framed preview, and material controls now share one bounded work surface with tighter column proportions and consistent vertical alignment. The material controls use a distinct light-paper panel on wide screens and a two-row control rail below 1000px, preventing labels from collapsing into vertical text.
- Motion: header and links settle in on entry; links lift and draw an ink line on hover; the brand mark has a slow, subtle breathing motion; the mobile menu icon morphs and the menu enters with a short fade/slide. Reduced-motion users receive a static version.
- Responsive check: desktop navigation remains on one line at the compact desktop viewport; the existing mobile breakpoint retains the menu button and dropdown layout.

## Interaction and runtime checks

- Primary homepage CTA was verified to navigate to the try-on section.
- Navigation remains composed of native anchor links with visible focus styling, and its active state follows the selected URL hash instead of being fixed to “首页”.
- `npm run check:runtime`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- No P0, P1, or P2 visual issue remains in the inspected header/hero state.

final result: passed
