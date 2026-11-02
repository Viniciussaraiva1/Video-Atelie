/* ---------------------------------------------------------------
   "Lampejo" — house psicodélico sintetizado em JavaScript puro,
   sem amostra de banco e sem biblioteca. Composição original no
   clima do house filtrado do rock psicodélico de 2020: bumbo reto,
   tudo respirando junto com ele (sidechain), um filtro que abre e
   fecha a mistura inteira, acordes com phaser, baixo de disco e
   uma "voz" picotada feita de formantes, como se fosse amostra
   de vocal recortada. Melodia, acordes e arranjo são próprios.

   Cada filme tem o seu arranjo, preso aos cortes de cena: 120 bpm,
   compasso de 2 s, e todo corte do filme cai numa batida.
   uso: node scripts/lampejo.mjs              — os dois
        node scripts/lampejo.mjs principal    — out/trilha-lampejo.wav (111 s)
        node scripts/lampejo.mjs vertical     — out/trilha-lampejo-vertical.wav (43,5 s)
   As duas saem em -19 LUFS, como as outras trilhas.
----------------------------------------------------------------*/
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { fileURLToPath } from 'url';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SR = 44100;
const BAT = .5, SEMI = BAT / 4, COMP = 4 * BAT;
const ALVO = -19;
const ABERTO = 19000;

/* ---------------- arranjos ----------------
   corte: frequência do filtro da mistura inteira (Hz) ao longo do tempo;
   as outras curvas vão de 0 (fora) a 1 (inteiro). Pontos [t, valor]. */
const PLANOS = {
  principal: {
    dur: 111, arq: 'trilha-lampejo.wav',
    /* 0–5 s, abertura: tudo abafado, como se tocasse na sala ao lado.
       5 s (cena 01): o filtro abre de vez. 53,5–64,5 (prévia): meia-luz,
       sem palma. 64,5 (cor com estudo): volta inteiro. 103,5 (fecho):
       último refrão, e o filtro fecha nos 5 s finais. */
    corte:   [[0, 380], [3.6, 700], [4.75, 2600], [5, ABERTO], [53.3, ABERTO], [53.6, 2400], [62, 3200],
              [64.3, 6500], [64.5, ABERTO], [106, ABERTO], [110.6, 420]],
    bumbo:   [[0, 1], [110, 1], [110.2, 0]],
    palma:   [[0, 0], [4.9, 0], [5, 1], [53.4, 1], [53.5, 0], [64.4, 0], [64.5, 1], [110, 1], [110.2, 0]],
    chimbal: [[0, .35], [4.9, .35], [5, 1], [110, 1], [110.2, 0]],
    baixo:   [[0, 1], [109.9, 1], [110.2, 0]],
    acorde:  [[0, 1]],
    voz:     [[0, 1], [12, 1], [12.1, .8], [20.4, .8], [20.5, 1]],
    brilho:  [[0, 0], [20.4, 0], [20.5, .8], [37, .8], [37.1, 1], [53.4, 1], [53.5, .55], [64.4, .55],
              [64.5, 1], [110, 1]],
    subida:  [5, 64.5, 95.5],          /* onde termina cada subida de ruído */
    fim: 110.6
  },
  vertical: {
    dur: 43.5, arq: 'trilha-lampejo-vertical.wav',
    /* Reels não espera: a batida já está no primeiro quadro, e o filtro
       abre em 1,5 s. 27–29 s: fecha antes do preço e volta inteiro no corte.
       37 s (cartaz): último refrão; fecha e some nos 2,5 s finais. */
    corte:   [[0, 900], [1.5, ABERTO], [26.6, ABERTO], [28.8, 1100], [29, ABERTO], [40.8, ABERTO], [43.3, 450]],
    bumbo:   [[0, 1], [42.4, 1], [42.6, 0]],
    palma:   [[0, 0], [1.9, 0], [2, 1], [26.9, 1], [27, 0], [28.9, 0], [29, 1], [42.4, 1], [42.6, 0]],
    chimbal: [[0, .6], [1.9, .6], [2, 1], [42.4, 1], [42.6, 0]],
    baixo:   [[0, 1], [42.4, 1], [42.6, 0]],
    acorde:  [[0, 1]],
    voz:     [[0, 1]],
    brilho:  [[0, 0], [5.9, 0], [6, .8], [29, .8], [29.1, 1]],
    subida:  [29],
    fim: 43.2
  }
};

