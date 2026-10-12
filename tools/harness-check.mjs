import { chromium } from 'playwright';
const url = process.argv[2]; const shot = process.argv[3];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => ({
  appear: document.body.classList.contains('appear'),
  blocks: [...document.querySelectorAll('main .block')].map((b) => `${b.dataset.blockName}:${b.dataset.blockStatus}:${b.getBoundingClientRect().height | 0}`),
  h1: document.querySelectorAll('h1').length,
  sections: [...document.querySelectorAll('main > .section')].map((s) => s.className + (s.id ? '#' + s.id : '')),
  docH: document.documentElement.scrollHeight,
})), null, 1));
console.log('ERRORS', errs.slice(0, 8));
if (shot) await p.screenshot({ path: shot, fullPage: true });
await b.close();
