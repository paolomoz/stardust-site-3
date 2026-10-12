# Mapping brief — stardust.style home (`index`) → tryprofound.com vocabulary

Content model: `content-model/index/content-model.json` (14 captured slots, 6625 scope chars, 2 images).
Donor vocabulary: `donor-modules.md` (M1–M22). Tokens: `donor-tokens.json` (navy #081e3d / #F4F2EC override).

## Slot → module

| # | Content (anatomy) | Donor module | Rationale | Status |
|---|---|---|---|---|
| s01 | wordmark "stardust" · version p · lede p (span/span/em) · seed p (strong + 2 hash spans, date-derived) · h1 (3 spans, tight "." join) · "SCROLL" cta | M2 | display h1 + lede + one CTA = Profound centered hero; wordmark + version ride in M2's announcement chip; seed line as the small mutedFg note under the lede; SCROLL → the hero's primary `.btn` | mapped |
| s02 | 7 route labels (SVG `<text>` in source: extract direct prototype migrate / replica deploy rollout), no stream nodes | M18 (compact panel) | the two-lane route diagram is a workflow graph → Profound node-graph panel; rev 2: moved from the hero window into the "Two ways in" section (DOM-first, shown under the header via CSS order) — same slot order as the source spotlight block | mapped |
| s03 | h2 "Two ways in." + lede | M5 | heading + lede, left-aligned section header | mapped |
| s04 | two whole-card CTAs (#redesign, #migrate): h3 · sub p · flow code p · "A"/"B" mini visual · [SHORTCUT label · command · note] · "FOLLOW THE …" label | M21 | two parallel offers with name, sub-line, description, feature lines, bottom action = Profound plan cards; whole card stays one `<a>` (source nesting); A→B mini visual composed as a tiny M22-style pill pair | mapped |
| s05-head | "REDESIGN" tab · "Redesign" title · h2 (2 spans) · lede | M14 (label row) + M5 | the chapter series opener = Profound "[0n] Label" ruled row + header; the source tab/title pair fills the label row (tab in mutedFg position, title in headingFg position) | mapped |
| s05-quote | quote p (em) + attribution p | M15 | pull quote + attribution = Profound quote band (attribution in the right cell, no avatar — none in source) | mapped |
| s06 | "0","1" · h3 Extract · command p · h4 (2 spans) · body p · capture mock (url, end, label, Aa, 6 tags) · "IN THIS STEP" · 4 li · GitHub cta | M14 + M2-window + M22 chips | numbered step: digits → "[01]" (brackets via CSS ::before/::after, no bytes), h3 → label, command → chip right of label row, h4 → 32px step title, mock → app window with brand-surface pane (swatches from donor chart palette), 4 li → 2×2 bordered cell grid with check icons (M21 check idiom), cta → secondary button | mapped |
| s07 | as s06; mock = seed roll (url, "seed ·", date [date-derived], label, 4 hash chunks, "→ resolves to", 4 k/v/p rows) | M14 + M19 | roll rows = Profound sheet/table rows (key · value · index chip) | mapped |
| s08 | as s06; mock = BEFORE/AFTER tabs + "6 viewports" | M14 + M22 | before/after toggle = Profound segmented control in a window bar; two wireframe page thumbnails (decorative bars, no text) | mapped |
| s09 | h2 (2 spans) · p · "HOW IT WAS MADE" cta · 2× (caption p + image) | M5 + M8 | section header with right-side secondary action; two image cards with caption label overlay (case-study media cards, static 2-up instead of carousel — module transformation, no content change) | mapped |
| s10-head | "MIGRATE AS IS" tab · "Migrate as is" title · h2 (2 spans) · lede | M10 + M14 label row | second half of the site opens a gradient band (Profound's enterprise band) with the same ruled label row | mapped |
| s10-quote | quote p + attribution p | M15 | quote band | mapped |
| s10-flow | 3× (strong title + span caption) | M17 | three short title + caption pairs = Profound 3-cell stat row (title in 30px slot, caption below) | mapped |
| s11 | as s06; mock = gate window (url, pass "diff < 2% ✓", LIVE/REPLICA thumbs, 3 gate chips) | M14 + M2-window | side-by-side thumbs in a window; pass state in donor mint (status idiom) | mapped |
| s12 | as s06; mock = blocks (url, end, hero/cards/text/quote) | M14 + M18 | block list = Profound node chain (rounded node cards, dotted connectors) | mapped |
| s13 | as s06; mock = ledger (url, "delivered 112 / 134", meter, 6 path/status rows, foot line) | M14 + M19 | rollout ledger = Profound sheet with status pills (DELIVERED mint, DEPLOYING blue, PENDING muted) | mapped |
| s14-cta | h2 (2 spans) · lede · COPY INSTALL cta · README cta · "Built on impeccable." (tight "." join) | M12 | closing h2 + lede + primary + secondary = Profound final CTA | mapped |
| s14-quote | quote p + attribution p | M15 | compact quote under the CTA | mapped |
| s14-terminal | title "~/project" · 2 prompt markers · 5 commands · 6 output lines | M6 | the scripted install session = Profound AI Marketer chat pane: commands as user bubbles, outputs as agent lines, prompts as muted context lines, window title in the pane header | mapped |
| D1 | header nav: stardust · Install Stardust · Redesign · Migrate · GitHub | M1 | — | chrome |
| D2 | footer | M13 | — | chrome |
| D4 | hero demo: agent desktop app mock (user-requested, rev 2) | M2 window + M6 chat + M20 checklist + M19 rows + M22 segmented | — | demo |
| D3 | `.cube-tag` floating palette tab (outside main) | — | dropped | chrome |

## Stats

- Content slots (after splits): 19 · mapped 19 · new-module 0 · carried-invisible 0 → **mapped ratio 100%** (gate ≥ 80% ✔)
- New modules: none.
- Composed sub-patterns (all from donor tokens, no new module): command chip (chip spec + surface2), check-icon cell (M21 check list in M14 cell grid), swatch row (palette.chart).

## Deltas

- **D1 — header → Profound nav (M1)** — *rev 18: brand in its own colours; Redesign + Migrate left after the brand; GitHub (with mark) right beside Install Stardust.* Original note: Carries every source link and label verbatim: `stardust` → `/`, `Install Stardust` → `#install` (rendered as the nav's primary button, as the source's highlighted "kick" CTA), `Redesign` → `#redesign`, `Migrate` → `#migrate`, `GitHub` → github.com/adobe/skills/tree/main/plugins/stardust. Out of gate scope.
- **D2 — footer → Profound footer (M13)** — *rev 17: simplified to brand + Open Source · Apache 2.0 + AI skills from Adobe | Redesign, Migrate | GitHub, Install | brief + seed = star + md5 line.* Original note: Carries all 7 source links and the brand lines ("brief + seed = star", daily md5 line, "yours alone, today only", "Design you could only get today.", "s t a r d u s t", "Open source · Apache 2.0 · AI skills from Adobe", "Apache 2.0", "Adobe"). Out of gate scope.
- **D3 — `.cube-tag`** (fixed palette switcher outside `<main>`) dropped: interactive chrome tied to the source's cube palettes; no donor equivalent.
- **D4 — hero demo mock (user request, 2026-10-11 rev 2).** "Steal Profound's live demo mock": the stardust agent as a desktop app — SEO / AI-visibility / citations / LCP metrics strip at top, a chat thread (capture → direction → 3 prototypes → deploying to Edge Delivery), prototype thumbnails (A uses the Frescopa *after* image), a deployment rail with block statuses and AI visibility by engine. **Illustrative sample data** (brand: Frescopa, stardust's own white-label demo; all numbers are placeholders) — not source content. It lives outside the content-gate scope: the rendered scope is now `[data-gate="s01"],[data-gate="s02-s14"]` (the hero copy + everything after the hero), so the byte gate still covers 100% of source content and nothing else. `role="img"` + aria-label so assistive tech gets one description instead of fake UI chatter.
- **N-D1, N-D2** — shared defaults (no matches on this page).
- **N1** — flatten the scroll-choreography stage (scroll every layer once so lazy blocks decorate; force parked/waiting layers visible). Presentation-only.
- **N2** — remove scroll-rail chrome (`.sc-rail`, `.rail-overlay`, `.lane-tab`, `.lane-in`, `.sc-probe`) that duplicates chapter names.
- **N3** — finish the install typewriter via its own `[data-skip]` control.
- **N15** — **user-requested content addition** (rev 17): Shortcut + `/stardust:replica <url>` in the Migrate door (cloned from the Redesign door).
- **N12–N14** — **user-requested copy edits** (rev 17): install heading → "Install it. Docs included."; install lede → "Stardust is a set of AI skills. Install it, then say what you want in your own words."; "Two ways in." lede drops "Or open a door yourself." N9 reworded to "Takes a website & brings it back,".
- **N11** — **user-requested content removal** (rev 16): the impeccable lines of the install terminal.
- **N10** — **user-requested content removal** (rev 15): the install credit `Built on impeccable.` (`.install .credit`). Footer credit link dropped too (chrome).
- **N9** — **user-requested copy edit** (rev 10): kicker line 1 "Takes a website. Brings it back" → "Takes a website, brings it back:" (guarded; flag: not yet on the live source).
- **N8** — **user-requested content removal** (rev 10): the hero `SCROLL` link (`.hero .scroll`).
- **N7** — **user-requested content removal** (rev 8): the chapter intro titles beside the tab (`.chapters .sc-title` — "Redesign", "Migrate as is"); the [TAB] carries the word.
- **N6** — **user-requested content removal** (rev 7): the hero wordmark `stardust` (`.hero .hero-word`); the brand remains in the nav.
- **N5** — **user-requested content removal** (rev 6): the spotlight route diagram (`.spotlight .spot-media`, s02). Re-captured; the model now has 13 slots.
- **N4** — **user-requested content removal** (rev 5): the hero version tag `v0.20.0` (`.hero .ver`). Not chrome; an owner decision, executed in the shared ledger so capture and gate exclude it identically.

## Casing policy

Captured text is rendered-case. The source uppercases its mono labels (SEED, SCROLL, SHORTCUT, FOLLOW THE …,
IN THIS STEP, BRAND SURFACE, MD5(…), BEFORE/AFTER, LIVE/REPLICA, DELIVERED…, REDESIGN, MIGRATE AS IS,
HOW IT WAS MADE, FRESCOPA · …, COPY INSTALL, README ON GITHUB). The renderer emits the captured strings and
also sets `text-transform: uppercase` on those elements so the casing is declared in CSS, never edited.
Profound is sentence-case everywhere — **byte fidelity wins**; the labels adopt Profound's 12px label size,
weight and mutedFg color so the uppercase reads as small UI labels rather than shouty tracking.

## Judgment calls

1. **Daily seed strings.** s01 `md5("brand" · <date>) → <hash> ·` and s07's `<date>` are computed client-side by the
   source every day (scripts/seed.js). The renderer emits the captured strings and ports the exact md5/todayISO
   routine (seed.js, verbatim algorithm) to recompute them on load — the reskin shows the same string as the
   source on any day, so the byte gate stays valid beyond the capture date. Same treatment for the footer line (chrome).
2. **Hero DOM order vs visual order.** Source DOM order is wordmark → version → lede → seed → h1 → scroll; the
   renderer keeps it (byte gate) and uses CSS `order` so the h1 sits visually above the lede, as in Profound's hero.
3. **s02 has no stream nodes** (labels are SVG `<text>`, which the stream doesn't capture). The renderer splits the
   slot's `visibleText` on single spaces into exactly 7 labels and throws if re-joining doesn't reproduce it
   (fail-loud parse of one slot's text, not order reconstruction across nodes).
4. **Step digits "0","1".** Rendered as two flex items so innerText yields "0 1" (gate) while they sit visually
   together as "[01]"; brackets are CSS-generated (not in innerText).
5. **Extract mock swatches** use the donor chart palette instead of the source's illustration colors (no
   colors outside donor tokens); the swatch row is decoration, no text.
6. **Copy install** keeps `href="#install"` and the source behavior (copies the install commands to the clipboard).
7. Images are hotlinked from stardust.style (EDS media, publicly served); paint is asserted by slot-coverage.

## Flags (fidelity over repair)

- `og:image:alt` reads "Frescopa home page before the redesign" while og:image is the stardust OG card — carried verbatim; owner may want to fix.
- Footer says `CHANGELOG · v0.19.8` while the hero says `v0.20.0` — version drift upstream, carried verbatim.
- Meta description: "…redesigned, fixed, migrated, or all of it all together." (doubled "all") — carried verbatim.

## Revision 2 (user, 2026-10-11)

- Hero was too empty → D4 demo mock (above).
- Spacing too airy → `layout.sectionPaddingY` 120 → 88px; step gaps 120 → 72px; header/quote/cell padding tightened (token override recorded in donor-tokens.json `overrides.userLayout2`).
- H1 and subtitle bigger → display 48/56 → 72/76px (−2.4px), hero lede 18/24 → 22/30px (token override).

## Revision 3 (user, 2026-10-11)

- H1 on one line (lines rendered inline; wraps only on phones).
- Hero background = the stardust.style star nebula shader, ported verbatim (`renderers/nebula.client.js`). Its gold/coral/glow are stardust brand colours scoped to the hero canvas — a declared exception to donor tokens (donor-tokens.json `overrides.userHero3`). Decorative, `aria-hidden`, no text: no effect on the content gate.

## Revision 4 (user, 2026-10-11)

- D4 replaced. The agent-desktop mock (metrics, chat, rail — invented sample data) is gone. The hero demo now replays the
  six chapter mocks inside a browser frame: the address bar types each step's command, a left step list (Redesign: Extract,
  Direct, Prototype · Migrate as is: Replica, Deploy, Rollout) tracks progress, the active mock animates. All demo strings
  are the source's own chapter strings, rendered by the same MOCKS functions; the demo stays outside the content-gate scope
  because it duplicates them, and its stage is `aria-hidden` (the step list is the accessible surface).

## Revision 6 (user, 2026-10-11)

- s02 route diagram removed (N5). "Two ways in." becomes a full-width light band: cream #F4F2EC ground, navy ink — the
  same two palette colours inverted, so no new tokens.

## Revision 9 (user, 2026-10-11)

- Accent = stardust `--gold` #f7ca6e (was Profound mint). Token override `overrides.accentRev9`.

## Revision 12 (user, 2026-10-12)

- Quote module (M15) re-imagined after Refero references (Cartesia, Anthropic, Rox): no box or edge band — large type, gold quote marks, one gold-marked punchline (design choice; split is byte-verified). The gold marker is now the page's single emphasis idiom (hero + quotes).

## Revision 13 (user, 2026-10-12)

- Quotes: highlights removed; gold-tint #fbe7be card (stardust --gold-tint), navy italic Inter (real italic face).

## Revision 14 (user, 2026-10-12)

- Quotes = notebook page: graph-paper grid on surface1 navy, handwritten Caveat in gold-tint #fbe7be. Font override recorded in donor-tokens.json `overrides.quoteRev14`.

## v2 — AI-tell cleanup (2026-10-12) → pages/index-v2.html

v1 (pages/index.html) untouched. v2 = own ledger (normalize/index-v2.mjs: + V2-N16 step numbers, V2-N17 'In this step' labels), own model (content-model/index-v2), own tokens (donor-tokens-v2.json), own probe spec. Fixes #1 #2 #4 #6 #9 #10 #11 #12 #19 #20 — details in ledger.json pages['index-v2'].
