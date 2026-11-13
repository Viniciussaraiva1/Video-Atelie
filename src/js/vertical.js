/* ---------------------------------------------------------------
   Corte vertical (1080×1920, 42 s) para Reels, Stories e Status
   do WhatsApp. É o mesmo argumento do filme principal, na ordem de
   quem rola o feed: o gancho no primeiro segundo, a vitrine, a
   prévia grátis, o preço e o convite. Cada cena tem uma frase só,
   grande, porque a maioria assiste sem som.

   O estilo é o do filme: letras táteis (massinha, papel-alumínio,
   uma bolha de plástico no cartaz final) e a cor mostrada como
   galeria em movimento, subindo pela tela numa espiral.
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
      s._t = put(s, 'div', 'cartaz v-cartaz', 'Você não vende pouco.<br>Você');
      posta(s._t, 236);
      s._r = S.letrasQueCaem(s, 'responde', { material: 'argila', cor: '#d4553c', tam: 150, fonte: 'massa', x: 0, y: 418 });
      s._d = S.letrasQueCaem(s, 'demais.', { material: 'argila', cor: '#d4553c', tam: 150, fonte: 'massa', x: 0, y: 580 });
      [s._r, s._d].forEach(b => { b.style.left = (540 - b._larg / 2) + 'px'; });
      const ph = celular(s, 920, 1.0);
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
      /* a massinha já assentou no primeiro quadro; ainda amassa um pouco no começo */
      S.cai(s._r, t, -1.0, .05, 90);
      S.cai(s._d, t, -.8, .05, 90);
      entraCel(s._ph, t, .3);
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

  /* ---------- 3 · a cor, em galeria ---------- */
  L.push({
    id: 'v-cor', dur: 8.5,
    build(s) {
      s._t = titulo(s, 'Escolha a cor<br><em>e veja na hora.</em>');
      const cores = [].concat(...DATA.grupos.map(g => g.cores));
      const itens = S.fotosDeCor(cores, 200, 240, 5);
      const grade = { cols: 4, w: 200, h: 240, gx: 26, gy: 72, z: 260, y: 160 };
      s._g = Galeria.cria(s, itens, {
        W: 1080, H: 1920,
        etapas: [
          { arranjo: 'linha', op: { x: 0, y: 1700, passo: 10, z: 200 } },
          { t: .1, arranjo: 'espiral', op: { eixo: 'y', raio: 290, largura: 960, passo: .55, vel: .35, sobe: 0, z: 150 }, passo: .05, dur: 1.2 },
          { t: 3.6, arranjo: 'grade', op: grade, passo: .04, dur: 1.1 },
          { t: 6.0, arranjo: 'destaque', op: { i: 0, x: 0, y: 40, z: -420, resto: 'grade', restoOp: grade, recua: 1200 }, passo: 0, dur: 1.0 }
        ],
        camera: t => ({ x: 0, y: -250 * (1 - F.smooth(F.span(t, 3.4, 4.6))), z: 0, giro: 0 }),
        foco: t => t < 3.5 ? F.lerp(-100, 200, F.smooth(F.span(t, .5, 3.4))) : (t < 6 ? 260 : -420), dof: .013,
        linha: t => .9 * F.smooth(F.span(t, .8, 1.6)) * (1 - F.smooth(F.span(t, 3.5, 4.1))),
        rotulos: t => 1 - F.smooth(F.span(t, 6.0, 6.5)) * .85,
        entrada: (i, t) => i === 0 ? 1 : 1 - .85 * F.smooth(F.span(t, 6.0, 6.8))
      });
      s._nome = S.letrasQueCaem(s, 'Muted Clay', { material: 'argila', cor: cores[0].hex, tam: 128, fonte: 'massa', x: 0, y: 1330 });
      s._nome.style.left = (540 - s._nome._larg / 2) + 'px';
      s._hx = posta(put(s, 'div', 'kicker v-k', 'c08a78 · terrosos · carta 26/27'), 1530);
    },
    update(s, t) {
      entra(s._t, t, .1);
      s._g.pose(t);
      S.cai(s._nome, t, 6.4, .05, 90);
      S.fade(s._hx, F.span(t, 7.0, 7.6));
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

  /* ---------- 6 · o convite: o cartaz ---------- */
  L.push({
    id: 'v-cta', dur: 6.5,
    build(s) {
      s.classList.add('cena-cartaz');
      const tipo = put(s, 'div', 'cartaz-fecho v-fecho', 'Me manda<br>cinco<br>peças.');
      const lente = put(s, 'div', 'lente');
      const tipo2 = tipo.cloneNode(true); lente.appendChild(tipo2);
      const bw = 560, bh = 480;
      const pts = Tatil.contorno(bw / 2, bh / 2, 200, 29, 80, .34);
      const bolha = Tatil.forma(bw, bh, g => { Tatil.tracaContorno(g, pts); g.fill(); },
        { material: 'vidro', cor: '#ffffff', tam: 280, sombraCor: '#5a1a0e', semente: 29 });
      bolha.className = 'bolha';
      s.appendChild(bolha);
      s._t = tipo; s._t2 = tipo2; s._lente = lente; s._bolha = bolha; s._pts = pts; s._bw = bw; s._bh = bh;
      s._dev = S.letrasQueCaem(s, 'Eu devolvo', { material: 'argila', cor: '#f3e7d3', tam: 112, fonte: 'massa', x: 70, y: 1010, sombraCor: '#5a1a0e', semente: 51 });
      s._sua = S.letrasQueCaem(s, 'a sua vitrine.', { material: 'argila', cor: '#f3e7d3', tam: 112, fonte: 'massa', x: 70, y: 1140, sombraCor: '#5a1a0e', semente: 57 });
      s._cta = put(s, 'div', 'cartaz-cta v-cta-pill', `${Draw.whats('#f3e7d3', 22)}<span>Prévia grátis · ${DATA.previa.prazo}</span>`);
      s._miu = [put(s, 'div', 'miudo v-m1', 'Ateliê Digital<br>vitrines para boutiques'),
                put(s, 'div', 'miudo v-m2', 'chame no direct<br>ou no WhatsApp')];
    },
    update(s, t) {
      const k = F.outQuint(F.span(t, .1, 1.2));
      s._t.style.opacity = k; s._t.style.transform = `translateY(${(1 - k) * 30}px)`;
      s._lente.style.opacity = k;
      const bx = 230 + Math.sin(t * .55 + .2) * 170, by = 300 + Math.cos(t * .45) * 160 + t * 18;
      const kb = F.outQuint(F.span(t, .5, 1.6));
      s._bolha.style.opacity = kb;
      s._bolha.style.transform = `translate(${bx.toFixed(1)}px,${by.toFixed(1)}px) scale(${(.9 + .1 * kb).toFixed(3)})`;
      const cx = bx + s._bw / 2, cy = by + s._bh / 2;
      s._lente.style.clipPath = `polygon(${s._pts.map(p => `${(p[0] + bx).toFixed(1)}px ${(p[1] + by).toFixed(1)}px`).join(',')})`;
      s._t2.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      s._t2.style.transform = `translateY(${((1 - k) * 30).toFixed(1)}px) scale(1.14)`;
      S.cai(s._dev, t, 1.2, .05, 90);
      S.cai(s._sua, t, 1.7, .05, 90);
      S.rise([s._cta], t, 2.6, 0, .9, 16);
      S.rise(s._miu, t, 3.0, .2, .8, 8);
    }
  });

  return L;
})();
