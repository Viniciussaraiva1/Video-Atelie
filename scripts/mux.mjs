/* ---------------------------------------------------------------
   Troca a trilha de um vídeo já renderizado, sem refazer os quadros.
   uso: node scripts/mux.mjs [vídeo.mp4] [trilha.wav]
        node scripts/mux.mjs [vídeo.mp4] mudo    — tira a música

   "mudo" deixa uma faixa de áudio silenciosa em vez de nenhuma faixa:
   o vídeo fica sem som do mesmo jeito, mas alguns aplicativos (o envio
   do Instagram entre eles) engasgam com arquivo sem faixa de áudio.
----------------------------------------------------------------*/
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const video = path.join(raiz, 'out', process.argv[2] || 'atelie-digital-como-funciona.mp4');
const pedido = process.argv[3] || 'trilha.wav';
const mudo = pedido === 'mudo';
const trilha = path.join(raiz, 'out', mudo ? 'trilha.wav' : pedido);
const tmp = video.replace(/\.mp4$/, '.tmp.mp4');

const exigidos = mudo ? [video] : [video, trilha];
for (const f of exigidos) if (!fs.existsSync(f)) { console.error('falta:', f); process.exit(1); }

const entrada = mudo
  ? ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo']
  : ['-i', trilha];

const r = spawnSync(ffmpeg, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', video, ...entrada,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', mudo ? '48k' : '192k', '-ar', '44100',
  '-movflags', '+faststart', '-shortest', tmp
], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);

fs.renameSync(tmp, video);
console.log(`${mudo ? 'música retirada de' : 'trilha trocada em'} ${path.basename(video)} (${(fs.statSync(video).size / 1048576).toFixed(1)} MB)`);