/* ---------------- harmonia ----------------
   Fá maior com o iv menor emprestado no fim do ciclo (Si♭ maior →
   Si♭ menor): o desvio que dá o gosto psicodélico. Um acorde por
   compasso, ciclo de 8 compassos (16 s). */
const ACORDES = [
  { baixo: 41, notas: [57, 60, 64, 67] },   /* Fmaj9    */
  { baixo: 45, notas: [55, 60, 62, 64] },   /* Am7(11)  */
  { baixo: 38, notas: [57, 60, 64, 65] },   /* Dm9      */
  { baixo: 46, notas: [57, 62, 64, 65] },   /* B♭maj7♯11 */
  { baixo: 41, notas: [57, 60, 64, 67] },   /* Fmaj9    */
  { baixo: 45, notas: [55, 60, 62, 64] },   /* Am7(11)  */
  { baixo: 46, notas: [57, 62, 65, 69] },   /* B♭maj7   */
  { baixo: 46, notas: [58, 61, 65, 67] }    /* B♭m6     */
];
/* voz picotada: [passo de semicolcheia em 2 compassos, nota, vogal, duração em semicolcheias] */
const FRASE_A = [[0, 81, 'a', 2], [3, 79, 'o', 1], [6, 77, 'a', 2], [10, 76, 'e', 1], [12, 77, 'a', 3],
                 [19, 72, 'o', 1], [22, 74, 'a', 2], [24, 76, 'e', 2], [27, 77, 'o', 1], [30, 79, 'a', 2]];
const FRASE_B = [[0, 81, 'a', 2], [3, 79, 'o', 1], [6, 77, 'a', 2], [10, 76, 'e', 1], [12, 74, 'u', 4],
                 [19, 72, 'o', 1], [20, 74, 'a', 1], [22, 77, 'a', 2], [26, 80, 'o', 2], [29, 79, 'e', 3]];
const VOGAIS = {
  a: [[800, 80, 1], [1150, 90, .50], [2900, 120, .12]],
  o: [[450, 70, 1], [800, 80, .35], [2830, 120, .08]],
  e: [[400, 60, 1], [1700, 90, .40], [2600, 120, .15]],
  u: [[325, 50, 1], [700, 60, .22], [2530, 120, .05]]
};

