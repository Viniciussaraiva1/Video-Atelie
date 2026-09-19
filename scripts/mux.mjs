/* ---------------------------------------------------------------
   Troca a trilha de um vídeo já renderizado, sem refazer os quadros.
   uso: node scripts/mux.mjs [vídeo.mp4] [trilha.wav]
----------------------------------------------------------------*/
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const video = path.join(raiz, 'out', process.argv[2] || 'atelie-digital-como-funciona.mp4');
const trilha = path.join(raiz, 'out', process.argv[3] || 'trilha.wav');
const tmp = video.replace(/\.mp4$/, '.tmp.mp4');

for (const f of [video, trilha]) if (!fs.existsSync(f)) { console.error('falta:', f); process.exit(1); }

const r = spawnSync(ffmpeg, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-i', video, '-i', trilha,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
  '-movflags', '+faststart', '-shortest', tmp
], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);

fs.renameSync(tmp, video);
console.log(`trilha trocada em ${path.basename(video)} (${(fs.statSync(video).size / 1048576).toFixed(1)} MB)`);
