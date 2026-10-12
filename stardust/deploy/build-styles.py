#!/usr/bin/env python3
"""Generate styles/styles.css + styles/fonts.css from the approved v3 prototype's resolved CSS.

The prototype's stylesheet is ONE cascade (v1 → v2 → v3 override layers); it is lifted in order so
EDS renders pixel-identically, then an EDS adaptation layer maps the runtime's DOM (section/wrapper
divs, authored elements inside class-carrying wrappers) onto it. Re-run after re-rendering v3:
    python3 stardust/deploy/build-styles.py
"""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
html = (ROOT / 'stardust/reskin/pages/index-v3.html').read_text()
css = re.search(r'<style>(.*?)</style>', html, re.S).group(1)

# 1. fonts → styles/fonts.css (self-hosted; loaded by loadFonts()). Drop the prototype's CDN faces.
css = re.sub(r'@font-face \{[^}]*\}\s*', '', css)
fonts = '''/* Self-hosted brand faces (SIL OFL 1.1): Inter (rsms) and Caveat (Google Fonts). Loaded by
   loadFonts() after first paint; the metric-matched fallbacks live in styles.css. */
@font-face { font-family: interVariable; src: url("../fonts/inter-variable.woff2") format("woff2"); font-weight: 100 900; font-style: normal; font-display: swap; }
@font-face { font-family: Caveat; src: url("../fonts/caveat-500.woff2") format("woff2"); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: Caveat; src: url("../fonts/caveat-600.woff2") format("woff2"); font-weight: 600; font-style: normal; font-display: swap; }
'''
# 2. fallbacks second in every stack (the Inter token already names "interVariable Fallback")
css = css.replace('font-family: Caveat, ', 'font-family: Caveat, caveat-fallback, ')
# 3. buttons: the prototype's .btn system ↔ EDS decorateButtons() classes
css = re.sub(r'\.btn-secondary(?![\w-])', ':is(.btn-secondary, a.button.secondary)', css)
css = re.sub(r'\.btn-primary(?![\w-])', ':is(.btn-primary, a.button.primary)', css)
css = re.sub(r'\.btn(?![\w-])', ':is(.btn, a.button)', css)
# 3b. block-name collisions: EDS stamps the block name on the block's own div, so pin the
#     prototype classes that share a block name to their element (quote, step, flow).
for cls, tag in [('quote', 'figure'), ('step', 'article'), ('flow', 'ol')]:
    css = re.sub(r'(?<![\w-])\.' + cls + r'(?![\w-])', '.' + cls + ':where(' + tag + ')', css)  # same specificity as the prototype
# 4. hero accent verbs are authored <strong> (DA strips <span>)
css = css.replace('.hero-lede .ink-accent {', '.hero-lede strong { font-weight: inherit;')
# 5. stickiness belongs to the <header> host (the chrome block renders inside it)
css = css.replace('.nav { position: sticky; top: 0; z-index: 50;', '.nav {')
assert 'position: sticky; top: 0; z-index: 50' not in css.split('.nav {')[1][:80]

head = '''/*
 * stardust.style — Profound reskin, v3 (approved 2026-10-12).
 * Lifted from stardust/reskin/pages/index-v3.html by stardust/deploy/build-styles.py — do not edit
 * the lifted section by hand; edit the renderer, re-render v3, re-run the script. The EDS
 * adaptation layer at the end is hand-maintained (inside the script).
 */

/* ---------------------------------------------------------------- metric-matched fallbacks */
@font-face { font-family: "interVariable Fallback"; src: local("Arial"); size-adjust: 90.06%; ascent-override: 107.57%; descent-override: 26.78%; line-gap-override: 0%; }
@font-face { font-family: caveat-fallback; src: local("Arial"); size-adjust: 91.23%; ascent-override: 105.23%; descent-override: 32.88%; line-gap-override: 0%; }

/* ---------------------------------------------------------------- EDS runtime structure (keep) */
:root { --nav-height: 57px; }
body { display: none; }
body.appear { display: block; }
header { height: var(--nav-height); }
header .header, footer .footer { visibility: hidden; }
header .header[data-block-status="loaded"], footer .footer[data-block-status="loaded"] { visibility: visible; }

/* ================================================================ lifted prototype cascade */
'''
adapt = '''
/* ================================================================ EDS adaptation layer */
/* sticky chrome on the host element */
body > header { position: sticky; top: 0; z-index: 50; }
/* empty sections (the metadata block's) collapse */
main .section:empty { display: none; }
/* authored headings sit inside class-carrying wrappers (EW2): the wrapper owns the type */
main :is(h1, h2, h3, h4), footer :is(h1, h2, h3, h4) { font: inherit; letter-spacing: inherit; color: inherit; margin: 0; text-wrap: inherit; }
/* authored paragraphs slotted into inline positions render inline (their text joins the slot) */
main :is(span, b) > p, header :is(span, b) > p, footer :is(span, b) > p, .window p { display: contents; }
.hero-seed > p, .flow:where(ol) li p, .foot-col ul, .foot-col li, .foot-brand-link, .foot-brand-link p { display: contents; }
.flow:where(ol) li { font-size: 14px; line-height: 20px; color: var(--muted); }
/* the "Two ways in" head + cards stack as in the prototype's flex column */
.ways .doors > .container { display: flex; flex-direction: column; }
/* button wrappers from decorateButtons() */
p.button-wrapper { margin: 0; }
/* Experience Workspace edit mode: repaint CTAs from their authored marks (EW3) */
.prosemirror-editor p > :is(strong, em) > a:any-link { display: inline-flex; align-items: center; height: 32px; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: 500; }
.prosemirror-editor p > strong > a:any-link { background: rgb(244, 242, 236); color: rgb(8, 30, 61); }
.prosemirror-editor p > em > a:any-link { background: rgb(50, 68, 93); color: rgb(244, 242, 236); font-style: normal; }
a .prosemirror-editor a:any-link { color: inherit; text-decoration: none; }
'''
(ROOT / 'styles/styles.css').write_text(head + css.strip() + '\n' + adapt)
(ROOT / 'styles/fonts.css').write_text(fonts)
print('styles.css', len(head + css + adapt), 'bytes; fonts.css written')