/* ---------------- ferramentas ---------------- */
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rng = s => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x3fffffff - 1; };
/* curva por pontos; com log=true interpola na escala de oitavas (filtro) */
const curva = (pts, log = false) => t => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, v0] = pts[i - 1], [t1, v1] = pts[i];
      const k = (t - t0) / (t1 - t0 || 1e-9);
      return log ? v0 * Math.pow(v1 / v0, k) : v0 + (v1 - v0) * k;
    }
  }
  return pts[pts.length - 1][1];
};
/* serra sem serrilhado (polyBLEP) */
const blep = (f, dt) => {
  if (f < dt) { f /= dt; return f + f - f * f - 1; }
  if (f > 1 - dt) { f = (f - 1) / dt; return f * f + f + f + 1; }
  return 0;
};
/* biquad (receitas do RBJ) */
class Bq {
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  set(tipo, fc, Q) {
    const w = 2 * Math.PI * clamp(fc, 10, SR * .45) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * Q);
    let b0, b1, b2;
    if (tipo === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
    else if (tipo === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
    else { b0 = al; b1 = 0; b2 = -al; }
    const a0 = 1 + al;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = -2 * c / a0; this.a2 = (1 - al) / a0;
    return this;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

function gera(nome) {
  const P = PLANOS[nome];
  const DUR = P.dur, N = Math.ceil(DUR * SR);
  const buf = () => [new Float64Array(N), new Float64Array(N)];
  const bumboB = buf(), percB = buf(), musB = buf(), envio = buf();
  const g = {}; for (const k of ['bumbo', 'palma', 'chimbal', 'baixo', 'acorde', 'voz', 'brilho']) g[k] = curva(P[k]);
  const corte = curva(P.corte, true);
  const nComp = Math.ceil(DUR / COMP);
  const ac = c => ACORDES[c % 8];
  const ultimoAc = Math.floor((P.fim - .01) / COMP);
  const acNo = c => (c >= ultimoAc ? ACORDES[0] : ac(c));   /* o último compasso volta para Fá */
  const soma = (B, i, l, r) => { if (i >= 0 && i < N) { B[0][i] += l; B[1][i] += r; } };

  /* ---- bumbo: peito, com um estalo curto de ataque ---- */
  const batidas = [];
  for (let b = 0; b * BAT < DUR; b++) {
    const t0 = b * BAT, gg = g.bumbo(t0);
    if (gg <= 0) continue;
    batidas.push(t0);
    const ini = Math.round(t0 * SR), len = Math.floor(.42 * SR);
    let ph = 0;
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      ph += 2 * Math.PI * (54 + 116 * Math.exp(-t * 36)) / SR;
      const env = Math.exp(-t * 7.5) * (1 - Math.exp(-t * 900));
      const s = Math.tanh(Math.sin(ph) * env * 1.6) * .78 + .10 * Math.exp(-t * 400) * Math.sin(ph * 7);
      soma(bumboB, ini + k, s * gg, s * gg);
    }
  }

  /* ---- palma no 2 e no 4, chimbal aberto no contratempo, chocalho em semicolcheia ---- */
  const r = rng(777);
  for (let b = 0; b * BAT < DUR; b++) {
    const t0 = b * BAT;
    const pg = g.palma(t0), hg = g.chimbal(t0);
    if (b % 2 === 1 && pg > 0) {
      const bp = new Bq().set('bp', 1350, 1.1), ini = Math.round(t0 * SR), len = Math.floor(.28 * SR);
      for (let k = 0; k < len; k++) {
        const t = k / SR;
        /* três batidas de mão quase juntas, depois a sala */
        const env = (t < .022 ? Math.exp(-((t % .0075) / .0018)) : 0) + .55 * Math.exp(-(t - .022) * 15) * (t >= .022);
        const s = bp.run(r()) * env * 1.35 * pg;
        soma(percB, ini + k, s * .95, s * 1.05);
        soma(envio, ini + k, s * .35, s * .35);
      }
    }
    if (hg > 0) {
      const hp = new Bq().set('hp', 7800, .7), ini = Math.round((t0 + BAT / 2) * SR), len = Math.floor(.16 * SR);
      for (let k = 0; k < len; k++) {
        const s = hp.run(r()) * Math.exp(-(k / SR) * 24) * .24 * hg;
        soma(percB, ini + k, s * .8, s * 1.2);
      }
      for (let q = 0; q < 4; q++) {
        if (q === 2) continue;
        const hq = new Bq().set('hp', 9500, .7), iq = Math.round((t0 + q * SEMI) * SR), lq = Math.floor(.05 * SR);
        const ac2 = q === 0 ? .55 : .9;
        for (let k = 0; k < lq; k++) {
          const s = hq.run(r()) * Math.exp(-(k / SR) * 75) * .10 * hg * ac2;
          soma(percB, iq + k, s * 1.25, s * .75);
        }
      }
    }
  }

  /* ---- baixo de disco: oitava que pula, serra redonda num passa-baixa ---- */
  for (let c = 0; c < nComp; c++) {
    const a = acNo(c);
    for (let q = 0; q < 8; q++) {
      const t0 = c * COMP + q * (BAT / 2);
      const gg = g.baixo(t0);
      if (gg <= 0 || t0 >= DUR) continue;
      /* fundamental nos tempos, oitava acima nos contratempos, e uma quinta de passagem no fim */
      const nota = a.baixo + (q % 2 ? 12 : 0) + (q === 7 ? -5 : 0);
      const f = mtof(nota), dt = f / SR, ini = Math.round(t0 * SR), len = Math.floor(.23 * SR);
      const lp = new Bq().set('lp', 620 + (q % 2) * 240, 1.4);
      let ph = 0;
      for (let k = 0; k < len; k++) {
        const t = k / SR;
        ph += dt; if (ph >= 1) ph -= 1;
        const saw = 2 * ph - 1 - blep(ph, dt);
        const env = (1 - Math.exp(-t * 600)) * (t < .19 ? 1 - t * 1.6 : (1 - .19 * 1.6) * (1 - (t - .19) / .04));
        const s = (lp.run(saw) * .9 + Math.sin(2 * Math.PI * f * t) * .55) * env * .36 * gg;
        soma(musB, ini + k, s, s);
      }
    }
  }

  /* ---- acordes: três serras levemente desafinadas por nota, a mistura bombeada pelo bumbo ---- */
  const padL = new Float64Array(N), padR = new Float64Array(N);
  for (let c = 0; c < nComp; c++) {
    const a = acNo(c), t0 = c * COMP, gg = g.acorde(t0);
    if (gg <= 0) continue;
    const ini = Math.round(t0 * SR), len = Math.min(N - ini, Math.floor((COMP + .35) * SR));
    a.notas.forEach((n, j) => {
      [-.11, 0, .12].forEach((det, v) => {
        const f = mtof(n + det), dt = f / SR;
        let ph = (j * .31 + v * .17) % 1;
        const pan = v === 0 ? -.75 : v === 2 ? .75 : (j - 1.5) * .15;
        for (let k = 0; k < len; k++) {
          const t = k / SR;
          ph += dt; if (ph >= 1) ph -= 1;
          const env = Math.min(1, t / .012) * (t > COMP ? Math.max(0, 1 - (t - COMP) / .35) : 1);
          const s = (2 * ph - 1 - blep(ph, dt)) * env * .045 * gg;
          padL[ini + k] += s * (1 - pan) * .5 * 2;
          padR[ini + k] += s * (1 + pan) * .5 * 2;
        }
      });
    });
  }
  /* tom dos acordes: passa-baixa que respira devagar, depois o phaser */
  (() => {
    const fl = new Bq(), fr = new Bq();
    const apL = new Float64Array(6), apR = new Float64Array(6);
    let fbL = 0, fbR = 0;
    for (let i = 0; i < N; i++) {
      const t = i / SR;
      if (i % 32 === 0) {
        const fc = 1500 + 1100 * Math.sin(2 * Math.PI * t / 16 - Math.PI / 2) * -1;
        fl.set('lp', fc, .9); fr.set('lp', fc * 1.04, .9);
      }
      const xl = fl.run(padL[i]), xr = fr.run(padR[i]);
      /* phaser: seis passa-tudo de primeira ordem, varrendo de 250 a 1700 Hz em 7 s */
      const lfo = .5 + .5 * Math.sin(2 * Math.PI * t / 7);
      const fp = 250 * Math.pow(1700 / 250, lfo);
      const tn = Math.tan(Math.PI * fp / SR), co = (tn - 1) / (tn + 1);
      const lfoR = .5 + .5 * Math.sin(2 * Math.PI * t / 7 + 1.4);
      const tnR = Math.tan(Math.PI * 250 * Math.pow(1700 / 250, lfoR) / SR), coR = (tnR - 1) / (tnR + 1);
      let yl = xl + fbL * .45, yr = xr + fbR * .45;
      for (let s = 0; s < 6; s++) {
        const ol = co * yl + apL[s]; apL[s] = yl - co * ol; yl = ol;
        const or = coR * yr + apR[s]; apR[s] = yr - coR * or; yr = or;
      }
      fbL = yl; fbR = yr;
      const ll = (xl + yl) * .5, rr = (xr + yr) * .5;
      musB[0][i] += ll; musB[1][i] += rr;
      envio[0][i] += ll * .28; envio[1][i] += rr * .28;
    }
  })();

  /* ---- voz picotada: fonte de pulsos com formantes de vogal, cortada seco como amostra ---- */
  const vozL = new Float64Array(N), vozR = new Float64Array(N);
  for (let f2 = 0; f2 * 2 * COMP < DUR; f2++) {
    const frase = f2 % 4 === 3 ? FRASE_B : FRASE_A;
    for (const [passo, nota, vg, dur] of frase) {
      const t0 = f2 * 2 * COMP + passo * SEMI;
      const gg = g.voz(t0);
      if (gg <= 0 || t0 >= P.fim - .2) continue;
      const fq = mtof(nota - 12), ini = Math.round(t0 * SR), len = Math.floor(dur * SEMI * SR * .92);
      const fm = VOGAIS[vg].map(([F, bw, gn]) => [new Bq().set('bp', F, F / bw), gn]);
      const pan = ((passo * 7) % 5 - 2) * .14;
      let ph = 0;
      for (let k = 0; k < len; k++) {
        const t = k / SR;
        /* a nota chega um quarto de tom abaixo e sobe, com vibrato curto: jeito de voz */
        const ff = fq * Math.pow(2, (-.25 * Math.exp(-t * 45) + .012 * Math.sin(2 * Math.PI * 5.6 * t)) / 12);
        const dt = ff / SR;
        ph += dt; if (ph >= 1) ph -= 1;
        const src = (2 * ph - 1 - blep(ph, dt)) + r() * .08;
        let s = 0;
        for (const [bq, gn] of fm) s += bq.run(src) * gn;
        /* corte seco nas duas pontas, como tesoura em amostra */
        const env = Math.min(1, k / 110) * Math.min(1, (len - k) / 180);
        s *= env * .74 * gg;
        vozL[ini + k] += s * (1 - pan); vozR[ini + k] += s * (1 + pan);
      }
    }
  }
  /* eco ping-pong em colcheia pontuada, que é o que espalha a voz pela sala */
  (() => {
    const d = Math.round(.375 * SR), lL = new Float64Array(d), lR = new Float64Array(d);
    let idx = 0, zl = 0, zr = 0;
    for (let i = 0; i < N; i++) {
      const el = lL[idx], er = lR[idx];
      zl += .35 * (el - zl); zr += .35 * (er - zr);
      lL[idx] = vozR[i] * .5 + zr * .42;
      lR[idx] = vozL[i] * .5 + zl * .42;
      if (++idx >= d) idx = 0;
      const ol = vozL[i] + zl * .55, or = vozR[i] + zr * .55;
      musB[0][i] += ol; musB[1][i] += or;
      envio[0][i] += ol * .45; envio[1][i] += or * .45;
    }
  })();

  /* ---- brilho: arpejo de sininho em semicolcheia, duas oitavas acima ---- */
  for (let s16 = 0; s16 * SEMI < DUR; s16++) {
    const t0 = s16 * SEMI, gg = g.brilho(t0);
    if (gg <= 0 || t0 >= P.fim - .3) continue;
    const a = acNo(Math.floor(t0 / COMP));
    const ordem = [0, 2, 1, 3, 2, 0, 3, 1];
    const n = a.notas[ordem[s16 % 8]] + 12 + (s16 % 16 >= 8 ? 12 : 0);
    const f = mtof(n), ini = Math.round(t0 * SR), len = Math.floor(.5 * SR);
    const pan = s16 % 2 ? .55 : -.55, ac2 = s16 % 4 === 0 ? 1 : .62;
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      const mod = Math.sin(2 * Math.PI * f * 3.5 * t) * 1.6 * Math.exp(-t * 18);
      const s = Math.sin(2 * Math.PI * f * t + mod) * Math.exp(-t * 9) * Math.min(1, k / 40) * .064 * gg * ac2;
      soma(musB, ini + k, s * (1 - pan), s * (1 + pan));
      soma(envio, ini + k, s * .6, s * .6);
    }
  }

  /* ---- subidas: ruído que abre e sobe nos 4 tempos antes de cada virada ---- */
  for (const fimS of P.subida) {
    const t0 = Math.max(0, fimS - 2 * COMP), ini = Math.round(t0 * SR), len = Math.round((fimS - t0) * SR);
    const bp = new Bq();
    for (let k = 0; k < len; k++) {
      const u = k / len;
      if (k % 32 === 0) bp.set('bp', 400 * Math.pow(22, u), 1.6);
      const s = bp.run(r()) * u * u * .22;
      soma(percB, ini + k, s * (1 - u * .6), s * (1 + u * .6));
      soma(envio, ini + k, s * .5, s * .5);
    }
  }

  /* ---- sala: reverberação de Schroeder no envio ---- */
  function sala(x, off) {
    const combs = [1557, 1617, 1491, 1422, 1277, 1116, 1356, 1188].map(d => d + off);
    const out = new Float64Array(N);
    for (const d of combs) {
      const lin = new Float64Array(d); let idx = 0, filt = 0;
      for (let i = 0; i < N; i++) {
        const y = lin[idx]; out[i] += y;
        filt = y * .4 + filt * .6;
        lin[idx] = x[i] + filt * .82;
        if (++idx >= d) idx = 0;
      }
    }
    for (let i = 0; i < N; i++) out[i] /= combs.length;
    for (const d of [225 + off, 556 + off, 441 + off]) {
      const lin = new Float64Array(d); let idx = 0;
      for (let i = 0; i < N; i++) { const y = lin[idx], v = out[i]; lin[idx] = v + y * .5; out[i] = y - v * .5; if (++idx >= d) idx = 0; }
    }
    return out;
  }
  const hpE = [new Bq().set('hp', 280, .7), new Bq().set('hp', 280, .7)];
  for (let c = 0; c < 2; c++) for (let i = 0; i < N; i++) envio[c][i] = hpE[c].run(envio[c][i]);
  const rvL = sala(envio[0], 0), rvR = sala(envio[1], 23);

  /* ---- mistura: tudo que não é bumbo respira com ele, e o filtro passa por cima de tudo ---- */
  let kb = 0;
  const pump = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    while (kb + 1 < batidas.length && batidas[kb + 1] <= t) kb++;
    const dtk = batidas.length && batidas[kb] <= t ? t - batidas[kb] : 9;
    const u = clamp(dtk / .30, 0, 1);
    pump[i] = 1 - .62 * g.bumbo(t) * (1 - u * u * (3 - 2 * u));
  }
  const mL = new Float64Array(N), mR = new Float64Array(N);
  const fL = [new Bq(), new Bq()], fR = [new Bq(), new Bq()];
  const hpL = new Bq().set('hp', 36, .7), hpR = new Bq().set('hp', 36, .7);
  let pico = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    if (i % 32 === 0) {
      const fc = corte(t), Q = fc > 15000 ? .707 : 1.25;
      fL[0].set('lp', fc, Q); fL[1].set('lp', fc, .707); fR[0].set('lp', fc, Q); fR[1].set('lp', fc, .707);
    }
    const p = pump[i];
    let l = bumboB[0][i] + percB[0][i] + (musB[0][i] + rvL[i] * 1.1) * p;
    let rr = bumboB[1][i] + percB[1][i] + (musB[1][i] + rvR[i] * 1.1) * p;
    l = fL[1].run(fL[0].run(l)); rr = fR[1].run(fR[0].run(rr));
    l = hpL.run(l); rr = hpR.run(rr);
    /* fita: saturação macia, que cola a mistura */
    const env = Math.min(1, t / .02) * (t > P.fim ? Math.max(0, 1 - (t - P.fim) / (DUR - P.fim)) : 1);
    mL[i] = Math.tanh(l * 1.3) * env; mR[i] = Math.tanh(rr * 1.3) * env;
    pico = Math.max(pico, Math.abs(mL[i]), Math.abs(mR[i]));
  }

  /* WAV bruto (pico a -1 dBFS); o volume final sai da medição de loudness */
  const bruto = path.join(raiz, 'out', P.arq.replace('.wav', '.bruto.wav'));
  const norm = .89 / pico, bytes = N * 4, w = Buffer.alloc(44 + bytes);
  w.write('RIFF', 0); w.writeUInt32LE(36 + bytes, 4); w.write('WAVE', 8); w.write('fmt ', 12);
  w.writeUInt32LE(16, 16); w.writeUInt16LE(1, 20); w.writeUInt16LE(2, 22); w.writeUInt32LE(SR, 24);
  w.writeUInt32LE(SR * 4, 28); w.writeUInt16LE(4, 32); w.writeUInt16LE(16, 34); w.write('data', 36); w.writeUInt32LE(bytes, 40);
  for (let i = 0; i < N; i++) {
    w.writeInt16LE(Math.round(clamp(mL[i] * norm, -1, 1) * 32767), 44 + i * 4);
    w.writeInt16LE(Math.round(clamp(mR[i] * norm, -1, 1) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(bruto, w);

  const roda = args => {
    const x = spawnSync(ffmpeg, ['-hide_banner', '-nostats', ...args], { encoding: 'utf8' });
    if (x.status !== 0) { console.error(x.stderr); process.exit(1); }
    return x.stderr;
  };
  const I = Number(roda(['-i', bruto, '-af', 'ebur128', '-f', 'null', '-']).match(/I:\s+(-?[\d.]+) LUFS/g).pop().match(/-?[\d.]+/)[0]);
  const saida = path.join(raiz, 'out', P.arq);
  roda(['-y', '-loglevel', 'error', '-i', bruto, '-af', `volume=${(ALVO - I).toFixed(2)}dB,alimiter=limit=0.89:level=false`,
        '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', saida]);
  fs.unlinkSync(bruto);
  console.log(`${P.arq}: ${DUR} s · 120 bpm · ${I.toFixed(1)} → ${ALVO} LUFS`);
}

const pedido = process.argv[2];
for (const nome of Object.keys(PLANOS)) if (!pedido || pedido === nome) gera(nome);
