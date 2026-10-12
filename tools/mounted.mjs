import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: 'load' });
for (const t of [0, 500, 2000]) { await p.waitForTimeout(t); console.log(`+${t}ms mounted:`, await p.evaluate(() => [...document.querySelectorAll('.dstage')].map((s) => (s.firstElementChild ? 1 : 0)).join('')), 'minH', await p.evaluate(() => document.querySelector('.dstages')?.style.minHeight)); }
await b.close();
