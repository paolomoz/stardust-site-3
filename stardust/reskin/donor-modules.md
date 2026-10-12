# Donor module vocabulary — tryprofound.com

Evidence: `stardust/canon-source/assets/screenshots/` — `home.png` (H), `features-agents.png` (FA),
`customers-plaid.png` (CP), `pricing.png` (PR), `enterprise.png` (EN). Offsets are y-px at 1440 wide.

| # | Module | Where seen | Description (anatomy) |
|---|--------|-----------|-------------|
| M1 | Top nav | H 0–56 (all pages) | 56px bar, hairline bottom; mono logo (mark + wordmark) left; centered text links 14px/500 (some with chevrons); right: text link + primary `.btn` "Get a Demo" |
| M2 | Centered hero + product window | H 56–1300 | announcement chip (tinted pill + text + arrow) · display h1 48/56 centered · lede 18px mutedFg · primary + secondary buttons · radial light leak top-left · then a full-width app window mock (16px radius, sidebar + main pane) |
| M3 | Logo strip | H 1400–1670 | label left ("Powering…") + arrow link right; 6-cell bordered logo grid |
| M4 | Scroll-reveal statement | H 1900–2500 | single centered 54px statement in displayMuted, words brighten on scroll; nothing else in the viewport |
| M5 | Section header | H 4200, 5600, 7800 | left h2 48/56 (max ~50% width) + 18px lede mutedFg; optional right-aligned control (carousel arrows / "See All" secondary button) |
| M6 | Chat / agent panel | H 0–1260 (hero window), H 4950–5880 (right cell) | app pane: user bubbles (surface2, 12px radius, right-aligned), agent responses (left, small label + text), status/"Working" line, composer input at bottom |
| M7 | Two-up feature cells | H 6100–6900, FA 1800–2200 | 1px-bordered 2-col grid; each cell: mock area top, title 16–18px, body mutedFg, small secondary button |
| M8 | Case-study media card | H 8000–8600 | full-bleed image card, logo top-left, 54px stat bottom-left, caption + attribution, "View story" secondary button; horizontal carousel |
| M9 | Three-up mock cells | H 9300–9800 | 3-col bordered cells with chart/gauge mocks + title + body + button |
| M10 | Gradient enterprise band | H 9900–11300 | full-bleed band, top hairline, gradient (transparent → surface1); big h2; sub-row (title + body + button); wide table mock |
| M11 | Folder-tab research cards | H 11500–12600 | folder tabs (Popular / …) above a bordered panel of 3 paper cards with caption + byline |
| M12 | Final CTA | H 12100–12550 | centered h2 48/56 + lede + primary + secondary buttons, between full-bleed hairlines |
| M13 | Footer | H 12600–13288 | logo left; 3 link columns (14px mutedFg, column heads headingFg); status dot (mint) "All services are online"; © row |
| M14 | Numbered step section | FA 2750–4400, 5700–6800, 6900–7700 | ruled label row "[01] Use Templates" (12px; number mutedFg, label headingFg); step title 32/40; lede mutedFg; 2×2 bordered cell grid (title + body); then a large app-window mock |
| M15 | Quote band | FA 1470–1630, CP 1700–1820 | bordered row: large quote 24px headingFg (hanging “) left; right cell with avatar, name, role in mutedFg |
| M16 | Four-up icon cells | FA 1810–2100 | 4-col bordered cells: 24px icon tile, title 16px, body mutedFg |
| M17 | Stat row | CP 1110–1240, EN 1190–1370 | 3 bordered cells (or left-ruled items): 30px number/title + 14px caption mutedFg |
| M18 | Node-graph mock | FA 580–1170, 2560–2960 | vertical chain of rounded node cards (icon + title + output tag), dotted connectors, "Succeeded" mint badges; right rail checklist |
| M19 | Sheet / table mock | FA 7900–8450, H 10800–11200 | window with column headers, rows of path/title + status pill (mint "Completed"), index column |
| M20 | Progress checklist mock | FA 4050–4400 | stacked 400px rows: index, check icon, label; current row spinner |
| M21 | Plan cards | PR 500–980 | 2 bordered cards: name 20px, sub-line, description mutedFg, check-icon feature list, full-width button at bottom (secondary on card 1, primary on card 2) |
| M22 | Segmented control | H hero window ("AI Marketer / Analytics"), FA ("Nodes / Assistant"), PR ("For brands / For agencies") | pill-in-pill tabs, active segment surface2 |

**Notes for reskin.** Sentence case everywhere — no uppercase tracking on labels (casing fidelity may force
source uppercase strings; keep them, style with donor label size/color). Arrow suffix "→" on text links. Buttons are
32px and quiet: exactly one primary per region. Every illustration is product UI (windows, chats, node graphs,
sheets) on surface1/surface2 with hairline borders — never stock art. Rhythm: ~120px between sections, full-bleed
hairlines, dashed guides at the 1088px column edges.
