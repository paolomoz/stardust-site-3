/**
 * stage — the hero: headline, lede, today's seed, the star nebula, and the demo browser that plays
 * the six chapter mocks as one stardust run (v3 prototype, stardust/reskin/pages/index-v3.html).
 * Decode tier: template-slotted (deploy SKILL.md #95) — authored elements are MOVED into the
 * prototype's hero DOM; the demo is presentational (built from clones of the step blocks).
 *
 * Authoring rows:
 *   1. <h1> — the page headline
 *   2. <p> lede — line 1, <br>, <strong>accent verbs</strong>, <em>highlighted close</em>
 *   3. <p><strong>seed</strong> tail text</p> — the md5 hash is inserted between at runtime
 *
 * Generated text (runtime values, allowlisted): the seed hash `md5("brand" · <today>) → <hash> ·`
 * and the Direct mock's date. The demo's step names, taglines, commands and mock lines are
 * presentational clones of the step blocks' authored text (EW4: instrumentation stripped).
 * @ew-exempt <p> demo clones — presentational copies of the step blocks' authored lines
 */
import { ICONS, MOCKS, el, html, seedHash, todayISO, stripInstrumentation } from '../../scripts/stardust.js';
import mountNebula from './nebula.js';

const NEB_PALETTE = { page: '#081e3d', navy: '#0f2c55', glow: '#1d3d68', gold: '#f7ca6e', text: '#f4f2ec', coral: '#ed6f4c' };
const wrap = (node, cls) => el('div', cls, node);

/** Build the demo from the page's (not yet decorated) chapter-intro + step blocks. */
function buildDemo(main) {
  const nav = el('ol', 'dnav-list');
  const stages = el('div', 'dstages');
  stages.setAttribute('aria-hidden', 'true');
  let k = 0;
  let firstCmd = '';
  [...main.querySelectorAll('.chapter-intro')].forEach((intro) => {
    const label = intro.querySelector('p');
    const grp = el('li', 'dnav-grp', label ? stripInstrumentation(label.cloneNode(true)) : null);
    nav.append(grp);
    let sib = intro.closest('.section').querySelectorAll('.step');
    sib = [...sib];
    sib.forEach((step) => {
      const rows = [...step.children];
      const name = rows[0]?.querySelector('h3');
      const cmd = rows[1]?.querySelector('code');
      const title = rows[2]?.querySelector('h4');
      const lines = [...(rows[4]?.querySelectorAll('p') || [])].map((p) => stripInstrumentation(p.cloneNode(true)));
      const key = (name?.textContent || '').trim().toLowerCase();
      if (!name || !MOCKS[key]) return;
      const btn = el('button', `dnav${k ? '' : ' on'}`,
        el('span', 'dnav-t', name.textContent.trim()),
        el('span', 'dnav-s', title ? title.textContent.trim() : ''),
        html('<i class="dnav-bar" aria-hidden="true"></i>'));
      btn.type = 'button';
      btn.dataset.go = k;
      btn.setAttribute('aria-pressed', k ? 'false' : 'true');
      nav.append(el('li', null, btn));
      const stage = el('div', `dstage dstage-${key}${k ? '' : ' on'}`, MOCKS[key](lines));
      stage.dataset.cmd = cmd ? cmd.textContent : '';
      if (!k) firstCmd = stage.dataset.cmd;
      stages.append(stage);
      k += 1;
    });
  });
  const demo = el('div', 'demo window',
    el('div', 'browser-bar',
      html(`<span class="browser-nav" aria-hidden="true"><svg viewBox="0 0 16 16" class="ico"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><svg viewBox="0 0 16 16" class="ico"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`),
      el('div', 'addr', html(ICONS.mark), el('span', 'addr-t', firstCmd), html('<i class="caret"></i>'))),
    el('div', 'browser-body', nav, stages));
  demo.setAttribute('role', 'region');
  demo.setAttribute('aria-label', 'Demo: a stardust run, step by step');
  demo.querySelector('.addr').setAttribute('aria-hidden', 'true');
  return demo;
}

