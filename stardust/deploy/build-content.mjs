#!/usr/bin/env node
/**
 * stardust/deploy/build-content.mjs — emit the DA content documents for the approved v3 page.
 *
 * Every visible string comes from stardust/reskin/content-model/index-v3/content-model.json (the
 * same model the approved prototype was rendered from) — nothing is retyped. Output is the DA
 * body-fragment format (deploy SKILL.md Step 9): content/index.html, content/nav.html,
 * content/footer.html. Throws on any shape the generator does not expect.
 *
 * usage: node stardust/deploy/build-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const model = JSON.parse(readFileSync(resolve(ROOT, 'stardust/reskin/content-model/index-v3/content-model.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slot = (n) => model.sections.find((s) => s.slot === `s${String(n).padStart(2, '0')}`);
const fail = (m) => { throw new Error(m); };
const local = (href) => href.replace(/^https:\/\/stardust\.style\//, '/'); // in-page anchors → this origin
const row = (...cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
const block = (cls, rows) => `<div class="${cls}">${rows.join('')}</div>`;
const p = (t) => `<p>${esc(t)}</p>`;
const br = (node) => (node.children ? node.children.map((c) => esc(c.text)).join('<br>') : esc(node.text));
const take = (nodes, kind, test = () => true) => {
  const n = nodes.shift();
  if (!n || n.kind !== kind || !test(n)) fail(`expected ${kind}, got ${n && n.kind}: ${n && n.text}`);
  return n;
};

/* ---- hero (stage) */
const s1 = [...slot(1).ordered];
const lede = take(s1, 'paragraph');
const seed = take(s1, 'paragraph');
const h1 = take(s1, 'heading', (n) => n.level === 'h1');
if (s1.length) fail('hero: leftover nodes');
const [l0, l1, l2] = lede.children;
if (!/\.$/.test(l1.text)) fail('hero lede: accent line must end with "."');
const ledeHtml = `${esc(l0.text)}<br><strong>${esc(l1.text.slice(0, -1))}</strong>. <em>${esc(l2.text)}</em>`;
const [sLabel, , sTail] = seed.children; // the hash between them is generated at runtime (allowlisted)
const hero = block('stage', [row(`<h1>${esc(h1.text)}</h1>`), row(`<p>${ledeHtml}</p>`), row(`<p><strong>${esc(sLabel.text)}</strong> ${esc(sTail.text)}</p>`)]);

/* ---- two ways in: default-content head + doors */
const s2 = [...slot(2).ordered];
const waysHead = `<h2>${esc(take(s2, 'heading').text)}</h2>${p(take(s2, 'paragraph').text)}`;
const doorRows = slot(3).ordered.map((cta) => {
  const c = [...cta.children];
  const name = take(c, 'heading', (n) => n.level === 'h3');
  const sub = take(c, 'paragraph');
  const flow = take(c, 'paragraph');
  const a = take(c, 'text'); const b = take(c, 'text');
  const paras = c.splice(0);
  const action = paras.pop();
  const [label, cmd, note] = paras;
  return row([
    `<h3>${esc(name.text)}</h3>`, p(sub.text), `<p><code>${esc(flow.text)}</code></p>`, p(a.text), p(b.text),
    label ? p(label.text) : '', cmd ? `<p><code>${esc(cmd.text)}</code></p>` : '', note ? p(note.text) : '',
    `<p><a href="${esc(local(cta.absHref))}">${esc(action.text)}</a></p>`,
  ].join(''));
});
const doors = block('doors', doorRows);

/* ---- chapter intro + quote (+ flow) */
function intro(n, variant) {
  const c = [...slot(n).ordered];
  const tab = take(c, 'text');
  const h2 = take(c, 'heading', (x) => x.level === 'h2');
  const lede2 = take(c, 'paragraph');
  const quote = take(c, 'paragraph');
  const who = take(c, 'paragraph');
  const flow = [];
  while (c.length) flow.push([take(c, 'text', (x) => x.parentTag === 'strong'), take(c, 'text')]);
  return {
    intro: block(`chapter-intro ${variant}`, [row(p(tab.text)), row(`<h2>${br(h2)}</h2>`), row(p(lede2.text))]),
    quote: block('quote', [row(p(quote.text)), row(p(who.text))]),
    flow: flow.length ? block('flow', flow.map(([t, d]) => row(`<p><strong>${esc(t.text)}</strong> ${esc(d.text)}</p>`))) : '',
  };
}

