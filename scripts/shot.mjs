/* Tira quadros avulsos para conferência: node scripts/shot.mjs 12 34.5 ...
   PAGINA=vertical.html node scripts/shot.mjs 3 9   — quadros do corte vertical */
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
const dir = path.dirname(fileURLToPath(import.meta.url));
const EXEC = process.env.CHROME || '/opt/pw-browsers/chromium';
const PAGINA = process.env.PAGINA || 'index.html';
const pre = PAGINA === 'index.html' ? 'f' : 'v';
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--force-color-profile=srgb', '--hide-scrollbars', '--font-render-hinting=none'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
p.on('pageerror', e => console.error('ERRO NA PÁGINA:', e.message));
p.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await p.goto('file://' + path.join(dir, '..', 'src', PAGINA));
await p.waitForFunction('window.__ready===true', null, { timeout: 240000 });
const [W, H] = await p.evaluate('[window.__W, window.__H]');
await p.setViewportSize({ width: W, height: H });
console.log('duração total:', await p.evaluate('window.__DUR'), 's', `· ${W}×${H}`);
for (const t of times) {
  await p.evaluate(tt => window.__seek(tt), t);
  await p.screenshot({ path: path.join(dir, '..', 'out', `${pre}_${String(t).replace('.', '_')}.png`) });
}
await b.close();
console.log('quadros:', times.join(' '));
