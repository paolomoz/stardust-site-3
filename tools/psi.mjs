import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
for (const ff of ['mobile', 'desktop']) {
  await p.goto(url.replace(/form_factor=\w+/, `form_factor=${ff}`), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForSelector('.lh-gauge__percentage', { timeout: 90000 }).catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const root = [...document.querySelectorAll('.lh-vars, .lh-root, article')].find((e) => e.offsetParent !== null) || document;
    const gauges = [...root.querySelectorAll('.lh-gauge__wrapper, .lh-fraction__wrapper')].filter((g) => g.offsetParent !== null).map((g) => `${g.querySelector('.lh-gauge__label, .lh-fraction__label')?.textContent.trim()}: ${g.querySelector('.lh-gauge__percentage, .lh-fraction__content')?.textContent.trim()}`);
    const metrics = [...root.querySelectorAll('.lh-metric')].filter((m) => m.offsetParent !== null).map((m) => `${m.querySelector('.lh-metric__title')?.textContent.trim()} ${m.querySelector('.lh-metric__value')?.textContent.trim()}`);
    const cwv = document.body.innerText.match(/Core Web Vitals Assessment:?\s*(\w+(?: \w+)?)/i)?.[1] || 'n/a';
    const failing = [...root.querySelectorAll('.lh-audit--fail, .lh-audit--average')].filter((a) => a.offsetParent !== null).map((a) => (a.querySelector('.lh-audit__title')?.textContent.trim() || '') + ' ' + (a.querySelector('.lh-audit__display-text')?.textContent.trim() || '')).slice(0, 15);
    return { gauges: [...new Set(gauges)], metrics: [...new Set(metrics)], cwv, failing: [...new Set(failing)] };
  });
  console.log(`== ${ff}`, JSON.stringify(r, null, 1));
  await p.screenshot({ path: `/tmp/sl/psi-${ff}.png` });
}
await b.close();
