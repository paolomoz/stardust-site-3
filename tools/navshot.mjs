import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch();
for (const w of [1440, 360]) { const p = await b.newPage({ viewport: { width: w, height: 600 } });
  await p.goto(pathToFileURL(resolve('stardust/reskin/pages/index.html')).href, { waitUntil: 'networkidle' });
  await p.locator('.nav').screenshot({ path: `/tmp/sl/nav${w}.png` }); }
await b.close();
