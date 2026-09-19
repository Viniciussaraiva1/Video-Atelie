/* ---------------------------------------------------------------
   As cenas do vídeo. Cada cena tem duração, rótulo, legenda,
   um build() que monta o DOM e um update(t) que desenha o quadro
   daquele instante. Nada depende de relógio: só de t.
----------------------------------------------------------------*/
const SCENES = (() => {

  const { put, el } = UI;
  const F = FX;

  /* posição de um elemento em coordenadas do palco */
  const pt = n => {
    const r = n.getBoundingClientRect();
    const sc = n.closest('.scene'), k = (sc && sc._zoom) || 1;   /* desfaz a aproximação da cena */
    return { x: 960 + (r.left + r.width / 2 - 960) / k, y: 540 + (r.top + r.height / 2 - 540) / k };
  };

  /* entrada em sequência: cada nó sobe e aparece */
  const rise = (nodes, t, t0, step = .16, dur = .9, dist = 26) =>
    nodes.forEach((n, i) => {
      const k = F.outQuint(F.span(t, t0 + i * step, t0 + i * step + dur));
      n.style.opacity = k;
      n.style.transform = `translateY(${(1 - k) * dist}px)`;
    });

  const fade = (n, k) => { n.style.opacity = k; };
  const bin = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const blendHex = (a, b, k) => {
    const A = UI.hex2rgb(a), B = UI.hex2rgb(b);
    return '#' + A.map((v, i) => bin(v + (B[i] - v) * k)).join('');
  };

  const LOJA = DATA.lojas[0];

  /* =============================================================
     Mesa de montagem — composição comum às cenas 03 a 08.
     Manter as mesmas coordenadas em todas faz a dissolvência
     parecer um plano só, com a câmera parada.
  ==============================================================*/
  const MESA = { px: 84, py: 226, pw: 520, bx: 648, by: 168, bw: 1192, bh: 742 };

  function buildMesa(s) {
    const P = UI.panel(s, { x: MESA.px, y: MESA.py, w: MESA.pw });
    P.chips('fundo', 'Fundo da página', DATA.fundos.map(f => f.nome));
    P.swatches('cor', 'Cor da marca', DATA.grupos);
    P.chips('letra', 'Jeito da letra', DATA.letras.map(l => l.nome));
    P.chips('espaco', 'Espaço entre as peças', DATA.espacos.map(e => e.nome));
    P.checks('home', 'O que entra na home', DATA.secoes);
    P.ctrls.home.box.classList.add('two');
    P.ctrls.cor.sws.forEach(sw => {
      sw.gi = DATA.grupos.findIndex(g => g.grupo === sw.grupo);
      sw.ci = DATA.grupos[sw.gi].cores.findIndex(c => c.hex === sw.cor.hex);
    });
    const B = UI.browser(s, { x: MESA.bx, y: MESA.by, w: MESA.bw, h: MESA.bh, url: LOJA.url });
    const S = UI.site(B.page, { loja: LOJA, pecas: DATA.pecas, cards: 8 });
    const cur = UI.cursor(s);
    return { P, B, S, cur, baseH: 0 };
  }

  /* estado inicial padrão da mesa */
  const ST0 = { fi: 0, gi: 0, ci: 0, li: 0, ei: 1, on: { vitrine: 1 }, chk: { vitrine: 1 } };

  /* aplica os cliques já acontecidos até t e devolve o estado da página */
  function resolve(st0, evs, t) {
    const st = { ...st0, on: { ...st0.on }, chk: { ...st0.chk } };
    let fPrev = null, fAt = -9, cPrev = null, cAt = -9;
    const onAt = {}, onFrom = {}, onTo = {};
    for (const e of evs) {
      if (e.t > t) break;
      if (e.ctrl === 'fundo') { fPrev = st.fi; fAt = e.t; st.fi = e.i; }
      else if (e.ctrl === 'grupo') { st.gi = e.i; }
      else if (e.ctrl === 'cor') { cPrev = DATA.grupos[st.gi].cores[st.ci].hex; cAt = e.t; st.ci = e.i; }
      else if (e.ctrl === 'letra') { st.li = e.i; }
      else if (e.ctrl === 'espaco') { st.ei = e.i; }
      else if (e.ctrl === 'home') {
        onFrom[e.id] = onAt[e.id] != null ? (onTo[e.id]) : (st.on[e.id] || 0);
        onAt[e.id] = e.t; onTo[e.id] = e.v; st.chk[e.id] = e.v;
      }
    }
    const f0 = DATA.fundos[fPrev == null ? st.fi : fPrev], f1 = DATA.fundos[st.fi];
    const kF = F.smooth(F.span(t, fAt, fAt + .30));
    const fundo = { nome: f1.nome, bg: blendHex(f0.bg, f1.bg, kF), fg: blendHex(f0.fg, f1.fg, kF) };

    const corSel = DATA.grupos[st.gi].cores[st.ci];
    const kC = F.smooth(F.span(t, cAt, cAt + .30));
    const cor = { nome: corSel.nome, hex: cPrev == null ? corSel.hex : blendHex(cPrev, corSel.hex, kC) };

    for (const id in onAt) {
      const k = F.smooth(F.span(t, onAt[id], onAt[id] + .55));
      st.on[id] = F.lerp(onFrom[id] || 0, onTo[id], k);
    }
    return { st, page: { fundo, cor, letra: DATA.letras[st.li], espaco: DATA.espacos[st.ei], on: st.on }, corSel };
  }

  /* desenha o painel no estado st, com foco num controle */
  function paintPanel(P, st, foco) {
    P.ctrls.fundo.itens.forEach((n, i) => n.classList.toggle('on', i === st.fi));
    P.ctrls.letra.itens.forEach((n, i) => n.classList.toggle('on', i === st.li));
    P.ctrls.espaco.itens.forEach((n, i) => n.classList.toggle('on', i === st.ei));
    P.ctrls.cor.tabs.forEach((n, i) => n.classList.toggle('on', i === st.gi));
    const sel = DATA.grupos[st.gi].cores[st.ci];
    P.ctrls.cor.tag.textContent = `${sel.nome} · ${sel.hex}`;
    P.ctrls.cor.sws.forEach(sw => {
      sw.el.style.display = sw.gi === st.gi ? '' : 'none';
      sw.el.firstElementChild.style.opacity = (sw.gi === st.gi && sw.ci === st.ci) ? 1 : 0;
    });
    P.ctrls.home.itens.forEach((n, i) => {
      const id = DATA.secoes[i].id;
      n.classList.toggle('on', (st.chk[id] || 0) > .5);
    });
    ['fundo', 'cor', 'letra', 'espaco', 'home'].forEach(k => {
      P.ctrls[k].el.style.opacity = !foco ? 1 : (k === foco ? 1 : .32);
    });
  }

  /* alvo de cada clique dentro do painel */
  function alvo(P, st, e) {
    if (e.ctrl === 'fundo') return P.ctrls.fundo.itens[e.i];
    if (e.ctrl === 'letra') return P.ctrls.letra.itens[e.i];
    if (e.ctrl === 'espaco') return P.ctrls.espaco.itens[e.i];
    if (e.ctrl === 'grupo') return P.ctrls.cor.tabs[e.i];
    if (e.ctrl === 'cor') { const sw = P.ctrls.cor.sws.find(w => w.gi === st.gi && w.ci === e.i); return sw && sw.el; }
    if (e.ctrl === 'home') return P.ctrls.home.itens[DATA.secoes.findIndex(x => x.id === e.id)];
  }

  /* cursor: caminho pelos alvos + anel de clique */
  function drive(m, t, evs, st, entrada) {
    const pts = entrada ? [{ t: -1.2, x: entrada.x, y: entrada.y }] : [];
    evs.forEach(e => {
      const a = alvo(m.P, e.st || st, e);
      if (!a) return;
      const p = pt(a);
      pts.push({ t: e.t - .52, x: p.x, y: p.y }, { t: e.t + .12, x: p.x, y: p.y });
    });
    m.cur.path(t, pts);
    const act = evs.filter(e => t >= e.t && t < e.t + .45).pop();
    if (act) { const a = alvo(m.P, act.st || st, act); if (a) { const p = pt(a); m.cur.click(t, act.t, p.x, p.y); } }
    else m.cur.rip.style.opacity = 0;
  }

  /* rolagem da prévia: mostra a seção que acabou de entrar */
  function scrollPara(m, st, id) {
    let top = m.baseH, total = m.baseH, alvo = 0;
    for (const sec of DATA.secoes) {
      if (sec.fixa) continue;
      const h = m.S.secs[sec.id].h * (st.on[sec.id] || 0);
      if (sec.id === id) alvo = top + h - m.B.vpH + 70;
      if (sec.id !== id) top += h;
      total += h;
    }
    return F.clamp(alvo, 0, Math.max(0, total - m.B.vpH));
  }

  /* fábrica das cenas que usam a mesa de montagem */
  function mesaScene(cfg) {
    return {
      id: cfg.id, num: cfg.num, label: cfg.label, caption: cfg.caption, dur: cfg.dur,
      build(s) {
        const m = buildMesa(s);
        s._m = m;
        m.B.root.style.opacity = 1; m.P.root.style.opacity = 1;
        return m;
      },
      update(s, t, p) {
        const m = s._m;
        const { st, page, corSel } = resolve(cfg.start || ST0, cfg.evs || [], t);
        /* altura da página menos as seções abertas: sempre a mesma, em qualquer ordem de render */
        const extra = UI.applySite(m.S, page);
        m.baseH = m.S.root.offsetHeight - extra;
        paintPanel(m.P, st, cfg.foco);
        drive(m, t, cfg.evs || [], st, cfg.entrada);
        m.cur.show(cfg.semCursor ? 0 : F.clamp(F.span(t, .1, .5)));
        /* rolagem */
        let sc = cfg.scroll ? cfg.scroll(m, st, t) : 0;
        m.S.root.parentElement.style.transform = `translateY(${-sc}px)`;
        if (cfg.extra) cfg.extra(s, t, p, m);
      }
    };
  }

  /* =============================================================
     CENAS
  ==============================================================*/
  const list = [];

  /* ---------- abertura ---------- */
  list.push({
    id: 'abertura', dur: 5.5, label: null, caption: null,
    build(s) {
      const c = put(s, 'div', 'center'); c.style.top = '352px';
      s._k = put(c, 'div', 'kicker', 'Vitrines para quem vende pelo Instagram');
      s._t = put(c, 'div', 'display');
      Object.assign(s._t.style, { fontSize: '154px', marginTop: '46px', fontStyle: 'italic', letterSpacing: '-.03em' });
      s._t.innerHTML = 'Ateliê Digital';
      s._r = put(c, 'div', 'hair'); Object.assign(s._r.style, { width: '0px', marginTop: '54px' });
      s._s = put(c, 'div');
      Object.assign(s._s.style, { font: "italic 400 32px/1.4 'Playfair',serif", color: 'rgba(23,22,20,.6)', marginTop: '40px' });
      s._s.textContent = 'como funciona, do começo ao fim';
    },
    update(s, t) {
      fade(s._k, F.outQuint(F.span(t, .15, 1.3)));
      const k = F.outQuint(F.span(t, .5, 2.3));
      s._t.style.opacity = k; s._t.style.transform = `translateY(${(1 - k) * 28}px)`;
      s._r.style.width = (F.ease(F.span(t, 1.7, 3.1)) * 430) + 'px';
      fade(s._s, F.outQuint(F.span(t, 2.5, 3.9)));
    }
  });

  /* ---------- 01 · o problema ---------- */
  list.push({
    id: 'problema', num: '01', label: 'O problema', dur: 8.0,
    caption: 'A cliente chega pelo Instagram e pergunta o que já podia estar escrito na página.',
    build(s) {
      const b = put(s, 'div', 'display');
      Object.assign(b.style, { position: 'absolute', left: '84px', top: '300px', width: '900px', fontSize: '92px' });
      b.innerHTML = 'Você não vende pouco.<br><em>Você responde demais.</em>';
      s._b = b;
      const ph = UI.phone(s, { x: 1348, y: 200, scale: 1.02 });
      const dm = put(ph.screen, 'div', 'dm');
      const top = put(dm, 'div', 'dm-top', '<span>Direct</span>');
      s._ct = put(top, 'span', null, '0 hoje');
      const lista = put(dm, 'div', 'dm-list');
      s._rows = DATA.dms.map((m, i) => {
        const r = put(lista, 'div', 'dm-row');
        put(r, 'div', 'av');
        put(r, 'div', 'bub', m);
        put(r, 'div', 'hr', (9 + i) + 'h');
        r.style.opacity = 0;
        return r;
      });
      s._lista = lista; s._ph = ph;
    },
    update(s, t) {
      const k = F.outQuint(F.span(t, .3, 1.8));
      s._b.style.opacity = k; s._b.style.transform = `translateY(${(1 - k) * 24}px)`;
      const pk = F.outQuint(F.span(t, .1, 1.4));
      s._ph.root.style.opacity = pk;
      s._ph.root.style.transform = `scale(1.02) translateY(${(1 - pk) * 30}px)`;
      /* mensagens caindo, uma a cada 0,62 s */
      const t0 = 1.1, step = .62;
      s._rows.forEach((r, i) => {
        const a = t0 + i * step;
        const kk = F.outQuint(F.span(t, a, a + .34));
        r.style.opacity = kk; r.style.transform = `translateX(${(1 - kk) * -16}px)`;
      });
      const vis = Math.max(0, Math.min(s._rows.length, Math.floor((t - t0) / step) + 1));
      const desce = Math.max(0, vis - 7) * 58;
      s._lista.style.transform = `translateY(${-desce}px)`;
      const n = Math.round(F.ease(F.span(t, 1.0, 7.0)) * 47);
      s._ct.textContent = n + ' hoje';
    }
  });

  /* ---------- 02 · o link da bio ---------- */
  list.push({
    id: 'bio', num: '02', label: 'O link da bio', dur: 10.0,
    caption: 'O link da bio manda a cliente para uma lista de links. A vitrine resolve na mesma tela.',
    build(s) {
      const cor = '#c08a78';
      const A = UI.phone(s, { x: 430, y: 236, scale: 1 });
      put(A.screen, 'div', 'lt', `
        <div class="av"></div><div class="nick">@casaamare</div>
        <div class="bio">peças em tecido natural · BH</div>
        ${['Catálogo em PDF', 'WhatsApp', 'Instagram', 'Tabela de medidas', 'Como comprar', 'Frete e prazos']
          .map(x => `<div class="lk">${Draw.link(15)}<span>${x}</span></div>`).join('')}`);
      const B = UI.phone(s, { x: 1160, y: 236, scale: 1 });
      const mv = put(B.screen, 'div', 'mv');
      mv.style.background = '#faf7f1';
      mv.innerHTML = `<div class="top"><div class="bn">Casa Amaré</div><div class="mn">Vitrine</div></div>
        <div class="hero">As peças da casa,<br>prontas para escolher.</div>
        <div class="g">${DATA.pecas.slice(0, 4).map(p => `
          <div class="c"><div class="a" style="background:${UI.mix('#faf7f1', cor, .13)}">${Draw.croqui(p.croqui, cor)}</div>
          <div class="n">${p.nome}</div><div class="p">${p.preco}</div></div>`).join('')}</div>
        <div class="bar" style="background:${cor}">${Draw.whats('#fff', 16)}<span>Chamar para fechar</span></div>`;
      s._A = A; s._B = B;
      s._ta = put(s, 'div', 'ph-tag', 'Link da bio');
      Object.assign(s._ta.style, { left: '430px', top: '170px' });
      s._tb = put(s, 'div', 'ph-tag', 'A sua vitrine');
      Object.assign(s._tb.style, { left: '1160px', top: '170px' });
      s._v = put(s, 'div', 'versus', '×');
      Object.assign(s._v.style, { left: '944px', top: '540px' });
      s._na = put(s, 'div', 'note', 'seis botões e nenhuma peça: a cliente sai daqui para perguntar.');
      Object.assign(s._na.style, { left: '84px', top: '640px', width: '300px', textAlign: 'right' });
      s._nb = put(s, 'div', 'note', 'peça, preço e botão na mesma tela: a cliente decide sozinha.');
      Object.assign(s._nb.style, { left: '1540px', top: '640px', width: '300px' });
    },
    update(s, t) {
      const ka = F.outQuint(F.span(t, .2, 1.5));
      s._A.root.style.opacity = ka; s._A.root.style.transform = `translateY(${(1 - ka) * 26}px)`;
      const kb = F.outQuint(F.span(t, 1.6, 3.0));
      s._B.root.style.opacity = kb; s._B.root.style.transform = `translateY(${(1 - kb) * 26}px)`;
      fade(s._ta, F.span(t, .8, 1.6)); fade(s._tb, F.span(t, 2.2, 3.0));
      fade(s._v, F.span(t, 3.1, 3.9));
      rise([s._na], t, 4.2, 0, 1.0); rise([s._nb], t, 5.4, 0, 1.0);
    }
  });

  return { list, mesaScene, buildMesa, resolve, paintPanel, scrollPara, put, pt, rise, fade, blendHex, LOJA, MESA, ST0 };
})();
