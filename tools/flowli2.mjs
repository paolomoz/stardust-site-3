import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const b = await chromium.launch();
for (const url of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
  await p.goto(/^https?:/.test(url) ? url : pathToFileURL(resolve(url)).href, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => {
    const li = document.querySelector('ol.flow li'); const top = li.getBoundingClientRect().top;
    const out = [];
    const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 3 && c.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(c); const b = r.getBoundingClientRect(); out.push(`text ${(b.top - top).toFixed(1)}+${b.height.toFixed(1)}`); } else if (c.nodeType === 1) { const b = c.getBoundingClientRect(); out.push(`${c.tagName} ${(b.top - top).toFixed(1)}+${b.height.toFixed(1)} lh=${getComputedStyle(c).lineHeight}`); if (c.tagName !== 'svg') walk(c); } } };
    walk(li); return `li h=${li.getBoundingClientRect().height} lh=${getComputedStyle(li).lineHeight} fs=${getComputedStyle(li).fontSize} :: ` + out.join(' | ');
  }));
}
await b.close();
