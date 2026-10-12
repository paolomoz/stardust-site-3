/**
 * header — site chrome (v3 prototype `header.nav`), template-slotted from the authored /nav
 * document's three sections: 1. brand link · 2. <ul> of section links · 3. GitHub link, install CTA.
 * Behaviour: in-page anchors scroll natively (CSS scroll-behavior); no menus.
 * @ew-exempt <p> nav wrappers — the anchors move into the chrome bar (chrome, link labels stay editable)
 */
import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { ICONS, el, html } from '../../scripts/stardust.js';

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const sections = fragment ? [...fragment.querySelectorAll(':scope > .section')] : [];
  const [brandSec, linksSec, toolsSec] = sections;

  const brand = brandSec?.querySelector('a');
  if (brand) {
    brand.className = 'brand';
    const label = el('span', null, ...brand.childNodes);
    brand.replaceChildren(html(ICONS.markColor), label);
  }
  const links = el('nav', 'nav-links', [...(linksSec?.querySelectorAll('a') || [])]);
  links.setAttribute('aria-label', 'Primary');
  const [gh, install] = [...(toolsSec?.querySelectorAll('a') || [])];
  if (gh) {
    gh.className = 'nav-gh';
    gh.setAttribute('aria-label', 'GitHub');
    const label = el('span', null, ...gh.childNodes);
    gh.replaceChildren(html(ICONS.github), label);
  }
  if (install) install.className = 'nav-btn';

  block.replaceChildren(el('div', 'nav', el('div', 'container nav-inner', brand, links, gh, install)));
}
