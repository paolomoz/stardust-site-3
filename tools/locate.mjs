import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/' + (process.argv[2] || 'index') + '.html')).href, { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => {
  const isCard = (e) => { const c = getComputedStyle(e); const bg = c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.backgroundImage !== 'none'; const edge = parseFloat(c.borderRadius) >= 6 && (bg || c.boxShadow !== 'none' || c.borderTopStyle !== 'none'); const r = e.getBoundingClientRect(); return edge && r.width > 120 && r.height > 50; };
  const cls = (e) => `${e.tagName.toLowerCase()}.${(e.className + '').trim().split(/\s+/).slice(0, 3).join('.')}`;
  const nested = new Set();
  for (const e of document.querySelectorAll('main *')) { if (!isCard(e)) continue; let a = e.parentElement; while (a && a.tagName !== 'MAIN') { if (isCard(a)) { nested.add(`${cls(e)}  inside  ${cls(a)}`); break; } a = a.parentElement; } }
  const dim = new Set();
  for (const e of document.querySelectorAll('main *, header *, footer *')) { const c = getComputedStyle(e); if ((c.color === 'rgb(126, 136, 149)' || c.color === 'rgb(120, 126, 134)') && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) dim.add(cls(e) + ' "' + e.textContent.trim().slice(0, 30) + '"'); }
  const glow = new Set();
  for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (/0px 0px \d+px/.test(c.boxShadow) && /247, 202, 110|8, 255/.test(c.boxShadow)) glow.add('box ' + cls(e)); if (c.textShadow !== 'none') glow.add('text ' + cls(e)); }
  return 'NESTED\n' + [...nested].join('\n') + '\n\nDIM TEXT\n' + [...dim].slice(0, 20).join('\n') + '\n\nGLOW\n' + [...glow].join('\n');
}));
await b.close();
