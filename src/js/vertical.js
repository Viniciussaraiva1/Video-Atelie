/* ---------------------------------------------------------------
   Corte vertical (1080×1920, 42 s) para Reels, Stories e Status
   do WhatsApp. É o mesmo argumento do filme principal, na ordem de
   quem rola o feed: o gancho no primeiro segundo, a vitrine, a
   prévia grátis, o preço e o convite. Cada cena tem uma frase só,
   grande, porque a maioria assiste sem som.
----------------------------------------------------------------*/
window.ROTEIRO = (() => {
  const S = SCENES, put = S.put, F = FX;
  const L = [];
  const COR = DATA.grupos[0].cores[0].hex;

  /* título no alto da tela */
  const titulo = (s, html, top = 250, size = 82) => {
    const d = put(s, 'div', 'display v-tit', html);
    Object.assign(d.style, { top: top + 'px', fontSize: size + 'px' });
    return d;
  };
  /* sobe e aparece */
  const entra = (n, t, a, dur = 1.1, dist = 24) => {
    const k = F.outQuint(F.span(t, a, a + dur));
    n.style.opacity = k;
    n.style.transform = `translateY(${(1 - k) * dist}px)`;
  };
  /* celular centralizado, um pouco maior que no filme deitado */
  const celular = (s, top = 620, esc = 1.36) => {
    const ph = UI.phone(s, { x: 540 - 165, y: top, scale: esc });
    ph.esc = esc;
    return ph;
  };
  const entraCel = (ph, t, a) => {
    const k = F.outQuint(F.span(t, a, a + 1.3));
    ph.root.style.opacity = k;
    ph.root.style.transform = `scale(${ph.esc}) translateY(${(1 - k) * 30}px)`;
  };
  const posta = (n, top) => { n.style.top = top + 'px'; return n; };

  /* a vitrine da Casa Amaré dentro do celular, com cor, fundo e letra trocáveis */
  function vitrine(tela) {
    const mv = put(tela, 'div', 'mv tela');
    const top = put(mv, 'div', 'top');
    const bn = put(top, 'div', 'bn', 'Casa Amaré');
    put(top, 'div', 'mn', 'Vitrine');
    const hero = put(mv, 'div', 'hero', 'As peças da casa,<br>prontas para escolher.');
    const g = put(mv, 'div', 'g');
    const cards = DATA.pecas.slice(0, 4).map(p => {
      const c = put(g, 'div', 'c');
      const a = put(c, 'div', 'a');
      put(c, 'div', 'n', p.nome);
      put(c, 'div', 'p', p.preco);
      return { a, croqui: p.croqui };
    });
    const bar = put(mv, 'div', 'bar', `${Draw.whats('#fff', 16)}<span>Chamar para fechar</span>`);
    let chave = '';
    return {
      mv,
      pinta(fundo, cor, letra) {
        mv.style.background = fundo;
        const escuro = UI.lum(fundo) < .35;
        mv.style.color = escuro ? '#f4f1ea' : '#171614';
        const Lt = DATA.letras[letra];
        bn.style.font = `${Lt.it} ${Lt.peso} ${Math.round(19 * Lt.esc / .92)}px ${Lt.fam}`;
        bn.style.letterSpacing = Lt.ls;
        hero.style.font = `${Lt.it} ${Lt.peso} ${Math.round(22 * Lt.esc)}px/1.2 ${Lt.fam}`;
        hero.style.letterSpacing = Lt.ls;
        bar.style.background = cor;
        if (chave !== cor + fundo) {
          cards.forEach(c => {
            c.a.style.background = UI.mix(fundo, cor, .13);
            c.a.innerHTML = Draw.croqui(c.croqui, cor);
          });
          chave = cor + fundo;
        }
      }
    };
  }

  /* ---------- 1 · o gancho ---------- */
  L.push({
    id: 'v-gancho', dur: 6.0,
    build(s) {
      s._t = titulo(s, 'Você não vende pouco.<br><em>Você responde demais.</em>');
      const ph = celular(s);
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
      /* o título já está na tela no primeiro quadro, que vira a capa do Reels */
      entra(s._t, t, -.7, .8, 18);
      entraCel(s._ph, t, .15);
      /* mensagens caindo, uma a cada meio segundo */
      const t0 = .6, step = .48;
      s._rows.forEach((r, i) => {
        const a = t0 + i * step;
        const kk = F.outQuint(F.span(t, a, a + .3));
        r.style.opacity = kk; r.style.transform = `translateX(${(1 - kk) * -16}px)`;
      });
      const vis = Math.max(0, Math.min(s._rows.length, Math.floor((t - t0) / step) + 1));
      s._lista.style.transform = `translateY(${-Math.max(0, vis - 7) * 58}px)`;
      s._ct.textContent = Math.round(F.ease(F.span(t, .5, 5.4)) * 47) + ' hoje';
    }
  });

  /* ---------- 2 · do link da bio para a vitrine ---------- */
  L.push({
    id: 'v-vitrine', dur: 7.0,
    build(s) {
      s._t = titulo(s, 'Troque o link da bio<br><em>por uma vitrine.</em>');
      const ph = celular(s);
      s._lt = put(ph.screen, 'div', 'lt tela', `
        <div class="av"></div><div class="nick">@casaamare</div>
        <div class="bio">peças em tecido natural · BH</div>
        ${['Catálogo em PDF', 'WhatsApp', 'Instagram', 'Tabela de medidas', 'Como comprar', 'Frete e prazos']
          .map(x => `<div class="lk">${Draw.link(15)}<span>${x}</span></div>`).join('')}`);
      s._v = vitrine(ph.screen);
      s._v.pinta('#faf7f1', COR, 0);
      s._v.mv.style.opacity = 0;
      s._ph = ph;
      s._tg1 = posta(put(s, 'div', 'v-tag', 'Link da bio'), 452);
      s._tg2 = posta(put(s, 'div', 'v-tag', 'A sua vitrine'), 452);
      s._n1 = posta(put(s, 'div', 'v-nota', 'seis botões e nenhuma peça'), 1462);
      s._n2 = posta(put(s, 'div', 'v-nota', 'peça, preço e botão na mesma tela'), 1462);
    },
    update(s, t) {
      entra(s._t, t, .1);
      entraCel(s._ph, t, .3);
      const k = F.smooth(F.span(t, 3.0, 3.8));
      s._v.mv.style.opacity = k;
      s._lt.style.opacity = 1 - k;
      s._tg1.style.opacity = F.span(t, .8, 1.4) * (1 - k);
      s._tg2.style.opacity = k;
      s._n1.style.opacity = F.span(t, 1.3, 1.9) * (1 - F.smooth(F.span(t, 2.7, 3.2)));
      s._n2.style.opacity = F.span(t, 4.0, 4.6);
    }
  });

  /* ---------- 3 · monte a sua ---------- */
  const TROCAS = [
    { t: 1.5, ctrl: 'cor',   nome: 'Bordô',         fundo: '#faf7f1', cor: '#5e1f2b', letra: 0 },
    { t: 2.8, ctrl: 'fundo', nome: 'Areia',         fundo: '#efe5d7', cor: '#5e1f2b', letra: 0 },
    { t: 4.1, ctrl: 'letra', nome: 'Direto',        fundo: '#efe5d7', cor: '#5e1f2b', letra: 3 },
    { t: 5.4, ctrl: 'cor',   nome: 'Neptune Green', fundo: '#efe5d7', cor: '#3e8a80', letra: 3 }
  ];
  L.push({
    id: 'v-monte', dur: 7.5,
    build(s) {
      s._t = titulo(s, 'Monte a sua<br><em>e veja na hora.</em>');
      const ph = celular(s);
      s._v = vitrine(ph.screen);
      s._ph = ph;
      const box = posta(put(s, 'div', 'v-chips'), 1450);
      s._ch = {};
      [['cor', 'Cor', 'Muted Clay'], ['fundo', 'Fundo', 'Papel'], ['letra', 'Letra', 'Editorial']].forEach(([id, r, v]) => {
        const c = put(box, 'div', 'v-chip');
        put(c, 'i', null, r);
        c._b = put(c, 'b', null, v);
        c._v0 = v;
        s._ch[id] = c;
      });
      s._box = box;
    },
    update(s, t) {
      entra(s._t, t, .1);
      entraCel(s._ph, t, .2);
      entra(s._box, t, .7, 1.0, 16);
      /* estado da vitrine: a última troca já feita, com a cor passando em 0,35 s */
      let fundo = '#faf7f1', cor = COR, letra = 0, antes = null, quando = -9;
      const ultima = {};
      TROCAS.forEach(x => {
        if (x.t > t) return;
        antes = { fundo, cor }; quando = x.t;
        fundo = x.fundo; cor = x.cor; letra = x.letra;
        ultima[x.ctrl] = x;
      });
      if (antes) {
        const k = F.smooth(F.span(t, quando, quando + .35));
        fundo = S.blendHex(antes.fundo, fundo, k);
        cor = S.blendHex(antes.cor, cor, k);
      }
      s._v.pinta(fundo, cor, letra);
      /* o controle que acabou de mudar acende */
      Object.keys(s._ch).forEach(id => {
        const c = s._ch[id], x = ultima[id];
        c._b.textContent = x ? x.nome : c._v0;
        const aceso = TROCAS.some(y => y.ctrl === id && t >= y.t && t < y.t + 1.2);
        c.classList.toggle('on', aceso);
      });
    }
  });

  /* ---------- 4 · prévia grátis ---------- */
  L.push({
    id: 'v-previa', dur: 7.5,
    build(s) {
      s._t = titulo(s, 'Prévia grátis,<br><em>com cinco peças suas.</em>');
      const ph = celular(s);
      const wa = put(ph.screen, 'div', 'wa');
      const top = put(wa, 'div', 'top');
      put(top, 'div', 'av');
      put(top, 'div', null, '<div class="nm">Ateliê Digital</div><div class="st">online</div>');
      const msgs = put(wa, 'div', 'msgs');
      put(msgs, 'div', 'dia', 'hoje');
      s._conv = put(msgs, 'div', 'in', DATA.previa.convite);
      s._out = put(msgs, 'div', 'out', 'Casa Amaré — moda feminina, BH' +
        `<div class="anx">${DATA.previa.fotos.map(k => `<i style="background:${UI.mix('#d9f5c6', COR, .3)}">${Draw.croqui(k, COR)}</i>`).join('')}</div>` +
        '<div class="tm">5 fotos · enviado</div>');
      s._in = put(msgs, 'div', 'in', DATA.previa.resposta);
      [s._conv, s._out, s._in].forEach(n => { n.style.opacity = 0; });
      s._ph = ph;
      s._n = posta(put(s, 'div', 'v-nota', `${DATA.previa.prazo} · não gostou, não paga`), 1462);
    },
    update(s, t) {
      entra(s._t, t, .1);
      entraCel(s._ph, t, .2);
      entra(s._conv, t, .8, .7, 12);
      entra(s._out, t, 2.0, .7, 14);
      entra(s._in, t, 3.6, .7, 14);
      S.fade(s._n, F.span(t, 4.4, 5.0));
    }
  });

  /* ---------- 5 · quanto custa ---------- */
  L.push({
    id: 'v-preco', dur: 8.0,
    build(s) {
      s._t = titulo(s, 'Quanto custa', 250, 82);
      const box = posta(put(s, 'div', 'v-precos'), 420);
      s._linhas = [];
      DATA.precos.forEach((g, gi) => {
        const cab = put(box, 'div', 'cab' + (gi ? ' g2' : ''));
        put(cab, 'div', 'kicker', g.k);
        put(cab, 'div', 'sub', g.s);
        s._linhas.push(cab);
        g.itens.forEach(it => {
          const r = put(box, 'div', 'row');
          put(r, 'div', 't', it.t + (it.selo ? `<small>${it.selo}</small>` : ''));
          put(r, 'div', 'p', it.p + (it.u ? `<small>${it.u}</small>` : ''));
          s._linhas.push(r);
        });
      });
      s._pill = posta(put(s, 'div', 'v-pill', '<span>Você vê a prévia antes de pagar</span>'), 1330);
    },
    update(s, t) {
      entra(s._t, t, .1);
      S.rise(s._linhas.slice(0, 3), t, .5, .3, .9, 18);
      S.rise(s._linhas.slice(3), t, 2.2, .3, .9, 18);
      entra(s._pill, t, 4.2, 1.0, 14);
    }
  });

  /* ---------- 6 · o convite ---------- */
  L.push({
    id: 'v-cta', dur: 6.0,
    build(s) {
      s._k = posta(put(s, 'div', 'kicker v-k', 'Comece pela prévia grátis'), 500);
      s._t = titulo(s, 'Me manda<br>cinco peças.<br><em>Eu devolvo<br>a sua vitrine.</em>', 580, 112);
      s._p = posta(put(s, 'div', 'v-pill cheia',
        `<span>${Draw.whats('#faf7f1', 24)}Prévia grátis · ${DATA.previa.prazo}</span>`), 1150);
      s._s = posta(put(s, 'div', 'kicker v-k', 'chame no direct ou no WhatsApp'), 1270);
      s._m = posta(put(s, 'div', 'v-k'), 1350);
      Object.assign(s._m.style, { font: "italic 400 44px/1 'Playfair',serif", color: 'var(--ink)' });
      s._m.textContent = 'Ateliê Digital';
    },
    update(s, t) {
      S.fade(s._k, F.outQuint(F.span(t, .1, 1.0)));
      entra(s._t, t, .3, 1.4, 24);
      entra(s._p, t, 1.6, 1.0, 16);
      S.fade(s._s, F.span(t, 2.4, 3.2));
      S.fade(s._m, F.span(t, 2.8, 3.6));
    }
  });

  return L;
})();
