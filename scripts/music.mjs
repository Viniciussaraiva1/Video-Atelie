/* ---------------------------------------------------------------
   Trilha sonora sintetizada em JavaScript puro — sem biblioteca,
   sem amostra de banco. Ambiente, sem percussão: acordes longos,
   melodia de caixinha de música com eco, baixo grave e um fundo
   de ar. Saída: out/trilha.wav (44,1 kHz, estéreo, 16 bits).
----------------------------------------------------------------*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const DUR = Number(process.argv[2] || 120);
const N = Math.ceil(DUR * SR);

const L = new Float64Array(N), R = new Float64Array(N);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, k) => a + (b - a) * k;
/* rampa suave entre dois instantes */
const ramp = (t, a, b) => { const k = clamp((t - a) / (b - a || 1e-9), 0, 1); return k * k * (3 - 2 * k); };

/* ---------------- harmonia ----------------
   Um acorde a cada 8 s, quinze ao todo: nada de mudança brusca. */
const ACORDES = [
  { nome: 'Am9',  notas: [57, 60, 64, 71], baixo: 45, mel: [72, 76, 79, 84, 88] },
  { nome: 'Fmaj7',notas: [53, 57, 60, 64], baixo: 41, mel: [72, 77, 81, 84, 89] },
  { nome: 'Cmaj9',notas: [48, 52, 55, 62], baixo: 48, mel: [74, 76, 79, 83, 86] },
  { nome: 'G6',   notas: [47, 50, 55, 64], baixo: 43, mel: [74, 78, 79, 83, 86] },
  { nome: 'Dm9',  notas: [50, 57, 60, 65], baixo: 38, mel: [72, 77, 79, 84, 88] }
];
const ORDEM = [0, 1, 2, 3, 0, 1, 4, 3, 2, 0, 1, 3, 2, 1, 0];
const BLOCO = 8;                       /* segundos por acorde */
const nBlocos = Math.ceil(DUR / BLOCO);

/* ---------------- vozes ---------------- */

/* almofada: senoides levemente desafinadas entre si, ataque e queda longos */
function almofada(t0, dur, freq, ganho, pan) {
  const ini = Math.floor(t0 * SR), fim = Math.min(N, Math.floor((t0 + dur) * SR));
  const atk = 2.2, rel = 3.4;
  const det = [1, 1.0016, 0.9986, 2.0008];      /* a quarta voz é a oitava acima */
  const pesos = [1, .62, .55, .18];
  for (let i = ini; i < fim; i++) {
    const t = (i - ini) / SR;
    const env = Math.min(ramp(t, 0, atk), 1 - ramp(t, dur - rel, dur));
    if (env <= 0) continue;
    /* respiração lenta, para o acorde nunca ficar parado */
    const resp = 1 + .07 * Math.sin(2 * Math.PI * (.055 * t + pan));
    let s = 0;
    for (let d = 0; d < det.length; d++) s += pesos[d] * Math.sin(2 * Math.PI * freq * det[d] * (t + pan * .01));
    s /= 2.35;
    const a = s * env * ganho * resp;
    L[i] += a * (1 - .35 * pan);
    R[i] += a * (1 + .35 * pan - .35);
  }
}

/* caixinha de música: sino de decaimento rápido, com parciais fora da série */
function sino(t0, freq, ganho, pan) {
  const ini = Math.floor(t0 * SR);
  const dur = 2.6, fim = Math.min(N, ini + Math.floor(dur * SR));
  const parc = [1, 2.01, 3.03, 4.17, 5.43];
  const pesos = [1, .44, .26, .13, .07];
  const decai = [1.0, 1.7, 2.3, 3.1, 4.0];
  for (let i = ini; i < fim; i++) {
    const t = (i - ini) / SR;
    const atk = 1 - Math.exp(-t * 420);
    let s = 0;
    for (let p = 0; p < parc.length; p++) s += pesos[p] * Math.exp(-t * decai[p] * 1.55) * Math.sin(2 * Math.PI * freq * parc[p] * t);
    const a = s * atk * ganho * .72;
    L[i] += a * (1 - pan * .45);
    R[i] += a * (1 + pan * .45);
  }
}

/* baixo: senoide grave com um harmônico tímido */
function baixo(t0, dur, freq, ganho) {
  const ini = Math.floor(t0 * SR), fim = Math.min(N, Math.floor((t0 + dur) * SR));
  for (let i = ini; i < fim; i++) {
    const t = (i - ini) / SR;
    const env = Math.min(ramp(t, 0, 2.4), 1 - ramp(t, dur - 3.0, dur));
    if (env <= 0) continue;
    const s = Math.sin(2 * Math.PI * freq * t) + .16 * Math.sin(4 * Math.PI * freq * t);
    const a = s * env * ganho * (1 + .05 * Math.sin(2 * Math.PI * .08 * t));
    L[i] += a; R[i] += a;
  }
}

/* fundo de ar: ruído filtrado, bem embaixo de tudo */
function ar(ganho) {
  let z1L = 0, z2L = 0, z1R = 0, z2R = 0, seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x3fffffff - 1; };
  const c = .018;   /* corte grave */
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const mod = .55 + .45 * Math.sin(2 * Math.PI * .037 * t) * Math.sin(2 * Math.PI * .011 * t + 1.1);
    z1L += c * (rnd() - z1L); z2L += c * (z1L - z2L);
    z1R += c * (rnd() - z1R); z2R += c * (z1R - z2R);
    const env = Math.min(ramp(t, 0, 6), 1 - ramp(t, DUR - 6, DUR));
    L[i] += z2L * ganho * mod * env * 8;
    R[i] += z2R * ganho * mod * env * 8;
  }
}

