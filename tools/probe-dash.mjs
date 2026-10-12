import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://www.tryprofound.com/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const o = [];
  for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); for (const s of ['Left','Right','Top','Bottom']) if (c['border'+s+'Style']==='dashed') { o.push(`${e.tagName}.${(e.className+'').slice(0,70)} ${s} ${c['border'+s]} x=${Math.round(e.getBoundingClientRect().left)} w=${Math.round(e.getBoundingClientRect().width)}`); } const bi=c.backgroundImage; if (bi.includes('repeating-linear')) o.push('BGI '+e.tagName+' '+(e.className+'').slice(0,60)+' '+bi.slice(0,200)); }
  const h = document.querySelector('header, nav'); const hc = getComputedStyle(h);
  o.push('NAV ' + h.tagName + ' h=' + h.getBoundingClientRect().height + ' bg=' + hc.backgroundColor + ' bb=' + hc.borderBottom);
  const hero = document.querySelector('h1'); let x = hero; for (let i=0;i<6;i++){x=x.parentElement; const c=getComputedStyle(x); o.push('HEROCHAIN '+x.tagName+'.'+(x.className+'').slice(0,80)+' bgi='+c.backgroundImage.slice(0,200)+' pt='+c.paddingTop);}
  return o.slice(0, 40).join('\n');
});
console.log(r); await b.close();
