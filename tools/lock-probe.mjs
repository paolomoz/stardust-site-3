import { chromium } from 'playwright';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await p.addInitScript(() => { window.__ls = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput && e.value > 0) window.__ls.push(`${Math.round(e.startTime)}ms ${e.value.toFixed(4)} ${e.sources.map((s) => (s.node?.className || s.node?.nodeName) + ' ' + (s.previousRect.y | 0) + '→' + (s.currentRect.y | 0)).join(', ')}`); }).observe({ type: 'layout-shift', buffered: true }); });
await p.goto(process.argv[2], { waitUntil: 'load', timeout: 120000 });
const snap = async (l) => console.log(l, JSON.stringify(await p.evaluate(() => { const box = document.querySelector('.dstages'); return { t: Math.round(performance.now()), minH: box?.style.minHeight, h: Math.round(box?.getBoundingClientRect().height), on: [...document.querySelectorAll('.dstage')].findIndex((s) => s.classList.contains('on')), mounted: [...document.querySelectorAll('.dstage')].map((s) => (s.firstElementChild ? 1 : 0)).join(''), inter: document.fonts.check('500 16px interVariable') }; })));
await snap('load');
for (let i = 0; i < 6; i++) { await p.waitForTimeout(2000); await snap(`+${(i + 1) * 2}s`); }
console.log(await p.evaluate(() => window.__ls.join('\n')) || 'no shifts');
await b.close();
