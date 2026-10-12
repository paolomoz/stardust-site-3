import { chromium } from 'playwright';
const [url, out, w] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ['--use-angle=metal', '--window-position=-2400,0'] });
const p = await b.newPage({ viewport: { width: +w, height: +w > 600 ? 900 : 844 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
console.log(w, 'renderer:', await p.evaluate(() => document.querySelector('.hero-nebula')?.dataset.renderer), 'path:', await p.evaluate(() => document.querySelector('.error-path')?.textContent), 'header:', await p.evaluate(() => !!document.querySelector('header .nav-inner')), 'errors:', errs);
await p.screenshot({ path: out, fullPage: true });
await b.close();
