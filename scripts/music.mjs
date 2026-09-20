/* ---------------------------------------------------------------
   Trilha lo-fi sintetizada em JavaScript puro — sem biblioteca e
   sem amostra de banco. Piano elétrico abafado, baixo redondo, uma
   batida quase só sentida, ondulação de fita e chiado de vinil.
   Feita para ficar embaixo da imagem: nada aqui pede atenção.
   Saída: out/trilha.wav (44,1 kHz, estéreo, 16 bits).
   uso: node scripts/music.mjs [segundos]
----------------------------------------------------------------*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const SR = 44100;
const DUR = Number(process.argv[2] || 145);
const N = Math.ceil(DUR * SR);

const L = new Float64Array(N), R = new Float64Array(N);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
/* rampa suave entre dois instantes */
const ramp = (t, a, b) => { const k = clamp((t - a) / (b - a || 1e-9), 0, 1); return k * k * (3 - 2 * k); };
/* sorteio determinístico: mesma semente, mesmo arquivo, sempre */
const rng = s => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x3fffffff - 1; };

/* ---------------- andamento ----------------
   72 batidas por minuto: passo de quem anda devagar. */
const BPM = 72;
const BAT = 60 / BPM;
const COMPASSO = 4 * BAT;
const BLOCO = 2 * COMPASSO;              /* um acorde a cada dois compassos */
const nBlocos = Math.ceil(DUR / BLOCO);

/* ---------------- harmonia ----------------
   Roda de jazz em dó maior, com sétimas e nonas: o menor só passa,
   nunca fecha. As vozes ficam todas em volta do dó central, onde o
   piano elétrico é redondo, e o baixo nunca desce do mi grave. */
const ACORDES = [
  { nome: 'Cmaj9',  baixo: 48, notas: [64, 67, 71, 74], mel: [79, 76, 74] },
  { nome: 'Am11',   baixo: 45, notas: [64, 67, 72, 74], mel: [76, 74, 72] },
  { nome: 'Dm9',    baixo: 50, notas: [65, 69, 72, 76], mel: [81, 77, 74] },
  { nome: 'G13',    baixo: 43, notas: [65, 69, 71, 76], mel: [79, 76, 74] },
  { nome: 'Fmaj9',  baixo: 41, notas: [64, 67, 72, 76], mel: [81, 79, 76] },
  { nome: 'Em7',    baixo: 40, notas: [62, 67, 71, 74], mel: [79, 74, 71] },
  { nome: 'Dm7',    baixo: 50, notas: [65, 69, 72, 77], mel: [77, 74, 72] },
  { nome: 'G9sus',  baixo: 43, notas: [65, 67, 72, 74], mel: [79, 77, 74] }
];
const ORDEM = [0, 1, 2, 3, 4, 1, 2, 3, 0, 5, 6, 7, 4, 3, 1, 0];

/* ---------------- vozes ---------------- */

/* piano elétrico: fundamental gorda, um harmônico de sino que morre
   rápido e o trêmulo lento que todo Rhodes tem */
function rhodes(t0, freq, g, pan, dur = 4.2) {
  const ini = Math.floor(t0 * SR);
  if (ini >= N || g <= 0) return;
  const fim = Math.min(N, ini + Math.floor(dur * SR));
  const parc  = [1, 2, 3, 4.02, 6.01, 9.4];
  const pesos = [1, .30, .12, .055, .022, .009];
  const dec   = [.52, .95, 1.5, 2.2, 3.4, 6.2];
  const det = 1 + pan * .0009;                  /* os lados quase afinados entre si */
  for (let i = ini; i < fim; i++) {
    const t = (i - ini) / SR;
    const atk = 1 - Math.exp(-t * 240);
    let s = 0;
    for (let p = 0; p < parc.length; p++)
      s += pesos[p] * Math.exp(-t * dec[p]) * Math.sin(2 * Math.PI * freq * parc[p] * det * t);
    const trem = 1 + .10 * Math.sin(2 * Math.PI * 4.6 * t + pan * 2);
    const a = s * atk * trem * g * .50;
    L[i] += a * (1 - pan * .40);
    R[i] += a * (1 + pan * .40);
  }
}

/* baixo: senoide redonda com dois harmônicos tímidos, sem ataque duro */
function baixo(t0, freq, g, dur = 3.0) {
  const ini = Math.floor(t0 * SR);
  if (ini >= N || g <= 0) return;
  const fim = Math.min(N, ini + Math.floor(dur * SR));
  for (let i = ini; i < fim; i++) {
    const t = (i - ini) / SR;
    const env = (1 - Math.exp(-t * 70)) * Math.exp(-t * 1.00);
    const s = Math.sin(2 * Math.PI * freq * t)
            + .17 * Math.sin(4 * Math.PI * freq * t)
            + .05 * Math.sin(6 * Math.PI * freq * t);
    const a = s * env * g;
    L[i] += a; R[i] += a;
  }
}

