import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://stardust.style/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const doors = document.querySelectorAll('main .spot-tiles a.door'); const [red, mig] = doors;
  const label = [...red.querySelectorAll('p')].find((p) => p.querySelector('strong') && /^Shortcut$/i.test(p.textContent.trim()));
  return JSON.stringify({ n: doors.length, label: !!label, labelHTML: label?.outerHTML, next: label?.nextElementSibling?.outerHTML?.slice(0, 120), parent: label?.parentElement.className, follow: [...mig.querySelectorAll('p')].map((p) => JSON.stringify(p.textContent.trim())) });
}));
await b.close();
