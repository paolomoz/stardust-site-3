import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const sels = ['.hero', '.demo', '.ways', '.plans', '#redesign', '#redesign .intro-label', '#redesign .sec-head', '#redesign .quote', '#redesign .step-v2', '.showcase', '#migrate', '#migrate .quote', '.flow', '#migrate .step-v2', '.final', '.final-grid', 'footer'];
const b = await chromium.launch();
const res = {};
for (const url of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: +(process.env.W || 1440), height: 900 }, reducedMotion: 'reduce' });
  await p.goto(/^https?:/.test(url) ? url : pathToFileURL(resolve(url)).href, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } scrollTo(0, 0); });
  await p.waitForTimeout(1200);
  res[url] = await p.evaluate((sels) => Object.fromEntries(sels.map((s) => { const els = [...document.querySelectorAll(s)]; return [s, els.map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.top + scrollY)}/${Math.round(r.height)}`; }).join(' ')]; })), sels);
}
const [a, c] = Object.keys(res);
for (const s of sels) console.log(s.padEnd(24), (res[a][s] || '').padEnd(40), '|', res[c][s]);
await b.close();
