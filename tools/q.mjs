import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const a = [...document.querySelectorAll('main .hero a')].find((x) => /scroll/i.test(x.textContent));
  const chain = []; let x = a; for (let i = 0; i < 4 && x; i++, x = x.parentElement) chain.push(x.tagName + '.' + x.className);
  const em = document.querySelector('main .hero em'); const k = em.parentElement;
  return chain.join(' < ') + '\nKICKER: ' + k.tagName + '.' + k.className + ' :: ' + k.innerHTML.slice(0, 400);
}));
await b.close();
