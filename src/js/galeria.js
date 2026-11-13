/* ---------------------------------------------------------------
   Galeria em movimento, no jeito dos estudos de galeria feitos no
   Cavalry: cada peça tem um lugar em vários arranjos (espiral, grade,
   anel, linha, pilha) e passa de um para o outro misturando as
   posições, uma peça depois da outra. Por cima, o que o programa
   mostraria na tela de trabalho: o número de cada peça, o nome do
   arquivo, a linha-guia passando pelos centros e os fios até um
   ponto de ancoragem. A câmera tem perspectiva e foco: o que está
   longe do plano de foco desfoca.
----------------------------------------------------------------*/
const Galeria = (() => {
  const F = FX;

  /* ---------------- arranjos ----------------
     cada um devolve a posição da peça i de n no espaço: x, y, z
     (z positivo afasta da câmera), giro no plano (rz) e escala (s) */
  const ARRANJOS = {
    /* a mola da referência: as peças enroladas num eixo que atravessa a tela */
    espiral: (i, n, t, o) => {
      const u = n > 1 ? i / (n - 1) : .5, a = i * (o.passo || .52) + (o.fase || 0) + t * (o.vel || 0);
      const R = o.raio || 420, L = o.largura || 1500;
      const ao = -L / 2 + u * L, tr = Math.sin(a) * R * .55 + (u - .5) * (o.sobe == null ? -260 : o.sobe);
      const z = Math.cos(a) * R + (o.z || 0), rz = Math.sin(a * .7) * 4;
      /* eixo y: a mola sobe pela tela, para o corte vertical */
      return o.eixo === 'y' ? { x: tr, y: -ao, z, rz, s: 1 } : { x: ao, y: tr, z, rz, s: 1 };
    },
    grade: (i, n, t, o) => {
      const cols = o.cols || 4, rows = Math.ceil(n / cols), c = i % cols, r = Math.floor(i / cols);
      const w = o.w || 300, h = o.h || 340, gx = o.gx == null ? 40 : o.gx, gy = o.gy == null ? 60 : o.gy;
      return { x: (c - (cols - 1) / 2) * (w + gx) + (o.x || 0), y: (r - (rows - 1) / 2) * (h + gy) + (o.y || 0), z: o.z || 0, rz: 0, s: 1 };
    },
    anel: (i, n, t, o) => {
      const a = i / n * Math.PI * 2 + (o.fase || 0) + t * (o.vel || 0), R = o.raio || 700;
      return { x: Math.sin(a) * R, y: (o.y || 0) + Math.cos(a) * (o.incl || 60), z: -Math.cos(a) * R + (o.z || 0), rz: 0, s: 1 };
    },
    linha: (i, n, t, o) => {
      const d = o.passo || 260;
      return { x: (i - (n - 1) / 2) * d + (o.x || 0), y: (o.y || 0) + Math.sin(i * .9 + t * (o.vel || 0)) * (o.onda || 0), z: o.z || 0, rz: 0, s: 1 };
    },
    pilha: (i, n, t, o) => ({ x: (o.x || 0) + i * (o.dx == null ? 8 : o.dx), y: (o.y || 0) + i * (o.dy == null ? -6 : o.dy), z: (o.z || 0) + i * (o.dz == null ? 70 : o.dz), rz: (i % 2 ? 1 : -1) * (o.gira || 2), s: 1 }),
    /* uma peça vem para a frente; as outras ficam no arranjo de antes, recuadas */
    destaque: (i, n, t, o) => {
      if (i === o.i) return { x: o.x || 0, y: o.y || 0, z: o.z == null ? -300 : o.z, rz: o.rz || 0, s: o.s || 1 };
      const p = ARRANJOS[o.resto || 'grade'](i, n, t, o.restoOp || {});
      return { ...p, z: p.z + (o.recua == null ? 900 : o.recua) };
    }
  };

  const mistura = (a, b, k) => ({
    x: F.lerp(a.x, b.x, k), y: F.lerp(a.y, b.y, k), z: F.lerp(a.z, b.z, k),
    rz: F.lerp(a.rz, b.rz, k), s: F.lerp(a.s, b.s, k)
  });

  /* curva suave pelos pontos (Catmull-Rom escrita como Bézier cúbica) */
  function curva(p) {
    if (p.length < 2) return '';
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
      const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
      const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
    }
    return d;
  }

  /* itens: [{el, w, h, num, arq}] — el já tem o tamanho w × h
     o.etapas: [{t, arranjo, op, dur, passo, ordem}] — a primeira é o ponto de partida
     o.camera(t) → {x, y, z, giro}; o.foco(t) → z do plano nítido
     o.linha(t), o.fios(t), o.rotulos(t) → visibilidade de 0 a 1 */
  function cria(cena, itens, o) {
    const W = o.W || 1920, Hh = o.H || 1080;
    const root = UI.put(cena, 'div', 'galeria');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'guia');
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
    svg.style.width = W + 'px'; svg.style.height = Hh + 'px';
    const caminho = document.createElementNS(svg.namespaceURI, 'path');
    caminho.setAttribute('fill', 'none');
    svg.appendChild(caminho);
    const fios = document.createElementNS(svg.namespaceURI, 'path');
    fios.setAttribute('fill', 'none'); fios.setAttribute('class', 'fios');
    svg.appendChild(fios);
    const nos = itens.map(() => {
      const c = document.createElementNS(svg.namespaceURI, 'circle');
      c.setAttribute('r', 3.2); svg.appendChild(c); return c;
    });

    const pecas = itens.map((it, i) => {
      const p = UI.put(root, 'div', 'peca');
      p.style.width = it.w + 'px'; p.style.height = it.h + 'px';
      p.appendChild(it.el);
      p._n = UI.put(p, 'div', 'pn', it.num == null ? String(i + 1) : it.num);
      if (it.arq) p._a = UI.put(p, 'div', 'pa', it.arq);
      return { p, it };
    });
    root.appendChild(svg);

    /* pontinhos de cor soltos no espaço, como na tela de trabalho */
    const soltos = (o.soltos || []).map(s => {
      const q = UI.put(root, 'div', 'solto');
      Object.assign(q.style, { width: s.tam + 'px', height: s.tam + 'px', background: s.cor });
      return { q, s };
    });

    const etapas = o.etapas;
    function posicao(i, n, t) {
      const e0 = etapas[0];
      let pos = ARRANJOS[e0.arranjo](i, n, t, e0.op || {});
      for (let k = 1; k < etapas.length; k++) {
        const e = etapas[k];
        const ord = e.ordem ? e.ordem(i, n) : i;
        const a = e.t + ord * (e.passo == null ? .05 : e.passo);
        const kk = F.smooth(F.span(t, a, a + (e.dur || 1.2)));
        if (kk <= 0) break;
        pos = mistura(pos, ARRANJOS[e.arranjo](i, n, t, e.op || {}), kk);
      }
      return pos;
    }

    function projeta(x, y, z, cam) {
      const dx = x - cam.x, dy = y - cam.y, dz = z - cam.z;
      const cg = Math.cos(cam.giro || 0), sg = Math.sin(cam.giro || 0);
      const xr = dx * cg - dz * sg, zr = dx * sg + dz * cg;
      const f = o.focal || 1500, s = f / Math.max(80, f + zr);
      return { X: W / 2 + xr * s, Y: Hh / 2 + dy * s, s, z: zr };
    }

    return {
      root, pecas,
      pose(t) {
        const cam = o.camera ? o.camera(t) : { x: 0, y: 0, z: 0, giro: 0 };
        const foco = o.foco ? o.foco(t) : 0;
        const dof = o.dof == null ? .011 : o.dof;
        const n = pecas.length, centros = [], ancoras = [];
        const vis = o.rotulos ? o.rotulos(t) : 1;
        pecas.forEach(({ p, it }, i) => {
          const pos = posicao(i, n, t);
          if (it.ajuste) Object.assign(pos, it.ajuste(t, pos));
          const pr = projeta(pos.x, pos.y, pos.z, cam);
          const sc = pr.s * pos.s;
          const desf = Math.min(o.desfMax || 16, Math.abs(pr.z - foco) * dof);
          const entra = o.entrada ? o.entrada(i, t) : 1;
          p.style.transform = `translate(${(pr.X - it.w / 2).toFixed(2)}px,${(pr.Y - it.h / 2).toFixed(2)}px) ` +
                              `scale(${sc.toFixed(4)}) rotate(${pos.rz.toFixed(2)}deg)`;
          p.style.filter = desf > .3 ? `blur(${desf.toFixed(2)}px)` : 'none';
          p.style.zIndex = String(5000 - Math.round(pr.z));
          p.style.opacity = entra;
          p._n.style.opacity = vis; if (p._a) p._a.style.opacity = vis * .9;
          centros.push([pr.X, pr.Y, entra]);
          ancoras.push([pr.X - it.w / 2 * sc, pr.Y + it.h / 2 * sc, entra]);
        });
        soltos.forEach(({ q, s }) => {
          const pr = projeta(s.x + Math.sin(t * .4 + s.x) * 12, s.y + Math.cos(t * .33 + s.y) * 10, s.z, cam);
          const desf = Math.min(o.desfMax || 16, Math.abs(pr.z - foco) * dof);
          q.style.transform = `translate(${pr.X.toFixed(1)}px,${pr.Y.toFixed(1)}px) scale(${pr.s.toFixed(3)})`;
          q.style.filter = desf > .3 ? `blur(${desf.toFixed(1)}px)` : 'none';
          q.style.zIndex = String(5000 - Math.round(pr.z));
        });

        /* linha-guia pelos centros, na ordem das peças */
        const lv = o.linha ? o.linha(t) : 0;
        const vivos = centros.filter(c => c[2] > .5);
        caminho.setAttribute('d', lv > .01 ? curva(vivos) : '');
        caminho.style.opacity = lv;
        nos.forEach((c, i) => {
          c.setAttribute('cx', centros[i][0].toFixed(1)); c.setAttribute('cy', centros[i][1].toFixed(1));
          c.style.opacity = lv * (centros[i][2] > .5 ? 1 : 0);
        });
        /* fios de algumas peças até o ponto de ancoragem */
        const fv = o.fios ? o.fios(t) : 0;
        if (fv > .01 && o.ancora) {
          const [hx, hy] = o.ancora(t), ids = o.fiosDe || [];
          fios.setAttribute('d', ids.map(i => `M${ancoras[i][0].toFixed(1)} ${ancoras[i][1].toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)}`).join(' '));
        } else fios.setAttribute('d', '');
        fios.style.opacity = fv;
      }
    };
  }

  /* ---------------- as peças da galeria ----------------
     Uma "foto" em duas cores do mesmo tom, como as imagens da
     referência: o fundo claro e um objeto tátil na cor cheia. */
  function foto(cor, tipo, w, h, semente, extra = {}) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    /* fundo no meio-tom da cor; cores muito escuras clareiam um pouco mais */
    const escura = UI.lum(cor) < .06;
    const fundo = UI.mix(cor, '#ffffff', escura ? .62 : .5);
    g.fillStyle = fundo; g.fillRect(0, 0, w, h);
    /* luz de estúdio no fundo, da esquerda para a direita */
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(0,0,0,.06)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const tam = Math.min(w, h);
    let obj;
    const op = { material: extra.material || 'argila', cor, tam: tam * .9, semente, sombraCor: UI.mix(cor, '#1a1410', .7) };
    if (tipo === 'letra') {
      obj = Tatil.texto(extra.ch || 'A', { ...op, fonte: 'massa', tam: tam * .82 });
    } else if (tipo === 'fio') {
      obj = Tatil.forma(w, h, gg => {
        gg.lineWidth = tam * .14; gg.lineCap = 'round'; gg.lineJoin = 'round';
        gg.beginPath();
        for (let k = 0; k <= 60; k++) {
          const u = k / 60, a = u * Math.PI * 3.2 + semente;
          const x = w * .5 + Math.cos(a) * w * (.14 + u * .26), y = h * (.16 + u * .66) + Math.sin(a * 1.3) * h * .06;
          k ? gg.lineTo(x, y) : gg.moveTo(x, y);
        }
        gg.stroke();
      }, { ...op, material: 'pasta', tam: tam * .7 });
    } else if (tipo === 'folha') {
      obj = Tatil.forma(w, h, gg => {
        Tatil.tracaContorno(gg, Tatil.contorno(w / 2, h / 2, tam * .33, semente, 64, .5)); gg.fill();
      }, { ...op, material: 'folha', tam: tam * .8 });
    } else if (tipo === 'tecido') {
      /* um retalho dobrado: faixas de luz e sombra atravessando a peça */
      const tc = document.createElement('canvas'); tc.width = w; tc.height = h;
      const tg = tc.getContext('2d'), img = tg.createImageData(w, h), d = img.data, base = UI.hex2rgb(cor);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const dobra = Math.sin((x * .9 + y * .45) / tam * 11 + Tatil.fbm(x / tam * 2, y / tam * 2, semente, 3) * 5);
        const trama = (Math.sin(x * 1.9) * Math.sin(y * 1.9)) * .04;
        const k = .62 + .32 * dobra + trama, p = (y * w + x) * 4;
        d[p] = Math.min(255, base[0] * k + 30 * Math.max(0, dobra)); d[p + 1] = Math.min(255, base[1] * k + 30 * Math.max(0, dobra));
        d[p + 2] = Math.min(255, base[2] * k + 30 * Math.max(0, dobra)); d[p + 3] = 255;
      }
      tg.putImageData(img, 0, 0);
      g.drawImage(tc, 0, 0);
      return c;
    } else {
      /* gota de massinha amassada à mão */
      obj = Tatil.forma(w, h, gg => {
        Tatil.tracaContorno(gg, Tatil.contorno(w / 2, h / 2, tam * .38, semente, 72, .42)); gg.fill();
      }, { ...op, tam: tam * .9 });
    }
    g.drawImage(obj, (w - obj.width) / 2, (h - obj.height) / 2 + (tipo === 'letra' ? tam * .02 : 0));
    return c;
  }

  /* papel com grão, por cima de tudo, para a tela não ficar lisa demais */
  function grao(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    for (let i = 0; i < w * h; i++) {
      const v = Tatil.hash(i % w, Math.floor(i / w), 99);
      const p = i * 4; d[p] = d[p + 1] = d[p + 2] = v > .5 ? 255 : 0; d[p + 3] = Math.abs(v - .5) * 34;
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  return { cria, foto, grao, ARRANJOS };
})();
