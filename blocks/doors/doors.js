/**
 * doors — "Two ways in." (v3 prototype `section.sec.ways.band-light`): a cream band with the
 * section head and two whole-card links, each with an A→B drawing per use case.
 * Decode tier: reconstructive (one authored row per door). The section head is DEFAULT CONTENT
 * (D1) reabsorbed into the band's container at decorate time (EW8: its nodes are moved).
 *
 * Authoring rows: one per door, one cell:
 *   <h3> name · <p> sub-line · <p><code>route</code></p> · <p>A</p> · <p>B</p>
 *   · [<p>Shortcut</p> · <p><code>command</code></p> · <p> note</p>] · <p><a href>action</a></p>
 * The card is a link to the authored action's href; the inner anchor is unwrapped (EW6).
 */
import { ICONS, el, html } from '../../scripts/stardust.js';

const wrap = (node, cls) => (node ? el('div', cls, node) : null);
const slot = (tag, cls, node) => el(tag, cls, node);

function ab(migrate, a, b) {
  if (migrate) {
    const page = (lbl) => {
      const pg = html('<span class="ab-pg pg-same"><i class="s-title"></i><span class="s-tiles"><i></i><i></i><i></i></span></span>');
      pg.append(slot('b', null, lbl));
      return pg;
    };
    return el('div', 'ab ab-migrate',
      el('span', 'ab-col', page(a), html('<span class="base base-old" aria-hidden="true"><i></i><i></i><i></i></span>')),
      html(ICONS.arrow),
      el('span', 'ab-col', page(b), html('<span class="base base-edge" aria-hidden="true"><i></i><i></i><i></i><i></i></span>')));
  }
  const old = html('<span class="ab-pg pg-old"><i class="o-nav"></i><span class="o-body"><i class="o-side"></i><span class="o-txt"><i></i><i></i><i></i><i></i></span></span></span>');
  old.append(slot('b', null, a));
  const neu = html('<span class="ab-pg pg-new"><i class="n-title"></i><i class="n-sub"></i><span class="n-cards"><i></i><i></i></span></span>');
  neu.append(slot('b', null, b));
  return el('div', 'ab ab-redesign', old, html(ICONS.arrow), neu);
}

function door(cell, k) {
  const name = cell.querySelector('h3');
  const ps = [...cell.querySelectorAll(':scope > p')];
  const action = ps.find((p) => p.querySelector('a'));
  const flow = ps.find((p) => p.querySelector('code'));
  const rest = ps.filter((p) => p !== action && p !== flow);
  const sub = rest.shift();
  const [a, b] = rest.splice(rest.findIndex((p) => p.textContent.trim().length === 1), 2);
  const label = rest.find((p) => !p.querySelector('code'));
  const cmd = ps.find((p) => p !== flow && p.querySelector('code'));
  const note = rest.find((p) => p !== label && !p.querySelector('code'));
  const link = action.querySelector('a');
  const card = el('a', `plan${k ? ' plan-2' : ''}`);
  card.href = link.href;
  link.replaceWith(...link.childNodes); // EW6: the action's paragraph survives inside the card link
  const migrate = /#migrate$/.test(card.href);
  card.append(
    wrap(name, 'plan-name'),
    wrap(sub, 'plan-sub'),
    wrap(flow, 'plan-flow'),
    ab(migrate, a, b),
    label || cmd || note ? el('div', 'plan-extra', wrap(label, 'label'), wrap(cmd, 'cmd'), wrap(note, 'note')) : null,
    el('div', 'plan-action', el('span', 'btn-like', action)),
  );
  return card;
}

export default async function decorate(block) {
  const section = block.closest('.section');
  if (section) {
    section.classList.add('sec', 'ways', 'band-light');
    section.id = 'ways';
  }
  const headWrap = block.parentElement?.previousElementSibling;
  const head = el('div', 'sec-head');
  if (headWrap?.classList.contains('default-content-wrapper')) {
    const h2 = headWrap.querySelector('h2');
    const lede = headWrap.querySelector('p');
    head.append(wrap(h2, 'h2'), wrap(lede, 'lede'));
    headWrap.remove();
  }
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const plans = el('div', 'plans', cells.map(door));
  block.replaceChildren(el('div', 'container', head, plans));
}
