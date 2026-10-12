/**
 * showcase — "Frescopa, before and after." (v3 prototype `section.sec.showcase`): head with a
 * secondary action, then two captioned screenshots. Decode tier: template-slotted.
 *
 * Authoring rows: 1. <h2> · 2. <p> lede · 3. <p><em><a>action</a></em></p>
 *   · then one row per figure: <p> caption | <picture>
 */
import { el } from '../../scripts/stardust.js';

export default async function decorate(block) {
  const section = block.closest('.section');
  if (section) section.classList.add('sec', 'showcase');
  const rows = [...block.children];
  const h2 = block.querySelector('h2');
  const lede = rows[1]?.querySelector('p');
  const action = rows[2]?.querySelector('p');
  const figs = rows.slice(3).map((r, k) => {
    const cap = r.querySelector('p:not(:has(picture))');
    const pic = r.querySelector('picture, img');
    return el('figure', `media-card${k ? ' after' : ''}`, cap ? el('div', 'media-label', cap) : null, pic);
  });
  const head = el(
    'div',
    'sec-head row',
    el('div', null, h2 ? el('div', 'h2', h2) : null, lede ? el('div', 'lede', lede) : null),
    action ? el('div', 'sec-action', action) : null,
  );
  block.replaceChildren(el('div', 'container', head, el('div', 'media-grid', figs)));
}