/** The prototype's sequencer: type the command, play the active mock, advance. */
function runDemo(demo) {
  const stages = [...demo.querySelectorAll('.dstage')];
  const btns = [...demo.querySelectorAll('.dnav')];
  const addr = demo.querySelector('.addr-t');
  if (!stages.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUR = 4600;
  let cur = 0; let timer = 0; let visible = false; let started = false;
  const live = [];
  const STAGGER = ['.swatches i', '.chips .chip', '.hashes span', '.seed .tr', '.thumb', '.chip.ok', '.chain .gnode', '.chain .glink', '.chain .gnode-ok', '.sheet .tr', '.sheet .status'];
  stages.forEach((st) => {
    STAGGER.forEach((sel) => st.querySelectorAll(sel).forEach((n, i) => n.style.setProperty('--i', i)));
    st.querySelectorAll('.hashes span').forEach((h) => { h.dataset.final = h.textContent; });
  });
  demo.style.setProperty('--dur', `${DUR}ms`);
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
    demo.dispatchEvent(new CustomEvent('stage:go', { detail: n }));
    stages.forEach((st, k) => { st.classList.toggle('on', k === n); st.classList.remove('play'); });
    btns.forEach((b, k) => { b.classList.remove('on'); b.classList.toggle('past', k < n); b.setAttribute('aria-pressed', String(k === n)); });
    // eslint-disable-next-line no-void
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

  // Only the playing stage keeps its mock mounted (AI readability: hidden presentational clones
  // add words). All mocks are mounted while measuring, the stage area's height is locked to the
  // tallest one, then inactive mocks are released; each stage remounts when it plays.
  const box = demo.querySelector('.dstages');
  const mocks = stages.map((st) => st.firstElementChild);
  const lock = () => {
    stages.forEach((st, k) => { if (!st.firstElementChild) st.append(mocks[k]); });
    box.style.minHeight = '';
    box.style.minHeight = `${box.getBoundingClientRect().height}px`;
    stages.forEach((st, k) => { if (k !== cur) st.replaceChildren(); });
  };
  const mount = (n) => { if (!stages[n].firstElementChild) stages[n].append(mocks[n]); };
  const release = () => setTimeout(() => stages.forEach((st, k) => { if (k !== cur) st.replaceChildren(); }), 700);
  const firstLock = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    firstLock.disconnect();
    requestAnimationFrame(() => requestAnimationFrame(lock));
  });
  firstLock.observe(demo);
  let rz = 0;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(lock, 200); }, { passive: true });
  demo.addEventListener('stage:go', (e) => { mount(e.detail); release(); });
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (reduced) return;
    if (visible && !started) { started = true; go(0); } else if (visible) go(cur); else { clearTimeout(timer); clearLive(); }
  }, { threshold: 0.25 }).observe(demo);
}

export default async function decorate(block) {
  const h1 = block.querySelector('h1');
  const ps = [...block.querySelectorAll('p')];
  const seed = ps.find((p) => /^\s*seed\b/i.test(p.textContent) && p.querySelector('strong'));
  const lede = ps.find((p) => p !== seed);

  const section = block.closest('.section');
  if (section) section.classList.add('hero');

  const inner = el('div', 'container hero-inner');
  if (lede) inner.append(wrap(lede, 'lede hero-lede'));
  if (seed) {
    // runtime value: today's hash after the authored "seed" label
    const hash = el('span', 'hash', `md5("brand" · ${todayISO()}) → ${seedHash('brand')} ·`);
    seed.querySelector('strong').after(' ', hash);
    inner.append(wrap(seed, 'hero-seed'));
  }
  if (h1) inner.append(wrap(h1, 'display'));

  const nebula = html('<div class="hero-nebula" aria-hidden="true"><canvas></canvas></div>');
  const main = block.closest('main') || document;
  const demo = buildDemo(main);
  block.replaceChildren(nebula, inner, demo);

  mountNebula(nebula, NEB_PALETTE);
  runDemo(demo);
}
