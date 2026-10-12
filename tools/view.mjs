import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [sel, out, w = '1440'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/' + (process.argv[5] || 'index') + '.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } });
await p.waitForTimeout(1500);
if (sel === 'full') await p.screenshot({ path: out, fullPage: true });
else { await p.locator(sel).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await p.locator(sel).first().screenshot({ path: out }); }
console.log(await p.evaluate(() => [...document.querySelectorAll('main img')].map(i => `${i.naturalWidth}x${i.naturalHeight} rendered ${i.clientWidth}x${i.clientHeight}`).join(' | ')));
await b.close();
