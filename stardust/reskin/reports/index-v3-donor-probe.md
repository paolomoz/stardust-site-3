# Design-adoption gate — donor token probe

- Tokens: stardust/reskin/donor-tokens-v3.json
- Rendered: stardust/reskin/pages/index-v3.html
- Spec: stardust/reskin/probe-spec-v3.json
- Generated: 2026-10-12T07:59:53.105Z

## Assertions — 44/44 pass

- [x] page bg = rgb(8, 30, 61) — rgb(8, 30, 61)
- [x] body fg = rgb(244, 242, 236) — rgb(244, 242, 236)
- [x] font-family token string = interVariable, "interVariable Fallback", "SF Pro Display", -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif — interVariable, "interVariable Fallback", "SF Pro Display", -apple-system, "system-ui", "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif
- [x] body font size = 16px — 16px
- [x] display weight (h1) = 500 — 500
- [x] display size (h1) = 72px — 72px
- [x] display tracking (h1) = -2.4px — -2.4px
- [x] heading color = rgb(244, 242, 236) — rgb(244, 242, 236)
- [x] h2 size = 48px — 48px
- [x] h2 weight = 500 — 500
- [x] primary button bg = rgb(244, 242, 236) — rgb(244, 242, 236)
- [x] primary button fg = rgb(8, 30, 61) — rgb(8, 30, 61)
- [x] primary button radius = 8px — 8px
- [x] primary button padding (±2px) = 6px 12px — 6px 12px
- [x] primary button font size = 14px — 14px
- [x] secondary button bg = rgb(50, 68, 93) — rgb(50, 68, 93)
- [x] secondary button radius = 8px — 8px
- [x] container max-width (±20px) = 1088px — 1088px
- [x] section rhythm (±16px) = 88px — 88px
- [x] section rhythm, content band (±16px) = 88px — 88px
- [x] hairline color = rgb(36, 55, 82) — rgb(36, 55, 82)
- [x] step title size = 32px — 32px
- [x] step title weight = 500 — 500
- [x] step name = heading (v2) = 32px — 32px
- [x] lede color (muted) = rgb(169, 187, 214) — rgb(169, 187, 214)
- [x] lede size = 18px — 18px
- [x] window surface = rgb(17, 38, 68) — rgb(17, 38, 68)
- [x] window radius = 16px — 16px
- [x] plain list rule (v2 #6) = rgb(36, 55, 82) — rgb(36, 55, 82)
- [x] status mint = rgb(247, 202, 110) — rgb(247, 202, 110)
- [x] light band ground (rev 6) = rgb(244, 242, 236) — rgb(244, 242, 236)
- [x] light band ink (rev 6) = rgb(8, 30, 61) — rgb(8, 30, 61)
- [x] chapter band accent (rev 8) = rgb(247, 202, 110) — rgb(247, 202, 110)
- [x] chapter band tab 300% (rev 8) = 36px — 36px
- [x] solid header, no glass (v2 #10) = none — none
- [x] no hero text halo (v2 #2) = none — none
- [x] muted text navy-tinted (v2 #19) = rgb(169, 187, 214) — rgb(169, 187, 214)
- [x] no pill on tags (v3 #13) = 0px — 0px
- [x] code set in mono (v3 #13) = ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace — ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace
- [x] flat migrate ground (v3 #14) = none — none
- [x] pipeline, not stat row (v3 #7) = 16px — 16px
- [x] no brackets (v3 #16) = 36px — 36px
- [x] no horizontal overflow @1440 — overflow=0px
- [x] no horizontal overflow @360 — overflow=0px

**Overall: PASS**

> The probe proves tokens; it does not prove the page READS as the donor.
> Complete the gate with the side-by-side eyeball vs the donor screenshots
> (stardust/canon-source/assets/screenshots/) per reference/gates.md.
