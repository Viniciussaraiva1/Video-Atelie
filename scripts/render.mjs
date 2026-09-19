/* ---------------------------------------------------------------
   Renderiza o filme quadro a quadro. Cada quadro é um seek(t) na
   página e uma foto da tela; as fotos vão direto para o ffmpeg por
   um cano, sem encostar no disco. O áudio entra na mesma passada.
   uso: node scripts/render.mjs [fps] [saída.mp4]
----------------------------------------------------------------*/
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.join(dir, '..');
const FPS = Number(process.argv[2] || 30);
const SAIDA = path.join(raiz, 'out', process.argv[3] || 'atelie-digital-como-funciona.mp4');
const TRILHA = path.join(raiz, 'out', 'trilha.wav');
const EXEC = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

if (!fs.existsSync(TRILHA)) { console.error('Falta a trilha. Rode: npm run music'); process.exit(1); }

const nav = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--force-color-profile=srgb', '--hide-scrollbars',
         '--font-render-hinting=none', '--disable-lcd-text', '--disable-gpu']
});
const pag = await nav.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
pag.on('pageerror', e => { console.error('ERRO NA PÁGINA:', e.message); process.exitCode = 1; });
await pag.goto('file://' + path.join(raiz, 'src', 'index.html'));
await pag.waitForFunction('window.__ready===true', null, { timeout: 30000 });

const DUR = await pag.evaluate('window.__DUR');
/* DE e ATE (em segundos) rendem só um trecho, para conferir sem esperar o filme todo */
const DE = Number(process.env.DE || 0), ATE = Number(process.env.ATE || DUR);
const Q0 = Math.round(DE * FPS), TOTAL = Math.round((ATE - DE) * FPS);
console.log(`filme: ${DUR}s · ${FPS} qps · trecho ${DE}–${ATE}s · ${TOTAL} quadros`);

const ff = spawn(ffmpeg, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-vcodec', 'png', '-framerate', String(FPS), '-i', 'pipe:0',
  '-ss', String(DE), '-i', TRILHA,
  '-map', '0:v', '-map', '1:a',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
  '-movflags', '+faststart', '-shortest', SAIDA
], { stdio: ['pipe', 'inherit', 'inherit'] });

const fim = new Promise((ok, erro) => {
  ff.on('close', c => (c === 0 ? ok() : erro(new Error('ffmpeg saiu com código ' + c))));
});

const t0 = Date.now();
for (let f = 0; f < TOTAL; f++) {
  const t = (Q0 + f) / FPS;
  await pag.evaluate(tt => window.__seek(tt), t);
  const png = await pag.screenshot({ type: 'png' });
  if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 150 === 0 || f === TOTAL - 1) {
    const dec = (Date.now() - t0) / 1000;
    const falta = f ? (dec / f) * (TOTAL - f) : 0;
    console.log(`  quadro ${String(f + 1).padStart(4)}/${TOTAL}  ${(t).toFixed(1)}s  ` +
                `${dec.toFixed(0)}s decorridos, ~${falta.toFixed(0)}s restantes`);
  }
}
ff.stdin.end();
await nav.close();
await fim;

const mb = (fs.statSync(SAIDA).size / 1048576).toFixed(1);
console.log(`pronto: ${SAIDA} (${mb} MB, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
