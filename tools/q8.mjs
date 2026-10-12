import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } });
await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const d = document.querySelector('main .chapter span.d'); const chain = []; let x = d; for (let i = 0; i < 4 && x; i++, x = x.parentElement) chain.push(x.tagName + '.' + x.className);
  const lab = [...document.querySelectorAll('main .chapter p')].find((p) => /in this step/i.test(p.textContent)); const c2 = []; x = lab; for (let i = 0; i < 3 && x; i++, x = x.parentElement) c2.push(x.tagName + '.' + x.className);
  return chain.join(' < ') + '\n' + c2.join(' < ') + '\n' + lab.outerHTML + '\ncount d=' + document.querySelectorAll('main .chapter span.d').length + ' labels=' + [...document.querySelectorAll('main .chapter p')].filter((p) => /^in this step$/i.test(p.textContent.trim())).length;
}));
await b.close();
