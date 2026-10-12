import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/index.html')).href, { waitUntil: 'networkidle' });
await p.locator('.nav .brand').screenshot({ path: '/tmp/sl/logo-nav.png' });
await p.locator('.foot .brand').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
await p.locator('.foot .brand').screenshot({ path: '/tmp/sl/logo-foot.png' });
await b.close();
