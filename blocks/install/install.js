/**
 * install — "Install it. Docs included." (v3 prototype `section.sec.final#install`): centred head
 * with the install CTAs, then a compact notebook quote beside a chat-style terminal session.
 * Decode tier: template-slotted.
 *
 * Authoring rows: 1. <h2> · 2. <p> lede · 3. <p><strong><a>Copy install</a></strong></p>
 *   <p><em><a>README</a></em></p> · 4. <p> quote · 5. <p> attribution · 6. <p> terminal title
 *   · 7. terminal lines: <p><code>command</code></p> = a typed command, a line ending in "›" =
 *   the prompt, anything else = output.
 * "Copy install" copies the authored /plugin commands (the source's behaviour).
 */
import { ICONS, el, html } from '../../scripts/stardust.js';

export default async function decorate(block) {
  const section = block.closest('.section');
  if (section) {
    section.classList.add('sec', 'final');
    section.id = 'install';
  }
  const rows = [...block.children].map((r) => r.firstElementChild);
  const h2 = block.querySelector('h2');
  const lede = rows[1]?.querySelector('p');
  const ctas = [...(rows[2]?.querySelectorAll(':scope > p') || [])];
  const quote = rows[3]?.querySelector('p');
  const who = rows[4]?.querySelector('p');
  const title = rows[5]?.querySelector('p');
  const lines = [...(rows[6]?.querySelectorAll(':scope > p') || [])];

  const chat = el('div', 'chat-body');
  lines.forEach((p) => {
    if (p.querySelector('code')) chat.append(el('div', 'msg-user', el('span', null, p)));
    else if (/›\s*$/.test(p.textContent)) chat.append(el('div', 'msg-ctx', p));
    else chat.append(el('div', 'msg-agent', html(`<span class="msg-ico" aria-hidden="true">${ICONS.mark}</span>`), el('span', null, p)));
  });
  const commands = lines.map((p) => p.textContent.trim()).filter((t) => t.startsWith('/plugin'));
  const copy = ctas[0]?.querySelector('a');
  if (copy) {
    copy.setAttribute('role', 'button');
    const txt = el('span', 'txt', ...copy.childNodes);
    copy.append(txt);
    copy.addEventListener('click', async (e) => {
      e.preventDefault();
      if (txt.textContent !== 'Copied') {
        const old = [...txt.childNodes];
        txt.replaceChildren('Copied');
        setTimeout(() => txt.replaceChildren(...old), 1400);
      }
      try { await navigator.clipboard.writeText(commands.join('\n')); } catch { /* ignore */ }
    });
  }

  const head = el(
    'div',
    'final-head',
    h2 ? el('div', 'h2', h2) : null,
    lede ? el('div', 'lede', lede) : null,
    el('div', 'actions', ctas),
  );
  const figure = el(
    'figure',
    'quote compact',
    el('blockquote', null, quote),
    el('figcaption', null, html(`<span class="quote-mark" aria-hidden="true">${ICONS.mark}</span>`), who),
  );
  const win = el(
    'div',
    'window chat',
    el('div', 'win-bar', el('span', 'win-url', title), html(`<span class="win-end" aria-hidden="true">${ICONS.chev}</span>`)),
    chat,
    html(`<div class="composer" aria-hidden="true"><span class="composer-in"></span><span class="composer-send">${ICONS.arrow}</span></div>`),
  );
  block.replaceChildren(el('div', 'container', head, el('div', 'final-grid', figure, win)));
}
