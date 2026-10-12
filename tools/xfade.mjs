import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 900 } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/index-v2.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(() => scrollTo(0, 300)); await p.waitForTimeout(1500);
await p.click('.dnav[data-go="1"]');
const o = [];
for (const t of [60, 140, 220, 320]) { await p.waitForTimeout(t - (o.length ? [60,140,220,320][o.length-1] : 0)); o.push(await p.evaluate(() => [...document.querySelectorAll('.dstage')].slice(0, 2).map((s) => getComputedStyle(s).opacity).join('/'))); }
console.log('extract/direct opacity over time:', o.join('  '));
await b.close();
