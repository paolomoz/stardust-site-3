/**
 * quote — a notebook-page pull quote (v3 prototype `figure.quote`): handwritten quote on ruled
 * lines, attribution with the stardust mark. Block Collection shape: quote, then attribution.
 * Decode tier: template-slotted.
 *
 * Authoring rows: 1. <p> quote · 2. <p> attribution
 */
import { ICONS, el, html } from '../../scripts/stardust.js';

export default async function decorate(block) {
  const [quote, who] = [...block.querySelectorAll('p')];
  const figure = el('figure', 'quote',
    el('blockquote', null, quote),
    el('figcaption', null, html(`<span class="quote-mark" aria-hidden="true">${ICONS.mark}</span>`), who));
  block.replaceChildren(el('div', 'container', figure));
}