/* bumbo: altura despencando, mais peito que estalo */
function bumbo(t0, g) {
  const ini = Math.floor(t0 * SR);
  if (ini >= N || g <= 0) return;
  const fim = Math.min(N, ini + Math.floor(.52 * SR));
  let ph = 0;
  for (let i = ini; i < fim; i++) {
    const t = (i - ini) / SR;
    ph += 2 * Math.PI * (46 + 64 * Math.exp(-t * 32)) / SR;
    const env = Math.exp(-t * 9.0) * (1 - Math.exp(-t * 700));
    const a = Math.sin(ph) * env * g;
    L[i] += a; R[i] += a;
  }
}

/* escova e aro: ruído curto e abafado, o chiado de uma vassourinha */
function escova(t0, g, pan, dur, corte, semente) {
  const ini = Math.floor(t0 * SR);
  if (ini >= N || g <= 0) return;
  const fim = Math.min(N, ini + Math.floor(dur * SR));
  const r = rng(semente);
  let z = 0;
  for (let i = ini; i < fim; i++) {
    const t = (i - ini) / SR;
    z += corte * (r() - z);                     /* passa-baixa: tira o bico do ruído */
    const a = z * Math.exp(-t / (dur * .30)) * g;
    L[i] += a * (1 - pan * .55);
    R[i] += a * (1 + pan * .55);
  }
}

/* ---------------- arranjo ---------------- */

for (let b = 0; b < nBlocos; b++) {
  const ac = ACORDES[b === nBlocos - 1 ? 0 : ORDEM[b % ORDEM.length]];
  const t0 = b * BLOCO;

  /* o filme abre quase no silêncio e a trilha vai entrando */
  const corpo = ramp(t0, 0, 12) * (1 - ramp(t0, DUR - 9, DUR - 2));

  for (let c = 0; c < 2; c++) {
    const tc = t0 + c * COMPASSO;
    if (tc > DUR - .4) break;
    const peso = c === 0 ? 1 : .74;             /* o segundo compasso responde mais baixo */

    /* o acorde é rolado, não batido: cada voz entra uns milésimos depois */
    ac.notas.forEach((n, j) => {
      const pan = (j - 1.5) / 2.2;
      rhodes(tc + j * .034, mtof(n), .098 * corpo * peso * (j === 3 ? .82 : 1), pan);
    });
    baixo(tc, mtof(ac.baixo), .058 * corpo * peso);
  }

  /* uma nota solta por bloco, só para o ouvido ter onde pousar */
  if (b % 2 === 1) {
    const tm = t0 + COMPASSO + 2 * BAT;
    const abre = ramp(t0, 16, 34) * (1 - ramp(t0, DUR - 16, DUR - 6));
    rhodes(tm, mtof(ac.mel[b % ac.mel.length]), .050 * corpo * abre, .30, 3.2);
  }

  /* batida: entra tarde, sai cedo e fica sempre embaixo de tudo */
  const bat = ramp(t0, 18, 30) * (1 - ramp(t0, DUR - 20, DUR - 10)) * corpo;
  if (bat > .001) {
    for (let c = 0; c < 2; c++) {
      const tc = t0 + c * COMPASSO;
      bumbo(tc, .034 * bat);
      bumbo(tc + 2.5 * BAT, .024 * bat);
      escova(tc + 2 * BAT, .020 * bat, -.2, .30, .22, 4242 + b * 7 + c);   /* aro no 3 */
      for (let h = 0; h < 4; h++)                                          /* contratempos */
        escova(tc + (h + .5) * BAT, .0085 * bat * (h % 2 ? .7 : 1), .35, .13, .40, 911 + b * 13 + c * 5 + h);
    }
  }
}

/* ---------------- fita: a ondulação que faz soar gravado ---------------- */
function fita(buf, fase) {
  const out = new Float64Array(N);
  const base = 6.0;                              /* atraso de repouso, em milésimos */
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const wow   = 2.30 * Math.sin(2 * Math.PI * .63 * t + fase);
    const lento = 1.55 * Math.sin(2 * Math.PI * .17 * t + fase * 1.7 + .7);
    const flu   = 0.26 * Math.sin(2 * Math.PI * 6.10 * t + fase * 2.3 + 1.3);
    const j = i - (base + wow + lento + flu) * SR / 1000;
    if (j < 1) { out[i] = buf[i]; continue; }
    const j0 = Math.floor(j), fr = j - j0;
    out[i] = buf[j0] * (1 - fr) + buf[j0 + 1] * fr;
  }
  return out;
}

