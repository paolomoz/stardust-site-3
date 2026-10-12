import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => { const em = document.querySelector('main .hero em'); let x = em; for (let i = 0; i < 3; i++) x = x.parentElement; return x.tagName + '.' + x.className + ' :: ' + x.outerHTML.slice(0, 700); }));
await b.close();
