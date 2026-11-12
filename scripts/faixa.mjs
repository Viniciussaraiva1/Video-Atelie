/* ---------------------------------------------------------------
   Monta a trilha dos dois filmes a partir de uma música pronta
   (audio/vitrine-jazz-house.mp3, 1 min 46 s, 120 bpm, compasso
   de 2 s), sem mexer no andamento nem no tom.

   - filme principal (111 s): pula a entrada de 3 s e repete os
     quatro compassos de 40,5 a 48,5 s. Os cortes caem em cima da
     batida, então a emenda não se ouve, e o fim da música coincide
     com o fim do filme;
   - corte vertical (43,5 s): começa aos 32,5 s, onde a música abre,
     para o gancho já ter batida, e sai em 2,5 s no fim.

   As duas saem em -19 LUFS: 3 dB abaixo do teto de rede social, para a
   música acompanhar o filme sem empurrar o texto.
   uso: node scripts/faixa.mjs
        node scripts/mux.mjs atelie-digital-como-funciona.mp4 trilha-jazz.wav
        node scripts/mux.mjs atelie-digital-vertical.mp4 trilha-jazz-vertical.wav
----------------------------------------------------------------*/
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import path from 'path';
import { fileURLToPath } from 'url';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MUSICA = path.join(raiz, 'audio', 'vitrine-jazz-house.mp3');
const ALVO = -19;

/* batidas medidas na própria faixa: a primeira em 0,486 s, uma a cada 0,5002 s */
const batida = k => 0.486 + k * (60 / 119.95);

const roda = args => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
  return r.stderr;
};

function monta(saida, filtro, dur) {
  const arq = path.join(raiz, 'out', saida);
  const medida = roda(['-i', MUSICA, '-filter_complex', filtro + ',ebur128', '-f', 'null', '-']);
  const I = Number(medida.match(/I:\s+(-?[\d.]+) LUFS/g).pop().match(/-?[\d.]+/)[0]);
  roda(['-y', '-loglevel', 'error', '-i', MUSICA, '-filter_complex',
        `${filtro},volume=${(ALVO - I).toFixed(2)}dB,alimiter=limit=0.89:level=false`,
        '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', arq]);
  console.log(`${saida}: ${dur.toFixed(2)} s, ${I.toFixed(1)} → ${ALVO} LUFS`);
}

/* principal */
const ini = batida(5), dobraDe = batida(80), dobraAte = batida(96), fim = 106.03;
monta('trilha-jazz.wav',
  `[0:a]asplit[a][b];` +
  `[a]atrim=${ini}:${dobraAte},asetpts=PTS-STARTPTS,afade=t=in:d=0.12[p1];` +
  `[b]atrim=${dobraDe},asetpts=PTS-STARTPTS[p2];` +
  `[p1][p2]acrossfade=d=0.02:c1=tri:c2=tri,afade=t=out:st=110.6:d=0.4`,
  (dobraAte - ini) + (fim - dobraDe));

/* vertical */
const vIni = batida(64), vDur = 43.5;
monta('trilha-jazz-vertical.wav',
  `[0:a]atrim=${vIni}:${vIni + vDur},asetpts=PTS-STARTPTS,` +
  `afade=t=in:d=0.05,afade=t=out:st=${vDur - 2.5}:d=2.5`, vDur);
