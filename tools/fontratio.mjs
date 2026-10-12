import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const root = process.argv[2];
const b = await chromium.launch(); const p = await b.newPage();
await p.setContent(`<style>
@font-face{font-family:I;src:url(${pathToFileURL(root+'/fonts/inter-variable.woff2').href})}
@font-face{font-family:C;src:url(${pathToFileURL(root+'/fonts/caveat-500.woff2').href})}
span{font-size:100px;white-space:nowrap}</style>
<span id=i style="font-family:I">Takes a website and brings it back redesigned, fixed, migrated. 0123456789</span><br>
<span id=a style="font-family:Arial">Takes a website and brings it back redesigned, fixed, migrated. 0123456789</span><br>
<span id=c style="font-family:C">You can go from global brand to regionalized site in under a day.</span><br>
<span id=a2 style="font-family:Arial">You can go from global brand to regionalized site in under a day.</span>`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => Object.fromEntries(['i','a','c','a2'].map((k) => [k, document.getElementById(k).getBoundingClientRect().width])))));
await b.close();
