import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => [...document.querySelectorAll('main .spot-tiles a.door')].map((d) => [...d.children].map((c) => `${c.tagName}.${c.className} :: ${c.textContent.trim().slice(0, 50)}`).join('\n')).join('\n----\n')));
await b.close();
