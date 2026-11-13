/* ---------------------------------------------------------------
   Peças do Instagram do Ateliê Digital, no mesmo idioma do filme:
   papel com grão, letra de massinha, número em papel-alumínio,
   bolha de plástico e a galeria de "fotos" em dois tons.

   Cada peça é montada sob demanda em #peca, no tamanho exato do
   Instagram, e o scripts/insta.mjs tira o PNG.
     perfil   1080×1080 (o Instagram recorta em círculo)
     destaque 1080×1080 (capas dos destaques, também em círculo)
     post     1080×1350 (o 4:5, que ocupa mais tela no feed)
----------------------------------------------------------------*/
const Insta = (() => {
  const VERMELHO = '#d4553c', CARTAZ = '#d9492c', CREME = '#f3e7d3', TINTA = '#151210';
  const P = () => document.getElementById('peca');
  const put = (cls, html, css = {}) => { const n = UI.put(P(), 'div', cls, html); Object.assign(n.style, css); return n; };

  /* caixa do objeto sem a sombra: a sombra nunca passa de 40 % de opacidade */
  function caixa(c) {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++)
      if (d[(y * c.width + x) * 4 + 3] > 200) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }
  /* põe um canvas tátil com o centro do objeto (ou o canto, ancora='esq') em x,y */
  function poe(c, x, y, ancora = 'centro', rot = 0) {
    const b = caixa(c);
    c.className = 't';
    const left = ancora === 'esq' ? x - b.x0 : x - b.cx;
    Object.assign(c.style, { left: left + 'px', top: (y - b.cy) + 'px', transform: rot ? `rotate(${rot}deg)` : '' });
    P().appendChild(c);
    return { ...b, left, top: y - b.cy };
  }
  /* uma linha de letras táteis, cada letra com a sua semente, como no filme */
  function linha(txt, o, x, y, ancora = 'esq') {
    const ls = Tatil.letras(txt, o);
    const g = document.createElement('canvas');
    const pad = ls[0].pad, h = ls[0].h;
    g.width = Math.ceil(ls.largura + pad * 2); g.height = h;
    const gg = g.getContext('2d');
    ls.forEach(l => gg.drawImage(l.c, l.x, 0));
    return poe(g, ancora === 'esq' ? x : x, y, ancora);
  }
  function grao() {
    const n = put('ig-gr');
    n.style.backgroundImage = `url(${Galeria.grao(512, 512).toDataURL()})`;
  }
  function bolha(w, h, r, sem, sombra = '#5a1a0e') {
    const pts = Tatil.contorno(w / 2, h / 2, r, sem, 80, .34);
    const c = Tatil.forma(w, h, g => { Tatil.tracaContorno(g, pts); g.fill(); },
      { material: 'vidro', cor: '#ffffff', tam: r * 1.35, sombraCor: sombra, semente: sem });
    return { c, pts };
  }
  const todasCores = () => DATA.grupos.flatMap(g => g.cores);

  /* ================= foto de perfil ================= */
  const perfil = {
    /* A de massinha vermelha no papel: a mesma letra do título do filme */
    'perfil-papel'() {
      P().style.background = '#ece7e0';
      poe(Tatil.texto('A', { material: 'argila', cor: VERMELHO, tam: 700, fonte: 'massa', semente: 7, raio: .5 }), 540, 556);
      grao();
    },
    /* o avesso: A creme no vermelho do cartaz final */
    'perfil-cartaz'() {
      P().style.background = CARTAZ;
      poe(Tatil.texto('A', { material: 'argila', cor: CREME, tam: 700, fonte: 'massa', semente: 7, sombraCor: '#5a1a0e', raio: .5 }), 540, 556);
      grao();
    },
    /* A de papel-alumínio dentro de uma bolha de plástico, no papel */
    'perfil-folha'() {
      P().style.background = '#ece7e0';
      poe(Tatil.texto('A', { material: 'folha', tam: 640, fonte: 'massa', semente: 9 }), 540, 560);
      const b = bolha(980, 900, 330, 23, '#3a3027');
      poe(b.c, 560, 540);
      grao();
    }
  };

  /* ================= capas dos destaques =================
     A "foto" da galeria do filme: meio-tom da cor no fundo e o objeto na cor cheia. */
  const DEST = [
    ['destaque-vitrines', '#b5644a', 'letra', 11, { ch: 'V' }],
    ['destaque-previa',   '#3e8a80', 'fio',   5,  {}],
    ['destaque-cores',    '#e3c14e', 'gota',  21, {}],
    ['destaque-precos',   '#9a958c', 'letra', 3,  { ch: '$', material: 'folha' }],
    ['destaque-duvidas',  '#c39bc4', 'letra', 17, { ch: '?' }],
    ['destaque-clientes', '#5e1f2b', 'letra', 29, { ch: '♥' }]
  ];
  const destaques = {};
  DEST.forEach(([id, cor, tipo, sem, extra]) => {
    destaques[id] = () => {
      const c = Galeria.foto(cor, tipo, 1080, 1080, sem, extra);
      c.className = 't'; c.style.left = 0; c.style.top = 0; P().appendChild(c);
      grao();
    };
  });

  /* ================= posts 4:5 ================= */
  const posts = {
    /* 1 — quem é: o título de massinha e a galeria em leque */
    'post-1-apresenta'() {
      put('ig-k', 'Vitrines para boutiques<br>que vendem pelo Instagram', { left: '84px', top: '96px' });
      linha('Ateliê', { material: 'argila', cor: VERMELHO, tam: 230, fonte: 'massa', semente: 7 }, 78, 330);
      linha('Digital', { material: 'argila', cor: VERMELHO, tam: 230, fonte: 'massa', semente: 44 }, 78, 560);
      put('ig-pf', 'a sua loja respondendo por você.', { left: '86px', top: '700px' });
      /* galeria: seis peças em leque, como na abertura do filme */
      const pecas = [['#5b3a78', 'tecido', 3], ['#e3c14e', 'letra', 9, { ch: 'S' }], ['#1e2a44', 'fio', 4],
                     ['#c08a78', 'gota', 12], ['#3e8a80', 'letra', 6, { ch: 'C' }], ['#171614', 'folha', 8]];
      pecas.forEach(([cor, tipo, sem, ex], i) => {
        const w = 250, h = 300;
        const c = Galeria.foto(cor, tipo, w, h, sem, ex || {});
        const box = put('ig-sw', '', { left: (40 + i * 168) + 'px', top: (900 - Math.sin(i / 5 * Math.PI) * 110 + (i % 2) * 24) + 'px',
          transform: `rotate(${(i - 2.5) * 4}deg)`, zIndex: 10 + (i % 2 ? 1 : 0) });
        box.appendChild(c);
      });
      put('ig-pe', 'link na bio · prévia grátis', { left: '84px', bottom: '64px', zIndex: 40 });
      grao();
    },

    /* 2 — a dor: o direct que vira balcão de informação */
    'post-2-direct'() {
      put('ig-k', '01 — o direct', { left: '84px', top: '96px' });
      put('ig-an', 'Seu direct<br>virou balcão.', { left: '80px', top: '170px', fontSize: '150px' });
      const pergs = [['quanto custa?', 300, 640, 210, 3], ['tem no P?', 760, 600, 170, 8], ['aceita pix?', 640, 830, 180, 14],
                     ['ainda tem?', 250, 900, 170, 19], ['tem em outra cor?', 600, 1030, 215, 26]];
      pergs.forEach(([t, x, y, r, sem]) => {
        const b = bolha(Math.round(r * 2.9), Math.round(r * 2.6), r, sem, '#3a3027');
        poe(b.c, x, y);
        put('ig-dm', t, { left: x + 'px', top: y + 'px', zIndex: 5 });
      });
      put('ig-tx', 'A vitrine responde antes da pergunta: preço, tamanho, cor e Pix na mesma tela.',
        { left: '84px', top: '1196px', width: '900px', fontSize: '30px', zIndex: 6 });
      grao();
    },

    /* 3 — prova de estudo: a carta de cor em amostras táteis */
    'post-3-carta'() {
      put('ig-k', 'Carta Outono-Inverno 26/27 · 28 marcas lidas', { left: '84px', top: '96px' });
      put('ig-an', 'Cor com estudo.', { left: '80px', top: '150px', fontSize: '128px' });
      const cores = todasCores(), tipos = ['gota', 'tecido', 'letra', 'fio'];
      const L = 4, w = 178, h = 178, gx = 66, gy = 72, x0 = 84, y0 = 310;
      cores.forEach((c, i) => {
        const col = i % L, row = Math.floor(i / L);
        const x = x0 + col * (w + gx), y = y0 + row * (h + gy);
        const tipo = tipos[(i + row) % 4];
        const can = Galeria.foto(c.hex, tipo, w, h, 5 + i * 7, { ch: c.nome[0] });
        put('ig-sw', '', { left: x + 'px', top: y + 'px' }).appendChild(can);
        put('ig-swn', c.nome, { left: x + 'px', top: (y + h + 14) + 'px' });
        put('ig-swh', c.hex.toUpperCase(), { left: x + 'px', top: (y + h + 44) + 'px' });
      });
      grao();
    },

    /* 4 — a oferta: o número em papel-alumínio, como no filme */
    'post-4-preco'() {
      put('ig-k', 'Passo 1 · a vitrine', { left: '84px', top: '96px' });
      const n = Tatil.texto('R$ 890', { material: 'folha', tam: 300, fonte: 'cartaz', semente: 31 });
      poe(n, 84, 380, 'esq');
      put('ig-pf', 'uma vez só. Sem mensalidade na página.', { left: '86px', top: '560px', width: '880px', color: 'var(--ink)' });
      put('ig-inc', DATA.inclusos.concat(['No ar em 7 dias úteis']).map(t => `<i></i>${t}`).join('<br>'),
        { left: '86px', top: '720px' });
      put('ig-tx', 'Quer a marca inteira? <b style="font-weight:600;color:#171614">Identidade e site, R$ 2.490.</b>',
        { left: '86px', top: '1080px', width: '880px', fontSize: '30px' });
      put('ig-pe', 'prévia grátis · em até 2 dias úteis', { left: '84px', bottom: '64px' });
      grao();
    },

    /* 5 — o risco sai das costas da lojista: três números de massinha */
    'post-5-sem-risco'() {
      P().style.background = '#e9e2d6';
      put('ig-k', 'Como funciona', { left: '84px', top: '96px' });
      put('ig-an', 'Sem risco<br>pra você.', { left: '80px', top: '160px', fontSize: '150px' });
      const cores = ['#3e8a80', '#e3c14e', VERMELHO];
      DATA.semRisco.forEach((s, i) => {
        const y = 560 + i * 250;
        poe(Tatil.texto(String(i + 1), { material: 'argila', cor: cores[i], tam: 210, fonte: 'massa', semente: 12 + i * 9 }), 170, y + 70);
        put('ig-passo', `<b>${s.t}</b><span>${s.d}</span>`, { left: '320px', top: y + 'px' });
      });
      grao();
    },

    /* 6 — a chamada: o cartaz do fim do filme, em pé */
    'post-6-cartaz'() {
      P().style.background = CARTAZ;
      const tipo = put('ig-an', 'Me manda<br>cinco<br>peças.', { left: '64px', top: '70px', fontSize: '232px', zIndex: 1 });
      /* a lente: a mesma letra, ampliada, só dentro da bolha */
      const bw = 560, bh = 480, bx = 330, by = 160, esc = 1.18;
      const b = bolha(bw, bh, 200, 23);
      const lente = put('ig-lente', '', { zIndex: 2, background: CARTAZ });
      const t2 = tipo.cloneNode(true); lente.appendChild(t2);
      const cx = bx + bw / 2, cy = by + bh / 2;
      Object.assign(t2.style, { transformOrigin: `${cx - 64}px ${cy - 70}px`, transform: `scale(${esc})` });
      lente.style.clipPath = `polygon(${b.pts.map(p => `${bx + p[0]}px ${by + p[1]}px`).join(',')})`;
      Object.assign(b.c.style, { left: bx + 'px', top: by + 'px', zIndex: 3 }); b.c.className = 't'; P().appendChild(b.c);
      [['Eu devolvo', 51, 860], ['a sua vitrine.', 57, 975]].forEach(([t, sem, y]) =>
        linha(t, { material: 'argila', cor: CREME, tam: 104, fonte: 'massa', sombraCor: '#5a1a0e', semente: sem }, 70, y));
      put('ig-pill', `${Draw.whats('#f3e7d3', 28)}<span>Prévia grátis · ${DATA.previa.prazo}</span>`, { left: '72px', top: '1150px', zIndex: 4 });
      grao();
    }
  };

  const TODAS = { ...perfil, ...destaques, ...posts };
  const tamanho = id => (id.startsWith('post') ? [1080, 1350] : [1080, 1080]);

  function monta(id) {
    const p = P();
    p.innerHTML = ''; p.style.background = '';
    const [w, h] = tamanho(id);
    Object.assign(p.style, { width: w + 'px', height: h + 'px' });
    TODAS[id]();
    return [w, h];
  }

  return { ids: Object.keys(TODAS), monta };
})();

(async () => {
  await Promise.all(["400 100px 'Bagel Fat One'", "400 100px 'Anton'", "400 30px 'Inter'", "italic 400 30px 'Playfair'",
    "500 20px 'PlexMono'"].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  window.__ids = Insta.ids;
  window.__monta = id => Insta.monta(id);
  window.__ready = true;
})();
