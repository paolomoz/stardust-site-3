import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => [...document.querySelectorAll('main .spot-tiles > *')].map((d) => d.tagName + '.' + d.className + '\n  ' + [...d.querySelectorAll(':scope *')].filter((e) => e.children.length === 0 || e.tagName === 'P').map((e) => e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 40) + '"').join('\n  ')).join('\n')));
await b.close();
