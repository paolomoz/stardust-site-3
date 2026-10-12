import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/index.html')).href, { waitUntil: 'networkidle' });
const big = p.locator('.foot-big'); await big.scrollIntoViewIfNeeded();
const spans = p.locator('.foot-big span');
for (let i = 0; i < 8; i++) { await spans.nth(i).hover(); await p.waitForTimeout(90); }
await p.waitForTimeout(150);
await big.screenshot({ path: '/tmp/sl/foot.png' });
console.log(await spans.evaluateAll((els) => els.map((e) => getComputedStyle(e).color).join(' | ')));
await b.close();
