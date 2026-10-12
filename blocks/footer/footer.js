/**
 * footer — site chrome (v3 prototype `footer.foot`), template-slotted from the authored /footer
 * document: 1. brand link + two lines · 2. "Stardust" + links · 3. "Source" + links
 * · 4. "brief + seed = star" (the md5 line is generated: runtime value) · 5. the wordmark.
 * Letters of the wordmark become hover targets (presentational split of chrome text).
 * @ew-exempt <p> footer wordmark — split into per-letter hover targets (chrome)
 */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import {
  ICONS, el, html, seedHash, todayISO,
} from '../../scripts/stardust.js';

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  const secs = fragment ? [...fragment.querySelectorAll(':scope > .section')] : [];
  const [s1, s2, s3, s4, s5] = secs.map((s) => s.querySelector('.default-content-wrapper') || s);

  const col = (sec, extraCls) => {
    if (!sec) return null;
    const [h, ...rest] = [...sec.children];
    const c = el('div', `foot-col${extraCls ? ` ${extraCls}` : ''}`, el('div', 'foot-h', h));
    rest.forEach((n) => c.append(n));
    return c;
  };

  const brandCol = el('div', 'foot-col foot-brand');
  if (s1) {
    const [bp, ...lines] = [...s1.children];
    const a = bp?.querySelector('a');
    if (a) {
      a.className = 'brand';
      const label = el('span', null, ...a.childNodes);
      a.replaceChildren(html(ICONS.markColor), label);
      brandCol.append(el('div', 'foot-brand-link', bp));
    }
    lines.forEach((p) => brandCol.append(el('span', 'foot-gold', p)));
  }
  const seedCol = col(s4);
  if (seedCol) seedCol.append(el('span', 'seedline', `md5("stardust" · ${todayISO()}) → ${seedHash('stardust')}`));

  const word = s5?.querySelector('p');
  const big = el('div', 'foot-big');
  big.setAttribute('aria-label', 'stardust');
  if (word) [...word.textContent.trim()].forEach((ch) => big.append(el('span', null, ch)));

  block.replaceChildren(el('div', 'foot', el(
    'div',
    'container',
    el('div', 'foot-top', brandCol, col(s2), col(s3), seedCol),
    big,
  )));
}
