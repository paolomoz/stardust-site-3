import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch({ headless: false, args: ['--use-angle=metal', '--window-position=-2400,0'] });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/index.html')).href, { waitUntil: 'networkidle' });
await p.evaluate(() => scrollTo(0, 420)); await p.waitForTimeout(800);
for (let k = 0; k < 6; k++) {
  await p.click(`.dnav[data-go="${k}"]`);
  await p.waitForTimeout(k === 2 ? 1500 : 1100);
  await p.locator('.demo').screenshot({ path: `/tmp/sl/f${k}a.png` });
  await p.waitForTimeout(2200);
  await p.locator('.demo').screenshot({ path: `/tmp/sl/f${k}b.png` });
}
await b.close();