/* ---- step */
function step(n) {
  const c = [...slot(n).ordered];
  const name = take(c, 'heading', (x) => x.level === 'h3');
  const cmd = take(c, 'paragraph');
  const title = take(c, 'heading', (x) => x.level === 'h4');
  const body = take(c, 'paragraph');
  const mock = [];
  while (c[0] && c[0].kind === 'text') mock.push(c.shift());
  const items = [];
  while (c[0] && c[0].kind === 'listItem') items.push(c.shift());
  const cta = take(c, 'cta');
  if (c.length) fail(`step s${n}: leftover nodes`);
  // the Direct mock's date is today's date at runtime (allowlisted generated text) — not authored
  const mockLines = mock.filter((m) => !/^\d{4}-\d{2}-\d{2}$/.test(m.text));
  return block('step', [
    row(`<h3>${esc(name.text)}</h3>`),
    row(`<p><code>${esc(cmd.text)}</code></p>`),
    row(`<h4>${esc(title.text)}</h4>`),
    row(p(body.text)),
    row(mockLines.map((m) => p(m.text)).join('')),
    row(`<ul>${items.map((i) => `<li>${esc(i.text)}</li>`).join('')}</ul>`),
    row(`<p><em><a href="${esc(cta.absHref)}">${esc(cta.text)}</a></em></p>`),
  ]);
}

/* ---- showcase */
const s8 = [...slot(8).ordered];
const shH2 = take(s8, 'heading', (x) => x.level === 'h2');
const shP = take(s8, 'paragraph');
const shHow = take(s8, 'paragraph').children[0];
const figs = [];
while (s8.length) figs.push([take(s8, 'paragraph'), take(s8, 'image')]);
const showcase = block('showcase', [
  row(`<h2>${br(shH2)}</h2>`), row(p(shP.text)),
  row(`<p><em><a href="${esc(shHow.absHref)}">${esc(shHow.text)}</a></em></p>`),
  ...figs.map(([cap, img]) => row(p(cap.text), `<img src="${esc(img.currentSrc.split('?')[0])}" alt="${esc(img.alt)}">`)),
]);

/* ---- install */
const s13 = [...slot(13).ordered];
const inH2 = take(s13, 'heading', (x) => x.level === 'h2');
const inLede = take(s13, 'paragraph');
const copy = take(s13, 'paragraph').children[0];
const readme = take(s13, 'paragraph').children[0];
const inQuote = take(s13, 'paragraph');
const inWho = take(s13, 'paragraph');
const termTitle = take(s13, 'text');
const termLines = s13.splice(0).map((t) => {
  if (t.parentClass === 'c') return `<p><code>${esc(t.text)}</code></p>`;
  if (t.parentClass === 'p' || t.parentClass === 'd') return p(t.text);
  return fail(`install terminal: unknown line ${t.parentClass}`);
});
const install = block('install', [
  row(`<h2>${br(inH2)}</h2>`), row(p(inLede.text)),
  row(`<p><strong><a href="${esc(local(copy.absHref))}">${esc(copy.text)}</a></strong></p><p><em><a href="${esc(readme.absHref)}">${esc(readme.text)}</a></em></p>`),
  row(p(inQuote.text)), row(p(inWho.text)), row(p(termTitle.text)), row(termLines.join('')),
]);

/* ---- metadata (D14: config only) */
const md = model.metadata;
const metadata = block('metadata', [
  row('Title', esc(md.title)),
  row('Description', esc(md.description)),
  row('Image', `<img src="${esc(md.ogTags['og:image'].split('?')[0])}" alt="${esc(md.ogTags['og:image:alt'] || '')}">`),
]);

const redesign = intro(4, 'redesign');
const migrate = intro(9, 'migrate band');
const sections = [
  hero,
  waysHead + doors,
  redesign.intro + redesign.quote + step(5) + step(6) + step(7),
  showcase,
  migrate.intro + migrate.quote + migrate.flow + step(10) + step(11) + step(12),
  install,
  metadata,
];
const doc = (secs) => `<body>\n  <header></header>\n  <main>\n${secs.map((s) => `    <div>${s}</div>`).join('\n')}\n  </main>\n  <footer></footer>\n</body>\n`;

/* ---- chrome documents (D12): brand / links / tools; footer columns + wordmark */
const GH = 'https://github.com/adobe/skills/tree/main/plugins/stardust';
const nav = doc([
  '<p><a href="/">stardust</a></p>',
  '<ul><li><a href="/#redesign">Redesign</a></li><li><a href="/#migrate">Migrate</a></li></ul>',
  `<p><a href="${GH}">GitHub</a></p><p><a href="/#install">Install Stardust</a></p>`,
]);
const footer = doc([
  '<p><a href="/">stardust</a></p><p>Open Source · Apache 2.0</p><p>AI skills from Adobe</p>',
  '<p>Stardust</p><ul><li><a href="/#redesign">Redesign</a></li><li><a href="/#migrate">Migrate</a></li></ul>',
  `<p>Source</p><ul><li><a href="${GH}">GitHub</a></li><li><a href="/#install">Install</a></li></ul>`,
  '<p>brief + seed = star</p>',
  '<p>stardust</p>',
]);

mkdirSync(resolve(ROOT, 'content'), { recursive: true });
writeFileSync(resolve(ROOT, 'content/index.html'), doc(sections));
writeFileSync(resolve(ROOT, 'content/nav.html'), nav);
writeFileSync(resolve(ROOT, 'content/footer.html'), footer);
console.log('wrote content/index.html, content/nav.html, content/footer.html');
