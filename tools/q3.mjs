import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } });
await p.waitForTimeout(1500);
console.log(await p.evaluate(() => { const a = document.querySelector('main .install a[href*="impeccable.style"]'); const out = []; let x = a; for (let i = 0; i < 4 && x; i++, x = x.parentElement) out.push(x.tagName + '.' + x.className); return out.join(' < '); }));
await b.close();
