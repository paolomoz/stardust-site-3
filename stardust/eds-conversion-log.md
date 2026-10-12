# EDS conversion log — stardust.style × Profound reskin (v3)

**Source prototype:** `stardust/reskin/pages/index-v3.html` (approved 2026-10-12).
**Site:** github.com/paolomoz/stardust-site-3 · DA `paolomoz/stardust-site-3` ·
preview https://main--stardust-site-3--paolomoz.aem.page/ · live https://main--stardust-site-3--paolomoz.aem.live/
**Requirement:** pixel parity with the prototype, diff < 1 % at desktop and mobile.

## Result

| Gate | Result |
|---|---|
| Pixel diff vs prototype (full page, reduced motion, nebula canvas masked on both) | 1440: **0.002 %** · 768: **0.085 %** · 390: **0.078 %** — document heights identical (8818 / 10822 / 12844) — same on aem.page and aem.live |
| `.plain.html` | 1 `<h1>`, 0 `about:error`, 2/2 images + alt rehosted, metadata → title/description/og |
| Computed render | all 15 blocks `loaded`, 0 pageerrors, sections/anchors identical to the prototype |
| Experience Workspace (`ew-editability-probe`) | **154/154 authored texts editable**, 0 dead, 0 duplicated; edit-mode block Δh = 0 |
| AI readability (`ai-readability.mjs`) | **100 %** (served 1051 / rendered 1029; gate 98) |
| CLS (deployed, woff2 + chrome delayed 1.5 s) | 1440: 0.0013 · 390: 0.0059 |
| Interactions (deployed) | demo step buttons, autoplay/typing, Copy install → clipboard = the two `/plugin` lines, nav anchors land on unique section ids |
| Lint | eslint clean; stylelint clean (generated lift carries a scoped disable — see deviations) |
| davids-model-lint | 1 🔴 D15 justified false positive (below), 8 🟡 D1/D3 advisories justified (below) |

The residual pixel diff is (a) the Frescopa screenshots, served by EDS as the 750px JPEG rendition
on phones vs the prototype's hot-linked 2000px webp, and (b) at 768 a sub-pixel vertical offset of
the centred demo mock caused by the locked stage height.

## Block inventory (locked; single page, so names = section intent)

| Block | Prototype section | Tier | Notes |
|---|---|---|---|
| `stage` | `section.hero` | template-slotted | h1 / lede / seed; generates the seed hash (runtime), mounts the nebula (`blocks/stage/nebula.js`, verbatim port), builds the demo from presentational clones of the step blocks |
| `doors` | `section.sec.ways.band-light` | reconstructive (row per door) | head is default content reabsorbed (EW8); card-as-link with the inner anchor unwrapped (EW6); A→B drawings per use case |
| `chapter-intro` | intro label + head | template-slotted | variants `redesign` / `migrate band` set the section classes + anchor id |
| `quote` | `figure.quote` | template-slotted | Block Collection name and shape (quote, attribution) |
| `step` ×6 | `article.step.step-v2` | template-slotted | mock lines authored as `<p>`s, moved into the mock template keyed by step name (`scripts/stardust.js` MOCKS) |
| `flow` | `ol.flow` | reconstructive (row per stop) | |
| `showcase` | `section.sec.showcase` | template-slotted | figure rows: caption \| picture |
| `install` | `section.sec.final#install` | template-slotted | head + CTAs, compact quote, chat terminal; Copy install copies the authored `/plugin` commands |
| `header` / `footer` | chrome | template-slotted | from the authored `/nav` and `/footer` documents |

