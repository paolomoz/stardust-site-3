import { chromium } from 'playwright';
import { NORMALIZE } from '../stardust/reskin/normalize/index.mjs';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2000);
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); } scrollTo(0, 0); });
await p.waitForTimeout(2000);
await p.evaluate(NORMALIZE);
await p.waitForTimeout(300);
const r = await p.evaluate(() => {
  const n = (s) => s.replace(/\s+/g, ' ').trim();
  const res = [];
  res.push('MAIN ' + n(document.querySelector('main').innerText).length);
  const hid = [];
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el);
    if ((cs.display === 'none' || cs.visibility === 'hidden') && n(el.textContent).length > 3) hid.push(`${el.tagName}.${el.className} d=${cs.display} v=${cs.visibility} :: ${n(el.textContent).slice(0, 80)}`);
  }
  res.push('HIDDEN:\n' + hid.join('\n'));
  res.push(n(document.querySelector('main').innerText));
  return res.join('\n');
});
console.log(r);
await b.close();
