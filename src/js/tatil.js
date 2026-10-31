/* ---------------------------------------------------------------
   Matéria tátil: letras e formas que parecem massinha, pasta de
   bisnaga, papel-alumínio amassado ou plástico transparente.

   Nada de foto nem de 3D: a forma é desenhada num canvas, vira um
   mapa de altura e cada pixel é iluminado em JavaScript, com a luz
   vindo de cima e da esquerda, como numa mesa perto da janela.
   Tudo é calculado uma vez, quando a página abre; no filme as peças
   só se movem, então o render quadro a quadro continua barato.
----------------------------------------------------------------*/
const Tatil = (() => {

  /* ---------------- ruído determinístico ---------------- */
  const hash = (x, y, s) => {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  function ruido(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, s, oit = 4) {
    let t = 0, amp = .5, f = 1, norma = 0;
    for (let o = 0; o < oit; o++) { t += amp * ruido(x * f, y * f, s + o * 17); norma += amp; amp *= .5; f *= 2.03; }
    return t / norma;
  }
  /* ruído calculado numa grade grossa e interpolado: o mesmo desenho, 16 vezes mais rápido */
  function campo(w, h, passo, fn) {
    const gw = Math.ceil(w / passo) + 2, gh = Math.ceil(h / passo) + 2;
    const g = new Float32Array(gw * gh);
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) g[j * gw + i] = fn(i * passo, j * passo);
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const gy = y / passo, j = Math.floor(gy), fy = gy - j;
      for (let x = 0; x < w; x++) {
        const gx = x / passo, i = Math.floor(gx), fx = gx - i, k = j * gw + i;
        const a = g[k], b = g[k + 1], c = g[k + gw], d = g[k + gw + 1];
        out[y * w + x] = (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
      }
    }
    return out;
  }

  /* ---------------- borrão: três caixas seguidas ≈ gaussiana ---------------- */
  function caixa(src, w, h, r) {
    const tmp = new Float32Array(w * h), dst = new Float32Array(w * h), n = 2 * r + 1;
    for (let y = 0; y < h; y++) {
      const o = y * w; let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[o + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        tmp[o + x] = acc / n;
        acc += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        dst[y * w + x] = acc / n;
        acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
      }
    }
    return dst;
  }
  function borra(src, w, h, sigma) {
    const r = Math.max(1, Math.round(sigma * .9));
    return caixa(caixa(caixa(src, w, h, r), w, h, r), w, h, r);
  }

  /* ---------------- máscara: o desenho em alfa ---------------- */
  function mascara(w, h, desenha) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = '#000'; g.strokeStyle = '#000';
    desenha(g, w, h);
    const d = g.getImageData(0, 0, w, h).data, m = new Float32Array(w * h);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] / 255;
    return m;
  }
  /* empurra a máscara por um campo de ruído: a borda fica mole, de coisa feita à mão */
  function deforma(m, w, h, amp, freq, semente) {
    if (!amp) return m;
    const dx = campo(w, h, 6, (x, y) => (fbm(x * freq, y * freq, semente, 3) - .5) * 2 * amp);
    const dy = campo(w, h, 6, (x, y) => (fbm(x * freq + 31.7, y * freq + 11.3, semente + 5, 3) - .5) * 2 * amp);
    const o = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, sx = x + dx[i], sy = y + dy[i];
      const x0 = Math.floor(sx), y0 = Math.floor(sy), fx = sx - x0, fy = sy - y0;
      if (x0 < 0 || y0 < 0 || x0 >= w - 1 || y0 >= h - 1) continue;
      const k = y0 * w + x0;
      o[i] = (m[k] * (1 - fx) + m[k + 1] * fx) * (1 - fy) + (m[k + w] * (1 - fx) + m[k + w + 1] * fx) * fy;
    }
    return o;
  }

  /* ---------------- cor ---------------- */
  const rgb = h => {
    if (h.startsWith('rgb')) return h.replace(/[^\d,.]/g, '').split(',').slice(0, 3).map(Number);
    h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
  };
  const cl = v => (v < 0 ? 0 : v > 255 ? 255 : v);

  /* ---------------- os quatro materiais ----------------
     raio: quanto da borda arredonda, em fração do tamanho
     mole: amplitude da deformação da borda; ruga: textura da superfície */
  const MAT = {
    argila: { raio: .10, mole: .030, freq: .9, ruga: .05, amb: .40, luz: .82, brilho: .16, dureza: 14, sombra: .36 },
    pasta:  { raio: .085, mole: .060, freq: 2.0, ruga: .16, amb: .44, luz: .74, brilho: .34, dureza: 30, sombra: .34, fio: true },
    folha:  { raio: .05, mole: .022, freq: 2.2, ruga: 0, amb: .30, luz: .70, brilho: 1.25, dureza: 60, sombra: .30, amassa: true },
    vidro:  { raio: .20, mole: .02, freq: .7, ruga: 0, amb: 0, luz: 0, brilho: 1.4, dureza: 110, sombra: .07, vidro: true }
  };
  const L = (() => { const v = [-.52, -.62, .78], n = Math.hypot(...v); return v.map(c => c / n); })();
  const H = (() => { const v = [L[0], L[1], L[2] + 1], n = Math.hypot(...v); return v.map(c => c / n); })();

  /* Ilumina uma máscara já desenhada. tam é o "tamanho de letra" de
     referência: tudo (borda, sombra, ruga) é medido em fração dele. */
  function ilumina(m, w, h, o) {
    const M = MAT[o.material || 'argila'];
    const tam = o.tam, sem = o.semente || 7;
    const base = rgb(o.cor || '#c8553d');

    m = deforma(m, w, h, M.mole * tam * (o.mole == null ? 1 : o.mole), M.freq / tam * 6, sem);

    /* altura: por dentro sobe em cúpula, a partir da borda */
    const r = Math.max(2, M.raio * tam * (o.raio || 1));
    const b1 = borra(m, w, h, r), b2 = borra(m, w, h, r * .45);
    const alt = new Float32Array(w * h), ed = new Float32Array(w * h);
    for (let i = 0; i < alt.length; i++) {
      if (m[i] < .01) continue;
      const e = Math.min(1, Math.max(0, (.62 * b1[i] + .38 * b2[i] - .45) * 2.1));
      ed[i] = e;
      alt[i] = m[i] * Math.sqrt(1 - (1 - e) * (1 - e));
    }
    /* textura de superfície: dedo na massinha, fio de bisnaga, alumínio amassado */
    if (M.ruga) {
      const f = 1 / tam * 9;
      const rg = campo(w, h, 3, (x, y) => fbm(x * f, y * f, sem + 3, 3) - .5);
      for (let i = 0; i < alt.length; i++) alt[i] += rg[i] * M.ruga * m[i];
    }
    if (M.fio) {
      const ang = o.fio == null ? .9 : o.fio, ca = Math.cos(ang), sa = Math.sin(ang), f = 2 * Math.PI / (tam * .055);
      const tor = campo(w, h, 4, (x, y) => fbm(x / tam * 3, y / tam * 3, sem + 9, 2) * 5);
      for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
        if (m[i] < .01) continue;
        alt[i] += .014 * Math.sin((x * ca + y * sa) * f + tor[i]) * Math.min(1, alt[i] * 3);
      }
    }
    if (M.amassa) {
      const f = 1 / tam * 7;
      const ru = campo(w, h, 2, (x, y) => {
        let t = 0, amp = .5, ff = 1;
        for (let k = 0; k < 4; k++) { t += amp * (1 - Math.abs(2 * ruido(x * f * ff, y * f * ff, sem + k * 13) - 1)); amp *= .5; ff *= 2.1; }
        return t;
      });
      for (let i = 0; i < alt.length; i++) alt[i] = alt[i] * .55 + ru[i] * .45 * Math.min(1, alt[i] * 2.5) * m[i];
    }

    /* sombra no papel: uma longa e mole, outra curta e escura, de contato */
    const sh1 = borra(m, w, h, tam * .055), sh2 = borra(m, w, h, tam * .014);
    const ox1 = Math.round(tam * .045), oy1 = Math.round(tam * .075), ox2 = Math.round(tam * .012), oy2 = Math.round(tam * .02);

    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    const A = tam * (M.vidro ? 1.1 : .55);                   /* altura do relevo em pixels */
    const sCor = o.sombraCor ? rgb(o.sombraCor) : [52, 38, 30];

    for (let y = 1, i = w + 1; y < h - 1; y++, i += 2) for (let x = 1; x < w - 1; x++, i++) {
      const p = i * 4;
      /* sombra */
      const j1 = (y - oy1) * w + (x - ox1), j2 = (y - oy2) * w + (x - ox2);
      const s = (j1 > 0 ? sh1[j1] * .55 : 0) + (j2 > 0 ? sh2[j2] * .45 : 0);
      const sa = Math.min(1, s) * M.sombra * (o.sombra == null ? 1 : o.sombra);
      const a = m[i];
      if (a < .004) {
        if (sa > .004) { d[p] = sCor[0]; d[p + 1] = sCor[1]; d[p + 2] = sCor[2]; d[p + 3] = sa * 255; }
        continue;
      }
      /* normal pela diferença de alturas vizinhas */
      let nx = -(alt[i + 1] - alt[i - 1]) * .5 * A, ny = -(alt[i + w] - alt[i - w]) * .5 * A, nz = 1;
      const nn = Math.hypot(nx, ny, nz); nx /= nn; ny /= nn; nz /= nn;
      const dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      const spec = Math.pow(Math.max(0, nx * H[0] + ny * H[1] + nz * H[2]), M.dureza) * M.brilho;
      let R, G, B, al = a;
      if (M.vidro) {
        /* plástico transparente: quase nada no meio, borda e brilho fortes */
        const fres = Math.pow(1 - nz, 1.4), aro = Math.pow(1 - ed[i], 7);
        const claro = Math.min(1, fres * .55 + spec);
        R = cl((base[0] * .3 + 178) * (1 - aro * .55) + 255 * claro * .7);
        G = cl((base[1] * .3 + 178) * (1 - aro * .55) + 255 * claro * .7);
        B = cl((base[2] * .3 + 178) * (1 - aro * .55) + 255 * claro * .7);
        al = a * Math.min(1, .05 + .32 * fres + .45 * aro + spec * 1.1);
      } else if (M.amassa) {
        /* alumínio: o reflexo de um estúdio em faixas, mais o brilho da janela */
        const ry = 2 * nz * ny, rx = 2 * nz * nx;
        const env = 182 + 62 * Math.sin(ry * 4.6 + rx * 1.7 + 1.1) + 30 * Math.sin(rx * 7.3 - ry * 2.2);
        const v = env * (.62 + .48 * dif) + 255 * spec;
        const tint = o.cor ? .18 : 0;
        R = cl(v * (1 - tint) + base[0] * tint); G = cl(v * (1 - tint) + base[1] * tint); B = cl(v * (1 - tint) + base[2] * tint);
      } else {
        const k = M.amb + M.luz * dif;
        R = cl(base[0] * k + 255 * spec); G = cl(base[1] * k + 255 * spec); B = cl(base[2] * k + 255 * spec);
      }
      /* a sombra continua aparecendo sob a borda semitransparente */
      const fa = al + sa * (1 - al);
      d[p] = (R * al + sCor[0] * sa * (1 - al)) / fa;
      d[p + 1] = (G * al + sCor[1] * sa * (1 - al)) / fa;
      d[p + 2] = (B * al + sCor[2] * sa * (1 - al)) / fa;
      d[p + 3] = fa * 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  /* ---------------- texto ---------------- */
  const FONTES = {
    massa: "'Bagel Fat One','Playfair',serif",
    cartaz: "'Anton','Inter',sans-serif",
    serifa: "'Playfair',serif"
  };
  function fonte(o) { return `${o.estilo || ''} ${o.peso || 400} ${o.tam}px ${FONTES[o.fonte || 'massa'] || o.fonte}`; }

  /* uma palavra inteira num canvas só */
  function texto(txt, o) {
    const pad = Math.round(o.tam * .32);
    const med = document.createElement('canvas').getContext('2d');
    med.font = fonte(o);
    if (o.espaco) med.letterSpacing = o.espaco + 'px';
    const lw = Math.ceil(med.measureText(txt).width);
    const w = lw + pad * 2, h = Math.round(o.tam * 1.25) + pad * 2;
    const m = mascara(w, h, g => {
      g.font = fonte(o); g.textBaseline = 'alphabetic';
      if (o.espaco) g.letterSpacing = o.espaco + 'px';
      g.fillText(txt, pad, pad + o.tam * .98);
    });
    const c = ilumina(m, w, h, o);
    c._pad = pad; c._lw = lw;
    return c;
  }

  /* uma letra por canvas, já com a posição de cada uma na linha (com o kerning da fonte) */
  function letras(txt, o) {
    const med = document.createElement('canvas').getContext('2d');
    med.font = fonte(o);
    if (o.espaco) med.letterSpacing = o.espaco + 'px';
    const out = [];
    [...txt].forEach((ch, i) => {
      const x = med.measureText(txt.slice(0, i)).width;
      if (ch === ' ') return;
      const c = texto(ch, { ...o, semente: (o.semente || 7) + i * 31 });
      out.push({ ch, x, c, w: c.width, h: c.height, pad: c._pad, lw: c._lw });
    });
    out.largura = med.measureText(txt).width;
    return out;
  }

  /* qualquer desenho de forma, com o mesmo acabamento */
  function forma(w, h, desenha, o) {
    return ilumina(mascara(w, h, desenha), w, h, o);
  }

  /* contorno orgânico (bolha de plástico, gota de massinha) como lista de pontos */
  function contorno(cx, cy, r, semente, n = 72, irreg = .28) {
    const pts = [];
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2;
      const q = 1 + irreg * (fbm(Math.cos(a) * 1.3 + 5, Math.sin(a) * 1.3 + 5, semente, 3) - .5) * 2;
      pts.push([cx + Math.cos(a) * r * q, cy + Math.sin(a) * r * q * .82]);
    }
    return pts;
  }
  function tracaContorno(g, pts) {
    g.beginPath();
    pts.forEach((p, k) => {
      const q = pts[(k + 1) % pts.length], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      if (k === 0) g.moveTo(mx, my); else g.quadraticCurveTo(p[0], p[1], mx, my);
    });
    const p = pts[0], q = pts[1];
    g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    g.closePath();
  }

  return { texto, letras, forma, ilumina, mascara, contorno, tracaContorno, fbm, ruido, hash, FONTES, MAT };
})();
