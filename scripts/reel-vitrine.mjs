#!/usr/bin/env node
/* Reel "do toque ao pedido": uma compra inteira na vitrine, como gravação de tela de celular.
     node scripts/reel-vitrine.mjs                     # reels/vitrine-em-uso.mp4 (1080×1920, 30 qps)
     node scripts/reel-vitrine.mjs "n=praia&l=Loja+Exemplo&c=1F6B54" vitrine-praia
   A vitrine é a de exemplo (peças desenhadas), então o vídeo pode ser publicado sem pedir foto a ninguém.
   Cada quadro é uma fotografia da página; nada depende de relógio. A trilha é "Lampejo", composição própria. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
let FFMPEG = 'ffmpeg'; try { FFMPEG = require('ffmpeg-static') || 'ffmpeg'; } catch { /* usa o do sistema */ }

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const QPS = 30, L = 360, A = 640, ESCALA = 3;
const consulta = process.argv[2] || 'n=festa&l=Loja+Exemplo&c=6E2433', nome = process.argv[3] || 'vitrine-em-uso';

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const servidor = createServer(async (req, res) => {
  try { let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, ''); if (p.endsWith('/')) p += 'index.html';
    res.writeHead(200, { 'content-type': TIPOS[extname(p)] || 'application/octet-stream' }).end(await readFile(join(RAIZ, p))); } catch { res.writeHead(404).end(); }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));

mkdirSync(join(RAIZ, 'reels'), { recursive: true });
const saida = join(RAIZ, 'reels', nome + '.mp4'), trilha = join(RAIZ, 'audio', 'lampejo.m4a');
const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(QPS), '-i', '-'];
if (existsSync(trilha)) args.push('-i', trilha);
args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-movflags', '+faststart');
const ff = spawn(FFMPEG, [...args, '-shortest', '-c:a', 'aac', '-b:a', '160k', saida], { stdio: ['pipe', 'inherit', 'inherit'] });
let quadros = 0;
const grava = buf => new Promise(ok => { quadros++; if (!ff.stdin.write(buf)) ff.stdin.once('drain', ok); else ok(); });

const navegador = await chromium.launch();
const p = await navegador.newPage({ viewport: { width: L, height: A }, deviceScaleFactor: ESCALA });
/* O palco: uma faixa escura em cima, com a marca e a legenda, e a vitrine embaixo, numa moldura própria.
   A legenda fica abaixo de 240 px do vídeo, fora da área que o Instagram cobre no Reels. */
