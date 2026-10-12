import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } });
await p.waitForTimeout(1500);
console.log(await p.evaluate(() => { const h = document.querySelector('main .install h2'); const ps = [...document.querySelectorAll('main .install p')].map((x) => x.className + ' :: ' + x.textContent.slice(0, 60)); return h.outerHTML + '\n' + ps.join('\n'); }));
await b.close();