/* ---------------- sala ---------------- */
function reverb(buf, offset) {
  const combs = [1557, 1617, 1491, 1422, 1277, 1116].map(d => d + offset);
  const fb = [.70, .695, .69, .685, .68, .675];
  const out = new Float64Array(N);
  for (let c = 0; c < combs.length; c++) {
    const d = combs[c], lin = new Float64Array(d);
    let idx = 0, filt = 0;
    for (let i = 0; i < N; i++) {
      const y = lin[idx];
      out[i] += y;
      filt = y * .34 + filt * .66;              /* abafa a cauda, para não sibilar */
      lin[idx] = buf[i] + filt * fb[c];
      if (++idx >= d) idx = 0;
    }
  }
  for (let i = 0; i < N; i++) out[i] /= combs.length;
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

/* ---------------- filtros de tom ---------------- */
const passaBaixa = (buf, fc) => {
  const c = 1 - Math.exp(-2 * Math.PI * fc / SR);
  let z = 0;
  for (let i = 0; i < N; i++) { z += c * (buf[i] - z); buf[i] = z; }
};
const passaAlta = (buf, fc) => {
  const c = 1 - Math.exp(-2 * Math.PI * fc / SR);
  let z = 0;
  for (let i = 0; i < N; i++) { z += c * (buf[i] - z); buf[i] -= z; }
};

/* a fita primeiro: a ondulação tem que pegar as notas, não a sala */
let mL = fita(L, 0), mR = fita(R, 1.9);
/* duas passagens de passa-baixa: o agudo fica abafado, como em fita velha */
passaBaixa(mL, 4800); passaBaixa(mL, 6800);
passaBaixa(mR, 4800); passaBaixa(mR, 6800);
passaAlta(mL, 42); passaAlta(mR, 42);

const wetL = reverb(mL, 0), wetR = reverb(mR, 23);
const WET = .17;
for (let i = 0; i < N; i++) {
  mL[i] = mL[i] * (1 - WET * .40) + wetL[i] * WET;
  mR[i] = mR[i] * (1 - WET * .40) + wetR[i] * WET;
}

/* ---------------- vinil: chiado contínuo e estalos esparsos ---------------- */
(() => {
  const rh = rng(24680), rc = rng(13579);
  let z1 = 0, z2 = 0, z3 = 0, z4 = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const env = Math.min(ramp(t, 0, 3.5), 1 - ramp(t, DUR - 4.5, DUR));
    z1 += .085 * (rh() - z1); z2 += .085 * (z1 - z2);
    z3 += .085 * (rh() - z3); z4 += .085 * (z3 - z4);
    mL[i] += z2 * .105 * env;
    mR[i] += z4 * .105 * env;
    /* uns três estalos por segundo, cada um com seu lado e seu tamanho */
    if (rc() > .99985) {
      const amp = .020 * env * (.35 + .65 * Math.abs(rc()));
      const pan = rc() * .6;
      const len = 60 + Math.floor(Math.abs(rc()) * 150);
      for (let k = 0; k < len && i + k < N; k++) {
        const s = amp * Math.exp(-k / (len * .26)) * (k === 0 ? 1 : rc() * .55);
        mL[i + k] += s * (1 - pan);
        mR[i + k] += s * (1 + pan);
      }
    }
  }
})();

/* ---------------- mestre: tira o contínuo, entra, sai e nunca estoura ---------------- */
let pico = 0, xL = 0, yL = 0, xR = 0, yR = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  /* bloqueador de corrente contínua: a realimentação da sala empurra o zero */
  yL = mL[i] - xL + .9950 * yL; xL = mL[i];
  yR = mR[i] - xR + .9950 * yR; xR = mR[i];
  const env = Math.min(ramp(t, 0, 3.0), 1 - ramp(t, DUR - 4.0, DUR - .15));
  mL[i] = Math.tanh(yL * 1.15 * env) * .92;
  mR[i] = Math.tanh(yR * 1.15 * env) * .92;
  pico = Math.max(pico, Math.abs(mL[i]), Math.abs(mR[i]));
}
/* trilha de fundo: pico bem abaixo do teto, para não disputar com a imagem */
const ALVO = .46;
const norm = pico > 0 ? ALVO / pico : 1;

/* ---------------- arquivo WAV ---------------- */
const bytes = N * 4;
const buf = Buffer.alloc(44 + bytes);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + bytes, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(bytes, 40);
let somaQ = 0;
for (let i = 0; i < N; i++) {
  const l = mL[i] * norm, r = mR[i] * norm;
  somaQ += l * l + r * r;
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(l * 32767))), 44 + i * 4);
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(r * 32767))), 46 + i * 4);
}
const saida = path.join(dir, '..', 'out', 'trilha.wav');
fs.writeFileSync(saida, buf);
const rms = Math.sqrt(somaQ / (N * 2));
console.log(`trilha lo-fi: ${DUR}s · ${BPM} bpm · ${nBlocos} acordes · ` +
  `pico ${(20 * Math.log10(ALVO)).toFixed(1)} dBFS · médio ${(20 * Math.log10(rms)).toFixed(1)} dBFS · ` +
  `${(buf.length / 1048576).toFixed(1)} MB`);
console.log(saida);
