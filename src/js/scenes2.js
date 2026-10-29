/* ---------------------------------------------------------------
   Cenas 03 a 11 e o fechamento. As três primeiras usam a mesma
   composição da mesa de montagem, nas mesmas coordenadas: a
   dissolvência entre elas parece um plano só.

   O filme é de venda, não de manual: a mesa passa rápido, e o
   tempo que sobra vai para a prévia grátis, o preço e o risco.
----------------------------------------------------------------*/
(() => {
  const S = SCENES, put = S.put, pt = S.pt, F = FX;
  const CTRLS = ['fundo', 'cor', 'letra', 'espaco', 'home'];

  /* ---------- 03 · a mesa de montagem ---------- */
  S.list.push(S.mesaScene({
    id: 'mesa', num: '03', label: 'A mesa de montagem', dur: 6.5,
    caption: 'Cinco controles de um lado, a sua página do outro. O que você mexe muda na hora.',
    cursorDe: 2.6, entrada: { t: 2.6, x: 1060, y: 920 },
    evs: [{ t: 3.7, ctrl: 'fundo', i: 1 }, { t: 4.7, ctrl: 'fundo', i: 3 }, { t: 5.8, ctrl: 'fundo', i: 0 }],
    extra(s, t, p, m) {
      const kb = F.outQuint(F.span(t, .15, 1.3));
      m.B.root.style.opacity = kb; m.B.root.style.transform = `translateY(${(1 - kb) * 26}px)`;
      const kp = F.outQuint(F.span(t, .5, 1.6));
      m.P.root.style.opacity = kp; m.P.root.style.transform = `translateY(${(1 - kp) * 22}px)`;
      /* os controles entram em cascata e, quando o cursor chega, o fundo ganha o destaque */
      const dim = F.smooth(F.span(t, 3.0, 3.45));
      CTRLS.forEach((k, i) => {
        const kk = F.outQuint(F.span(t, 1.0 + i * .30, 1.9 + i * .30));
        m.P.ctrls[k].el.style.opacity = kk * (k === 'fundo' ? 1 : 1 - .68 * dim);
        m.P.ctrls[k].el.style.transform = `translateY(${(1 - kk) * 14}px)`;
      });
    }
  }));

  /* ---------- 04 · cor e letra ---------- */
  S.list.push(S.mesaScene({
    id: 'cor', num: '04', label: 'Cor e letra', dur: 7.5,
    caption: 'A cor sai de uma carta de tendências; a letra muda o tom da loja sem mudar uma palavra.',
    focos: [{ t: -9, f: 'cor' }, { t: 4.3, f: 'letra' }],
    evs: [
      { t: 1.0, ctrl: 'grupo', i: 1 }, { t: 1.8, ctrl: 'cor', i: 1 },
      { t: 2.8, ctrl: 'grupo', i: 2 }, { t: 3.6, ctrl: 'cor', i: 3 },
      { t: 4.9, ctrl: 'letra', i: 1 }, { t: 5.9, ctrl: 'letra', i: 3 }, { t: 6.9, ctrl: 'letra', i: 0 }
    ]
  }));

  /* ---------- 05 · vitrine e seções ---------- */
  const evsHome = [
    { t: 4.2, ctrl: 'home', id: 'sobre', v: 1 },
    { t: 5.0, ctrl: 'home', id: 'clientes', v: 1 },
    { t: 5.8, ctrl: 'home', id: 'whats', v: 1 },
    { t: 6.6, ctrl: 'home', id: 'endereco', v: 1 }
  ];
  S.list.push(S.mesaScene({
    id: 'vitrine', num: '05', label: 'Vitrine e seções', dur: 8.0,
    caption: 'Mais respiro ou vitrine cheia — e só os blocos que a sua loja usa entram na página.',
    start: { ...S.ST0, gi: 2, ci: 3 },
    focos: [{ t: -9, f: 'espaco' }, { t: 3.6, f: 'home' }],
    evs: [
      { t: 1.0, ctrl: 'espaco', i: 0 }, { t: 2.0, ctrl: 'espaco', i: 2 }, { t: 3.0, ctrl: 'espaco', i: 1 },
      ...evsHome
    ],
    scroll(m, st, t) {
      /* a prévia desliza até a seção que acabou de entrar */
      const i = evsHome.filter(e => e.t <= t).length - 1;
      if (i < 0) return 0;
      const ant = i > 0 ? S.scrollPara(m, st, evsHome[i - 1].id) : 0;
      return F.lerp(ant, S.scrollPara(m, st, evsHome[i].id), F.smooth(F.span(t, evsHome[i].t, evsHome[i].t + .75)));
    }
  }));

  /* ---------- 06 · doze modelos prontos ---------- */
  S.list.push({
    id: 'modelos', num: '06', label: 'Doze modelos prontos', dur: 7.5,
    caption: 'Doze pontos de partida, um por tipo de loja. Escolha o seu e ajuste a partir dele.',
    build(s) {
      const g = put(s, 'div', 'thumbs seis');
      Object.assign(g.style, { left: '110px', top: '236px', width: '1700px' });
      s._th = DATA.modelos.map(mo => {
        const t = put(g, 'div', 'thumb');
        const L = DATA.letras[mo.letra];
        const escuro = UI.lum(mo.fundo) < .35;
        /* cor muito escura sobre fundo escuro some: o croqui clareia um pouco */
        const tinta = escuro && UI.lum(mo.cor) < .08 ? UI.mix(mo.cor, '#ffffff', .32) : mo.cor;
        const w = put(t, 'div', 'win');
        w.style.background = mo.fundo;
        w.style.color = escuro ? '#f4f1ea' : '#171614';
        const br = put(w, 'div', 'w-br', 'sua marca');
        br.style.font = `${L.it} ${L.peso} ${Math.round(16 * L.esc)}px ${L.fam}`;
        br.style.letterSpacing = L.ls;
        const gr = put(w, 'div', 'w-g');
        ['casaco', 'vestido', 'capa'].forEach(k => {
          const d = put(gr, 'div');
          d.style.background = UI.mix(mo.fundo, mo.cor, escuro ? .18 : .14);
          d.innerHTML = Draw.croqui(k, tinta);
        });
        const l1 = put(w, 'div', 'w-l'); l1.style.background = tinta; l1.style.width = '58%';
        const l2 = put(w, 'div', 'w-l'); l2.style.background = tinta; l2.style.width = '34%';
        l2.style.marginTop = '8px';
        put(t, 'div', 'nm', mo.nome);
        put(t, 'div', 'tp', 'modelo pronto');
        t._sel = put(t, 'div', 'sel');
        return t;
      });
      s._cur = UI.cursor(s);
      s._nota = put(s, 'div', 'kicker', 'Escolhido — a mesa já abre montada assim');
      Object.assign(s._nota.style, { position: 'absolute', left: '110px', top: '846px', opacity: 0 });
    },
    update(s, t) {
      const passeio = [3, 5, 8, 0];
      const pts = passeio.map((idx, i) => {
        const q = pt(s._th[idx]);
        return { t: 2.2 + i * .8, x: q.x + 36, y: q.y - 10 };
      });
      s._cur.show(F.clamp(F.span(t, 1.8, 2.2)));
      s._cur.path(t, pts);
      const tc = 2.2 + 3 * .8 + .2;
      const alvo = pt(s._th[0]);
      s._cur.click(t, tc, alvo.x + 36, alvo.y - 10, 16);
      /* entrada em cascata e destaque do escolhido no mesmo transform */
      s._th.forEach((n, i) => {
        const a = .2 + i * .07;
        const sobe = F.outQuint(F.span(t, a, a + .9));
        n.style.opacity = sobe;
        const on = (i === 0 && t >= tc);
        n._sel.style.opacity = on ? F.out(F.span(t, tc, tc + .4)) : 0;
        const k = on ? F.out(F.span(t, tc, tc + .5)) : 0;
        n.style.transform = `translateY(${(1 - sobe) * 26}px) scale(${1 + k * .02})`;
      });
      S.fade(s._nota, F.span(t, tc + .3, tc + 1.1));
    }
  });

  /* ---------- 07 · prévia grátis ---------- */
  S.list.push({
    id: 'previa', num: '07', label: 'Prévia grátis', dur: 11.0,
    caption: 'Você manda o que montou e cinco fotos. A vitrine volta pronta — e você só decide depois de ver.',
    build(s) {
      const cor = DATA.grupos[0].cores[0].hex;
      const b = put(s, 'div', 'brief');
      Object.assign(b.style, { left: '110px', top: '214px', width: '790px' });
      put(b, 'div', 'h', 'O que você manda');
      s._ln = DATA.briefing.map(() => put(b, 'div', 'ln', ''));
      const fo = put(b, 'div', 'fotos');
      s._ft = DATA.previa.fotos.map(k => {
        const f = put(fo, 'div', 'ft');
        f.style.background = UI.mix('#faf7f1', cor, .14);
        f.innerHTML = Draw.croqui(k, cor);
        return f;
      });
      s._fl = put(b, 'div', 'flg', 'cinco fotos de peças, do celular mesmo');
      s._btn = put(b, 'div', 'send', `${Draw.whats('#fff', 19)}<span>Pedir minha prévia grátis</span>`);
      s._btn.style.opacity = 0;

      const ph = UI.phone(s, { x: 1288, y: 196, scale: 1.04 });
      const wa = put(ph.screen, 'div', 'wa');
      const top = put(wa, 'div', 'top');
      put(top, 'div', 'av');
      put(top, 'div', null, '<div class="nm">Ateliê Digital</div><div class="st">online</div>');
      const msgs = put(wa, 'div', 'msgs');
      put(msgs, 'div', 'dia', 'hoje');
      s._conv = put(msgs, 'div', 'in', DATA.previa.convite);
      s._out = put(msgs, 'div', 'out',
        DATA.briefing.slice(0, 3).join('<br>') +
        `<div class="anx">${DATA.previa.fotos.map(k => `<i style="background:${UI.mix('#d9f5c6', cor, .3)}">${Draw.croqui(k, cor)}</i>`).join('')}</div>` +
        '<div class="tm">5 fotos · enviado</div>');
      s._out.style.opacity = 0;
      s._in = put(msgs, 'div', 'in', DATA.previa.resposta);
      s._in.style.opacity = 0;
      s._ph = ph; s._b = b;
      s._cur = UI.cursor(s);
    },
    update(s, t) {
      const kb = F.outQuint(F.span(t, .2, 1.4));
      s._b.style.opacity = kb; s._b.style.transform = `translateY(${(1 - kb) * 20}px)`;
      const kp = F.outQuint(F.span(t, .6, 1.9));
      s._ph.root.style.opacity = kp;
      s._ph.root.style.transform = `scale(1.04) translateY(${(1 - kp) * 22}px)`;
      S.rise([s._conv], t, 1.2, 0, .7, 12);
      /* o pedido sendo escrito, letra por letra */
      const t0 = 1.3, vel = 60;
      let gasto = 0;
      DATA.briefing.forEach((txt, i) => {
        const ini = t0 + gasto, fim = ini + txt.length / vel;
        gasto += txt.length / vel + .10;
        const n = Math.floor(F.clamp(F.span(t, ini, fim)) * txt.length);
        s._ln[i].textContent = txt.slice(0, n);
        s._ln[i].style.opacity = t >= ini ? 1 : 0;
      });
      const fimTexto = t0 + gasto;
      /* as cinco fotos entram uma a uma */
      S.rise(s._ft, t, fimTexto + .1, .12, .7, 16);
      S.fade(s._fl, F.span(t, fimTexto + .5, fimTexto + 1.1));
      const tb = fimTexto + 1.0;
      S.fade(s._btn, F.span(t, tb, tb + .5));
      /* clique em "pedir minha prévia" */
      const tc = tb + 1.1;
      s._cur.show(F.clamp(F.span(t, tb + .1, tb + .5)) * (1 - F.span(t, tc + 1.2, tc + 1.8)));
      const q = pt(s._btn);
      s._cur.path(t, [{ t: tb + .1, x: 980, y: 930 }, { t: tc - .1, x: q.x, y: q.y }]);
      s._cur.click(t, tc, q.x, q.y, 20);
      s._btn.style.transform = `scale(${1 - .03 * F.pulse(t, tc, tc + .3, .15)})`;
      const ko = F.outQuint(F.span(t, tc + .25, tc + .85));
      s._out.style.opacity = ko; s._out.style.transform = `translateY(${(1 - ko) * 14}px)`;
      const ki = F.outQuint(F.span(t, tc + 1.4, tc + 2.0));
      s._in.style.opacity = ki; s._in.style.transform = `translateY(${(1 - ki) * 14}px)`;
    }
  });

  /* ---------- 08 · cor com estudo ---------- */
  S.list.push({
    id: 'carta', num: '08', label: 'Cor com estudo', dur: 8.0,
    caption: 'Cada tom da mesa sai de um estudo de tendências: marcas lidas no código, não no achismo.',
    build(s) {
      const n = put(s, 'div', 'nums pq');
      Object.assign(n.style, { left: '0', top: '196px' });
      s._n = DATA.numeros.map(x => {
        const d = put(n, 'div', 'num');
        const v = put(d, 'div', 'n', '0');
        put(d, 'div', 't', x.t);
        return { v, alvo: parseInt(x.n, 10), el: d };
      });
      const tons = put(s, 'div', 'tons');
      Object.assign(tons.style, { left: '205px', top: '470px' });
      const nomeados = [].concat(...DATA.grupos.map(g => g.cores))
        .filter(c => ['Muted Clay', 'Terracota', 'Red Mahogany', 'Bordô', 'Marinho', 'Púrpura',
                      'Acacia', 'Chartreuse', 'Neptune Green'].includes(c.nome));
      s._t = nomeados.map(c => {
        const d = put(tons, 'div', 'ton');
        const sw = put(d, 'div', 'sw'); sw.style.background = c.hex; sw.style.height = '178px';
        put(d, 'div', 'nm', c.nome);
        put(d, 'div', 'hx', c.hex);
        return d;
      });
      s._leg = put(s, 'div', 'kicker', 'Carta Outono-Inverno 26/27 · 15 tons, 9 já batizados');
      Object.assign(s._leg.style, { position: 'absolute', left: '205px', top: '428px', opacity: 0 });
      s._elo = put(s, 'div', 'elo', 'os mesmos tons que aparecem lá na Cor da marca');
      Object.assign(s._elo.style, { left: '205px', top: '806px', opacity: 0 });
    },
    update(s, t) {
      s._n.forEach((x, i) => {
        const a = .2 + i * .18;
        const k = F.outQuint(F.span(t, a, a + 1.3));
        x.el.style.opacity = F.clamp(k * 2);
        x.v.textContent = Math.round(k * x.alvo);
      });
      S.fade(s._leg, F.span(t, 1.4, 2.1));
      S.rise(s._t, t, 1.6, .09, .9, 28);
      S.fade(s._elo, F.span(t, 4.2, 5.0));
    }
  });

  /* ---------- 09 · radar de compra ---------- */
  const COR = { desce: '#3e8a80', sobe: '#b5644a', igual: 'rgba(23,22,20,.38)' };
  const reais = n => 'R$ ' + n.toLocaleString('pt-BR');

  /* Linha do preço semana a semana. A faixa vertical é a da própria série,
     mas nunca menor que 14% do preço: assim preço parado desenha linha reta
     em vez de virar serra por causa de dois reais de diferença. */
  const spark = r => {
    const W = 300, H = 46, v = r.serie;
    const mn = Math.min(...v), mx = Math.max(...v), meio = (mn + mx) / 2;
    const amp = Math.max(mx - mn, meio * .14), pe = meio - amp / 2;
    const P = v.map((n, i) => [
      +(5 + i / (v.length - 1) * (W - 10)).toFixed(1),
      +(H - 7 - (n - pe) / amp * (H - 14)).toFixed(1)
    ]);
    const z = P[P.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}">
      <path class="l" d="M${P.map(p => p[0] + ' ' + p[1]).join(' L ')}" fill="none"
        stroke="${COR[r.dir]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${z[0]}" cy="${z[1]}" r="4.2" fill="${COR[r.dir]}" opacity="0"/></svg>`;
  };

  S.list.push({
    id: 'radar', num: '09', label: 'Radar de compra', dur: 11.5,
    caption: 'O preço do que você compra, as ofertas da semana e fornecedores novos. Neste exemplo, o mês pagou o radar três vezes.',
    build(s) {
      const C = DATA.compras;

      const p = put(s, 'div', 'radar');
      Object.assign(p.style, { left: '110px', top: '206px', width: '1020px' });
      put(p, 'div', 'h', 'O que a sua loja compra · oito semanas de preço');
      /* a varredura vem antes das linhas para que a última delas continue
         sendo o último div do painel, e perca a borda de baixo */
      s._scan = put(p, 'div', 'scan');
      s._r = C.radar.map(r => {
        const row = put(p, 'div', 'rrow');
        const id = put(row, 'div', 'id');
        put(id, 'div', 'pc', r.peca);
        put(id, 'div', 'fo', `${r.forn} · ${r.seg}`);
        const sp = put(row, 'div', 'spark', spark(r));
        const vr = put(row, 'div', 'vr', r.vr);
        vr.style.color = COR[r.dir];
        const linha = sp.querySelector('path.l');
        const len = linha.getTotalLength();
        linha.style.strokeDasharray = len;
        return { el: row, vr, linha, len, ponto: sp.querySelector('circle') };
      });
      s._p = p;

      /* ofertas encontradas, com o fornecedor novo no meio delas */
      const A = put(s, 'div', 'achado');
      Object.assign(A.style, { left: '1210px', top: '206px', width: '600px' });
      put(A, 'div', 'h', 'Achados do mês');
      s._of = C.ofertas.map(o => {
        const row = put(A, 'div', 'arow');
        put(row, 'div', 't', o.peca);
        put(row, 'div', 's' + (o.novo ? ' novo' : ''), o.forn);
        const pr = put(row, 'div', 'p');
        put(pr, 'span', 'de', o.de);
        put(pr, 'span', 'por', o.por);
        const ec = put(pr, 'span', 'ec', '');
        put(row, 'div', 's', o.nota).style.marginTop = '8px';
        return { el: row, ec, ganho: o.ganho };
      });
      s._A = A;

      /* a conta do mês: o que o radar achou contra o que ele custa */
      const B = put(s, 'div', 'conta');
      Object.assign(B.style, { left: '1210px', top: '742px', width: '600px' });
      const l1 = put(B, 'div', 'cl');
      put(l1, 'span', null, 'Economia achada no mês');
      s._eco = put(l1, 'b', null, 'R$ 0');
      const l2 = put(B, 'div', 'cl');
      put(l2, 'span', null, 'O radar custa');
      put(l2, 'b', 'custo', reais(C.mes.radar) + '/mês');
      s._sob = put(B, 'div', 'sobra',
        `sobram ${reais(C.mes.economia - C.mes.radar)} no caixa · ${(C.mes.economia / C.mes.radar).toFixed(0)}× o que custa`);
      s._B = B;
    },
    update(s, t) {
      const C = DATA.compras;
      const kp = F.outQuint(F.span(t, .15, 1.4));
      s._p.style.opacity = kp;
      s._p.style.transform = `translateY(${(1 - kp) * 24}px)`;

      /* as linhas de preço sendo desenhadas, uma abaixo da outra */
      const n = s._r.length;
      s._r.forEach((r, i) => {
        const a = .9 + i * .30;
        const k = F.outQuint(F.span(t, a, a + .9));
        r.el.style.opacity = k;
        r.el.style.transform = `translateY(${(1 - k) * 16}px)`;
        const kl = F.ease(F.span(t, a + .25, a + 1.25));
        r.linha.style.strokeDashoffset = r.len * (1 - kl);
        r.ponto.style.opacity = F.span(t, a + 1.15, a + 1.45);
      });

      /* a varredura desce pela lista e a variação de cada peça aparece atrás dela */
      const y0 = s._r[0].el.offsetTop, y1 = s._r[n - 1].el.offsetTop;
      const kv = F.smooth(F.span(t, 3.2, 5.3));
      Object.assign(s._scan.style, {
        top: F.lerp(y0, y1, kv) + 'px',
        height: s._r[0].el.offsetHeight + 'px',
        opacity: F.pulse(t, 3.1, 5.7, .35) * .9
      });
      s._r.forEach((r, i) => {
        const tr = 3.2 + (i / (n - 1)) * 2.1 + .2;
        r.vr.style.opacity = F.span(t, tr, tr + .45);
      });

      /* os achados: a economia de cada um é contada no lugar */
      const ka = F.outQuint(F.span(t, 5.0, 6.2));
      s._A.style.opacity = ka;
      s._A.style.transform = `translateY(${(1 - ka) * 22}px)`;
      s._of.forEach((o, i) => {
        const a = 5.3 + i * .5;
        const k = F.outQuint(F.span(t, a, a + .9));
        o.el.style.opacity = k;
        o.el.style.transform = `translateY(${(1 - k) * 14}px)`;
        const kc = F.ease(F.span(t, a + .5, a + 1.5));
        o.ec.textContent = kc > 0 ? `−${reais(Math.round(kc * o.ganho))}` : '';
        o.ec.style.opacity = F.span(t, a + .5, a + .8);
      });

      /* e a conta do mês fecha embaixo */
      const kb = F.outQuint(F.span(t, 7.6, 8.6));
      s._B.style.opacity = kb;
      s._B.style.transform = `translateY(${(1 - kb) * 18}px)`;
      const ke = F.ease(F.span(t, 8.0, 9.3));
      s._eco.textContent = reais(Math.round(ke * C.mes.economia / 5) * 5);
      S.fade(s._sob, F.span(t, 9.4, 10.0));
    }
  });

  /* ---------- 10 · quanto custa ---------- */
  S.list.push({
    id: 'precos', num: '10', label: 'Quanto custa', dur: 11.0,
    caption: 'Primeiro a vitrine, com pagamento único. Depois, se quiser, a temporada: mês a mês, sem fidelidade.',
    build(s) {
      s._g = DATA.precos.map((g, gi) => {
        const col = put(s, 'div', 'preco-g');
        Object.assign(col.style, { left: (110 + gi * 880) + 'px', top: '212px' });
        const cab = put(col, 'div', 'cab');
        put(cab, 'div', 'kicker', g.k);
        put(cab, 'div', 'sub', g.s);
        const cards = put(col, 'div', 'cards');
        const cs = g.itens.map(it => {
          const c = put(cards, 'div', 'pcard');
          if (it.selo) put(c, 'div', 'selo', it.selo);
          put(c, 'div', 't', it.t);
          put(c, 'div', 'p', it.p + (it.u ? `<small>${it.u}</small>` : ''));
          put(c, 'div', 'r');
          put(c, 'div', 'd', it.d);
          return c;
        });
        return { col, cab, cs };
      });
      s._seta = put(s, 'div', 'seta', '→');
      Object.assign(s._seta.style, { left: '930px', top: '412px' });
      const inc = put(s, 'div', 'inclusos');
      Object.assign(inc.style, { left: '110px', top: '690px', width: '1700px' });
      s._inc = DATA.inclusos.map(x => put(inc, 'span', null, x));
      s._incBox = inc;
    },
    update(s, t) {
      s._g.forEach((g, gi) => {
        const a = .3 + gi * 2.3;
        S.rise([g.cab], t, a, 0, .9, 18);
        S.rise(g.cs, t, a + .35, .4, 1.0, 26);
      });
      S.fade(s._seta, F.span(t, 2.2, 2.9));
      S.fade(s._incBox, F.smooth(F.span(t, 4.7, 5.3)));
      S.rise(s._inc, t, 5.0, .3, .8, 10);
    }
  });

  /* ---------- 11 · sem risco ---------- */
  S.list.push({
    id: 'risco', num: '11', label: 'Sem risco', dur: 8.0,
    caption: 'Você vê a vitrine antes, paga metade para começar e o resto só com a página no ar.',
    build(s) {
      s._c = DATA.semRisco.map((d, i) => {
        const c = put(s, 'div', 'step');
        Object.assign(c.style, { left: (110 + i * 580) + 'px', top: '370px' });
        put(c, 'div', 'n', d.n);
        const bar = put(c, 'div', 'bar');
        bar.style.marginTop = '20px';
        put(c, 'div', 't', d.t);
        put(c, 'div', 'd', d.d);
        c._bar = bar;
        return c;
      });
    },
    update(s, t) {
      s._c.forEach((c, i) => {
        const a = .3 + i * .7;
        const k = F.outQuint(F.span(t, a, a + 1.0));
        c.style.opacity = k;
        c.style.transform = `translateY(${(1 - k) * 28}px)`;
        c._bar.style.width = (F.ease(F.span(t, a + .35, a + 1.5)) * 498) + 'px';
      });
    }
  });

  /* ---------- fechamento ---------- */
  S.list.push({
    id: 'fecho', dur: 7.0, label: null, caption: null,
    build(s) {
      const c = put(s, 'div', 'center'); c.style.top = '300px';
      s._k = put(c, 'div', 'kicker', 'Comece pela prévia grátis');
      s._t = put(c, 'div', 'display');
      Object.assign(s._t.style, { fontSize: '96px', marginTop: '40px', letterSpacing: '-.025em' });
      s._t.innerHTML = 'Me manda cinco peças.<br><em>Eu devolvo a sua vitrine.</em>';
      s._b = put(c, 'div');
      s._b.style.marginTop = '62px';
      s._b.innerHTML = `<span class="cta">${Draw.whats('#171614', 20)}Prévia grátis · ${DATA.previa.prazo}</span>`;
      s._s = put(c, 'div');
      Object.assign(s._s.style, {
        font: "400 15px/1 'PlexMono',monospace", letterSpacing: '.24em', textTransform: 'uppercase',
        color: 'rgba(23,22,20,.42)', marginTop: '38px'
      });
      s._s.textContent = 'responda esta mensagem com as fotos';
    },
    update(s, t) {
      S.fade(s._k, F.outQuint(F.span(t, .2, 1.3)));
      const k = F.outQuint(F.span(t, .5, 2.1));
      s._t.style.opacity = k; s._t.style.transform = `translateY(${(1 - k) * 24}px)`;
      const kb = F.outQuint(F.span(t, 2.0, 3.2));
      s._b.style.opacity = kb; s._b.style.transform = `translateY(${(1 - kb) * 18}px)`;
      S.fade(s._s, F.span(t, 3.0, 4.0));
    }
  });
})();
