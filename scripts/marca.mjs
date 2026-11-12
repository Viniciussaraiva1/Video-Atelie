#!/usr/bin/env node
/* Fotografa as peças da marca (marca/pecas.html) em PNG.
     node scripts/marca.mjs            # todas: marca/cartao.png, marca/perfil.png e insta/novo/post-*.png
     node scripts/marca.mjs post-3     # só as que começam com "post-3"
   As peças mostram a vitrine de verdade (v/), então o script sobe um servidor local enquanto fotografa. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');   /* acha a instalação local ou a global */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const servidor = createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    if (p.endsWith('/')) p += 'index.html';
    res.writeHead(200, { 'content-type': TIPOS[extname(p)] || 'application/octet-stream' }).end(await readFile(join(RAIZ, p)));
  } catch { res.writeHead(404).end(); }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
const base = 'http://127.0.0.1:' + servidor.address().port + '/marca/pecas.html?p=';

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 1350 } });
await pagina.goto(base + 'perfil');
const nomes = (await pagina.evaluate(() => window.PECAS_NOMES)).filter(n => !process.argv[2] || n.startsWith(process.argv[2]));
mkdirSync(join(RAIZ, 'insta', 'novo'), { recursive: true });
for (const n of nomes) {
  await pagina.goto(base + n, { waitUntil: 'networkidle' });
  const [w, h] = await pagina.evaluate(() => window.PECA_TAMANHO);
  await pagina.setViewportSize({ width: w, height: h });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(700);
  const saida = n.startsWith('post-') ? join('insta', 'novo', n + '.png') : join('marca', n + '.png');
  await pagina.screenshot({ path: join(RAIZ, saida), clip: { x: 0, y: 0, width: w, height: h } });
  console.log(saida, w + 'x' + h);
}
await navegador.close(); servidor.close();
