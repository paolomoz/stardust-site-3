import { chromium } from 'playwright';
import { NORMALIZE } from '../stardust/reskin/normalize/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); } scrollTo(0, 0); });
await p.waitForTimeout(2000);
await p.evaluate(NORMALIZE);
const r = await p.evaluate(() => {
  const out = [];
  const walk = (el, d) => {
    if (d > 3) return;
    for (const c of el.children) {
      const t = (c.innerText || '').replace(/\s+/g, ' ').trim();
      if (!t) continue;
      out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}${c.className && typeof c.className === 'string' ? '.' + c.className.trim().split(/\s+/).join('.') : ''} (${t.length}) ${t.slice(0, 70)}`);
      walk(c, d + 1);
    }
  };
  walk(document.querySelector('main .sc-stage'), 0);
  return out.join('\n');
});
console.log(r);
await b.close();
