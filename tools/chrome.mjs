import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
const r = await p.evaluate(() => {
  const links = (root) => [...root.querySelectorAll('a')].map(a => `${a.innerText.replace(/\s+/g,' ').trim()} -> ${a.href}`);
  const h = document.querySelector('header'), f = document.querySelector('footer');
  return { header: links(h), footer: links(f), footerText: f.innerText, brandSvg: h.querySelector('a.brand svg')?.outerHTML, cube: document.querySelector('.hero-visual')?.innerHTML.slice(0, 3000) };
});
console.log(JSON.stringify(r, null, 1)); await b.close();