const FAIXA = 124;
await p.setContent(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@1,500&family=Montserrat:wght@300;400;500;600&display=swap">
<style>
  html,body{margin:0;width:${L}px;height:${A}px;overflow:hidden;background:#2B2623;font-family:'Montserrat',sans-serif;color:#FAF8F5}
  #marca{position:absolute;left:0;right:0;top:40px;text-align:center;font-size:15px;font-weight:300;opacity:.8}
  #marca em,.m em,h1 em{font-family:'Bodoni Moda',Georgia,serif;font-style:italic;font-weight:500;color:#E0A57E}
  #legenda{position:absolute;left:16px;right:16px;top:78px;height:36px;display:grid;place-items:center;text-align:center;font-size:19px;font-weight:500;letter-spacing:-.01em}
  #tela{position:absolute;left:0;top:${FAIXA}px;width:${L}px;height:${A - FAIXA}px;border:0;border-radius:20px 20px 0 0;background:#FAF8F5}
  #toque{position:absolute;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(154,74,38,.28);border:2px solid rgba(154,74,38,.9);opacity:0;pointer-events:none}
  #cartaz{position:absolute;inset:0;display:none;flex-direction:column;justify-content:center;gap:18px;padding:0 32px;background:#FAF8F5;color:#2B2623}
  #cartaz .m{font-size:17px;font-weight:300}#cartaz .m em,#cartaz h1 em{color:#9A4A26}
  #cartaz h1{margin:0;font-size:42px;font-weight:300;line-height:1.06;letter-spacing:-.02em}
  #cartaz p{margin:0;font-size:17px;line-height:1.4;color:#6B625C}
  #cartaz .tag{align-self:flex-start;padding:9px 16px 9px 30px;background:#9A4A26;color:#fff;font-size:15px;font-weight:500;border-radius:6px;clip-path:polygon(13px 0,100% 0,100% 100%,13px 100%,0 50%)}
</style></head><body>
<div id="marca">Ateliê <em>Digital</em></div><div id="legenda"></div>
<iframe id="tela" name="tela" src="http://127.0.0.1:${servidor.address().port}/v/?e=1&${consulta}"></iframe>
<div id="toque"></div><div id="cartaz"></div></body></html>`, { waitUntil: 'networkidle' });
const tela = p.frame({ name: 'tela' }), na = s => p.frameLocator('#tela').locator(s).first();
await p.evaluate(() => document.fonts.ready); await tela.evaluate(() => document.fonts.ready);

const foto = () => p.screenshot({ type: 'jpeg', quality: 93 });
const segura = async s => { const b = await foto(); for (let i = 0; i < Math.round(s * QPS); i++) await grava(b); };
const legenda = t => p.evaluate(t => { document.getElementById('legenda').textContent = t || ''; }, t);
const cartaz = html => p.evaluate(h => { const c = document.getElementById('cartaz'); c.style.display = h ? 'flex' : 'none'; c.innerHTML = h || ''; }, html);
const suave = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
async function rola(ate, s) {
  const de = await tela.evaluate(() => scrollY), n = Math.round(s * QPS);
  for (let i = 1; i <= n; i++) { await tela.evaluate(y => scrollTo(0, y), de + (ate - de) * suave(i / n)); await grava(await foto()); }
}
async function toca(seletor) {
  const alvo = na(seletor); await alvo.scrollIntoViewIfNeeded();
  const r = await alvo.boundingBox(), x = r.x + r.width / 2, y = r.y + r.height / 2;   /* já vem em coordenadas do palco */
  for (let i = 0; i < 9; i++) {
    await p.evaluate(([x, y, k]) => { const t = document.getElementById('toque'); t.style.left = x + 'px'; t.style.top = y + 'px'; t.style.opacity = String(1 - k * .55); t.style.transform = 'scale(' + (.55 + k * .6) + ')'; }, [x, y, i / 8]);
    await grava(await foto());
  }
  await p.evaluate(() => { document.getElementById('toque').style.opacity = '0'; });
  await alvo.click(); await p.waitForTimeout(420);
}

/* ----- o filme ----- */
await cartaz('<span class="m">Ateliê <em>Digital</em></span><h1>Do toque ao pedido, <em>sem esperar resposta.</em></h1><p>Uma compra inteira na vitrine, sem cortes.</p>');
await segura(1.7);
await cartaz(''); await legenda('A cliente abre o link da bio'); await segura(.9);
const grade = await tela.evaluate(() => Math.round(document.getElementById('vitrine').getBoundingClientRect().top + scrollY - 70));
await rola(grade, 1.7); await legenda('Vê a peça e o preço'); await segura(.8);
await toca('#grade > * img'); await segura(1.1);
await legenda('Escolhe o tamanho'); await toca('#f-tams button:nth-child(2)'); await segura(.7);
await toca('#f-add'); await legenda('Fecha o pedido sem te chamar'); await segura(1.0);
await toca('#s-fechar-compra'); await segura(.5);
await na('#c-nome').fill('Ana Paula'); await na('#c-cel').fill('(94) 99123-4567'); await segura(.8);
await legenda('Paga no Pix'); await toca('#c-pagar'); await segura(1.3);
await toca('#pix-pago'); await legenda('Você só separa a peça'); await segura(1.4);
await legenda('');
await cartaz('<span class="m">Ateliê <em>Digital</em></span><h1>Me manda cinco peças. <em>Eu devolvo a sua vitrine.</em></h1><p>Prévia grátis em até 2 dias úteis. Página de venda por R$ 890, uma vez só.</p><span class="tag">Comente VITRINE</span>');
await p.screenshot({ path: join(RAIZ, 'reels', 'capa-' + nome + '.jpg'), type: 'jpeg', quality: 92 });
await segura(2.6);

await navegador.close(); ff.stdin.end();
await new Promise((ok, erro) => ff.on('close', c => c === 0 ? ok() : erro(new Error('ffmpeg saiu com ' + c))));
servidor.close();
console.log(saida, (quadros / QPS).toFixed(1) + ' s', quadros + ' quadros');
