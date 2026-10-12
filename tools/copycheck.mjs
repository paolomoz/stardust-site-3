import { chromium } from 'playwright';
const b = await chromium.launch(); const ctx = await b.newContext({ permissions: ['clipboard-read', 'clipboard-write'] }); const p = await ctx.newPage();
await p.goto(process.argv[2], { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
await p.locator('#install a.button.primary').scrollIntoViewIfNeeded(); await p.click('#install a.button.primary'); await p.waitForTimeout(300);
console.log('clipboard:', JSON.stringify(await p.evaluate(() => navigator.clipboard.readText())));
console.log('version strings on page:', await p.evaluate(() => (document.body.innerText.match(/\b\d+\.\d+\.\d+\b|\bv\d+\.\d+/g) || []).join(', ') || 'none'));
console.log('terminal:', await p.evaluate(() => [...document.querySelectorAll('.chat-body > div')].map((d) => d.className.replace('msg-', '') + ':' + d.innerText).join(' | ')));
await b.close();
