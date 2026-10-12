/**
 * step — one chapter step (v3 prototype `article.step.step-v2`): the step name + command are the
 * heading, then the tagline, the body, a product-UI mock and a plain list, then the GitHub link.
 * Decode tier: template-slotted; every authored element is MOVED into the prototype DOM (EW1).
 *
 * Authoring rows (one cell each):
 *   1. <h3> step name (Extract, Direct, …) — also keys the mock template
 *   2. <p><code>command</code></p>
 *   3. <h4> tagline
 *   4. <p> body
 *   5. mock lines — one <p> per line, in the chapter's mock order (scripts/stardust.js MOCKS)
 *   6. <ul> what this step does
 *   7. <p><em><a>Read … on GitHub</a></em></p> — secondary button
 * Generated text (runtime, allowlisted): the Direct mock's date (today).
 */
import { ICONS, MOCKS, el, html } from '../../scripts/stardust.js';

const wrap = (node, cls) => (node ? el('div', cls, node) : null);

export default async function decorate(block) {
  const rows = [...block.children].map((r) => r.firstElementChild);
  const name = block.querySelector('h3');
  const title = block.querySelector('h4');
  const cmd = [...block.querySelectorAll('p')].find((p) => p.querySelector('code') && !p.closest('ul'));
  const body = rows[3]?.querySelector('p');
  const mockLines = [...(rows[4]?.querySelectorAll(':scope > p') || [])];
  const list = block.querySelector('ul');
  const cta = block.querySelector('a.button, p a');
  const key = (name?.textContent || '').trim().toLowerCase();

  const copy = el('div', 'step-copy',
    el('div', 'step-head', wrap(name, 'step-name'), wrap(cmd, 'cmd')),
    wrap(title, 'step-title'),
    wrap(body, 'lede'));
  const mock = MOCKS[key] ? MOCKS[key](mockLines) : null;
  const ctaWrap = cta ? el('div', 'step-cta', cta.closest('p') || cta) : null;
  if (cta) cta.prepend(html(ICONS.github));

  const article = el('article', 'step step-v2', copy, mock, wrap(list, 'plain-list'), ctaWrap);
  block.replaceChildren(el('div', 'container', article));
}
