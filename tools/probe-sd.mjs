import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
const t0 = await p.evaluate(() => document.querySelector('main').innerText.replace(/\s+/g,' ').trim());
console.log('LOAD len', t0.length);
// scroll through
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const seen = new Set();
for (let y = 0; y < H; y += 450) {
  await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(250);
  const t = await p.evaluate(() => document.querySelector('main').innerText.replace(/\s+/g,' ').trim());
  seen.add(t.length);
}
console.log('lens while scrolling', [...seen].join(','));
// hidden text-bearing elements
const hid = await p.evaluate(() => {
  const res = [];
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el);
    if ((cs.display === 'none' || cs.visibility === 'hidden') && el.textContent.trim().length > 20 && !(el.parentElement && (getComputedStyle(el.parentElement).display==='none'||getComputedStyle(el.parentElement).visibility==='hidden'))) res.push(`${el.tagName}.${el.className} d=${cs.display} v=${cs.visibility} :: ${el.textContent.replace(/\s+/g,' ').trim().slice(0,80)}`);
  }
  return res;
});
console.log(hid.join('\n'));
console.log(t0);
await b.close();
