/**
 * flow — the migrate pipeline (v3 prototype `ol.flow`): stops joined by drawn arrows.
 * Decode tier: reconstructive — one authored row per stop.
 *
 * Authoring rows: one per stop — <p><strong>Stop name</strong> caption</p>
 */
import { ICONS, el, html } from '../../scripts/stardust.js';

export default async function decorate(block) {
  const stops = [...block.querySelectorAll(':scope > div > div > p')];
  const ol = el('ol', 'flow');
  stops.forEach((p, k) => {
    const li = el('li', null, p);
    if (k < stops.length - 1) li.append(html(`<i class="flow-arrow" aria-hidden="true">${ICONS.arrow}</i>`));
    ol.append(li);
  });
  block.replaceChildren(el('div', 'container', ol));
}
