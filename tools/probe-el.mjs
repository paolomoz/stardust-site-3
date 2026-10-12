import { chromium } from 'playwright';
const [url, ...texts] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36' });
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
for (let y = 0; y < 16000; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
const r = await p.evaluate((texts) => {
  const P = ['fontFamily','fontSize','lineHeight','fontWeight','letterSpacing','color','backgroundColor','backgroundImage','borderTop','borderLeft','borderRadius','padding','maxWidth','width','boxShadow'];
  const out = { html: getComputedStyle(document.documentElement).backgroundColor };
  for (const t of texts) {
    const all = [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim() === t));
    out[t] = all.slice(0, 2).map(e => { const cs = getComputedStyle(e); const chain = []; let x = e; for (let i = 0; i < 4 && x; i++, x = x.parentElement) { const c = getComputedStyle(x); chain.push(`${x.tagName}.${(x.className+'').slice(0,90)} bg=${c.backgroundColor} bt=${c.borderTop} bl=${c.borderLeft} r=${c.borderRadius} pad=${c.padding} w=${Math.round(x.getBoundingClientRect().width)}`); } return { ...Object.fromEntries(P.map(k => [k, cs[k]])), chain }; });
  }
  return out;
}, texts);
console.log(JSON.stringify(r, null, 1));
await b.close();
