import { chromium } from 'playwright';
const [url, w = '1440'] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: 900 } });
await ctx.route(/\.woff2$|\/nav\.plain\.html|\/footer\.plain\.html/, async (r) => { await new Promise((res) => setTimeout(res, 1500)); r.continue(); });
const p = await ctx.newPage();
await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(5000);
console.log(`CLS @${w}:`, (await p.evaluate(() => window.__cls)).toFixed(4));
await b.close();