Shared runtime: `scripts/stardust.js` (icons, brand mark, seed md5 ported from stardust.style
`seed.js`, the six mock templates). Content is generated, never retyped:
`stardust/deploy/build-content.mjs` (from the v3 content model); styles by
`stardust/deploy/build-styles.py` (from the v3 prototype's resolved CSS).

## Decisions and deviations (with reasons)

1. **One stylesheet, not per-block CSS.** The prototype's CSS is a single cascade with v1→v2→v3
   override layers; splitting it per block would reorder the cascade and break parity. It is lifted
   verbatim into `styles/styles.css` (in order), followed by a hand-maintained EDS adaptation layer.
   Block CSS files are stubs that point here. Regenerate with `python3 stardust/deploy/build-styles.py`.
2. **Block-name collisions.** EDS puts the block name on the block's own div; prototype classes that
   share a block name (`.quote`, `.step`, `.flow`) are pinned as `.quote:where(figure)` etc. — same
   specificity as the prototype, so the cascade order is preserved.
3. **Authored paragraphs in inline slots use `display: contents`.** Template slots that were `span`/
   `b` in the prototype receive the authored `<p>` (moved, EW1); `display: contents` makes its text
   join the slot so layout is byte-identical. The EW probe reports these as "height 0 → N" in edit
   mode — a measurement artifact; block heights do not change (Δh = 0).
4. **Cross-wrapper sibling rule.** The prototype's `.chapters .quote + .step-v2` is re-expressed as
   `.quote-wrapper + .step-wrapper .step-v2` (EDS wrappers are the siblings).
5. **Hero demo is presentational and lazily mounted.** It clones the step blocks' authored lines
   (instrumentation stripped, EW4). Only the playing stage keeps its mock mounted; the stage area's
   height is locked to the tallest mock so layout is unchanged. This took AI readability 96 → 100 %.
6. **Generated runtime text (allowlisted by rule, not by file — values change daily):** the seed
   hash line (stage), the Direct mock's date (step), the footer's md5 line, "Copied" (install).
7. **Anchor ids.** The pipeline auto-ids headings from text (`<h3>Redesign</h3>` → `#redesign`),
   colliding with the chapter anchor; `chapter-intro` clears other holders of its id.
8. **Chrome anchors carry classes** (`brand`, `nav-gh`, `nav-btn`) to reuse the prototype CSS; the
   link labels stay editable (declared `@ew-exempt` on the wrappers in header.js / footer.js).
9. **D15 🔴 justified false positive:** `<code>/stardust:extract &lt;url&gt;</code>` — `<url>` is
   the CLI placeholder authored exactly this way on stardust.style, not leaked markup. Not
   re-encoded to dodge the regex.
10. **D1/D3 🟡 justified:** stage, doors, chapter-intro, quote, flow are bespoke compositions
    (template-slotted) — prose-only rows are by design; showcase rows differ (head rows 1 cell, figure
    rows 2 cells: caption | picture).
11. **Fonts:** Inter (rsms) + Caveat (Google) self-hosted (SIL OFL); fallbacks metric-matched from
    the measured rendered-width ratio (Inter 90.06 %, Caveat 91.23 %) — `xAvgCharWidth` gave an
    implausible 145 % for Inter's variable build.
12. **`fstab.yaml`** is used although the boilerplate's AGENTS.md calls it retired — the eds-new-site
    procedure relies on it for the Code Sync bot's site config, and it produced the correct
    content source.

## For the next person

- Copy changes go in DA (da.live/#/paolomoz/stardust-site-3); the reskin's normalization ledger
  (`stardust/reskin/normalize/index-v3.mjs`) records user copy edits not yet on stardust.style
  (N9, N12–N15) — those are now real content on this site.
- Design changes: edit the renderer, re-render v3, re-run `build-styles.py`, re-run the pixel diff
  (`tools/proto-shot.mjs` + `tools/pixdiff.py`) at 1440 / 768 / 390.
- `npm i` prunes `--no-save` Playwright: run `npm i` first, then `npm i --no-save playwright`.

## Go-live configuration (2026-10-12, pre-cutover)

| Item | State |
|---|---|
| Production host | config service `cdn.json` → `{"prod":{"host":"stardust.style"}}` (host only — no push invalidation yet) |
| robots.txt | config service: `Allow: /` + `Sitemap: https://stardust.style/sitemap.xml`; served only when `X-Forwarded-Host` is set (aem.page/aem.live stay noindex) |
| Sitemap | default (no config): lists only `https://stardust.style/`; `/nav` and `/footer` carry `Robots: noindex` |
| Canonical / og:url | metadata `Canonical: https://stardust.style/` (also what the pipeline derives under XFH) |
| Redirects | DA sheet `/redirects`: `/docs → /` (carried from the current site), `/og/stardust.jpg → ` the rehosted share image |
| 404 | `404.html` in the new design (nebula hero, home + go-back, the missing path) |
| Repo | github.com/paolomoz/stardust-site-3 — public |

Verified against `main--stardust-site-3--paolomoz.aem.live` with `x-forwarded-host: stardust.style`:
200 + no `x-robots-tag` on `/`, canonical/og:url `https://stardust.style/`, robots.txt as above,
sitemap `<loc>https://stardust.style/</loc>` only, `/docs` 301 → `/`, unknown paths 404 with the new page.

Cutover (Cloudflare, owner): point the stardust.style worker's `ORIGIN_HOSTNAME` at
`main--stardust-site-3--paolomoz.aem.live` (worker must send `X-Forwarded-Host` and strip
`x-robots-tag` / `age` — the official adobe/aem-cloudflare-prod-worker does), route `stardust.style/*`.
For push invalidation add `type: cloudflare`, `plan`, `zoneId`, `apiToken` (Zone › Cache Purge) to
`cdn.json` prod.
