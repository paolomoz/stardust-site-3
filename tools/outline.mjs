import { chromium } from 'playwright';
const [url] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(2000);
const r = await p.evaluate(() => {
  const out = [];
  const walk = (el, d) => {
    if (d > 4) return;
    for (const c of el.children) {
      if (['SCRIPT','STYLE','LINK','META','NOSCRIPT'].includes(c.tagName)) continue;
      const t = (c.innerText || '').replace(/\s+/g, ' ').trim();
      const r = c.getBoundingClientRect();
      out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}${c.id ? '#' + c.id : ''}${c.className && typeof c.className === 'string' ? '.' + c.className.trim().split(/\s+/).join('.') : ''} [${Math.round(r.top + scrollY)}h${Math.round(r.height)}] (${t.length}) ${t.slice(0, 90)}`);
      if (t.length > 0) walk(c, d + 1);
    }
  };
  walk(document.body, 0);
  return out.join('\n');
});
console.log(r);
await b.close();
