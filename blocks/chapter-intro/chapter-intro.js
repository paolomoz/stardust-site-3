/**
 * chapter-intro — the chapter opener (v3 prototype): a full-bleed accent band with the chapter
 * label, then the chapter heading + lede. Variants: `redesign` | `migrate` (+ `band`) — the variant
 * names the anchor the nav links to (#redesign, #migrate) and the section's look.
 * Decode tier: template-slotted.
 *
 * Authoring rows: 1. <p> label · 2. <h2> heading (<br> = line break) · 3. <p> lede
 */
import { el } from '../../scripts/stardust.js';

export default async function decorate(block) {
  const [label, ...rest] = [...block.querySelectorAll('p')];
  const h2 = block.querySelector('h2');
  const lede = rest[0];
  const section = block.closest('.section');
  if (section) {
    section.classList.add('sec', 'chapters');
    if (block.classList.contains('band')) section.classList.add('band');
    const id = ['redesign', 'migrate'].find((v) => block.classList.contains(v));
    if (id) section.id = id;
  }
  const head = el('div', 'sec-head', h2 ? el('div', 'h2', h2) : null, lede ? el('div', 'lede', lede) : null);
  const band = el('div', 'intro-label', el('span', 'tab', label));
  block.replaceChildren(el('div', 'container', band, head));
}
