import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/index.html')).href, { waitUntil: 'networkidle' });
await p.locator('.plans').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
await p.locator('.plans').screenshot({ path: '/tmp/sl/plans.png' });
for (const [sel, name] of [['#redesign .intro-label', 'r'], ['#migrate .intro-label', 'm']]) {
  for (const [k, off] of [[0, 820], [1, 600], [2, 380], [3, 150]]) {
    await p.evaluate(([sel, off]) => { const el = document.querySelector(sel); scrollTo(0, el.getBoundingClientRect().top + scrollY - off); }, [sel, off]);
    await p.waitForTimeout(250);
    await p.locator(sel).screenshot({ path: `/tmp/sl/band-${name}${k}.png` });
  }
}
await b.close();
