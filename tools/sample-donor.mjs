import { chromium } from 'playwright';
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36' });
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
for (let y = 0; y < 20000; y += 700) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1000);
const r = await p.evaluate(() => {
  const pick = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); return Object.fromEntries(props.map(k => [k, cs[k]])); };
  const T = ['fontFamily','fontSize','lineHeight','fontWeight','letterSpacing','color','textTransform'];
  const out = { body: pick(document.body, ['backgroundColor','color','fontFamily','fontSize','lineHeight','fontWeight']) };
  out.h1 = pick(document.querySelector('h1'), T); out.h1text = document.querySelector('h1')?.innerText;
  out.h2s = [...document.querySelectorAll('h2')].slice(0, 6).map(h => ({ t: h.innerText.slice(0, 50), ...pick(h, T) }));
  out.h3s = [...document.querySelectorAll('h3')].slice(0, 6).map(h => ({ t: h.innerText.slice(0, 50), ...pick(h, T) }));
  out.ps = [...document.querySelectorAll('p')].filter(x => x.innerText.length > 40).slice(0, 8).map(h => ({ t: h.innerText.slice(0, 50), ...pick(h, T) }));
  const btns = [];
  for (const el of document.querySelectorAll('a, button')) {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    if (r.width > 40 && r.height > 24 && r.height < 70 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') btns.push({ t: el.innerText.trim().slice(0, 30), cls: (el.className+'').slice(0, 80), top: Math.round(r.top + scrollY), h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, pad: cs.padding, fs: cs.fontSize, fw: cs.fontWeight, border: cs.border, shadow: cs.boxShadow });
  }
  out.btns = btns.slice(0, 25);
  const mw = {}; for (const el of document.querySelectorAll('body *')) { const v = getComputedStyle(el).maxWidth; const n = parseFloat(v); if (n >= 700 && n <= 1500) mw[v] = (mw[v] || 0) + 1; } out.maxWidths = mw;
  out.sections = [...document.querySelectorAll('section')].slice(0, 16).map(s => ({ cls: (s.className+'').slice(0, 60), pt: getComputedStyle(s).paddingTop, pb: getComputedStyle(s).paddingBottom, bg: getComputedStyle(s).backgroundColor, bgi: getComputedStyle(s).backgroundImage.slice(0, 120), h: Math.round(s.getBoundingClientRect().height) }));
  const cols = {}; for (const el of document.querySelectorAll('body *')) { const cs = getComputedStyle(el); for (const k of ['color','backgroundColor','borderTopColor']) { const v = cs[k]; if (v && v !== 'rgba(0, 0, 0, 0)') cols[k+':'+v] = (cols[k+':'+v] || 0) + 1; } } out.colors = Object.entries(cols).sort((a,b)=>b[1]-a[1]).slice(0, 40);
  const rad = {}; for (const el of document.querySelectorAll('body *')) { const v = getComputedStyle(el).borderRadius; if (v !== '0px') rad[v] = (rad[v]||0)+1; } out.radii = rad;
  const fams = {}; for (const el of document.querySelectorAll('body *')) { const v = getComputedStyle(el).fontFamily; fams[v] = (fams[v]||0)+1; } out.families = fams;
  out.links = [...new Set([...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href')))].slice(0, 80);
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
