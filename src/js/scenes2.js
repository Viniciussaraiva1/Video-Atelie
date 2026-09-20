/* ---------------------------------------------------------------
   Cenas 03 a 12 e o fechamento. As seis primeiras usam a mesma
   composição da mesa de montagem, nas mesmas coordenadas: a
   dissolvência entre elas parece um plano só.
----------------------------------------------------------------*/
(() => {
  const S = SCENES, put = S.put, pt = S.pt, F = FX;

  /* ---------- 03 · a mesa de montagem ---------- */
  S.list.push(S.mesaScene({
    id: 'mesa', num: '03', label: 'A mesa de montagem', dur: 7.5,
    caption: 'Cinco controles de um lado, a sua página do outro. O que você mexe muda na hora.',
    semCursor: true, evs: [],
    extra(s, t, p, m) {
      const kb = F.outQuint(F.span(t, .15, 1.5));
      m.B.root.style.opacity = kb; m.B.root.style.transform = `translateY(${(1 - kb) * 26}px)`;
      const kp = F.outQuint(F.span(t, .7, 2.0));
      m.P.root.style.opacity = kp; m.P.root.style.transform = `translateY(${(1 - kp) * 22}px)`;
      ['fundo', 'cor', 'letra', 'espaco', 'home'].forEach((k, i) => {
        const kk = F.outQuint(F.span(t, 1.5 + i * .40, 1.5 + i * .40 + .9));
        m.P.ctrls[k].el.style.opacity = kk;
        m.P.ctrls[k].el.style.transform = `translateY(${(1 - kk) * 14}px)`;
      });
      m.cur.show(F.clamp(F.span(t, 5.5, 6.1)));
      const q = pt(m.P.ctrls.fundo.itens[1]);
      m.cur.path(t, [{ t: 5.5, x: 1060, y: 920 }, { t: 8.6, x: q.x, y: q.y }]);
    }
  }));

  /* ---------- 04 · fundo da página ---------- */
  S.list.push(S.mesaScene({
    id: 'fundo', num: '04', label: 'Fundo da página', dur: 8.0, foco: 'fundo',
    caption: 'O fundo é a primeira escolha: papel, areia, névoa ou carvão.',
    evs: [
      { t: 1.9, ctrl: 'fundo', i: 1 }, { t: 3.7, ctrl: 'fundo', i: 2 },
      { t: 5.5, ctrl: 'fundo', i: 3 }, { t: 7.4, ctrl: 'fundo', i: 0 }
    ]
  }));

  /* ---------- 05 · cor da marca ---------- */
  S.list.push(S.mesaScene({
    id: 'cor', num: '05', label: 'Cor da marca', dur: 11.5, foco: 'cor',
    caption: 'A cor vem em quatro grupos, e cada tom saiu de um estudo de tendências — não de um chute.',
    evs: [
      { t: 1.4, ctrl: 'grupo', i: 1 }, { t: 2.5, ctrl: 'cor', i: 1 },
      { t: 4.6, ctrl: 'grupo', i: 2 }, { t: 5.7, ctrl: 'cor', i: 3 },
      { t: 7.9, ctrl: 'grupo', i: 0 }, { t: 9.0, ctrl: 'cor', i: 0 }
    ]
  }));

  /* ---------- 06 · jeito da letra ---------- */
  S.list.push(S.mesaScene({
    id: 'letra', num: '06', label: 'Jeito da letra', dur: 8.5, foco: 'letra',
    caption: 'O jeito da letra troca o tom da loja sem mudar uma palavra do texto.',
    evs: [
      { t: 1.5, ctrl: 'letra', i: 1 }, { t: 3.3, ctrl: 'letra', i: 2 },
      { t: 5.1, ctrl: 'letra', i: 3 }, { t: 7.0, ctrl: 'letra', i: 0 }
    ]
  }));

  /* ---------- 07 · espaço entre as peças ---------- */
  S.list.push(S.mesaScene({
    id: 'espaco', num: '07', label: 'Espaço entre as peças', dur: 8.0, foco: 'espaco',
    caption: 'O espaço decide se a vitrine respira ou se enche os olhos de peça.',
    evs: [
      { t: 1.6, ctrl: 'espaco', i: 0 }, { t: 3.7, ctrl: 'espaco', i: 2 }, { t: 5.9, ctrl: 'espaco', i: 1 }
    ]
  }));

  /* ---------- 08 · o que entra na home ---------- */
  const evsHome = [
    { t: 1.0, ctrl: 'home', id: 'sobre', v: 1 },
    { t: 2.5, ctrl: 'home', id: 'clientes', v: 1 },
    { t: 4.1, ctrl: 'home', id: 'whats', v: 1 },
    { t: 5.6, ctrl: 'home', id: 'avise', v: 1 },
    { t: 7.1, ctrl: 'home', id: 'endereco', v: 1 },
    { t: 8.9, ctrl: 'home', id: 'avise', v: 0 }
  ];
  S.list.push(S.mesaScene({
    id: 'home', num: '08', label: 'O que entra na home', dur: 10.5, foco: 'home',
    caption: 'Você liga só os blocos que a sua loja usa. O que sobra sai da página.',
    evs: evsHome,
    scroll(m, st, t) {
      /* a prévia desliza até a seção que acabou de entrar */
      const ligas = evsHome.filter(e => e.v === 1);
      const i = ligas.filter(e => e.t <= t).length - 1;
      if (i < 0) return 0;
      const ant = i > 0 ? S.scrollPara(m, st, ligas[i - 1].id) : 0;
      return F.lerp(ant, S.scrollPara(m, st, ligas[i].id), F.smooth(F.span(t, ligas[i].t, ligas[i].t + .75)));
    }
  }));

  /* ---------- 09 · modelos prontos ---------- */
  S.list.push({
    id: 'modelos', num: '09', label: 'Modelos prontos', dur: 8.5,
    caption: 'Oito modelos por tipo de loja: dá para começar já montado e mexer depois.',
    build(s) {
      const g = put(s, 'div', 'thumbs');
      Object.assign(g.style, { left: '110px', top: '244px', width: '1700px' });
      s._th = DATA.modelos.map(mo => {
        const t = put(g, 'div', 'thumb');
        const L = DATA.letras[mo.letra];
        const escuro = UI.lum(mo.fundo) < .35;
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
          d.innerHTML = Draw.croqui(k, mo.cor);
        });
        const l1 = put(w, 'div', 'w-l'); l1.style.background = mo.cor; l1.style.width = '58%';
        const l2 = put(w, 'div', 'w-l'); l2.style.background = mo.cor; l2.style.width = '34%';
        l2.style.marginTop = '8px';
        put(t, 'div', 'nm', mo.nome);
        put(t, 'div', 'tp', 'modelo pronto');
        t._sel = put(t, 'div', 'sel');
        return t;
      });
      s._cur = UI.cursor(s);
      s._nota = put(s, 'div', 'kicker', 'Escolhido — a mesa já abre montada assim');
      Object.assign(s._nota.style, { position: 'absolute', left: '110px', top: '880px', opacity: 0 });
    },
    update(s, t) {
      const passeio = [3, 5, 1, 0];
      const pts = passeio.map((idx, i) => {
        const q = pt(s._th[idx]);
        return { t: 2.4 + i * .95, x: q.x + 40, y: q.y - 10 };
      });
      s._cur.show(F.clamp(F.span(t, 1.9, 2.4)));
      s._cur.path(t, pts);
      const tc = 2.4 + 3 * .95 + .2;
      const alvo = pt(s._th[0]);
      s._cur.click(t, tc, alvo.x + 40, alvo.y - 10, 16);
      /* entrada em cascata e destaque do escolhido no mesmo transform */
      s._th.forEach((n, i) => {
        const a = .25 + i * .11;
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

  /* ---------- 10 · briefing no WhatsApp ---------- */
  S.list.push({
    id: 'briefing', num: '10', label: 'Briefing no WhatsApp', dur: 11.0,
    caption: 'No fim, a própria página escreve o briefing e manda para mim no WhatsApp.',
    build(s) {
      const b = put(s, 'div', 'brief');
      Object.assign(b.style, { left: '110px', top: '236px', width: '790px', height: '600px' });
      put(b, 'div', 'h', 'Briefing gerado pela mesa');
      s._ln = DATA.briefing.map(() => put(b, 'div', 'ln', ''));
      s._btn = put(b, 'div', 'send', `${Draw.whats('#fff', 19)}<span>Mandar no WhatsApp</span>`);
      s._btn.style.opacity = 0;
      const ph = UI.phone(s, { x: 1288, y: 196, scale: 1.04 });
      const wa = put(ph.screen, 'div', 'wa');
      const top = put(wa, 'div', 'top');
      put(top, 'div', 'av');
      put(top, 'div', null, '<div class="nm">Ateliê Digital</div><div class="st">online</div>');
      const msgs = put(wa, 'div', 'msgs');
      put(msgs, 'div', 'dia', 'hoje');
      put(msgs, 'div', 'in', 'Monta na mesa do jeito que você quer e me manda o briefing por aqui.');
      s._out = put(msgs, 'div', 'out',
        DATA.briefing.slice(0, 6).join('<br>') + '<div class="tm">enviado</div>');
      s._out.style.opacity = 0;
      s._in = put(msgs, 'div', 'in', 'Recebi o briefing da Casa Amaré. Já começo a montar a prévia.');
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
      /* o briefing sendo escrito, letra por letra */
      const t0 = 1.1, vel = 54;
      let gasto = 0;
      DATA.briefing.forEach((txt, i) => {
        const ini = t0 + gasto, fim = ini + txt.length / vel;
        gasto += txt.length / vel + .10;
        const n = Math.floor(F.clamp(F.span(t, ini, fim)) * txt.length);
        s._ln[i].textContent = txt.slice(0, n);
        s._ln[i].style.opacity = t >= ini ? 1 : 0;
      });
      const fimTexto = t0 + gasto;
      S.fade(s._btn, F.span(t, fimTexto + .1, fimTexto + .7));
      /* clique em "mandar no WhatsApp" */
      const tc = fimTexto + 1.3;
      s._cur.show(F.clamp(F.span(t, fimTexto + .2, fimTexto + .7)) * (1 - F.span(t, tc + 1.2, tc + 1.8)));
      const q = pt(s._btn);
      s._cur.path(t, [{ t: fimTexto + .2, x: 980, y: 900 }, { t: tc - .1, x: q.x, y: q.y }]);
      s._cur.click(t, tc, q.x, q.y, 20);
      s._btn.style.transform = `scale(${1 - .03 * F.pulse(t, tc, tc + .3, .15)})`;
      const ko = F.outQuint(F.span(t, tc + .25, tc + .85));
      s._out.style.opacity = ko; s._out.style.transform = `translateY(${(1 - ko) * 14}px)`;
      const ki = F.outQuint(F.span(t, tc + 1.5, tc + 2.1));
      s._in.style.opacity = ki; s._in.style.transform = `translateY(${(1 - ki) * 14}px)`;
    }
  });

  /* ---------- 11 · como as cores são escolhidas ---------- */
  S.list.push({
    id: 'estudo', num: '11', label: 'De onde vêm as cores', dur: 9.5,
    caption: 'As cores não são chute: saem de um estudo de tendências que acompanha o que as marcas estão usando.',
    build(s) {
      const cores = [].concat(...DATA.grupos.map(g => g.cores));
      const passos = [
        { n: '01', t: 'As marcas', d: 'Vinte e oito marcas de moda acompanhadas temporada a temporada, das grandes às de ateliê.' },
        { n: '02', t: 'A cor de verdade', d: 'O tom é lido direto do código do site — o valor exato que a marca usa, não o que a foto faz parecer.' },
        { n: '03', t: 'O que se repete', d: 'Os tons que aparecem em muitas marcas ao mesmo tempo viram um movimento. Dezoito, nesta temporada.' }
      ];
      s._p = passos.map((x, i) => {
        const c = put(s, 'div', 'passo');
        Object.assign(c.style, { left: (110 + i * 600) + 'px', top: '214px' });
        put(c, 'div', 'n', x.n);
        const cx = put(c, 'div', 'cx');
        put(c, 'div', 't', x.t);
        put(c, 'div', 'd', x.d);
        c._cx = cx;
        return c;
      });

      /* 01 — seis sites em miniatura, cada um na sua cor */
      const g = put(s._p[0]._cx, 'div', 'minis');
      s._minis = [0, 5, 8, 11, 2, 13].map(k => {
        const cor = cores[k].hex;
        const m = put(g, 'div', 'mini');
        const b = put(m, 'div', 'b'); put(b, 'i'); put(b, 'i'); put(b, 'i');
        const cc = put(m, 'div', 'c');
        const l1 = put(cc, 'div', 'l'); l1.style.background = cor; l1.style.width = '64%';
        const l2 = put(cc, 'div', 'l'); l2.style.background = UI.mix('#ffffff', cor, .35); l2.style.width = '88%';
        const l3 = put(cc, 'div', 'l'); l3.style.background = UI.mix('#ffffff', cor, .22); l3.style.width = '46%';
        return m;
      });

      /* 02 — o tom saindo do código da página */
      const cod = put(s._p[1]._cx, 'div', 'codigo');
      s._lupa = put(s._p[1]._cx, 'div', 'lupa');
      s._lupa.style.top = '82px';
      cod.innerHTML = ':root {<br>&nbsp;&nbsp;--fundo: #faf7f1;<br>' +
        '&nbsp;&nbsp;--marca: <b id="hexlido"></b><br>&nbsp;&nbsp;--texto: #171614;<br>}';
      s._hex = cod.querySelector('#hexlido');
      s._alvo = '#c08a78;';

      /* 03 — os tons se juntando em famílias */
      const nv = put(s._p[2]._cx, 'div', 'nuvem');
      const grupos = [
        { base: '#c08a78', cx: 118, cy: 96, r: 62 },
        { base: '#3e8a80', cx: 300, cy: 74, r: 52 },
        { base: '#5b3a78', cx: 232, cy: 188, r: 50 }
      ];
      s._pts = [];
      grupos.forEach((gr, gi) => {
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2 + gi * 1.1;
          const d = gr.r * (.28 + .72 * ((k * 37) % 11) / 11);
          const pt = put(nv, 'div', 'pt');
          const tam = 15 + ((k * 23) % 9);
          Object.assign(pt.style, {
            width: tam + 'px', height: tam + 'px',
            left: (gr.cx + Math.cos(a) * d - tam / 2) + 'px',
            top: (gr.cy + Math.sin(a) * d - tam / 2) + 'px',
            background: k % 2 ? UI.mix(gr.base, '#ffffff', .10 + k * .04) : UI.mix(gr.base, '#171614', k * .03)
          });
          s._pts.push({ el: pt, gi, k });
        }
      });
      s._anel = put(nv, 'div', 'anel');
      Object.assign(s._anel.style, { left: '36px', top: '14px', width: '164px', height: '164px' });
      s._capa = put(nv, 'div', 'cap', 'movimento');
      Object.assign(s._capa.style, { left: '70px', top: '186px' });
    },
    update(s, t) {
      s._p.forEach((c, i) => {
        const a = .25 + i * .55;
        const k = F.outQuint(F.span(t, a, a + 1.0));
        c.style.opacity = k;
        c.style.transform = `translateY(${(1 - k) * 26}px)`;
      });
      /* 01 */
      S.rise(s._minis, t, 1.0, .09, .7, 14);
      /* 02 — o código sendo lido, caractere a caractere */
      const n = Math.floor(F.clamp(F.span(t, 2.3, 3.5)) * s._alvo.length);
      const txt = s._alvo.slice(0, n);
      s._hex.innerHTML = n >= s._alvo.length
        ? `<span class="chip" style="background:#c08a78"></span>${txt}` : txt;
      s._lupa.style.opacity = F.pulse(t, 2.1, 5.2, .5) * .9;
      /* 03 — os pontos aparecem e uma família se fecha */
      s._pts.forEach(p => {
        const a = 3.0 + p.gi * .35 + p.k * .055;
        const k = F.outQuint(F.span(t, a, a + .5));
        p.el.style.opacity = k;
        p.el.style.transform = `scale(${.4 + .6 * k})`;
      });
      s._anel.style.opacity = F.outQuint(F.span(t, 5.4, 6.1)) * .75;
      S.fade(s._capa, F.span(t, 5.8, 6.4));
    }
  });

  /* ---------- 12 · a carta da temporada ---------- */
  S.list.push({
    id: 'carta', num: '12', label: 'A carta da temporada', dur: 8.5,
    caption: 'O estudo fecha numa carta de quinze tons — é ela que abastece a lista do controle Cor da marca.',
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
      S.fade(s._leg, F.span(t, 1.6, 2.3));
      S.rise(s._t, t, 1.8, .09, .9, 28);
      S.fade(s._elo, F.span(t, 4.6, 5.4));
    }
  });

  /* ---------- 13 · radar de compras ---------- */
  const COR = { desce: '#3e8a80', sobe: '#b5644a', igual: 'rgba(23,22,20,.38)' };

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
    id: 'radar', num: '13', label: 'Radar de compras', dur: 12.5,
    caption: 'O mesmo estudo olha para o outro lado do balcão: o preço do que você compra, as ofertas e fornecedores novos.',
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

      /* ofertas encontradas */
      const A = put(s, 'div', 'achado');
      Object.assign(A.style, { left: '1210px', top: '206px', width: '600px' });
      put(A, 'div', 'h', 'Ofertas da semana');
      s._of = C.ofertas.map(o => {
        const row = put(A, 'div', 'arow');
        put(row, 'div', 't', o.peca);
        put(row, 'div', 's', o.forn);
        const pr = put(row, 'div', 'p');
        put(pr, 'span', 'de', o.de);
        put(pr, 'span', 'por', o.por);
        const ec = put(pr, 'span', 'ec', '');
        put(row, 'div', 's', o.nota).style.marginTop = '10px';
        return { el: row, ec, ganho: o.ganho };
      });
      s._A = A;

      /* fornecedores novos */
      const B = put(s, 'div', 'achado');
      Object.assign(B.style, { left: '1210px', top: '578px', width: '600px' });
      put(B, 'div', 'h', 'Fornecedores novos');
      s._nv = C.novos.map(n => {
        const row = put(B, 'div', 'arow');
        put(row, 'div', 't', n.nome);
        put(row, 'div', 's', `${n.seg} · ${n.cidade}`);
        put(row, 'div', 's', n.cond).style.marginTop = '10px';
        return row;
      });
      s._B = B;

      s._elo = put(s, 'div', 'elo', 'toda semana, sem você ter que procurar');
      Object.assign(s._elo.style, { left: '1210px', top: '900px', opacity: 0 });
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
      const kv = F.smooth(F.span(t, 3.3, 5.6));
      Object.assign(s._scan.style, {
        top: F.lerp(y0, y1, kv) + 'px',
        height: s._r[0].el.offsetHeight + 'px',
        opacity: F.pulse(t, 3.2, 6.0, .35) * .9
      });
      s._r.forEach((r, i) => {
        const tr = 3.3 + (i / (n - 1)) * 2.3 + .2;
        r.vr.style.opacity = F.span(t, tr, tr + .45);
      });

      /* as ofertas: a economia do lote é contada no lugar */
      const ka = F.outQuint(F.span(t, 5.5, 6.7));
      s._A.style.opacity = ka;
      s._A.style.transform = `translateY(${(1 - ka) * 22}px)`;
      s._of.forEach((o, i) => {
        const a = 5.8 + i * .55;
        const k = F.outQuint(F.span(t, a, a + .9));
        o.el.style.opacity = k;
        o.el.style.transform = `translateY(${(1 - k) * 14}px)`;
        const kc = F.ease(F.span(t, a + .5, a + 1.5));
        o.ec.textContent = kc > 0 ? `−R$ ${Math.round(kc * o.ganho)} no lote` : '';
        o.ec.style.opacity = F.span(t, a + .5, a + .8);
      });

      const kb = F.outQuint(F.span(t, 8.1, 9.3));
      s._B.style.opacity = kb;
      s._B.style.transform = `translateY(${(1 - kb) * 22}px)`;
      S.rise(s._nv, t, 8.4, .55, .9, 14);

      S.fade(s._elo, F.span(t, 10.3, 11.1));
    }
  });

  /* ---------- 14 · três degraus ---------- */
  S.list.push({
    id: 'degraus', num: '14', label: 'Três degraus', dur: 10.5,
    caption: 'Começa pela página que vende, depois a marca inteira. O estudo de cores e o radar de compras andam por fora, todo mês.',
    build(s) {
      s._c = DATA.degraus.map((d, i) => {
        const c = put(s, 'div', 'step');
        Object.assign(c.style, { left: (110 + i * 580) + 'px', top: (390 - i * 74) + 'px' });
        put(c, 'div', 'n', d.n);
        const bar = put(c, 'div', 'bar');
        bar.style.marginTop = '20px';
        put(c, 'div', 't', d.t);
        put(c, 'div', 'd', d.d);
        c._bar = bar;
        return c;
      });
      const ad = put(s, 'div', 'adic');
      s._ln = put(ad, 'div', 'ln');
      s._k = put(ad, 'div', 'kicker', 'Serviço adicional · assinatura mensal');
      s._k.style.marginTop = '24px';
      const g = put(ad, 'div', 'g');
      s._it = DATA.adicional.map(x => {
        const it = put(g, 'div', 'it');
        put(it, 'i').style.background = x.c;
        const cx = put(it, 'div');
        put(cx, 'div', 't', x.t);
        put(cx, 'div', 'd', x.d);
        return it;
      });
      s._ad = ad;
    },
    update(s, t) {
      s._c.forEach((c, i) => {
        const a = .3 + i * .55;
        const k = F.outQuint(F.span(t, a, a + 1.0));
        c.style.opacity = k;
        c.style.transform = `translateY(${(1 - k) * 28}px)`;
        c._bar.style.width = (F.ease(F.span(t, a + .35, a + 1.5)) * 498) + 'px';
      });
      s._ln.style.width = (F.ease(F.span(t, 3.4, 4.8)) * 1700) + 'px';
      S.fade(s._k, F.span(t, 4.2, 5.0));
      S.rise(s._it, t, 4.8, .55, 1.0, 20);
    }
  });

  /* ---------- fechamento ---------- */
  S.list.push({
    id: 'fecho', dur: 7.0, label: null, caption: null,
    build(s) {
      const c = put(s, 'div', 'center'); c.style.top = '318px';
      s._k = put(c, 'div', 'kicker', 'A mesa de montagem está aberta');
      s._t = put(c, 'div', 'display');
      Object.assign(s._t.style, { fontSize: '96px', marginTop: '40px', letterSpacing: '-.025em' });
      s._t.innerHTML = 'Monte a sua vitrine<br><em>antes de falar comigo.</em>';
      s._b = put(c, 'div');
      s._b.style.marginTop = '62px';
      s._b.innerHTML = '<span class="cta">Ateliê Digital · mesa de montagem</span>';
      s._s = put(c, 'div');
      Object.assign(s._s.style, {
        font: "400 15px/1 'PlexMono',monospace", letterSpacing: '.24em', textTransform: 'uppercase',
        color: 'rgba(23,22,20,.42)', marginTop: '38px'
      });
      s._s.textContent = 'o link vai junto com este vídeo';
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
