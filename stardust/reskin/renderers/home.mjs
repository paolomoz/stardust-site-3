#!/usr/bin/env node
/**
 * stardust/reskin/renderers/home.mjs — programmatic renderer for the stardust.style home
 * reskinned onto the tryprofound.com vocabulary (mapping: stardust/reskin/mapping.md).
 *
 * Content in:  stardust/reskin/content-model/<slug>/content-model.json  (never retyped)
 * Surface in:  stardust/reskin/donor-tokens.json                         (CSS custom properties)
 * Out:         stardust/reskin/pages/<slug>.html
 *
 * Every slot is consumed through a cursor that throws on an unexpected node kind and on any
 * unconsumed node, so a renderer bug is a loud failure, never a silent content drop.
 *
 * usage: node home.mjs [slug=index]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const slug = process.argv[2] || 'index';
const model = JSON.parse(readFileSync(resolve(ROOT, `content-model/${slug}/content-model.json`), 'utf8'));
// v2 = the AI-tell cleanup variant (own ledger, model, token sheet); v1 rendering is untouched.
const V2 = slug === 'index-v2';
const tokens = JSON.parse(readFileSync(resolve(ROOT, V2 ? 'donor-tokens-v2.json' : 'donor-tokens.json'), 'utf8'));

/* ------------------------------------------------------------------ helpers */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Logical slot ids follow the original 14-slot capture. Owner-requested removals (normalize N5:
// the s02 route diagram) shift the captured ids, so resolve logical → captured here.
const hasRoutes = model.sections.some((x) => (x.rootClass || '').split(/\s+/).includes('spot-media'));
const slot = (logical) => {
  let n = Number(logical.slice(1));
  if (!hasRoutes && n === 2) return null;
  if (!hasRoutes && n > 2) n -= 1;
  const id = `s${String(n).padStart(2, '0')}`;
  const s = model.sections.find((x) => x.slot === id);
  if (!s) throw new Error(`slot ${id} missing from the content model`);
  return s;
};

function cursor(nodes, where) {
  let i = 0;
  const c = {
    peek: (o = 0) => nodes[i + o],
    next(kind, test) {
      const n = nodes[i];
      if (!n) throw new Error(`${where}: expected ${kind}, stream exhausted`);
      if (kind && n.kind !== kind) throw new Error(`${where}[${i}]: expected ${kind}, got ${n.kind} ${JSON.stringify(n.text)}`);
      if (test && !test(n)) throw new Error(`${where}[${i}]: node failed check ${JSON.stringify(n.text)}`);
      i += 1;
      return n;
    },
    /** consume consecutive nodes while pred holds */
    while(pred) { const out = []; while (nodes[i] && pred(nodes[i])) { out.push(nodes[i]); i += 1; } return out; },
    done() { if (i !== nodes.length) throw new Error(`${where}: ${nodes.length - i} unconsumed node(s), next ${JSON.stringify(nodes[i])}`); },
  };
  return c;
}

const isText = (cls) => (n) => n.kind === 'text' && (cls == null || (n.parentClass || '').split(/\s+/).includes(cls));
const caps = (t) => (t === t.toUpperCase() && /[A-Z]/.test(t) ? ' caps' : '');

/** Inline children of a node, honoring sep ('' = tight join). wrap(child) may return markup. */
function inline(node, wrap = (ch) => `<span>${esc(ch.text)}</span>`) {
  if (!node.children || !node.children.length) return esc(node.text);
  return node.children.map((ch, k) => `${k && ch.sep === ' ' ? ' ' : ''}${wrap(ch)}`).join('');
}
/** Heading/paragraph whose span children are visual lines. */
const lines = (node) => inline(node, (ch) => `<span class="line">${esc(ch.text)}</span>`);

const a = (n, cls, inner) => `<a class="${cls}" href="${esc(n.absHref)}">${inner ?? esc(n.text)}</a>`;

/* Daily seed — same algorithm and format as stardust.style scripts/seed.js (md5 of
   `<name> · <YYYY-MM-DD>`, first 8 hex). Asserted against the captured strings below. */
const md5 = (s) => createHash('md5').update(s, 'utf8').digest('hex');
const capDate = (model._provenance.capturedAt || '').slice(0, 10);

/* ------------------------------------------------------------------ icons (decorative, no text) */

const MARK = `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><g><rect x="14" y="2" width="4" height="4"/><rect x="14" y="26" width="4" height="4"/><rect x="2" y="14" width="4" height="4"/><rect x="26" y="14" width="4" height="4"/><rect x="14" y="8" width="4" height="4" opacity=".7"/><rect x="14" y="20" width="4" height="4" opacity=".7"/><rect x="8" y="14" width="4" height="4" opacity=".7"/><rect x="20" y="14" width="4" height="4" opacity=".7"/></g><rect x="13" y="13" width="6" height="6"/></svg>`;
// Brand mark in its own colours (stardust.style: gold arms, coral core) — nav + footer only (rev 18).
const MARK_COLOR = MARK.replace('class="mark"', 'class="mark mark-color"').replace('<g>', '<g fill="#f7ca6e">').replace(/<rect x="13" y="13" width="6" height="6"\/>/, '<rect x="13" y="13" width="6" height="6" fill="#ed6f4c"/>');
const I = {
  arrow: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg class="ico check" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="m5 8.2 2 2 4-4.4" fill="none" stroke="var(--page)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  node: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 8h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  github: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 .2a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.4 7.4 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2"/></svg>',
  chev: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 6.5 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8l5.1-1.4Z" fill="currentColor"/></svg>',
};
const dots = V2 ? '' : '<span class="win-dots" aria-hidden="true"><i></i><i></i><i></i></span>'; // v2 #9: no faux window controls

/* ------------------------------------------------------------------ D4 hero demo (user-requested, rev 4)
   "The stardust run, in a browser": the six chapter mocks (the same MOCKS markup the chapters
   render) played as one sequence — address bar types each step's command, a step list on the
   left tracks progress, the active mock animates on the right. Its strings are the source's own
   chapter strings, reused; the demo still sits outside the content-gate scope (it would duplicate
   them) and its stage is aria-hidden — the step list is the accessible surface. */

function demo() {
  const groups = [
    { intro: 's05', steps: ['s06', 's07', 's08'] },
    { intro: 's10', steps: ['s11', 's12', 's13'] },
  ];
  let k = 0;
  const nav = [];
  const stages = [];
  groups.forEach((g) => {
    const tab = slot(g.intro).ordered[0]; // the chapter tab ("REDESIGN" / "MIGRATE AS IS")
    nav.push(`<li class="dnav-grp">${esc(tab.text)}</li>`);
    g.steps.forEach((id) => {
      const st = parseStep(id);
      const num = st.digits.map((d) => d.text).join('');
      const h4 = st.title.children ? st.title.children.map((ch) => ch.text).join(' ') : st.title.text;
      nav.push(`<li><button type="button" class="dnav${k ? '' : ' on'}" data-go="${k}" aria-pressed="${k ? 'false' : 'true'}"><span class="dnav-n">${esc(num)}</span><span class="dnav-t">${esc(st.name.text)}</span><span class="dnav-s">${esc(h4)}</span><i class="dnav-bar" aria-hidden="true"></i></button></li>`);
      stages.push(`<div class="dstage dstage-${esc(st.name.text.toLowerCase())}${k ? '' : ' on'}" data-cmd="${esc(st.cmd.text)}">${st.mock(st.mockNodes)}</div>`);
      k += 1;
    });
  });
  return `
  <div class="demo window" role="region" aria-label="Demo: a stardust run, step by step">
    <div class="browser-bar">
      ${dots}
      <span class="browser-nav" aria-hidden="true"><svg viewBox="0 0 16 16" class="ico"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 16 16" class="ico"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <div class="addr" aria-hidden="true">${MARK}<span class="addr-t">${esc(parseStep('s06').cmd.text)}</span><i class="caret"></i></div>
      ${V2 ? '' : '<span class="run-pill" aria-hidden="true"><i></i><span>Running</span></span>'}
    </div>
    <div class="browser-body">
      <ol class="dnav-list">${nav.join('')}</ol>
      <div class="dstages" aria-hidden="true">${stages.join('')}</div>
    </div>
  </div>`;
}


/* A → B, drawn per use case (rev 17). Only the captured "A"/"B" letters are text; the rest is drawing.
   redesign: a dated page becomes a new one.  migrate: the same page, lifted from an old server stack
   onto an edge network. */
function abVisual(href, ab) {
  const [A, B] = ab.map((n) => `<b>${esc(n.text)}</b>`);
  if (/#migrate$/.test(href)) {
    const page = (lbl) => `<span class="ab-pg pg-same"><i class="s-title"></i><span class="s-tiles"><i></i><i></i><i></i></span>${lbl}</span>`;
    return `<div class="ab ab-migrate"><span class="ab-col">${page(A)}<span class="base base-old" aria-hidden="true"><i></i><i></i><i></i></span></span>${I.arrow}<span class="ab-col">${page(B)}<span class="base base-edge" aria-hidden="true"><i></i><i></i><i></i><i></i></span></span></div>`;
  }
  return `<div class="ab ab-redesign"><span class="ab-pg pg-old"><i class="o-nav"></i><span class="o-body"><i class="o-side"></i><span class="o-txt"><i></i><i></i><i></i><i></i></span></span>${A}</span>${I.arrow}<span class="ab-pg pg-new"><i class="n-title"></i><i class="n-sub"></i><span class="n-cards"><i></i><i></i></span>${B}</span></div>`;
}

/* ------------------------------------------------------------------ s01 hero + s02 route window */

function hero() {
  const s = slot('s01');
  const c = cursor(s.ordered, 's01');
  // the wordmark is optional: removed at the owner's request (normalize N6)
  const word = c.peek(0)?.kind === 'text' ? c.next('text') : null;
  // the version tag is optional: removed at the owner's request (normalize N4)
  const ver = c.peek(0)?.kind === 'paragraph' && c.peek(1)?.kind === 'paragraph' && c.peek(2)?.kind === 'paragraph' && c.peek(3)?.kind === 'heading' ? c.next('paragraph') : null;
  const lede = c.next('paragraph');
  const seed = c.next('paragraph');
  const h1 = c.next('heading', (n) => n.level === 'h1');
  // the scroll link is optional: removed at the owner's request (normalize N8)
  const scroll = c.peek(0) ? c.next('paragraph') : null;
  c.done();

  // seed line: strong label + generated hash span + authored tail
  const [sLabel, sHash, sTail] = seed.children;
  const expect = `md5("brand" · ${capDate}) → ${md5(`brand · ${capDate}`).slice(0, 8)} ·`;
  if (sHash.text !== expect) throw new Error(`s01 seed hash: captured ${JSON.stringify(sHash.text)} != ported ${JSON.stringify(expect)}`);
  const scrollCta = scroll?.children[0];
  if (scroll && (scroll.children.length !== 1 || scrollCta.kind !== 'cta')) throw new Error('s01: scroll paragraph shape');

  // h1: line spans; a tight-joined "." rides inside the previous line
  const parts = h1.children;
  let h = '';
  parts.forEach((p, k) => {
    if (k && p.sep === '') { h = h.replace(/<\/span>$/, `<span class="h1-dot">${esc(p.text)}</span></span>`); return; }
    h += `${k ? ' ' : ''}<span class="line">${esc(p.text)}</span>`;
  });

  const ledeHtml = lede.children.map((ch, k) => {
    let t = ch.parentTag === 'em' ? `<em>${esc(ch.text)}</em>` : `<span>${esc(ch.text)}</span>`;
    if (k === 1) { // rev 17: the three verbs in the accent; trailing punctuation stays body colour
      const m = ch.text.match(/^(.*?)([.,:;!?]*)$/);
      if (m[1] + m[2] !== ch.text) throw new Error('s01 lede accent split failed');
      t = `<span><span class="ink-accent">${esc(m[1])}</span>${esc(m[2])}</span>`;
    }
    return k === 0 ? t : (k === 1 ? `<br>${t}` : ` ${t}`);
  }).join('');

  return `
<section class="hero" aria-labelledby="h-hero">
  <div class="hero-nebula" aria-hidden="true"><canvas></canvas></div>
  <div class="container hero-inner" data-gate="s01">
    ${word || ver ? `<div class="announce">${word ? `<span class="announce-tag">${MARK}<span>${esc(word.text)}</span></span>` : ''}${ver ? `<p class="announce-text">${esc(ver.text)}</p>` : ''}</div>` : ''}
    <p class="lede hero-lede">${ledeHtml}</p>
    <p class="hero-seed"><strong class="${caps(sLabel.text).trim()}">${esc(sLabel.text)}</strong> <span class="hash" data-seed="brand">${esc(sHash.text)}</span> <span>${esc(sTail.text)}</span></p>
    <h1 id="h-hero" class="display">${h}</h1>
    ${scrollCta ? `<p class="hero-cta">${a(scrollCta, `btn${caps(scrollCta.text)}`, `${esc(scrollCta.text)}`)}</p>` : ''}
  </div>
  ${demo()}
</section>`;
}

/* ------------------------------------------------------------------ s02 route graph (M18, compact) */

function routes() {
  if (!slot('s02')) return ''; // removed at the owner's request (normalize N5)
  const r = slot('s02');
  if (r.ordered.length) throw new Error('s02: expected an empty stream (SVG labels) — re-check the mapping');
  const labels = r.visibleText.split(' ');
  if (labels.length !== 7 || labels.join(' ') !== r.visibleText) throw new Error(`s02: route label parse failed: ${r.visibleText}`);
  const node = (t, k) => `<div class="gnode" style="--k:${k}"><span class="gnode-ico">${I.node}</span><span class="gnode-t">${esc(t)}</span></div>`;
  const lane = (ls, cls) => `<div class="glane ${cls}">${ls.map((t, k) => `${k ? '<i class="glink" aria-hidden="true"></i>' : ''}${node(t, k)}`).join('')}</div>`;

  return `<div class="routes" aria-label="Routes">
      <div class="graph-root" aria-hidden="true">${MARK}</div>
      <svg class="graph-fork" viewBox="0 0 120 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0 100 C 60 100, 60 30, 120 30 M0 100 C 60 100, 60 170, 120 170" fill="none"/></svg>
      <div class="graph-lanes">${lane(labels.slice(0, 4), 'lane-a')}${lane(labels.slice(4), 'lane-b')}</div>
    </div>`;
}

/* ------------------------------------------------------------------ s03 + s04 two ways in */

function ways() {
  const h = slot('s03');
  const c = cursor(h.ordered, 's03');
  const h2 = c.next('heading', (n) => n.level === 'h2');
  const p = c.next('paragraph');
  c.done();

  const d = slot('s04');
  const dc = cursor(d.ordered, 's04');
  const cards = [dc.next('cta'), dc.next('cta')];
  dc.done();

  const card = (cta, k) => {
    const cc = cursor(cta.children, `s04 card ${k}`);
    const name = cc.next('heading', (n) => n.level === 'h3');
    const sub = cc.next('paragraph');
    const flow = cc.next('paragraph');
    const ab = cc.while(isText(null));
    const paras = cc.while((n) => n.kind === 'paragraph');
    cc.done();
    if (ab.length !== 2) throw new Error(`s04 card ${k}: expected A/B pair`);
    const action = paras.pop();
    const [label, cmd, note] = paras;
    const extras = [
      label && `<p class="label${caps(label.text)}">${esc(label.text)}</p>`,
      cmd && `<p class="cmd"><code>${esc(cmd.text)}</code></p>`,
      note && `<p class="note">${esc(note.text)}</p>`,
    ].filter(Boolean).join('');
    if (paras.length > 3) throw new Error(`s04 card ${k}: unexpected extra paragraphs`);
    return `<a class="plan${k ? ' plan-2' : ''}" href="${esc(cta.absHref)}">
      <h3 class="plan-name">${esc(name.text)}</h3>
      <p class="plan-sub">${esc(sub.text)}</p>
      <p class="plan-flow"><code>${esc(flow.text)}</code></p>
      ${abVisual(cta.absHref, ab)}
      ${extras ? `<div class="plan-extra">${extras}</div>` : ''}
      <p class="plan-action${caps(action.text)}"><span class="btn-like">${esc(action.text)}</span></p>
    </a>`;
  };

  return `
<section class="sec ways band-light" id="ways" aria-labelledby="h-ways">
  <div class="container">
    ${routes()}
    <div class="sec-head"><h2 id="h-ways" class="h2">${esc(h2.text)}</h2><p class="lede">${esc(p.text)}</p></div>
    <div class="plans">${cards.map(card).join('')}</div>
  </div>
</section>`;
}


/* Quote body (rev 12): gold quote marks + one gold-marked punchline. The punchline list is a
   design choice, not content: each phrase must occur exactly once, and the pieces must rejoin to
   the captured string byte-for-byte, or the renderer throws. No match = no highlight. */
const PUNCHLINES = []; // rev 13: highlights removed at the owner's request — quotes render plain
function quoteBody(text) {
  const m = text.match(/^([“"]?)([\s\S]*?)([”"]?)$/);
  const [, open, body, close] = m;
  const hit = PUNCHLINES.find((ph) => body.split(ph).length === 2);
  let inner = esc(body);
  if (hit) {
    const [before, after] = body.split(hit);
    inner = `${esc(before)}<mark>${esc(hit)}</mark>${esc(after)}`;
    if (before + hit + after !== body) throw new Error(`quote punchline split failed: ${text}`);
  }
  if (open + body + close !== text) throw new Error(`quote mark split failed: ${text}`);
  return `${open ? `<span class="qm">${esc(open)}</span>` : ''}${inner}${close ? `<span class="qm">${esc(close)}</span>` : ''}`;
}

/* ------------------------------------------------------------------ chapter intros (s05, s10) */

function intro(id, { flow = false, motion = null } = {}) {
  const s = slot(id);
  const c = cursor(s.ordered, id);
  const tab = c.next('text');
  // the chapter title beside the tab is optional: removed at the owner's request (normalize N7)
  const title = c.peek(0)?.kind === 'text' ? c.next('text') : null;
  const h2 = c.next('heading', (n) => n.level === 'h2');
  const lede = c.next('paragraph');
  const quote = c.next('paragraph');
  const who = c.next('paragraph');
  let flowHtml = '';
  if (flow) {
    const items = [];
    while (c.peek()) items.push([c.next('text', (n) => n.parentTag === 'strong'), c.next('text')]);
    flowHtml = `<div class="stats">${items.map(([t, d]) => `<div class="stat"><strong>${esc(t.text)}</strong> <span>${esc(d.text)}</span></div>`).join('')}</div>`;
  }
  c.done();
  return `
    <div class="intro-label"${motion ? ` data-motion="${motion}"` : ''}><span class="tab${caps(tab.text)}">${motion === 'morph' ? [...tab.text].map((ch, i) => `<span class="ch" style="--i:${i}">${esc(ch)}</span>`).join('') : esc(tab.text)}</span>${title ? `<span class="tab-title">${esc(title.text)}</span>` : ''}</div>
    <div class="sec-head"><h2 class="h2">${lines(h2)}</h2><p class="lede">${esc(lede.text)}</p></div>
    <figure class="quote"><blockquote><p>${quoteBody(quote.text)}</p></blockquote><figcaption><span class="quote-mark" aria-hidden="true">${MARK}</span><p>${esc(who.text)}</p></figcaption></figure>
    ${flowHtml}`;
}

/* ------------------------------------------------------------------ chapter mocks (product-UI windows) */

const bar = (url, end, endCls = '') => `<div class="win-bar">${dots}<span class="win-url">${url}</span><span class="win-end${endCls}">${end}</span></div>`;

const MOCKS = {
  extract(t) {
    const c = cursor(t, 'mock extract');
    const url = c.next('text', isText('url'));
    const end = c.next('text', isText('end'));
    const label = c.next('text', isText('label'));
    const aa = c.next('text', isText('aa'));
    const tags = c.while(isText(null));
    c.done();
    return `<div class="window mock">
      ${bar(esc(url.text), esc(end.text))}
      <div class="mock-body capture">
        <p class="mock-label${caps(label.text)}">${esc(label.text)}</p>
        <div class="swatches" aria-hidden="true">${tokens.palette.chart.map((col) => `<i style="background:${col}"></i>`).join('')}<i class="sw-cream"></i></div>
        <div class="typecard"><span class="aa">${esc(aa.text)}</span><span class="rows" aria-hidden="true"><i style="width:90%"></i><i style="width:70%"></i><i style="width:80%"></i><i style="width:45%"></i></span></div>
        <div class="chips">${tags.map((g, k) => `<span class="chip${k ? '' : ' on'}">${esc(g.text)}</span>`).join(' ')}</div>
      </div>
    </div>`;
  },
  direct(t) {
    const c = cursor(t, 'mock direct');
    const url = c.next('text', isText('url'));
    const end = c.next('text', isText('end'));
    const date = c.next('text', (n) => /^\d{4}-\d{2}-\d{2}$/.test(n.text));
    if (date.text !== capDate) throw new Error(`mock direct: date ${date.text} != capture date ${capDate}`);
    const label = c.next('text', isText('label'));
    const hashes = c.while((n) => n.kind === 'text' && /^[0-9a-f]{8}$/.test(n.text));
    const eq = c.next('text', isText('eq'));
    const rows = [];
    while (c.peek()) rows.push([c.next('text', isText('k')), c.next('text'), c.next('text', isText('p'))]);
    c.done();
    return `<div class="window mock">
      ${bar(esc(url.text), `${esc(end.text)} <span data-today>${esc(date.text)}</span>`)}
      <div class="mock-body seed">
        <p class="mock-label${caps(label.text)}">${esc(label.text)}</p>
        <div class="hashes">${hashes.map((h) => `<span>${esc(h.text)}</span>`).join(' ')}</div>
        <p class="eq">${esc(eq.text)}</p>
        <div class="table">${rows.map(([k, v, p]) => `<div class="tr"><span class="td k">${esc(k.text)}</span> <span class="td v">${esc(v.text)}</span> <span class="td p"><span class="pill">${esc(p.text)}</span></span></div>`).join('')}</div>
      </div>
    </div>`;
  },
  prototype(t) {
    const c = cursor(t, 'mock prototype');
    const tabs = c.while((n) => n.kind === 'text' && n.parentTag === 'b');
    const end = c.next('text', isText('end'));
    c.done();
    const pg = (cls) => `<div class="wf ${cls}" aria-hidden="true"><i class="wf-nav"></i><i class="wf-hero"></i><span class="wf-row"><i></i><i></i><i></i></span><span class="wf-txt"><i></i><i></i><i></i></span></div>`;
    return `<div class="window mock">
      <div class="win-bar">${dots}<span class="seg">${tabs.map((b) => `<b class="${(b.parentClass || '').includes('on') ? 'on' : ''}${caps(b.text)}">${esc(b.text)}</b>`).join(' ')}</span><span class="win-end">${esc(end.text)}</span></div>
      <div class="mock-body ba">${pg('wf-before')}${I.arrow}${pg('wf-after')}</div>
    </div>`;
  },
  replica(t) {
    const c = cursor(t, 'mock replica');
    const url = c.next('text', isText('url'));
    const end = c.next('text', isText('pass'));
    const labels = c.while(isText('label'));
    const gates = c.while((n) => n.kind === 'text' && n.parentTag === 'b');
    c.done();
    const pg = '<div class="wf" aria-hidden="true"><i class="wf-nav"></i><i class="wf-hero"></i><span class="wf-row"><i></i><i></i><i></i></span><span class="wf-txt"><i></i><i></i></span></div>';
    return `<div class="window mock">
      ${bar(esc(url.text), esc(end.text), ' ok')}
      <div class="mock-body pair">
        ${labels.map((l, k) => `<div class="thumb"><p class="mock-label${caps(l.text)}">${esc(l.text)}</p>${pg}${k ? '<i class="scan" aria-hidden="true"></i>' : ''}</div>`).join('')}
      </div>
      <div class="mock-foot chips">${gates.map((g) => `<span class="chip ok">${I.check}<span>${esc(g.text)}</span></span>`).join(' ')}</div>
    </div>`;
  },
  deploy(t) {
    const c = cursor(t, 'mock deploy');
    const url = c.next('text', isText('url'));
    const end = c.next('text', isText('end'));
    const names = c.while(isText('name'));
    c.done();
    return `<div class="window mock">
      ${bar(esc(url.text), esc(end.text))}
      <div class="mock-body chain">${names.map((n, k) => `${k ? '<i class="glink v" aria-hidden="true"></i>' : ''}<div class="gnode wide"><span class="gnode-ico">${I.node}</span><span class="gnode-t">${esc(n.text)}</span><span class="gnode-ok" aria-hidden="true">${I.check}</span></div>`).join('')}</div>
    </div>`;
  },
  rollout(t) {
    const c = cursor(t, 'mock rollout');
    const url = c.next('text', isText('url'));
    const end = c.next('text', isText('end'));
    const rows = [];
    while (c.peek() && !isText('foot')(c.peek())) rows.push([c.next('text'), c.next('text', isText('st'))]);
    const foot = c.next('text', isText('foot'));
    c.done();
    const m = end.text.match(/(\d+)\s*\/\s*(\d+)/);
    const pct = m ? ((100 * Number(m[1])) / Number(m[2])).toFixed(1) : 0;
    const st = (n) => (n.parentClass.includes('ok') ? 'ok' : n.parentClass.includes('run') ? 'run' : 'wait');
    return `<div class="window mock">
      ${bar(esc(url.text), esc(end.text))}
      <div class="mock-body sheet">
        <div class="meter" aria-hidden="true"><i style="width:${pct}%"></i></div>
        <div class="table">${rows.map(([p, s], k) => `<div class="tr"><span class="td idx" aria-hidden="true"></span><span class="td path">${esc(p.text)}</span> <span class="td"><span class="status ${st(s)}${caps(s.text)}">${esc(s.text)}</span></span></div>`).join('')}</div>
        <p class="mock-foot-line">${esc(foot.text)}</p>
      </div>
    </div>`;
  },
};

/* ------------------------------------------------------------------ numbered step (M14) */

function parseStep(id) {
  const s = slot(id);
  const c = cursor(s.ordered, id);
  const digits = c.while(isText('d'));
  const name = c.next('heading', (n) => n.level === 'h3');
  const cmd = c.next('paragraph');
  const title = c.next('heading', (n) => n.level === 'h4');
  const body = c.next('paragraph');
  const mockNodes = c.while((n) => n.kind === 'text');
  // the "In this step" label is optional: removed in v2 (V2-N17)
  const label = c.peek(0)?.kind === 'paragraph' ? c.next('paragraph') : null;
  const items = c.while((n) => n.kind === 'listItem');
  const cta = c.next('cta');
  c.done();
  const mock = MOCKS[name.text.toLowerCase()];
  if (!mock) throw new Error(`${id}: no mock for chapter ${name.text}`);
  return { digits, name, cmd, title, body, mockNodes, label, items, cta, mock };
}

function step(id) {
  const { digits, name, cmd, title, body, mockNodes, label, items, cta, mock } = parseStep(id);
  if (V2) {
    // v2 #4/#6: no numbered eyebrow row — the step name + command ARE the heading; the checklist is a plain list.
    if (digits.length || label) throw new Error(`${id}: v2 expects step numbers + label removed (V2-N16/N17)`);
    return `
  <article class="step step-v2" aria-labelledby="h-${id}">
    <div class="step-copy">
      <div class="step-head"><h3 id="h-${id}" class="step-name">${esc(name.text)}</h3><p class="cmd"><code>${esc(cmd.text)}</code></p></div>
      <h4 class="step-title">${lines(title)}</h4>
      <p class="lede">${esc(body.text)}</p>
    </div>
    ${mock(mockNodes)}
    <ul class="plain-list">${items.map((li) => `<li>${esc(li.text)}</li>`).join('')}</ul>
    <p class="step-cta">${a(cta, 'btn btn-secondary', `${I.github}<span>${esc(cta.text)}</span>`)}</p>
  </article>`;
  }
  return `
  <article class="step" aria-labelledby="h-${id}">
    <div class="step-label"><span class="num">${digits.map((d) => `<span>${esc(d.text)}</span>`).join('')}</span><h3 id="h-${id}" class="step-name">${esc(name.text)}</h3><p class="cmd"><code>${esc(cmd.text)}</code></p></div>
    <div class="step-grid">
      <div class="step-copy">
        <h4 class="step-title">${lines(title)}</h4>
        <p class="lede">${esc(body.text)}</p>
      </div>
      ${mock(mockNodes)}
    </div>
    <div class="cells-wrap"><p class="label${caps(label.text)}">${esc(label.text)}</p><ul class="cells">${items.map((li) => `<li>${I.check}<span>${esc(li.text)}</span></li>`).join('')}</ul></div>
    <p class="step-cta">${a(cta, 'btn btn-secondary', `${I.github}<span>${esc(cta.text)}</span>`)}</p>
  </article>`;
}

/* ------------------------------------------------------------------ s09 showcase */

function showcase() {
  const s = slot('s09');
  const c = cursor(s.ordered, 's09');
  const h2 = c.next('heading', (n) => n.level === 'h2');
  const p = c.next('paragraph');
  const how = c.next('paragraph');
  const figs = [];
  while (c.peek()) figs.push([c.next('paragraph'), c.next('image')]);
  c.done();
  const howCta = how.children[0];
  return `
<section class="sec showcase" aria-labelledby="h-show">
  <div class="container">
    <div class="sec-head row"><div><h2 id="h-show" class="h2">${lines(h2)}</h2><p class="lede">${esc(p.text)}</p></div><p class="sec-action">${a(howCta, `btn btn-secondary${caps(howCta.text)}`)}</p></div>
    <div class="media-grid">${figs.map(([cap, img], k) => `<figure class="media-card${k ? ' after' : ''}"><p class="media-label${caps(cap.text)}">${esc(cap.text)}</p><img src="${esc(img.currentSrc)}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}" loading="lazy"></figure>`).join('')}</div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ s14 install */

function install() {
  const s = slot('s14');
  const c = cursor(s.ordered, 's14');
  const h2 = c.next('heading', (n) => n.level === 'h2');
  const lede = c.next('paragraph');
  const btnPs = c.while((n) => n.kind === 'paragraph' && n.children?.length === 1 && n.children[0].kind === 'cta');
  // the credit line is optional: removed at the owner's request (normalize N10)
  const built = c.peek(0)?.kind === 'paragraph' && c.peek(0).children?.some((ch) => ch.kind === 'cta') ? c.next('paragraph') : null;
  const quote = c.next('paragraph');
  const who = c.next('paragraph');
  const title = c.next('text', (n) => !n.parentClass);
  const term = c.while((n) => n.kind === 'text');
  c.done();
  if (btnPs.length !== 2) throw new Error('s14: expected two button paragraphs');
  const [copy, readme] = btnPs.map((p) => p.children[0]);
  const builtHtml = built ? inline(built, (ch) => (ch.kind === 'cta' ? a(ch, 'inline-link') : esc(ch.text))) : '';
  const line = (n) => {
    const k = n.parentClass;
    if (k === 'p') return `<p class="msg-ctx">${esc(n.text)}</p>`;
    if (k === 'c') return `<p class="msg-user"><span>${esc(n.text)}</span></p>`;
    if (k === 'd') return `<p class="msg-agent"><span class="msg-ico" aria-hidden="true">${MARK}</span><span>${esc(n.text)}</span></p>`;
    throw new Error(`s14 terminal: unknown line class ${k}`);
  };
  const copyLines = term.filter((n) => n.parentClass === 'c' && n.text.startsWith('/plugin')).map((n) => n.text);
  return `
<section class="sec final" id="install" aria-labelledby="h-install">
  <div class="container">
    <div class="final-head">
      <h2 id="h-install" class="h2">${lines(h2)}</h2>
      <p class="lede">${esc(lede.text)}</p>
      <div class="actions"><p>${a(copy, `btn btn-primary${caps(copy.text)}`, `<span class="txt">${esc(copy.text)}</span>`).replace('<a ', `<a data-copy="${esc(JSON.stringify(copyLines))}" role="button" `)}</p><p>${a(readme, `btn btn-secondary${caps(readme.text)}`)}</p></div>
      ${builtHtml ? `<p class="built">${builtHtml}</p>` : ''}
    </div>
    <div class="final-grid">
      <figure class="quote compact"><blockquote><p>${quoteBody(quote.text)}</p></blockquote><figcaption><span class="quote-mark" aria-hidden="true">${MARK}</span><p>${esc(who.text)}</p></figcaption></figure>
      <div class="window chat">
        <div class="win-bar">${dots}<span class="win-url">${esc(title.text)}</span><span class="win-end" aria-hidden="true">${I.chev}</span></div>
        <div class="chat-body">${term.map(line).join('')}</div>
        <div class="composer" aria-hidden="true"><span class="composer-in"></span><span class="composer-send">${I.arrow}</span></div>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ chrome (D1/D2 — out of gate scope) */

const SRC = 'https://stardust.style/';
const nav = `
<header class="nav">
  <div class="container nav-inner">
    <a class="brand" href="${SRC}">${MARK_COLOR}<span>stardust</span></a>
    <nav class="nav-links" aria-label="Primary">
      <a href="${SRC}#redesign">Redesign</a>
      <a href="${SRC}#migrate">Migrate</a>
    </nav>
    <a class="nav-gh" href="https://github.com/adobe/skills/tree/main/plugins/stardust" aria-label="GitHub">${I.github}<span>GitHub</span></a>
    <a class="nav-btn" href="${SRC}#install">Install Stardust</a>
  </div>
</header>`;

const footSeed = `md5("stardust" · ${capDate}) → ${md5(`stardust · ${capDate}`).slice(0, 8)}`;
const footer = `
<footer class="foot">
  <div class="container">
    <div class="foot-top">
      <div class="foot-col foot-brand"><a class="brand" href="${SRC}">${MARK_COLOR}<span>stardust</span></a><span class="foot-gold">Open Source · Apache 2.0</span><span class="foot-gold">AI skills from Adobe</span></div>
      <div class="foot-col"><p class="foot-h">Stardust</p><a href="${SRC}#redesign">Redesign</a><a href="${SRC}#migrate">Migrate</a></div>
      <div class="foot-col"><p class="foot-h">Source</p><a href="https://github.com/adobe/skills/tree/main/plugins/stardust">GitHub</a><a href="${SRC}#install">Install</a></div>
      <div class="foot-col"><p class="foot-h">brief + seed = star</p><span class="seedline" data-seed-foot>${esc(footSeed)}</span></div>
    </div>
    <div class="foot-big" aria-label="stardust"><span>s</span><span>t</span><span>a</span><span>r</span><span>d</span><span>u</span><span>s</span><span>t</span></div>
  </div>
</footer>`;

/* ------------------------------------------------------------------ head (metadata verbatim) */

function head() {
  const m = model.metadata;
  const metaTags = [
    m.description != null && `<meta name="description" content="${esc(m.description)}">`,
    ...Object.entries(m.ogTags || {}).map(([k, v]) => `<meta property="${esc(k)}" content="${esc(v)}">`),
    ...Object.entries(m.twitterTags || {}).map(([k, v]) => `<meta name="${esc(k)}" content="${esc(v)}">`),
  ].filter(Boolean).join('\n  ');
  const ld = (m.jsonLd || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n  ');
  return `<meta charset="utf-8">
  <title>${esc(m.title)}</title>
  ${m.canonical ? `<link rel="canonical" href="${esc(m.canonical)}">` : ''}
  ${metaTags}
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${m.favicon ? `<link rel="icon" href="${esc(m.favicon)}">` : ''}
  ${ld}`;
}

/* ------------------------------------------------------------------ CSS from donor tokens */

const T = tokens;
const css = `
@font-face { font-family: interVariable; src: url(https://rsms.me/inter/font-files/InterVariable.woff2) format("woff2"); font-weight: 100 900; font-style: normal; font-display: swap; }
@font-face { font-family: interVariable; src: url(https://rsms.me/inter/font-files/InterVariable-Italic.woff2) format("woff2"); font-weight: 100 900; font-style: italic; font-display: swap; }
:root {
  --page: ${T.palette.pageBg}; --fg: ${T.palette.headingFg}; --muted: ${T.palette.mutedFg}; --dim: ${T.palette.dimFg};
  --display-muted: ${T.palette.displayMuted}; --s1: ${T.palette.surface1}; --s2: ${T.palette.surface2}; --border: ${T.palette.border};
  --accent: ${T.palette.accent}; --blue: ${T.palette.chart[0]}; --btn2: ${T.buttons.secondary.background};
  --font: ${T.type.family};
  --container: ${T.layout.containerMaxWidth}; --px: ${T.layout.contentPx}; --sec: ${T.layout.sectionPaddingY};
  --r: ${T.radii.card}; --r-panel: ${T.radii.panel}; --r-win: ${T.radii.window};
}
*, *::before, *::after { box-sizing: border-box; }
html { background: var(--page); scroll-behavior: smooth; scroll-padding-top: 72px; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { margin: 0; background: ${T.palette.pageBg}; color: ${T.palette.bodyFg}; font-family: var(--font); font-size: ${T.type.body.fontSize}; line-height: ${T.type.body.lineHeight}; font-weight: 400; -webkit-font-smoothing: antialiased; font-feature-settings: "cv11", "ss01"; text-rendering: optimizeLegibility; overflow-x: clip; }
h1, h2, h3, h4, p, figure, blockquote, ul { margin: 0; }
ul { padding: 0; list-style: none; }
a { color: inherit; text-decoration: none; }
img { display: block; max-width: 100%; height: auto; }
code { font-family: var(--font); font-size: inherit; }
.caps { text-transform: uppercase; }
.ico { width: 16px; height: 16px; flex: none; }
.mark { width: 18px; height: 18px; fill: currentColor; flex: none; }
.container { max-width: var(--container); margin: 0 auto; padding: ${T.layout.containerPadding}; }
:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; border-radius: 4px; }

/* frame: dashed guides at the column edges */
main { position: relative; }
main::before { content: ""; position: absolute; inset: 0 auto 0 50%; width: min(var(--container), 100%); transform: translateX(-50%); border-left: 1px dashed var(--border); border-right: 1px dashed var(--border); pointer-events: none; z-index: 0; }
main > * { position: relative; z-index: 1; }

/* buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; height: ${T.buttons.primary.height}; padding: ${T.buttons.primary.padding}; border-radius: ${T.buttons.primary.borderRadius}; font-size: ${T.buttons.primary.fontSize}; font-weight: ${T.buttons.primary.fontWeight}; line-height: 20px; background: ${T.buttons.primary.background}; color: ${T.buttons.primary.color}; white-space: nowrap; transition: background-color .2s ease, box-shadow .2s ease; }
.btn:hover { background: rgb(255, 253, 248); }
.btn-secondary { background: ${T.buttons.secondary.background}; color: ${T.buttons.secondary.color}; box-shadow: ${T.buttons.secondary.boxShadow}; }
.btn-secondary:hover { background: rgb(62, 80, 104); }
.btn.caps, .caps .btn-like { letter-spacing: .02em; }
.label, .mock-label { font-size: ${T.type.eyebrow.fontSize}; line-height: ${T.type.eyebrow.lineHeight}; letter-spacing: ${T.type.eyebrow.letterSpacing}; color: ${T.type.eyebrow.color}; }
.label.caps, .mock-label.caps { letter-spacing: .02em; }
.lede { font-size: ${T.type.lede.fontSize}; line-height: ${T.type.lede.lineHeight}; letter-spacing: ${T.type.lede.letterSpacing}; color: var(--muted); max-width: 34em; }
.h2 { font-size: ${T.type.h2.fontSize}; line-height: ${T.type.h2.lineHeight}; font-weight: ${T.type.h2.fontWeight}; letter-spacing: ${T.type.h2.letterSpacing}; color: ${T.palette.headingFg}; text-wrap: balance; }
.h2 .line, .step-title .line { display: block; }
.sec { padding: var(--sec) 0; border-top: 1px solid var(--border); }
.sec-head { display: grid; gap: 12px; padding: 0 var(--px); margin-bottom: 36px; }
.sec-head .h2 { max-width: 13em; }
.sec-head.row { grid-template-columns: 1fr auto; align-items: end; }
.sec-head.row > div { display: grid; gap: 12px; }

/* nav (M1) */
.nav { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--page) 88%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
.nav-inner { display: flex; align-items: center; gap: 24px; height: ${T.layout.navHeight}; }
.brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 17px; letter-spacing: -0.3px; }
.nav-links { display: flex; gap: 4px; margin: 0 auto 0 8px; }
.nav-gh { display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 6px 10px; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--muted); transition: color .2s ease, background-color .2s ease; }
.nav-gh:hover { color: var(--fg); background: var(--s1); }
.nav-gh .ico { width: 16px; height: 16px; }
.nav-inner { gap: 16px; }
.nav-links a { padding: 6px 12px; font-size: 14px; font-weight: 500; color: var(--muted); border-radius: var(--r); transition: color .2s ease, background-color .2s ease; }
.nav-links a:hover { color: var(--fg); background: var(--s1); }
.nav-btn { display: inline-flex; align-items: center; height: 32px; padding: 6px 12px; border-radius: 8px; background: ${T.buttons.primary.background}; color: ${T.buttons.primary.color}; font-size: 14px; font-weight: 500; white-space: nowrap; }

/* hero (M2) */
.hero { position: relative; padding: var(--sec) 0 0; overflow: clip; border-bottom: 1px solid var(--border); }
.hero-nebula { position: absolute; inset: 0 0 auto; height: min(100%, 1040px); pointer-events: none; -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 96%); mask-image: linear-gradient(to bottom, #000 55%, transparent 96%); }
.hero-nebula canvas { display: block; width: 100%; height: 100%; }
.hero-inner { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0; padding-bottom: 48px; }
.announce { order: 0; display: inline-flex; align-items: center; gap: 10px; padding: 4px 10px 4px 4px; margin-bottom: 28px; border: 1px solid var(--border); border-radius: 9999px; font-size: 14px; color: var(--fg); background: var(--s1); }
.announce-tag { display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px 2px 8px; border-radius: 9999px; background: color-mix(in oklab, ${T.palette.announceTint} 22%, transparent); color: ${T.palette.announceTint}; font-weight: 500; }
.announce-tag .mark { width: 14px; height: 14px; }
.announce-text { color: var(--muted); font-variant-numeric: tabular-nums; }
.announce:not(:has(.announce-text)) { padding-right: 4px; }
.display { order: 1; font-size: ${T.type.display.fontSize}; line-height: ${T.type.display.lineHeight}; font-weight: ${T.type.display.fontWeight}; letter-spacing: ${T.type.display.letterSpacing}; color: var(--fg); }
.display .line { display: inline; }
.display { white-space: nowrap; text-shadow: 0 2px 24px rgba(8, 30, 61, .55); }
.hero-lede, .hero-seed { text-shadow: 0 1px 16px rgba(8, 30, 61, .7); }
.hero-lede { order: 2; margin-top: 20px; max-width: 30em; font-size: ${T.type.heroLede.fontSize}; line-height: ${T.type.heroLede.lineHeight}; letter-spacing: ${T.type.heroLede.letterSpacing}; }
.hero-cta { order: 3; margin-top: 28px; display: flex; gap: 8px; }
.hero-seed { order: 4; margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 10px; font-size: 12px; line-height: 16px; color: var(--dim); font-variant-numeric: tabular-nums; }
.hero-seed strong { font-weight: 500; color: var(--muted); letter-spacing: .02em; }
.hero-seed .hash { color: var(--muted); }

/* windows (product-UI mocks) */
.window { background: var(--s1); border-radius: var(--r-win); box-shadow: ${T.shadows.window}; overflow: hidden; }
.win-bar { display: flex; align-items: center; gap: 12px; height: 44px; padding: 0 16px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--muted); }
.win-dots { display: inline-flex; gap: 6px; }
.win-dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--s2); box-shadow: inset 0 0 0 1px var(--border); }
.win-url { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--fg); font-weight: 500; }
.win-end { margin-left: auto; white-space: nowrap; font-variant-numeric: tabular-nums; }
.win-end.ok { color: var(--accent); }
.win-skel { width: 120px; height: 8px; border-radius: 4px; background: var(--s2); }
.routes { display: grid; grid-template-columns: 72px 104px 1fr; align-items: center; padding: 28px 32px; margin-bottom: 40px; border: 1px solid var(--border); border-radius: var(--r-panel); background: radial-gradient(70% 120% at 0% 50%, rgba(75, 141, 248, .08), transparent 70%), var(--s1); }
.ways .routes { order: 2; }
.ways > .container { display: flex; flex-direction: column; }
.ways .sec-head { order: 1; }
.ways .plans { order: 3; }
.graph-root { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 16px; background: var(--s2); box-shadow: 0 0 0 1px var(--border), 0 0 40px rgba(244, 242, 236, .08); color: var(--fg); }
.graph-root .mark { width: 28px; height: 28px; }
.graph-fork { width: 104px; height: 150px; }
.graph-fork path { stroke: var(--border); stroke-width: 1.5; stroke-dasharray: 4 4; vector-effect: non-scaling-stroke; }
.graph-lanes { display: grid; gap: 56px; }
.glane { display: flex; align-items: center; }
.glink { flex: 1; min-width: 16px; height: 0; border-top: 1.5px dashed var(--border); }
.glink.v { flex: none; width: 0; height: 18px; border-top: 0; border-left: 1.5px dashed var(--border); margin-left: 28px; }
.gnode { display: inline-flex; align-items: center; gap: 10px; padding: 8px 14px 8px 8px; border-radius: var(--r-panel); background: var(--s2); box-shadow: 0 0 0 1px var(--border); font-size: 15px; font-weight: 500; color: var(--fg); white-space: nowrap; }
.gnode-ico { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: var(--s1); color: var(--muted); }

/* D4 hero demo — a stardust run in a browser (rev 4) */
.demo { position: relative; max-width: 1180px; margin: 0 auto 72px; text-align: left; }
.browser-bar { display: flex; align-items: center; gap: 14px; height: 48px; padding: 0 16px; border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--s1) 70%, var(--page)); }
.browser-nav { display: inline-flex; gap: 4px; color: var(--dim); }
.addr { flex: 1; max-width: 560px; margin: 0 auto; display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 12px; border-radius: 8px; background: var(--s2); box-shadow: inset 0 0 0 1px var(--border); font-size: 13px; color: var(--fg); white-space: nowrap; overflow: hidden; }
.addr .mark { width: 12px; height: 12px; color: var(--muted); }
.addr-t { overflow: hidden; text-overflow: ellipsis; }
.caret { width: 1.5px; height: 15px; background: var(--fg); flex: none; }
.run-pill { display: inline-flex; align-items: center; gap: 6px; padding: 2px 9px; border-radius: 9999px; background: rgba(247, 202, 110, .12); color: var(--accent); font-size: 12px; font-weight: 500; }
.run-pill i { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
.demo.done .run-pill { background: var(--s2); color: var(--muted); }
.demo.done .run-pill i { background: var(--muted); box-shadow: none; }
.browser-body { display: grid; grid-template-columns: 300px minmax(0, 1fr); min-height: 480px; }
.dnav-list { display: flex; flex-direction: column; gap: 4px; padding: 18px 14px; margin: 0; list-style: none; border-right: 1px solid var(--border); background: color-mix(in srgb, var(--s1) 70%, var(--page)); }
.dnav-grp { padding: 10px 10px 4px; font-size: 11px; letter-spacing: .04em; color: var(--dim); }
.dnav-grp:first-child { padding-top: 0; }
.dnav { position: relative; display: grid; grid-template-columns: 28px 1fr; gap: 0 6px; width: 100%; padding: 9px 10px 11px; border: 0; border-radius: 10px; background: transparent; color: var(--muted); font: inherit; text-align: left; cursor: pointer; overflow: hidden; transition: background-color .25s ease, color .25s ease; }
.dnav:hover { background: var(--s1); color: var(--fg); }
.dnav.on { background: var(--s2); color: var(--fg); }
.dnav-n { grid-row: span 2; font-size: 12px; line-height: 20px; color: var(--dim); font-variant-numeric: tabular-nums; }
.dnav-t { font-size: 14px; line-height: 20px; font-weight: 500; }
.dnav-s { font-size: 12px; line-height: 16px; color: var(--dim); }
.dnav.on .dnav-s { color: var(--muted); }
.dnav.past .dnav-n { color: var(--accent); }
.dnav-bar { position: absolute; left: 10px; right: 10px; bottom: 4px; height: 2px; border-radius: 1px; background: transparent; transform-origin: left; transform: scaleX(0); }
.dnav.on .dnav-bar { background: var(--fg); }
.dnav.past .dnav-bar { transform: scaleX(0); }
.dstages { display: grid; grid-template-columns: minmax(0, 1fr); min-width: 0; align-items: center; padding: 32px 40px; background: radial-gradient(70% 90% at 70% 0%, rgba(75, 141, 248, .08), transparent 70%); }
.dstage { grid-area: 1 / 1; min-width: 0; opacity: 0; visibility: hidden; transform: translateY(10px) scale(.985); transition: opacity .45s ease, transform .6s cubic-bezier(.2, .7, .2, 1), visibility 0s linear .45s; }
.dstage.on { opacity: 1; visibility: visible; transform: none; transition: opacity .45s ease .1s, transform .6s cubic-bezier(.2, .7, .2, 1) .1s, visibility 0s; }
.dstage .mock { max-width: 640px; margin: 0 auto; }

@media (prefers-reduced-motion: no-preference) {
  .demo.auto .dnav.on .dnav-bar { animation: fill var(--dur, 4200ms) linear both; }
  .dstage.play .mock { --e: cubic-bezier(.2, .7, .2, 1); }
  /* extract: swatches pop, type card and tags stagger in */
  .dstage.play .swatches i { animation: pop .45s var(--e) calc(.35s + var(--i, 0) * .09s) both; }
  .dstage.play .typecard { animation: rise .5s var(--e) .9s both; }
  .dstage.play .chips .chip { animation: rise .4s var(--e) calc(1.2s + var(--i, 0) * .08s) both; }
  /* direct: hashes roll (JS scramble), roll table rows resolve */
  .dstage.play .hashes span { animation: pop .4s var(--e) calc(.3s + var(--i, 0) * .1s) both; }
  .dstage.play .seed .eq { animation: rise .4s var(--e) 1.2s both; }
  .dstage.play .seed .tr { animation: rise .4s var(--e) calc(1.4s + var(--i, 0) * .14s) both; }
  /* prototype: the after page wipes in, the toggle follows */
  .dstage.play .wf-before { animation: rise .45s var(--e) .3s both; }
  .dstage.play .wf-after { animation: wipe .9s var(--e) 1s both; }
  .dstage.play .ba > .ico { animation: rise .4s var(--e) .8s both; }
  .dstage.play .seg b { transition: background-color .3s ease, color .3s ease; }
  /* replica: scan sweeps, gates check */
  .dstage.play .thumb { animation: rise .45s var(--e) calc(.3s + var(--i, 0) * .15s) both; }
  .dstage.play .scan { animation: scan 1.6s ease-in-out .7s both; }
  .dstage.play .chip.ok { animation: pop .4s var(--e) calc(2.1s + var(--i, 0) * .18s) both; }
  .dstage.play .win-end.ok { animation: rise .4s var(--e) 2.7s both; }
  /* deploy: blocks land one by one, each checks */
  .dstage.play .chain .gnode { animation: rise .4s var(--e) calc(.3s + var(--i, 0) * .32s) both; }
  .dstage.play .chain .glink { animation: grow-y .3s var(--e) calc(.55s + var(--i, 0) * .32s) both; }
  .dstage.play .chain .gnode-ok { animation: pop .35s var(--e) calc(.6s + var(--i, 0) * .32s) both; }
  /* rollout: meter fills, rows deliver */
  .dstage.play .meter i { animation: grow 2.4s cubic-bezier(.3, .6, .2, 1) .3s both; transform-origin: left; }
  .dstage.play .sheet .tr { animation: rise .35s var(--e) calc(.4s + var(--i, 0) * .26s) both; }
  .dstage.play .sheet .status { animation: pop .3s var(--e) calc(.6s + var(--i, 0) * .26s) both; }
  .dstage.play .mock-foot-line { animation: rise .4s var(--e) 2.4s both; }
  .demo.auto .caret { animation: blink 1s steps(1) infinite; }
}
@keyframes pop { from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: none; } }
@keyframes wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes scan { 0% { top: 4%; opacity: 0; } 15% { opacity: .8; } 85% { opacity: .8; } 100% { top: 92%; opacity: 0; } }
@keyframes grow-y { from { transform: scaleY(0); } to { transform: none; } }
@keyframes fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.lane-a .gnode-ico { color: var(--blue); }
.lane-b .gnode-ico { color: var(--accent); }
.gnode.wide { display: flex; width: 100%; }
.gnode-ok { margin-left: auto; color: var(--accent); }

/* plans (M21) */
.plans { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); }
.plan { display: flex; flex-direction: column; gap: 14px; padding: 32px 24px 24px; transition: background-color .25s ease; }
.plan + .plan { border-left: 1px solid var(--border); }
.plan:hover { background: var(--s1); }
.plan-name { font-size: 20px; line-height: 28px; font-weight: 500; letter-spacing: -0.3px; }
.plan-sub { color: var(--fg); font-weight: 500; margin-top: -10px; }
.plan-flow code, .cmd code { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 9999px; background: var(--s2); box-shadow: inset 0 0 0 1px var(--border); font-size: 13px; line-height: 18px; color: var(--muted); font-variant-ligatures: none; }
.ab { display: flex; align-items: center; gap: 12px; color: var(--dim); margin: 6px 0; }
.ab-pg { position: relative; display: grid; place-items: end start; width: 112px; height: 68px; padding: 6px 8px; border-radius: var(--r); background: var(--s2); box-shadow: inset 0 0 0 1px var(--border); background-image: linear-gradient(var(--border), var(--border)), linear-gradient(var(--border), var(--border)); background-size: 70% 6px, 45% 6px; background-position: 8px 10px, 8px 22px; background-repeat: no-repeat; }
.ab-pg.ab-new { background-color: var(--fg); background-image: linear-gradient(var(--page), var(--page)), linear-gradient(rgb(75, 141, 248), rgb(75, 141, 248)); }
.ab-pg b { font-size: 11px; font-weight: 500; color: var(--muted); }
.ab-new b { color: var(--page); }
.plan-extra { display: grid; gap: 6px; padding-top: 14px; border-top: 1px solid var(--border); }
.plan-extra .cmd code { color: var(--fg); }
.note { font-size: 14px; line-height: 20px; color: var(--muted); }
.plan-action { margin-top: auto; padding-top: 10px; }
.btn-like { display: flex; justify-content: center; align-items: center; height: 36px; border-radius: 8px; background: var(--btn2); color: var(--fg); font-size: 14px; font-weight: 500; }
.plan-2 .btn-like { background: ${T.buttons.primary.background}; color: ${T.buttons.primary.color}; }


/* "Two ways in." — full-width light band (user request, rev 6): the palette inverted, cream ground + navy ink */
.band-light { --ink: ${T.palette.pageBg}; --ink-muted: rgb(79, 94, 114); --line: rgb(211, 212, 212); --tint: rgb(232, 230, 222); background: ${T.palette.headingFg}; color: var(--ink); border-top-color: var(--border); }
.band-light .h2 { color: var(--ink); }
.band-light .lede { color: var(--ink-muted); }
.band-light .plans { border-color: var(--line); background: rgb(250, 249, 245); }
.band-light .plan + .plan { border-left-color: var(--line); }
.band-light .plan:hover { background: var(--tint); }
.band-light .plan-sub { color: var(--ink); }
.band-light .plan-flow code, .band-light .cmd code { background: var(--tint); box-shadow: inset 0 0 0 1px var(--line); color: var(--ink-muted); }
.band-light .plan-extra { border-top-color: var(--line); }
.band-light .plan-extra .cmd code { color: var(--ink); }
.band-light .note, .band-light .label { color: var(--ink-muted); }
.band-light .ab { color: var(--ink-muted); }
.band-light .ab-pg { background-color: var(--tint); box-shadow: inset 0 0 0 1px var(--line); background-image: linear-gradient(var(--line), var(--line)), linear-gradient(var(--line), var(--line)); }
.band-light .ab-pg b { color: var(--ink-muted); }
.band-light .ab-pg.ab-new { background-color: var(--ink); background-image: linear-gradient(${T.palette.headingFg}, ${T.palette.headingFg}), linear-gradient(rgb(75, 141, 248), rgb(75, 141, 248)); }
.band-light .ab-new b { color: ${T.palette.headingFg}; }
.band-light .btn-like { background: var(--tint); color: var(--ink); box-shadow: inset 0 0 0 1px var(--line); }
.band-light .plan-2 .btn-like { background: var(--ink); color: ${T.palette.headingFg}; box-shadow: none; }
.band-light :focus-visible { outline-color: var(--ink); }
.band-light + .sec { border-top: 0; }


/* A → B per use case (rev 17) */
.band-light .ab { gap: 14px; margin: 8px 0; align-items: flex-start; }
.band-light .ab > .ico { align-self: center; }
.band-light .ab .ab-pg { position: relative; display: grid; align-content: start; gap: 5px; width: 132px; height: 86px; padding: 9px; border-radius: 8px; background-image: none; place-items: initial; }
.band-light .ab-pg b { position: absolute; left: 9px; bottom: 6px; font-size: 11px; font-weight: 500; }
.band-light .ab-pg i { display: block; border-radius: 2px; }
.band-light .pg-old { background-color: rgb(226, 224, 216); box-shadow: inset 0 0 0 1px var(--line); }
.band-light .pg-old b { color: rgb(120, 126, 134); }
.pg-old .o-nav { height: 5px; background: rgb(196, 196, 192); }
.pg-old .o-body { display: grid; grid-template-columns: 30% 1fr; gap: 5px; }
.pg-old .o-side { height: 38px; background: rgb(204, 203, 198); }
.pg-old .o-txt { display: grid; gap: 4px; align-content: start; }
.pg-old .o-txt i { height: 3px; background: rgb(196, 196, 192); }
.pg-old .o-txt i:nth-child(2) { width: 80%; } .pg-old .o-txt i:nth-child(4) { width: 60%; }
.band-light .pg-new { background-color: var(--ink); box-shadow: none; }
.band-light .pg-new b { color: ${T.palette.headingFg}; }
.pg-new .n-title { height: 11px; width: 78%; background: ${T.palette.accent}; margin-top: 2px; }
.pg-new .n-sub { height: 4px; width: 52%; background: rgba(244, 242, 236, .55); }
.pg-new .n-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 3px; }
.pg-new .n-cards i { height: 18px; border-radius: 3px; background: rgba(244, 242, 236, .18); }
.pg-new .n-cards i:first-child { background: rgb(75, 141, 248); }
.ab-col { display: grid; gap: 7px; }
.band-light .pg-same { background-color: rgb(250, 249, 245); box-shadow: inset 0 0 0 1px var(--line); }
.band-light .pg-same b { color: var(--ink-muted); }
.pg-same .s-title { height: 8px; width: 62%; background: var(--ink); margin-top: 2px; }
.pg-same .s-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 5px; }
.pg-same .s-tiles i { height: 20px; border-radius: 3px; background: var(--tint); box-shadow: inset 0 0 0 1px var(--line); }
.pg-same .s-tiles i:first-child { background: ${T.palette.accent}; box-shadow: none; }
.base { display: flex; width: 132px; }
.base-old { flex-direction: column; gap: 2px; }
.base-old i { height: 5px; border-radius: 2px; background: rgb(196, 196, 192); position: relative; }
.base-old i::after { content: ""; position: absolute; right: 5px; top: 1.5px; width: 2px; height: 2px; border-radius: 50%; background: rgb(150, 150, 146); }
.base-edge { position: relative; justify-content: space-between; align-items: center; height: 19px; padding: 0 4px; }
.base-edge::before { content: ""; position: absolute; left: 8px; right: 8px; top: 50%; border-top: 1.5px solid ${T.palette.accent}; }
.base-edge i { position: relative; width: 9px; height: 9px; border-radius: 50%; background: ${T.palette.accent}; box-shadow: 0 0 0 3px rgba(247, 202, 110, .25); }

/* chapter bands: scroll motion acts out the use case (rev 17). Rest state = no transform. */
.intro-label .tab { display: inline-block; }
.intro-label[data-motion="morph"] .ch { display: inline-block; font-weight: calc(200 + 300 * var(--lp, 1)); opacity: calc(.3 + .7 * var(--lp, 1)); transform: translateY(calc((1 - var(--lp, 1)) * 45%)) rotate(calc((1 - var(--lp, 1)) * -24deg)); transform-origin: 50% 80%; }
.intro-label[data-motion="slide"] .tab { transform: translateX(var(--tx, 0px)); will-change: transform; }
.intro-label[data-motion="slide"] { overflow: hidden; }

/* step labels (M14) */
.step-label { display: flex; align-items: center; gap: 8px; padding: 16px var(--px); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); font-size: 12px; line-height: 14.52px; letter-spacing: -0.15px; }
.num { display: inline-flex; color: var(--muted); font-variant-numeric: tabular-nums; }
.num::before { content: "["; }
.num::after { content: "]"; }
.step-name, .tab-title { font-size: 12px; line-height: 14.52px; font-weight: 400; color: var(--fg); }
.tab { color: var(--muted); }
.tab::before { content: "["; }
.tab::after { content: "]"; }
.step-label .cmd { margin-left: auto; }
.step-label .cmd code { font-size: 12px; padding: 2px 8px; }

/* chapter intros */

/* chapter intro band — [TAB] at 300% on a full-bleed accent band (user request, rev 8) */
.intro-label { display: flex; align-items: center; margin: 0 calc(50% - 50vw) 36px; padding: 22px calc(50vw - 50% + var(--px)); background: ${T.palette.accent}; color: ${T.palette.pageBg}; }
.intro-label .tab { font-size: 36px; line-height: 40px; font-weight: 500; letter-spacing: -0.02em; color: inherit; }
.intro-label .tab::before, .intro-label .tab::after { opacity: .45; font-weight: 400; }
.intro-label .tab::before { margin-right: .08em; }
.intro-label .tab::after { margin-left: .08em; }
.chapters.sec { padding-top: 0; }
.chapters .sec-head { margin-bottom: 28px; }
.quote { display: grid; grid-template-columns: 1fr 300px; border: 1px solid var(--border); margin-bottom: 0; }
.quote blockquote { padding: 32px 24px; font-size: 24px; line-height: 32px; letter-spacing: -0.4px; color: var(--fg); text-indent: -.4em; text-wrap: pretty; }
.quote figcaption { display: flex; align-items: center; gap: 12px; padding: 24px; border-left: 1px solid var(--border); color: var(--muted); font-size: 14px; line-height: 20px; }
.quote-mark { display: grid; place-items: center; flex: none; width: 32px; height: 32px; border-radius: 50%; background: var(--s2); color: var(--fg); }
.quote-mark .mark { width: 14px; height: 14px; }
.quote.compact { grid-template-columns: 1fr; margin: 0; align-self: start; }
.quote.compact blockquote { font-size: 20px; line-height: 28px; }
.quote.compact figcaption { border-left: 0; border-top: 1px solid var(--border); }
/* quote — a notebook page (rev 14): graph-paper grid on the lifted navy, handwritten gold-tint ink.
   24px squares; the hand sits on 48px lines (two squares per line). */
.quote { display: block; margin: 8px 0 0; padding: 48px 48px 40px; border: 0; border-radius: 6px; color: #fbe7be;
  background-color: var(--s1);
  background-image: linear-gradient(rgba(244, 242, 236, .075) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 242, 236, .075) 1px, transparent 1px);
  background-size: 24px 24px; background-position: -1px -1px;
  box-shadow: 0 0 0 1px var(--border); }
.quote blockquote { padding: 0; max-width: 22em; font-family: Caveat, "Segoe Print", "Bradley Hand", cursive; font-size: 46px; line-height: 48px; font-weight: 500; font-style: normal; letter-spacing: 0; color: #fbe7be; text-indent: -.3em; text-wrap: pretty; }
.quote .qm { color: inherit; }
.quote figcaption { display: flex; align-items: center; gap: 12px; padding: 24px 0 0; border: 0; color: var(--muted); font-size: 14px; line-height: 24px; font-style: normal; }
.quote .quote-mark { width: 28px; height: 28px; background: #fbe7be; color: ${T.palette.pageBg}; }
.quote.compact { padding: 24px 24px 24px 32px; margin: 0; }
.quote.compact blockquote { font-size: 34px; line-height: 48px; }
.quote.compact figcaption { border: 0; padding-top: 12px; }
.stats { border-top: 1px solid var(--border); margin-top: 48px; }


/* hero kicker highlight (rev 10) */
.hero-lede .ink-accent { color: ${T.palette.accent}; }
.hero-lede em { font-style: normal; padding: 0 .22em; border-radius: 5px; background: ${T.palette.accent}; color: ${T.palette.pageBg}; text-shadow: none; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.hero-seed { margin-top: 24px; }

/* step label rows — slightly lifted ground to mark the section title (rev 10) */
.step .step-label { background: var(--s1); border-color: var(--border); padding-top: 18px; padding-bottom: 18px; }
.step .step-label .cmd code { background: var(--page); }




/* steps */
.step { margin-top: 72px; }
.step-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 48px; align-items: start; padding: 32px var(--px) 28px; }
.step-copy { display: grid; gap: 16px; position: sticky; top: 96px; }
.step-title { font-size: ${T.type.stepTitle.fontSize}; line-height: ${T.type.stepTitle.lineHeight}; font-weight: ${T.type.stepTitle.fontWeight}; letter-spacing: ${T.type.stepTitle.letterSpacing}; color: var(--fg); }
.step-copy .lede { font-size: 16px; line-height: 24px; letter-spacing: -0.2px; }
.step-cta { margin-top: 16px; padding: 0 var(--px); }
.cells-wrap { display: grid; gap: 12px; }
.cells-wrap .label { padding: 0 var(--px); }
.cells { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); }
.cells li { display: flex; align-items: center; gap: 12px; padding: 18px 24px; font-size: ${T.type.cellTitle.fontSize}; line-height: ${T.type.cellTitle.lineHeight}; letter-spacing: ${T.type.cellTitle.letterSpacing}; border-bottom: 1px solid var(--border); }
.cells li:nth-child(odd) { border-right: 1px solid var(--border); }
.cells li:nth-last-child(-n+2) { border-bottom: 0; }
.cells .check { color: var(--fg); width: 18px; height: 18px; }

/* mocks */
.mock-body { padding: 24px; display: grid; gap: 16px; }
.swatches { display: flex; gap: 6px; }
.swatches i { flex: 1; height: 44px; border-radius: 6px; }
.swatches .sw-cream { background: var(--fg); }
.typecard { display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: center; padding: 16px; border-radius: var(--r-panel); background: var(--s2); }
.aa { font-size: 56px; line-height: 1; font-weight: 500; letter-spacing: -2px; color: var(--fg); }
.rows { display: grid; gap: 8px; }
.rows i { height: 6px; border-radius: 3px; background: var(--border); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 13px; line-height: 18px; color: var(--fg); box-shadow: inset 0 0 0 1px var(--border); }
.chip.on { background: var(--fg); color: var(--page); box-shadow: none; }
.chip.ok .check { color: var(--accent); width: 14px; height: 14px; }
.hashes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.hashes span { padding: 10px 8px; border-radius: var(--r); background: var(--s2); text-align: center; font-size: 15px; font-weight: 500; color: var(--fg); font-variant-numeric: tabular-nums; letter-spacing: .02em; }
.hashes span:first-child { box-shadow: inset 0 0 0 1px var(--blue); }
.eq { font-size: 13px; color: var(--muted); }
.table { display: grid; border-radius: var(--r-panel); box-shadow: inset 0 0 0 1px var(--border); overflow: hidden; }
.tr { display: grid; grid-template-columns: 110px 1fr auto; align-items: center; gap: 12px; padding: 10px 14px; font-size: 14px; line-height: 20px; border-top: 1px solid var(--border); }
.tr:first-child { border-top: 0; }
.td.k { color: var(--muted); }
.td.v { color: var(--fg); font-weight: 500; }
.pill { display: inline-block; padding: 1px 8px; border-radius: 6px; background: var(--s2); font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.ba { grid-template-columns: 1fr auto 1fr; align-items: center; color: var(--dim); }
.seg { display: inline-flex; padding: 2px; border-radius: 8px; background: var(--page); box-shadow: inset 0 0 0 1px var(--border); }
.seg b { padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; color: var(--muted); }
.seg b.on { background: var(--s2); color: var(--fg); }
.wf { display: grid; gap: 8px; padding: 10px; border-radius: var(--r); background: var(--s2); box-shadow: inset 0 0 0 1px var(--border); }
.wf i { display: block; height: 6px; border-radius: 3px; background: var(--border); }
.wf .wf-nav { height: 8px; width: 100%; }
.wf .wf-hero { height: 40px; border-radius: 4px; }
.wf-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.wf-row i { height: 26px; border-radius: 4px; }
.wf-txt { display: grid; gap: 6px; }
.wf-txt i:nth-child(2) { width: 80%; } .wf-txt i:nth-child(3) { width: 60%; }
.wf-after { background: var(--fg); }
.wf-after i { background: rgb(209, 210, 210); }
.wf-after .wf-hero { background: var(--page); height: 52px; }
.wf-after .wf-row { grid-template-columns: repeat(2, 1fr); }
.wf-after .wf-row i:first-child { background: var(--blue); }
.pair { grid-template-columns: 1fr 1fr; }
.thumb { position: relative; display: grid; gap: 8px; }
.scan { position: absolute; left: 0; right: 0; top: 40%; height: 2px; background: var(--accent); box-shadow: 0 0 16px var(--accent); opacity: .7; }
.mock-foot { padding: 0 24px 24px; }
.chain { gap: 0; }
.sheet .meter { height: 6px; border-radius: 3px; background: var(--s2); overflow: hidden; }
.meter i { display: block; height: 100%; background: var(--accent); border-radius: 3px; }
.sheet .tr { grid-template-columns: 20px 1fr auto; }
.td.idx { width: 8px; height: 8px; border-radius: 2px; background: var(--border); }
.td.path { color: var(--fg); }
.status { display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; letter-spacing: .02em; }
.status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.status.ok { color: var(--accent); background: rgba(247, 202, 110, .12); }
.status.run { color: var(--blue); background: rgba(75, 141, 248, .10); }
.status.wait { color: var(--dim); background: var(--s2); }
.mock-foot-line { font-size: 12px; color: var(--muted); }

/* showcase (M5 + M8) */
.media-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--border); }
.media-card { position: relative; padding: 16px; display: grid; gap: 12px; }
.media-card + .media-card { border-left: 1px solid var(--border); }
.media-card img { border-radius: var(--r-panel); box-shadow: 0 0 0 1px var(--border); aspect-ratio: 1600 / 940; object-fit: cover; width: 100%; }
.media-label { font-size: 12px; line-height: 16px; color: var(--muted); letter-spacing: .02em; }
.after .media-label { color: var(--fg); }

/* migrate band (M10) */
.band { background: linear-gradient(to bottom, rgba(17, 38, 68, 0) 0%, ${T.palette.darkBandBg} 30%, ${T.palette.darkBandBg} 75%, rgba(17, 38, 68, 0) 100%); }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--border); border-top: 0; }
.stat { display: grid; gap: 6px; padding: 24px; }
.stat + .stat { border-left: 1px solid var(--border); }
.stat strong { font-size: 24px; line-height: 32px; font-weight: 500; letter-spacing: -0.5px; color: var(--fg); }
.stat span { font-size: 14px; line-height: 20px; color: var(--muted); }

/* final CTA (M12 + M6) */
.final-head { display: grid; justify-items: center; text-align: center; gap: 16px; padding: 0 var(--px) 48px; }
.final-head .lede { max-width: 32em; }
.actions { display: flex; gap: 8px; margin-top: 16px; }
.built { font-size: 14px; color: var(--dim); }
.inline-link { color: var(--fg); text-decoration: underline; text-decoration-color: var(--border); text-underline-offset: 3px; }
.inline-link:hover { text-decoration-color: var(--fg); }
.final-grid { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 7fr); gap: 24px; align-items: start; }
.chat-body { display: grid; gap: 10px; padding: 20px; font-size: 14px; line-height: 20px; max-height: 520px; overflow: auto; }
.msg-ctx { font-size: 12px; color: var(--dim); padding-top: 6px; }
.msg-user { display: flex; justify-content: flex-end; }
.msg-user span { max-width: 85%; padding: 10px 14px; border-radius: 12px; background: var(--s2); color: var(--fg); overflow-wrap: anywhere; }
.msg-agent { display: flex; gap: 10px; align-items: flex-start; color: var(--muted); }
.msg-ico { display: grid; place-items: center; flex: none; width: 20px; height: 20px; border-radius: 6px; background: var(--s2); color: var(--fg); }
.msg-ico .mark { width: 11px; height: 11px; }
.composer { display: flex; align-items: center; gap: 12px; margin: 0 16px 16px; padding: 10px 10px 10px 16px; border-radius: 12px; background: var(--s2); box-shadow: inset 0 0 0 1px var(--border); }
.composer-in { flex: 1; height: 8px; max-width: 220px; border-radius: 4px; background: var(--border); }
.composer-send { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--fg); color: var(--page); }
.composer-send .ico { transform: rotate(-90deg); }

/* footer (M13) */
.foot { border-top: 1px solid var(--border); padding: 56px 0 0; overflow: clip; }
.foot-top { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; padding: 0 var(--px); }
.foot-brand .brand { margin-bottom: 4px; color: var(--fg); }
.foot-gold { color: ${T.palette.accent}; }
.foot-brand { display: grid; gap: 12px; align-content: start; }
.foot-col { display: grid; gap: 10px; align-content: start; font-size: 14px; color: var(--muted); }
.foot-col a:hover { color: var(--fg); }
.foot-h { color: var(--fg); margin-bottom: 4px; }
.seedline { font-variant-numeric: tabular-nums; }
.foot-big { display: flex; justify-content: space-between; margin-top: 48px; padding: 0 var(--px); font-size: clamp(64px, 17vw, 236px); line-height: .78; font-weight: 600; letter-spacing: -0.04em; color: var(--s2); user-select: none; }

/* footer wordmark — each letter lights up in a stardust palette colour on hover (rev 11) */
.foot-big span { --c: #f7ca6e; display: inline-block; transition: color 2.6s cubic-bezier(.7, 0, .3, 1), transform 1s cubic-bezier(.2, .7, .2, 1), text-shadow 2.6s cubic-bezier(.7, 0, .3, 1); cursor: default; }
.foot-big span:nth-child(4n+1) { --c: #f7ca6e; }
.foot-big span:nth-child(4n+2) { --c: #ed6f4c; }
.foot-big span:nth-child(4n+3) { --c: #f4f2ec; }
.foot-big span:nth-child(4n+4) { --c: #fbe7be; }
.foot-big span:hover { color: var(--c); text-shadow: 0 0 48px color-mix(in srgb, var(--c) 45%, transparent); transition-duration: .12s, .25s, .12s; }
@media (prefers-reduced-motion: no-preference) { .foot-big span:hover { transform: translateY(-4%); } }


/* responsive */
@media (max-width: 960px) {
  .browser-body { grid-template-columns: minmax(0, 1fr); }
  .dnav-list { flex-direction: row; overflow-x: auto; gap: 6px; padding: 10px 12px; border-right: 0; border-bottom: 1px solid var(--border); scrollbar-width: none; }
  .dnav-grp { display: none; }
  .dnav { grid-template-columns: auto auto; width: auto; white-space: nowrap; padding: 6px 10px 8px; }
  .dnav-n { grid-row: auto; }
  .dnav-s { display: none; }
  .dstages { padding: 20px 16px; }
  .browser-nav { display: none; }
  .step-grid, .final-grid { grid-template-columns: 1fr; }
  .step-copy { position: static; }
  .routes { grid-template-columns: 56px 64px 1fr; padding: 24px 16px; }
  .graph-root { width: 56px; height: 56px; }
  .graph-fork { width: 64px; }
  .gnode { font-size: 13px; padding: 8px 10px 8px 8px; gap: 8px; }
  .gnode-ico { width: 22px; height: 22px; }
}
@media (max-width: 760px) {
  :root { --sec: 64px; }
  .nav-links { display: none; }
  .nav-gh { margin-left: auto; padding: 6px 8px; }
  .nav-gh span { display: none; }
  .demo { margin: 0 12px 48px; }
  .display { font-size: 44px; line-height: 48px; letter-spacing: -1.4px; white-space: normal; }
  .hero-lede { font-size: 18px; line-height: 26px; }
  .h2 { font-size: 34px; line-height: 40px; letter-spacing: -0.8px; }
  .step-title { font-size: 26px; line-height: 32px; }
  .plans, .media-grid, .cells, .stats, .quote, .pair, .ba { grid-template-columns: minmax(0, 1fr); }
  .plan { padding: 24px 18px 20px; min-width: 0; }
  .band-light .ab { gap: 8px; }
  .band-light .ab .ab-pg, .base { width: 104px; }
  .band-light .ab .ab-pg { height: 72px; padding: 7px; }
  .plan + .plan, .media-card + .media-card, .stat + .stat { border-left: 0; border-top: 1px solid var(--border); }
  .cells li:nth-child(odd) { border-right: 0; }
  .cells li:nth-last-child(2) { border-bottom: 1px solid var(--border); }
  .quote figcaption { border: 0; }
  .quote { padding: 24px 24px 24px; }
  .quote blockquote { font-size: 34px; line-height: 48px; }
  .quote.compact blockquote { font-size: 30px; line-height: 48px; }
  .stats { margin-top: 32px; }
  .ba .ico { transform: rotate(90deg); justify-self: center; }
  .sec-head.row { grid-template-columns: 1fr; }
  .step-label { flex-wrap: wrap; }
  .intro-label { padding-top: 16px; padding-bottom: 16px; margin-bottom: 28px; }
  .intro-label .tab { font-size: 28px; line-height: 32px; }
  .routes { grid-template-columns: 1fr; gap: 24px; justify-items: start; }
  .graph-fork { display: none; }
  .graph-lanes { gap: 24px; width: 100%; }
  .glane { flex-direction: column; align-items: flex-start; }
  .glink { flex: none; width: 0; height: 14px; border-top: 0; border-left: 1.5px dashed var(--border); margin-left: 22px; min-width: 0; }
  .hashes { grid-template-columns: 1fr 1fr; }
  .run-pill span { display: none; }
  .browser-body { min-height: 0; }

  .tr { grid-template-columns: 80px 1fr auto; }
  .foot-top { grid-template-columns: 1fr 1fr; }
  .foot-brand { grid-column: 1 / -1; }
}
`;

/* ------------------------------------------------------------------ client script (ported behavior) */

const cssV2 = V2 ? `
/* ================================================================ v2 — AI-tell cleanup (2026-10-12) */
/* #10 solid header, no glass */
.nav { background: var(--page); backdrop-filter: none; -webkit-backdrop-filter: none; }
/* #2 no glows: hero text sits on a scrim instead of a halo; no chromatic halos anywhere */
.hero-nebula { opacity: .72; }
.scan { box-shadow: none; opacity: .9; }
.base-edge i { box-shadow: none; }
.foot-big span:hover { text-shadow: none; transform: none; }
.foot-big span { transition: color .5s ease; }
/* #1 no window-in-window: demo panels lose their frame; inner boxes flatten to rules */
.dstage .mock { background: none; box-shadow: none; border-radius: 0; overflow: visible; }
.dstage .mock .win-bar { padding: 0 0 12px; height: auto; }
.dstage .mock .mock-body { padding: 18px 0 0; }
.dstage .mock .mock-foot { padding: 0; }
.typecard { background: none; padding: 0; border-radius: 0; }
.table { box-shadow: none; border-radius: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.tr { padding-left: 0; padding-right: 0; }
.dnav.on { background: transparent; }
.dnav:hover { background: transparent; }
.dnav.on .dnav-t { color: var(--fg); }
/* frameless stages must not overlap mid-crossfade: out first, then in */
.dstage { transition: opacity .18s ease, transform .3s ease, visibility 0s linear .18s; }
.dstage.on { transition: opacity .4s ease .22s, transform .6s cubic-bezier(.2, .7, .2, 1) .22s, visibility 0s linear .22s; }
/* #9 no faux window controls */
.win-dots { display: none; }
.browser-bar { gap: 12px; }
/* #11 one authored moment (hero): no caret blink, no band motion, no hover lift */
.demo.auto .caret { animation: none; }
/* #20 contrast on the dated A/B thumbnail */
.band-light .pg-old b { color: rgb(79, 94, 114); }
/* #4/#6 step: name + command as the heading, plain list instead of the 2x2 check cells */
.step-v2 { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); grid-template-areas: "copy mock" "list mock" "cta mock"; grid-template-rows: auto auto 1fr; column-gap: 56px; margin-top: 96px; padding: 0 var(--px); align-items: start; }
.step-v2 .step-copy { grid-area: copy; position: static; gap: 14px; }
.step-v2 > .window { grid-area: mock; }
.step-v2 .plain-list { grid-area: list; margin-top: 24px; }
.step-v2 .step-cta { grid-area: cta; padding: 0; margin-top: 20px; }
.step-head { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }
.step-v2 .step-name { font-size: ${T.type.stepTitle.fontSize}; line-height: ${T.type.stepTitle.lineHeight}; font-weight: ${T.type.stepTitle.fontWeight}; letter-spacing: ${T.type.stepTitle.letterSpacing}; color: var(--fg); }
.step-v2 .step-head .cmd code { font-size: 13px; padding: 3px 10px; color: var(--muted); background: var(--s1); }
.step-v2 .step-title { font-size: 20px; line-height: 28px; font-weight: 500; letter-spacing: -0.3px; color: ${T.palette.displayMuted}; }
.step-v2 .step-title .line { display: inline; }
.plain-list { display: grid; margin: 0; padding: 0; list-style: none; border-top: 1px solid var(--border); }
.plain-list li { padding: 11px 0; border-bottom: 1px solid var(--border); font-size: 15px; line-height: 22px; color: var(--fg); }
.chapters .quote + .step-v2, .chapters .stats + .step-v2 { margin-top: 96px; }
@media (max-width: 960px) {
  .step-v2 { grid-template-columns: minmax(0, 1fr); grid-template-areas: "copy" "mock" "list" "cta"; grid-template-rows: none; row-gap: 24px; margin-top: 64px; }
  .step-v2 .plain-list { margin-top: 0; }
}
` : '';

const js = `
// Daily seed (ported from stardust.style scripts/seed.js: md5 of "<name> · <YYYY-MM-DD>", local date)
const K=Array.from({length:64},(_, i)=>Math.floor(Math.abs(Math.sin(i+1))*2**32));const S=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];
const rot=(x,n)=>(x<<n)|(x>>>(32-n));const hx=(n)=>Array.from({length:4},(_, k)=>((n>>>(k*8))&255).toString(16).padStart(2,'0')).join('');
function md5(str){const b=new TextEncoder().encode(str);const w=[];for(let i=0;i<b.length;i+=1)w[i>>2]|=b[i]<<((i%4)*8);w[b.length>>2]|=0x80<<((b.length%4)*8);w[(((b.length+8)>>6)<<4)+14]=b.length*8;let a=0x67452301,bb=0xefcdab89,c=0x98badcfe,d=0x10325476;for(let i=0;i<w.length;i+=16){let A=a,B=bb,C=c,D=d;for(let j=0;j<64;j+=1){let f,g;if(j<16){f=(B&C)|(~B&D);g=j;}else if(j<32){f=(D&B)|(~D&C);g=(5*j+1)%16;}else if(j<48){f=B^C^D;g=(3*j+5)%16;}else{f=C^(B|~D);g=(7*j)%16;}const t=D;D=C;C=B;B=(B+rot((A+f+K[j]+(w[i+g]|0))|0,S[(j>>4)*4+(j%4)]))|0;A=t;}a=(a+A)|0;bb=(bb+B)|0;c=(c+C)|0;d=(d+D)|0;}return [a,bb,c,d].map(hx).join('');}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
const seedHash=(n)=>md5(n+' · '+today()).slice(0,8);
function paintSeeds(){
  document.querySelectorAll('[data-seed]').forEach((el)=>{const n=el.dataset.seed;el.textContent='md5("'+n+'" · '+today()+') → '+seedHash(n)+' ·';});
  document.querySelectorAll('[data-seed-foot]').forEach((el)=>{el.textContent='md5("stardust" · '+today()+') → '+seedHash('stardust');});
  document.querySelectorAll('[data-today]').forEach((el)=>{el.textContent=today();});
}
paintSeeds();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)paintSeeds();});

// Hero demo: play the chapter mocks as one stardust run (rev 4). Reduced motion: no autoplay, steps stay clickable.
(() => {
  const demo = document.querySelector('.demo'); if (!demo) return;
  const stages = [...demo.querySelectorAll('.dstage')]; const btns = [...demo.querySelectorAll('.dnav')]; const addr = demo.querySelector('.addr-t');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = 4600; let cur = 0; let timer = 0; let visible = false; let started = false; const live = [];
  const STAGGER = ['.swatches i', '.chips .chip', '.hashes span', '.seed .tr', '.thumb', '.chip.ok', '.chain .gnode', '.chain .glink', '.chain .gnode-ok', '.sheet .tr', '.sheet .status'];
  stages.forEach((st) => {
    STAGGER.forEach((sel) => st.querySelectorAll(sel).forEach((el, i) => el.style.setProperty('--i', i)));
    st.querySelectorAll('.hashes span').forEach((h) => { h.dataset.final = h.textContent; });
  });
  demo.style.setProperty('--dur', DUR + 'ms');
  const clearLive = () => { live.splice(0).forEach((id) => { clearInterval(id); clearTimeout(id); }); };
  const type = (text) => {
    addr.textContent = '';
    let i = 0;
    const iv = setInterval(() => { i += 1; addr.textContent = text.slice(0, i); if (i >= text.length) clearInterval(iv); }, 26);
    live.push(iv);
  };
  const effects = (st) => {
    st.querySelectorAll('.hashes span').forEach((h, i) => {
      const f = h.dataset.final; let t = 0;
      const iv = setInterval(() => {
        t += 60;
        if (t > 700 + i * 140) { clearInterval(iv); h.textContent = f; return; }
        h.textContent = [...f].map(() => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      }, 60);
      live.push(iv);
    });
    const seg = [...st.querySelectorAll('.seg b')];
    if (seg.length === 2) {
      seg[0].classList.add('on'); seg[1].classList.remove('on');
      live.push(setTimeout(() => { seg[0].classList.remove('on'); seg[1].classList.add('on'); }, 1300));
    }
  };
  const go = (n) => {
    cur = n; clearTimeout(timer); clearLive();
    stages.forEach((st, k) => { st.classList.toggle('on', k === n); st.classList.remove('play'); });
    btns.forEach((b, k) => { b.classList.remove('on'); b.classList.toggle('past', k < n); b.setAttribute('aria-pressed', String(k === n)); });
    void demo.offsetWidth;
    btns[n].classList.add('on');
    const list = btns[n].closest('.dnav-list');
    if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: btns[n].parentElement.offsetLeft - 12, behavior: reduced ? 'auto' : 'smooth' });
    const st = stages[n];
    demo.classList.toggle('done', false);
    if (reduced) { addr.textContent = st.dataset.cmd; return; }
    st.classList.add('play');
    type(st.dataset.cmd);
    effects(st);
    timer = setTimeout(() => {
      if (n === stages.length - 1) { demo.classList.add('done'); timer = setTimeout(() => visible && go(0), 1600); return; }
      if (visible) go(n + 1);
    }, DUR);
  };
  btns.forEach((b, k) => b.addEventListener('click', () => go(k)));
  if (!reduced) demo.classList.add('auto');
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (reduced) return;
    if (visible && !started) { started = true; go(0); } else if (visible) go(cur); else { clearTimeout(timer); clearLive(); }
  }, { threshold: 0.25 }).observe(demo);
})();

// Chapter bands (rev 17): REDESIGN reshapes letter by letter, MIGRATE AS IS travels in unchanged.
(() => {
  const bands = [...document.querySelectorAll('.intro-label[data-motion]')];
  if (!bands.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight;
    bands.forEach((b) => {
      const r = b.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.72)); // 0 as the band enters, 1 once it is ~28% from the top
      if (b.dataset.motion === 'morph') {
        const chs = b.querySelectorAll('.ch');
        chs.forEach((c, i) => c.style.setProperty('--lp', clamp(p * 1.6 - (i / chs.length) * 0.6).toFixed(3)));
      } else {
        const tab = b.querySelector('.tab');
        const cs = getComputedStyle(b);
        const travel = b.clientWidth - parseFloat(cs.paddingLeft) - tab.offsetWidth;
        const e = 1 - Math.pow(1 - p, 3);
        tab.style.setProperty('--tx', ((1 - e) * travel).toFixed(1) + 'px');
      }
    });
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();

// Same-page anchors are absolute (content fidelity); keep them in-page here.
const canon=document.querySelector('link[rel=canonical]')?.href;
document.addEventListener('click',(e)=>{const a=e.target.closest('a[href*="#"]');if(!a||!canon)return;const u=new URL(a.href);if(u.origin+u.pathname!==new URL(canon).origin+new URL(canon).pathname)return;const t=document.getElementById(u.hash.slice(1));if(!t||a.hasAttribute('data-copy'))return;e.preventDefault();t.scrollIntoView({block:'start'});history.replaceState(null,'',u.hash);});

// Copy install (ported: copies the /plugin lines of the terminal script)
document.querySelectorAll('[data-copy]').forEach((btn)=>{btn.addEventListener('click',async(e)=>{e.preventDefault();const t=btn.querySelector('.txt');if(t&&t.textContent!=='Copied'){const old=t.textContent;t.textContent='Copied';setTimeout(()=>{t.textContent=old;},1400);}try{await navigator.clipboard.writeText(JSON.parse(btn.dataset.copy).join('\\n'));}catch(err){/* ignore */}});});

`;

/* ------------------------------------------------------------------ assemble */

const NEB_PALETTE = { page: '#081e3d', navy: '#0f2c55', glow: '#1d3d68', gold: '#f7ca6e', text: '#f4f2ec', coral: '#ed6f4c' };
const nebula = readFileSync(resolve(HERE, 'nebula.client.js'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="${esc(model.metadata.lang || 'en')}">
<head>
  ${head()}
  <link rel="preload" href="https://rsms.me/inter/font-files/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap">
  <style>${V2 ? css.replace(/ text-shadow: 0 2px 24px rgba\(8, 30, 61, \.55\);/, '').replace(/\n\.hero-lede, \.hero-seed \{ text-shadow: [^}]*\}/, '').replace(/ text-shadow: 0 0 48px [^;]*;/, '').replace(/, text-shadow 2\.6s cubic-bezier\(\.7, 0, \.3, 1\)/, '').replace(/ box-shadow: 0 0 16px var\(--accent\);/, '').replace(/ box-shadow: 0 0 0 3px rgba\(247, 202, 110, \.25\);/, '').replace(/ box-shadow: 0 0 8px var\(--accent\);/, '') : css}${cssV2}</style>
</head>
<body>
${nav}
<main>
${hero()}
<div class="gated" data-gate="s02-s14">
${ways()}
<section class="sec chapters" id="redesign" aria-label="Redesign">
  <div class="container">
    ${intro('s05', { motion: V2 ? null : 'morph' })}
    ${step('s06')}
    ${step('s07')}
    ${step('s08')}
  </div>
</section>
${showcase()}
<section class="sec chapters band" id="migrate" aria-label="Migrate as is">
  <div class="container">
    ${intro('s10', { flow: true, motion: V2 ? null : 'slide' })}
    ${step('s11')}
    ${step('s12')}
    ${step('s13')}
  </div>
</section>
${install()}
</div>
</main>
${footer}
<script type="module">${js}</script>
<script>const NEB_PALETTE = ${JSON.stringify(NEB_PALETTE)};
${nebula}</script>
</body>
</html>
`;

// every captured slot must have been rendered exactly once
const rendered = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09', 's10', 's11', 's12', 's13', 's14'].map((id) => slot(id)?.slot).filter(Boolean);
const missing = model.sections.map((s) => s.slot).filter((s) => !rendered.includes(s));
if (missing.length) throw new Error(`unrendered slots: ${missing.join(', ')}`);

mkdirSync(resolve(ROOT, 'pages'), { recursive: true });
writeFileSync(resolve(ROOT, `pages/${slug}.html`), html);
console.log(`wrote stardust/reskin/pages/${slug}.html (${html.length} bytes)`);
