/* ---------------------------------------------------------------
   Cenas 03 a 11 e o fechamento.

   O filme é de venda, não de manual: a mesa passa rápido, e o
   tempo que sobra vai para a prévia grátis, o preço e o risco.
   A cor, os modelos e o estudo aparecem como galeria em movimento
   (as peças correm por uma espiral e se reorganizam em grade, anel
   ou linha), e as letras de destaque são táteis: massinha, pasta,
   papel-alumínio e uma bolha de plástico no cartaz final.
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

  /* ---------- 04 · a cor da marca, em galeria ---------- */
  S.list.push({
    id: 'cor', num: '04', label: 'A cor da marca', dur: 10.0,
    caption: 'Dezesseis tons em quatro famílias, todos tirados de um estudo de tendências. Você escolhe um e a vitrine inteira muda junto.',
    build(s) {
      const cores = [].concat(...DATA.grupos.map(g => g.cores.map(c => ({ ...c, grupo: g.grupo }))));
      const itens = S.fotosDeCor(cores, 250, 300, 5);
      itens.forEach((it, i) => {
        it.arq = `${S.slug(it.cor.grupo)}/${it.arq}`;
        if (i % 4 === 0) it.num = `${i + 1}  ·  ${it.cor.grupo}`;
      });
      const grade = { cols: 8, w: 250, h: 300, gx: 40, gy: 120, z: 520, y: 30 };
      s._g = Galeria.cria(s, itens, {
        etapas: [
          { arranjo: 'linha', op: { x: 2900, passo: 30, z: 200 } },
          { t: .15, arranjo: 'espiral', op: { raio: 400, largura: 1750, passo: .5, vel: .28, sobe: 170, z: 160 }, passo: .06, dur: 1.3 },
          { t: 4.5, arranjo: 'grade', op: grade, passo: .045, dur: 1.2 },
          { t: 7.0, arranjo: 'destaque', op: { i: 0, x: -470, y: 10, z: -330, resto: 'grade', restoOp: grade, recua: 1100 }, passo: 0, dur: 1.1 }
        ],
        camera: t => ({ x: Math.sin(t * .35) * 50 * (1 - F.smooth(F.span(t, 4.2, 5.4))), y: 60 * (1 - F.smooth(F.span(t, 4.2, 5.4))), z: 0, giro: -.05 * (1 - F.smooth(F.span(t, 4.2, 5.6))) }),
        foco: t => t < 4.4 ? F.lerp(-150, 240, F.smooth(F.span(t, .8, 4.2))) : (t < 7 ? 520 : -330),
        dof: .013,
        linha: t => .9 * F.smooth(F.span(t, .9, 1.8)) * (1 - F.smooth(F.span(t, 4.3, 5.0))),
        fios: t => .65 * F.smooth(F.span(t, 1.6, 2.6)) * (1 - F.smooth(F.span(t, 4.3, 4.9))), fiosDe: [8, 9, 10, 11, 12, 13, 14],
        ancora: t => [1330 + Math.sin(t) * 20, 1010],
        rotulos: t => 1 - F.smooth(F.span(t, 7.0, 7.6)) * .85,
        /* quando o tom é escolhido, os outros recuam e quase somem */
        entrada: (i, t) => i === 0 ? 1 : 1 - .82 * F.smooth(F.span(t, 7.0, 7.9)),
        soltos: [{ x: -700, y: -380, z: 100, tam: 34, cor: '#e04a6b' }, { x: 940, y: -60, z: 500, tam: 48, cor: '#1e2a8a' }]
      });
      /* o tom escolhido ganha o nome em massinha, na cor dele */
      const esc = cores[0];
      s._nome = S.letrasQueCaem(s, esc.nome, { material: 'argila', cor: esc.hex, tam: 132, fonte: 'massa', x: 900, y: 350 });
      s._hx = put(s, 'div', 'kicker ficha-k', `${esc.hex.slice(1)} · ${esc.grupo} · carta outono-inverno 26/27`);
      Object.assign(s._hx.style, { left: '912px', top: '560px', position: 'absolute' });
      s._fr = put(s, 'div', 'ficha-t', 'Escolhida: a vitrine inteira veste esta cor, dos botões ao fundo das peças.');
      Object.assign(s._fr.style, { left: '912px', top: '604px' });
    },
    update(s, t) {
      s._g.pose(t);
      S.cai(s._nome, t, 7.5, .05);
      S.fade(s._hx, F.span(t, 8.2, 8.8));
      S.rise([s._fr], t, 8.5, 0, .8, 12);
    }
  });

  /* ---------- 05 · letra e vitrine ---------- */
  const evsHome = [
    { t: 6.1, ctrl: 'home', id: 'sobre', v: 1 },
    { t: 6.8, ctrl: 'home', id: 'clientes', v: 1 },
    { t: 7.5, ctrl: 'home', id: 'whats', v: 1 }
  ];
  S.list.push(S.mesaScene({
    id: 'letra', num: '05', label: 'Letra e vitrine', dur: 8.5,
    caption: 'A letra muda o tom da loja sem mudar uma palavra. A vitrine respira ou enche, e só entra o bloco que você usa.',
    focos: [{ t: -9, f: 'letra' }, { t: 3.3, f: 'espaco' }, { t: 5.6, f: 'home' }],
    evs: [
      { t: 1.0, ctrl: 'letra', i: 1 }, { t: 1.9, ctrl: 'letra', i: 3 }, { t: 2.8, ctrl: 'letra', i: 0 },
      { t: 3.8, ctrl: 'espaco', i: 0 }, { t: 4.6, ctrl: 'espaco', i: 2 }, { t: 5.4, ctrl: 'espaco', i: 1 },
      ...evsHome
    ],
    scroll(m, st, t) {
      const i = evsHome.filter(e => e.t <= t).length - 1;
      if (i < 0) return 0;
      const ant = i > 0 ? S.scrollPara(m, st, evsHome[i - 1].id) : 0;
      return F.lerp(ant, S.scrollPara(m, st, evsHome[i].id), F.smooth(F.span(t, evsHome[i].t, evsHome[i].t + .7)));
    }
  }));

  /* ---------- 06 · doze modelos prontos, em anel ---------- */
  S.list.push({
    id: 'modelos', num: '06', label: 'Doze modelos prontos', dur: 8.0,
    caption: 'Doze pontos de partida, um por tipo de loja. Escolha o seu e ajuste a partir dele.',
    build(s) {
      const itens = DATA.modelos.map((mo, i) => {
        const el = document.createElement('div'); el.className = 'thumb';
        const L = DATA.letras[mo.letra];
        const escuro = UI.lum(mo.fundo) < .35;
        const tinta = escuro && UI.lum(mo.cor) < .08 ? UI.mix(mo.cor, '#ffffff', .32) : mo.cor;
        const w = put(el, 'div', 'win');
        Object.assign(w.style, { background: mo.fundo, color: escuro ? '#f4f1ea' : '#171614', height: '220px' });
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
        const l2 = put(w, 'div', 'w-l'); l2.style.background = tinta; l2.style.width = '34%'; l2.style.marginTop = '8px';
        el._sel = put(el, 'div', 'sel');
        return { el, w: 300, h: 220, arq: `${String(i + 1).padStart(2, '0')}_${S.slug(mo.nome)}.html` };
      });
      s._itens = itens;
      s._g = Galeria.cria(s, itens, {
        etapas: [
          { arranjo: 'anel', op: { raio: 660, vel: .42, incl: 70, y: -10, fase: 1.2, z: 420 } },
          { t: 3.4, arranjo: 'grade', op: { cols: 6, w: 300, h: 220, gx: 34, gy: 96, z: 380, y: -20 }, passo: .05, dur: 1.2 }
        ],
        camera: () => ({ x: 0, y: 0, z: 0, giro: 0 }),
        foco: t => F.lerp(-80, 380, F.smooth(F.span(t, 3.4, 4.8))), dof: .008,
        linha: t => .8 * F.smooth(F.span(t, .3, 1.2)) * (1 - F.smooth(F.span(t, 3.3, 4.0))),
        entrada: (i, t) => F.smooth(F.span(t, i * .05, .5 + i * .05))
      });
      s._nota = put(s, 'div', 'kicker', 'Escolhido — a mesa já abre montada assim');
      Object.assign(s._nota.style, { position: 'absolute', left: '110px', top: '846px', opacity: 0 });
    },
    update(s, t) {
      s._g.pose(t);
      /* o primeiro modelo é escolhido: anel em volta e um respiro de escala */
      const tc = 5.6, k = F.out(F.span(t, tc, tc + .5));
      s._itens[0].el._sel.style.opacity = k;
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
      s._ft = DATA.previa.fotos.map((k, i) => {
        const f = put(fo, 'div', 'ft');
        f.style.background = UI.mix('#faf7f1', cor, .14);
        f.innerHTML = Draw.croqui(k, cor);
        put(f, 'div', 'fn', `${i + 1}`);
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
    id: 'carta', num: '08', label: 'Cor com estudo', dur: 8.5,
    caption: 'Vinte e oito marcas lidas no código e cento e nove cores medidas: é daí que sai a carta de quinze tons da mesa.',
    build(s) {
      /* os números do estudo em papel-alumínio amassado */
      s._n = DATA.numeros.map((x, i) => {
        const cx = 330 + i * 420;
        const box = S.letrasQueCaem(s, x.n, { material: 'folha', tam: 150, fonte: 'cartaz', x: 0, y: 150, semente: 13 + i * 5 });
        box.style.left = (cx - box._larg / 2) + 'px';
        const lb = put(s, 'div', 'kicker num-k', x.t);
        Object.assign(lb.style, { left: (cx - 160) + 'px', top: '378px' });
        return { box, lb };
      });
      const cores = [].concat(...DATA.grupos.map(g => g.cores)).slice(0, 15);
      const itens = S.fotosDeCor(cores, 190, 230, 61);
      s._g = Galeria.cria(s, itens, {
        etapas: [
          { arranjo: 'espiral', op: { raio: 260, largura: 1650, passo: .58, vel: .4, sobe: 150, z: 120 } },
          { t: 4.7, arranjo: 'linha', op: { passo: 210, z: 330, y: 0 }, passo: .05, dur: 1.2 }
        ],
        camera: t => ({ x: Math.sin(t * .3) * 30, y: -120, z: 0, giro: -.04 }),
        foco: t => t < 4.6 ? F.lerp(-120, 200, F.smooth(F.span(t, .5, 4.5))) : 330, dof: .014,
        linha: t => .85 * F.smooth(F.span(t, .4, 1.4)),
        entrada: (i, t) => F.smooth(F.span(t, i * .04, .4 + i * .04)),
        soltos: [{ x: 880, y: 380, z: 0, tam: 30, cor: '#e3c14e' }]
      });
    },
    update(s, t) {
      s._g.pose(t);
      s._n.forEach((x, i) => {
        S.cai(x.box, t, .4 + i * .35, .08, 110);
        S.fade(x.lb, F.span(t, 1.0 + i * .35, 1.5 + i * .35));
      });
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
      const eco = Tatil.texto(reais(C.mes.economia), { material: 'pasta', cor: '#b9d23a', tam: 62, fonte: 'cartaz', sombraCor: '#000000', semente: 77 });
      eco.className = 'eco';
      eco.style.margin = `${-eco._pad}px ${-eco._pad}px ${-eco._pad}px 0`;
      l1.appendChild(eco);
      s._eco = eco;
      const l2 = put(B, 'div', 'cl');
      put(l2, 'span', null, 'O radar custa');
      put(l2, 'b', 'custo', reais(C.mes.radar) + '/mês');
      s._sob = put(B, 'div', 'sobra',
        `sobram ${reais(C.mes.economia - C.mes.radar)} no caixa · ${(C.mes.economia / C.mes.radar).toFixed(0)}× o que custa`);
      s._B = B;
    },
    update(s, t) {
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
      /* a pasta sai da bisnaga da esquerda para a direita */
      const ke = F.ease(F.span(t, 8.0, 9.3)), pad = s._eco._pad, lw = s._eco._lw;
      s._eco.style.clipPath = `inset(0 ${(s._eco.width - pad - lw * ke).toFixed(1)}px 0 0)`;
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
        Object.assign(c.style, { left: (110 + i * 580) + 'px', top: '300px' });
        const n = Tatil.texto(d.n, { material: 'folha', tam: 120, fonte: 'cartaz', semente: 31 + i * 9 });
        n.className = 'step-n';
        n.style.margin = `${-n._pad}px 0 ${-n._pad - 4}px ${-n._pad}px`;
        c.appendChild(n);
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

  /* ---------- fechamento: o cartaz ---------- */
  S.list.push({
    id: 'fecho', dur: 7.5, label: null, caption: null,
    build(s) {
      s.classList.add('cena-cartaz');
      const tipo = put(s, 'div', 'cartaz-fecho', 'Me manda<br>cinco<br>peças.');
      /* a lente: a mesma tipografia, ampliada, só dentro da bolha */
      const lente = put(s, 'div', 'lente');
      const tipo2 = tipo.cloneNode(true); lente.appendChild(tipo2);
      const bw = 660, bh = 560;
      const pts = Tatil.contorno(bw / 2, bh / 2, 236, 23, 80, .34);
      const bolha = Tatil.forma(bw, bh, g => { Tatil.tracaContorno(g, pts); g.fill(); },
        { material: 'vidro', cor: '#ffffff', tam: 320, sombraCor: '#5a1a0e', semente: 23 });
      bolha.className = 'bolha';
      s.appendChild(bolha);
      s._t = tipo; s._t2 = tipo2; s._lente = lente; s._bolha = bolha; s._pts = pts; s._bw = bw; s._bh = bh;

      s._dev = S.letrasQueCaem(s, 'Eu devolvo', { material: 'argila', cor: '#f3e7d3', tam: 104, fonte: 'massa', x: 1110, y: 560, sombraCor: '#5a1a0e', semente: 51 });
      s._sua = S.letrasQueCaem(s, 'a sua vitrine.', { material: 'argila', cor: '#f3e7d3', tam: 104, fonte: 'massa', x: 1110, y: 680, sombraCor: '#5a1a0e', semente: 57 });
      s._cta = put(s, 'div', 'cartaz-cta', `${Draw.whats('#171614', 22)}<span>Prévia grátis · ${DATA.previa.prazo}</span>`);
      s._miu = [
        put(s, 'div', 'miudo m1', 'Ateliê Digital<br>vitrines para boutiques'),
        put(s, 'div', 'miudo m2', 'responda esta mensagem<br>com cinco fotos de peças'),
        put(s, 'div', 'miudo m3', 'prévia / 001')
      ];
    },
    update(s, t) {
      const k = F.outQuint(F.span(t, .1, 1.2));
      s._t.style.opacity = k; s._t.style.transform = `translateY(${(1 - k) * 30}px)`;
      s._lente.style.opacity = k;
      /* a bolha passeia devagar por cima das palavras */
      const bx = 120 + Math.sin(t * .5 + .3) * 190 + t * 34, by = 170 + Math.cos(t * .4) * 140;
      const kb = F.outQuint(F.span(t, .5, 1.6));
      s._bolha.style.opacity = kb;
      s._bolha.style.transform = `translate(${bx.toFixed(1)}px,${by.toFixed(1)}px) scale(${(.9 + .1 * kb).toFixed(3)})`;
      const cx = bx + s._bw / 2, cy = by + s._bh / 2;
      s._lente.style.clipPath = `polygon(${s._pts.map(p => `${(p[0] + bx).toFixed(1)}px ${(p[1] + by).toFixed(1)}px`).join(',')})`;
      s._t2.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      s._t2.style.transform = `translate(${((1 - k) * 0).toFixed(1)}px,${((1 - k) * 30).toFixed(1)}px) scale(1.14)`;
      S.cai(s._dev, t, 1.4, .05, 90);
      S.cai(s._sua, t, 1.9, .05, 90);
      S.rise([s._cta], t, 2.8, 0, .9, 16);
      S.rise(s._miu, t, 3.2, .2, .8, 8);
    }
  });
})();
