import { chromium } from 'playwright';
const [url, out, w='1440'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36' });
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
for (let y = 0; y < 30000; y += 600) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(120); }
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500);
const h = await p.evaluate(() => [document.body.scrollHeight, document.documentElement.scrollHeight]);
console.log(url, 'height', h);
await p.screenshot({ path: out, fullPage: true });
await b.close();
