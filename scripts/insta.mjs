/* ---------------------------------------------------------------
   Gera as peças do Instagram em PNG, na pasta insta/.
   uso: node scripts/insta.mjs              — todas
        node scripts/insta.mjs post-6-cartaz — só as que começam assim
----------------------------------------------------------------*/
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const saida = path.join(raiz, 'insta');
fs.mkdirSync(saida, { recursive: true });
const filtro = process.argv.slice(2);

const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--force-color-profile=srgb', '--hide-scrollbars', '--font-render-hinting=none'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
p.on('pageerror', e => console.error('ERRO NA PÁGINA:', e.message));
await p.goto('file://' + path.join(raiz, 'src', 'insta.html'));
await p.waitForFunction('window.__ready===true', null, { timeout: 120000 });
const ids = (await p.evaluate('window.__ids')).filter(id => !filtro.length || filtro.some(f => id.startsWith(f)));
for (const id of ids) {
  const [w, h] = await p.evaluate(i => window.__monta(i), id);
  await p.setViewportSize({ width: w, height: h });
  await p.locator('#peca').screenshot({ path: path.join(saida, id + '.png') });
  console.log(`${id}.png  ${w}×${h}`);
}
await b.close();