/* ---------------- arranjo ---------------- */

/* almofada e baixo: cada bloco entra antes do anterior sair */
for (let b = 0; b < nBlocos; b++) {
  const ac = ACORDES[ORDEM[b % ORDEM.length]];
  const t0 = b * BLOCO - (b === 0 ? 0 : 1.6);
  const dur = BLOCO + (b === 0 ? 2.0 : 3.6);
  /* o filme começa quase só com ar; a almofada cresce até a mesa de montagem */
  const corpo = lerp(.42, 1, ramp(b * BLOCO, 4, 26));
  ac.notas.forEach((n, j) => {
    const pan = (j - 1.5) / 3;
    almofada(t0, dur, mtof(n), .072 * corpo * (j === 3 ? .7 : 1), pan);
  });
  baixo(t0, dur, mtof(ac.baixo), .085 * corpo);
}

/* melodia: só entra quando o filme começa a explicar (cena 02 em diante) */
const RITMOS = [
  [0, 1.5, 3.0, 4.25, 6.0],
  [.5, 2.0, 3.5, 5.0, 6.5],
  [0, 1.0, 2.75, 4.5, 5.75, 7.25]
];
const CONTORNOS = [
  [4, 3, 2, 3, 1],
  [2, 4, 3, 1, 2],
  [0, 2, 3, 4, 3, 1]
];
const MEL_INI = 13.0;   /* entra junto com "o link da bio" */
for (let b = 0; b < nBlocos; b++) {
  const ac = ACORDES[ORDEM[b % ORDEM.length]];
  const rit = RITMOS[b % RITMOS.length], cont = CONTORNOS[b % CONTORNOS.length];
  for (let k = 0; k < rit.length; k++) {
    const t = b * BLOCO + rit[k];
    if (t < MEL_INI - 1 || t > DUR - .6) continue;
    const grau = cont[k % cont.length];
    let nota = ac.mel[grau];
    /* um brilho a mais na parte dos modelos e dos degraus */
    if ((t > 77 && t < 93) || t > 104) if (k % 3 === 1) nota += 12;
    const abre = ramp(t, MEL_INI, MEL_INI + 3.5);
    const fecha = 1 - ramp(t, DUR - 7, DUR - 1.5);
    const g = .30 * abre * fecha * (k % 2 === 0 ? 1 : .78);
    const pan = ((k % 3) - 1) * .5;
    if (g <= 0) continue;
    sino(t, mtof(nota), g, pan);
    /* eco: três repetições cada vez mais fracas, alternando os lados */
    for (let e = 1; e <= 3; e++) {
      const te = t + e * .42;
      if (te > DUR - .3) break;
      sino(te, mtof(nota), g * Math.pow(.44, e), -pan * (e % 2 ? 1 : -1));
    }
  }
}

ar(.030);

/* ---------------- sala (reverberação Schroeder simples) ---------------- */
function reverb(buf, offset) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1116].map(d => d + offset);
  const fb = [.80, .795, .79, .785, .78, .775];
  const out = new Float64Array(N);
  for (let c = 0; c < combs.length; c++) {
    const d = combs[c], lin = new Float64Array(d);
    let idx = 0, filt = 0;
    for (let i = 0; i < N; i++) {
      const y = lin[idx];
      out[i] += y;
      filt = y * .34 + filt * .66;           /* abafa a cauda, para não sibilar */
      lin[idx] = buf[i] + filt * fb[c];
      if (++idx >= d) idx = 0;
    }
  }
  for (let i = 0; i < N; i++) out[i] /= combs.length;
  /* dois passa-tudo para espalhar */
  [225 + offset, 556 + offset].forEach(d => {
    const lin = new Float64Array(d); let idx = 0;
    for (let i = 0; i < N; i++) {
      const y = lin[idx], x = out[i];
      lin[idx] = x + y * .5;
      out[i] = y - x * .5;
      if (++idx >= d) idx = 0;
    }
  });
  return out;
}

const wetL = reverb(L, 0), wetR = reverb(R, 23);
const WET = .30;
for (let i = 0; i < N; i++) {
  L[i] = L[i] * (1 - WET * .45) + wetL[i] * WET;
  R[i] = R[i] * (1 - WET * .45) + wetR[i] * WET;
}

/* ---------------- mestre: tira o contínuo, entra, sai e nunca estoura ---------------- */
let pico = 0, xL = 0, yL = 0, xR = 0, yR = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  /* bloqueador de corrente contínua: a realimentação da sala empurra o zero */
  yL = L[i] - xL + .9950 * yL; xL = L[i];
  yR = R[i] - xR + .9950 * yR; xR = R[i];
  const env = Math.min(ramp(t, 0, 2.6), 1 - ramp(t, DUR - 4.2, DUR - .15));
  L[i] = Math.tanh(yL * 1.25 * env) * .92;
  R[i] = Math.tanh(yR * 1.25 * env) * .92;
  pico = Math.max(pico, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = pico > 0 ? .89 / pico : 1;

/* ---------------- arquivo WAV ---------------- */
const bytes = N * 4;
const buf = Buffer.alloc(44 + bytes);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + bytes, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(bytes, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * norm * 32767))), 44 + i * 4);
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * norm * 32767))), 46 + i * 4);
}
const saida = path.join(dir, '..', 'out', 'trilha.wav');
fs.writeFileSync(saida, buf);
console.log(`trilha: ${DUR}s · ${nBlocos} acordes · pico ${(20 * Math.log10(pico)).toFixed(1)} dBFS · ${(buf.length / 1048576).toFixed(1)} MB`);
console.log(saida);
