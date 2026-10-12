import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
await p.goto(process.argv[2], { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForSelector('.lh-gauge__percentage', { state: 'attached', timeout: 90000 }); await p.waitForTimeout(4000);
const out = await p.evaluate(() => {
  const vis = (e) => e.offsetParent !== null;
  const audits = [...document.querySelectorAll('.lh-audit')].filter(vis);
  const want = audits.filter((a) => /layout shift|agentic|forced reflow|render-blocking|speed index|llms|accessible name|largest contentful/i.test(a.querySelector('.lh-audit__title')?.textContent || '') && (a.classList.contains('lh-audit--fail') || a.classList.contains('lh-audit--average') || /agentic/i.test(a.closest('.lh-category')?.textContent?.slice(0, 40) || '')));
  return want.map((a) => { a.querySelector('details')?.setAttribute('open', ''); return `### ${a.querySelector('.lh-audit__title')?.textContent.trim()}\n${(a.querySelector('.lh-audit__description')?.textContent || '').trim().slice(0, 300)}\n${[...a.querySelectorAll('table tr, .lh-table tr')].map((r) => r.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 14).join('\n')}`; });
});
console.log(out.join('\n\n'));
const ag = await p.evaluate(() => { const cat = [...document.querySelectorAll('.lh-category')].filter((c) => c.offsetParent !== null).find((c) => /Agentic/i.test(c.querySelector('.lh-category-header')?.textContent || c.textContent.slice(0, 200))); if (!cat) return 'no agentic category'; cat.querySelectorAll('details').forEach((d) => d.setAttribute('open', '')); return cat.innerText.slice(0, 2500); });
console.log('\n=== AGENTIC ===\n' + ag);
await b.close();
