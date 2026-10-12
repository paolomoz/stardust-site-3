/*
 * Shared stardust runtime helpers: icons, the brand mark, today's seed (md5) and the six chapter
 * mocks. Used by the step blocks (which MOVE their authored mock paragraphs into a mock) and by the
 * stage block (which builds the hero demo from presentational clones of the same paragraphs).
 *
 * Mock templates mirror stardust/reskin/renderers/home.mjs (index-v3) one-to-one: same classes,
 * same nesting, so the prototype's stylesheet applies unchanged. Text is never synthesized — every
 * slot receives an authored <p> (EW1); only runtime values (today's date) are generated.
 */

/* ---------------------------------------------------------------- icons (decorative, no text) */

const MARK_SVG = '<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><g><rect x="14" y="2" width="4" height="4"/><rect x="14" y="26" width="4" height="4"/><rect x="2" y="14" width="4" height="4"/><rect x="26" y="14" width="4" height="4"/><rect x="14" y="8" width="4" height="4" opacity=".7"/><rect x="14" y="20" width="4" height="4" opacity=".7"/><rect x="8" y="14" width="4" height="4" opacity=".7"/><rect x="20" y="14" width="4" height="4" opacity=".7"/></g><rect x="13" y="13" width="6" height="6"/></svg>';

export const ICONS = {
  mark: MARK_SVG,
  markColor: MARK_SVG.replace('class="mark"', 'class="mark mark-color"').replace('<g>', '<g fill="#f7ca6e">')
    .replace('<rect x="13" y="13" width="6" height="6"/>', '<rect x="13" y="13" width="6" height="6" fill="#ed6f4c"/>'),
  arrow: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg class="ico check" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="m5 8.2 2 2 4-4.4" fill="none" stroke="var(--page)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  node: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 8h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  github: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 .2a8 8 0 0 0-2.5 15.6c.4 0 .5-.2.5-.4v-1.5c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.4.7 0-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.4 7.4 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.6 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 .2"/></svg>',
  chev: '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 6.5 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/** Build an element from a trusted, text-free template (the boilerplate's default TT policy). */
export function html(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

/** An element with classes, optionally receiving moved children. */
export function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  children.flat().filter(Boolean).forEach((c) => node.append(c));
  return node;
}

/** Presentational clones carry no editor indices (EW4). */
export function stripInstrumentation(node) {
  [node, ...node.querySelectorAll('[data-prose-index], [data-image-index]')].forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  return node;
}

