import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const [out, w = '1440', h = '900', y = '0'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/' + (process.argv[6] || 'index') + '.html')).href, { waitUntil: 'networkidle' });
await p.evaluate((y) => scrollTo(0, +y), y); await p.waitForTimeout(4000);
await p.screenshot({ path: out });
await b.close();
