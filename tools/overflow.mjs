import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 800 } });
await p.goto(pathToFileURL(resolve('stardust/reskin/pages/index.html')).href, { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.intro-label,.dnav-list,.foot-big')).slice(0, 8).map((e) => `${e.tagName}.${e.className} right=${Math.round(e.getBoundingClientRect().right)}`).join('\n')));
await b.close();