/* ---------------------------------------------------------------- today's seed */
// Port of stardust.style scripts/seed.js: md5 of "<name> · <YYYY-MM-DD>" (local date), 8 hex chars.
/* eslint-disable no-bitwise */
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));
const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
const rot = (x, n) => (x << n) | (x >>> (32 - n));
const hex = (n) => Array.from({ length: 4 }, (_, k) => ((n >>> (k * 8)) & 255).toString(16).padStart(2, '0')).join('');
export function md5(str) {
  const bytes = new TextEncoder().encode(str);
  const w = [];
  for (let i = 0; i < bytes.length; i += 1) w[i >> 2] |= bytes[i] << ((i % 4) * 8);
  w[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  w[(((bytes.length + 8) >> 6) << 4) + 14] = bytes.length * 8;
  let a = 0x67452301; let b = 0xefcdab89; let c = 0x98badcfe; let d = 0x10325476;
  for (let i = 0; i < w.length; i += 16) {
    let A = a; let B = b; let C = c; let D = d;
    for (let j = 0; j < 64; j += 1) {
      let f; let g;
      if (j < 16) {
        f = (B & C) | (~B & D); g = j;
      } else if (j < 32) {
        f = (D & B) | (~D & C); g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = B ^ C ^ D; g = (3 * j + 5) % 16;
      } else {
        f = C ^ (B | ~D); g = (7 * j) % 16;
      }
      const t = D; D = C; C = B;
      B = (B + rot((A + f + K[j] + (w[i + g] | 0)) | 0, S[(j >> 4) * 4 + (j % 4)])) | 0;
      A = t;
    }
    a = (a + A) | 0; b = (b + B) | 0; c = (c + C) | 0; d = (d + D) | 0;
  }
  return [a, b, c, d].map(hex).join('');
}
/* eslint-enable no-bitwise */
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export const seedHash = (name) => md5(`${name} · ${todayISO()}`).slice(0, 8);

/* ---------------------------------------------------------------- chapter mocks */

// A slot: a generated element holding one authored <p> (rendered inline via `display: contents`).
const s = (tag, cls, p) => el(tag, cls, p);
const bar = (url, end, endCls = '') => el('div', 'win-bar', s('span', 'win-url', url), s('span', `win-end${endCls}`, end));
const take = (nodes, n, name) => {
  if (nodes.length < n) throw new Error(`mock ${name}: expected ${n} more line(s)`);
  return nodes.splice(0, n);
};

/**
 * MOCKS[name](paragraphs) → mock element. `paragraphs` is consumed in authored order; the shape
 * per chapter is fixed (the source's own illustration contract, keyed by chapter name).
 * @ew-exempt none — every authored line is moved into a slot.
 */
export const MOCKS = {
  extract(t) {
    const [url, end, label, aa] = take(t, 4, 'extract');
    const tags = t.splice(0);
    const chips = el('div', 'chips');
    tags.forEach((g, k) => { if (k) chips.append(' '); chips.append(s('span', k ? 'chip' : 'chip on', g)); });
    const body = el(
      'div',
      'mock-body capture',
      s('div', 'mock-label', label),
      html('<div class="swatches" aria-hidden="true"><i style="background:rgb(75, 141, 248)"></i><i style="background:rgb(247, 202, 110)"></i><i style="background:rgb(224, 30, 90)"></i><i style="background:rgb(187, 62, 255)"></i><i style="background:rgb(255, 35, 35)"></i><i class="sw-cream"></i></div>'),
      el('div', 'typecard', s('span', 'aa', aa), html('<span class="rows" aria-hidden="true"><i style="width:90%"></i><i style="width:70%"></i><i style="width:80%"></i><i style="width:45%"></i></span>')),
      chips,
    );
    return el('div', 'window mock', bar(url, end), body);
  },
  direct(t) {
    const [url, end, label] = take(t, 3, 'direct');
    const hashes = [];
    while (t.length && /^[0-9a-f]{8}$/.test(t[0].textContent.trim())) hashes.push(t.shift());
    const [eq] = take(t, 1, 'direct');
    const endSlot = s('span', 'win-end', end);
    // runtime value (allowlisted): today's date after the authored "seed ·"
    endSlot.append(' ', el('span', null, todayISO()));
    endSlot.lastChild.dataset.today = '';
    const hashBox = el('div', 'hashes');
    hashes.forEach((h, k) => { if (k) hashBox.append(' '); hashBox.append(s('span', null, h)); });
    const table = el('div', 'table');
    while (t.length) {
      const [k, v, p] = take(t, 3, 'direct row');
      table.append(el('div', 'tr', s('span', 'td k', k), ' ', s('span', 'td v', v), ' ', el('span', 'td p', s('span', 'pill', p))));
    }
    return el(
      'div',
      'window mock',
      el('div', 'win-bar', s('span', 'win-url', url), endSlot),
      el('div', 'mock-body seed', s('div', 'mock-label', label), hashBox, s('div', 'eq', eq), table),
    );
  },
  prototype(t) {
    const tabs = take(t, 2, 'prototype');
    const [end] = take(t, 1, 'prototype');
    const seg = el('span', 'seg');
    tabs.forEach((b, k) => { if (k) seg.append(' '); seg.append(s('b', k ? '' : 'on', b)); });
    const wf = (cls) => html(`<div class="wf ${cls}" aria-hidden="true"><i class="wf-nav"></i><i class="wf-hero"></i><span class="wf-row"><i></i><i></i><i></i></span><span class="wf-txt"><i></i><i></i><i></i></span></div>`);
    return el(
      'div',
      'window mock',
      el('div', 'win-bar', seg, s('span', 'win-end', end)),
      el('div', 'mock-body ba', wf('wf-before'), html(ICONS.arrow), wf('wf-after')),
    );
  },
  replica(t) {
    const [url, end, l1, l2] = take(t, 4, 'replica');
    const gates = t.splice(0);
    const wf = () => html('<div class="wf" aria-hidden="true"><i class="wf-nav"></i><i class="wf-hero"></i><span class="wf-row"><i></i><i></i><i></i></span><span class="wf-txt"><i></i><i></i></span></div>');
    const thumb = (l, scan) => el('div', 'thumb', s('div', 'mock-label', l), wf(), scan ? html('<i class="scan" aria-hidden="true"></i>') : null);
    const foot = el('div', 'mock-foot chips');
    gates.forEach((g, k) => { if (k) foot.append(' '); foot.append(el('span', 'chip ok', html(ICONS.check), s('span', null, g))); });
    return el('div', 'window mock', bar(url, end, ' ok'), el('div', 'mock-body pair', thumb(l1), thumb(l2, true)), foot);
  },
  deploy(t) {
    const [url, end] = take(t, 2, 'deploy');
    const chain = el('div', 'mock-body chain');
    t.splice(0).forEach((n, k) => {
      if (k) chain.append(html('<i class="glink v" aria-hidden="true"></i>'));
      chain.append(el('div', 'gnode wide', el('span', 'gnode-ico', html(ICONS.node)), s('span', 'gnode-t', n), html(`<span class="gnode-ok" aria-hidden="true">${ICONS.check}</span>`)));
    });
    return el('div', 'window mock', bar(url, end), chain);
  },
  rollout(t) {
    const [url, end] = take(t, 2, 'rollout');
    const foot = t.pop();
    const m = end.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    const pct = m ? ((100 * Number(m[1])) / Number(m[2])).toFixed(1) : 0;
    const table = el('div', 'table');
    while (t.length) {
      const [path, st] = take(t, 2, 'rollout row');
      const word = st.textContent.trim().toLowerCase();
      let cls = 'wait';
      if (/deliver/.test(word)) cls = 'ok';
      else if (/deploy/.test(word)) cls = 'run';
      table.append(el('div', 'tr', html('<span class="td idx" aria-hidden="true"></span>'), s('span', 'td path', path), ' ', el('span', 'td', s('span', `status ${cls}`, st))));
    }
    return el('div', 'window mock', bar(url, end), el(
      'div',
      'mock-body sheet',
      html(`<div class="meter" aria-hidden="true"><i style="width:${pct}%"></i></div>`),
      table,
      s('div', 'mock-foot-line', foot),
    ));
  },
};
