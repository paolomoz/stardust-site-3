import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch();
for (const url of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(/^https?:/.test(url) ? url : pathToFileURL(resolve(url)).href, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => [...document.querySelectorAll('.flow:not(.block) li, ol.flow li')].map((li) => `${li.getBoundingClientRect().height} [${[...li.children].map((c) => c.tagName + ':' + c.getBoundingClientRect().height).join(' ')}]`).join(' | ')));
}
await b.close();
