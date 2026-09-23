// Usage: node render/snap.js out_dir t1 t2 ...  → PNG stills of the composition at given times
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [out, ...times] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--disable-gpu', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('console', (m) => console.log('[page]', m.text()));
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../composition/index.html'));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  for (const t of times) {
    await page.evaluate((t) => window.seekTo(t), parseFloat(t));
    await page.screenshot({ path: `${out}/snap_${String(t).padStart(6, '0')}.png` });
  }
  await browser.close();
})();
