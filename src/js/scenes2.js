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
    caption: 'A cor vem em quatro grupos — e cada tom foi medido no código de uma marca de verdade.',
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
      s._nota = put(s, 'div', 'note', 'escolhido — a mesa já abre montada assim.');
      Object.assign(s._nota.style, { left: '110px', top: '918px', width: '700px', opacity: 0 });
    },
    update(s, t) {
      S.rise(s._th, t, .25, .11, .9, 26);
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
      s._th.forEach((n, i) => {
        const on = (i === 0 && t >= tc);
        n._sel.style.opacity = on ? F.out(F.span(t, tc, tc + .4)) : 0;
        const k = on ? F.out(F.span(t, tc, tc + .5)) : 0;
        n.style.transform = `translateY(${n.style.transform.includes('translateY') && t < 1.5 ? 0 : 0}px) scale(${1 + k * .02})`;
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

  /* ---------- 11 · de onde vêm as cores ---------- */
  S.list.push({
    id: 'atlas', num: '11', label: 'De onde vêm as cores', dur: 7.5,
    caption: 'As cores saíram do Atlas Cromático: medidas no código dos sites, não no olho.',
    build(s) {
      const n = put(s, 'div', 'nums');
      Object.assign(n.style, { left: '0', top: '206px' });
      s._n = DATA.numeros.map(x => {
        const d = put(n, 'div', 'num');
        const v = put(d, 'div', 'n', '0');
        put(d, 'div', 't', x.t);
        return { v, alvo: parseInt(x.n, 10), el: d };
      });
      const tons = put(s, 'div', 'tons');
      Object.assign(tons.style, { left: '205px', top: '536px' });
      const nomeados = [].concat(...DATA.grupos.map(g => g.cores))
        .filter(c => ['Muted Clay', 'Terracota', 'Red Mahogany', 'Bordô', 'Marinho', 'Púrpura',
                      'Acacia', 'Chartreuse', 'Neptune Green'].includes(c.nome));
      s._t = nomeados.map(c => {
        const d = put(tons, 'div', 'ton');
        const sw = put(d, 'div', 'sw'); sw.style.background = c.hex;
        put(d, 'div', 'nm', c.nome);
        put(d, 'div', 'hx', c.hex);
        return d;
      });
      s._leg = put(s, 'div', 'kicker', 'Carta Outono-Inverno 26/27 · 15 tons');
      Object.assign(s._leg.style, { position: 'absolute', left: '205px', top: '494px', opacity: 0 });
    },
    update(s, t) {
      s._n.forEach((x, i) => {
        const a = .2 + i * .2;
        const k = F.outQuint(F.span(t, a, a + 1.5));
        x.el.style.opacity = F.clamp(k * 2);
        x.v.textContent = Math.round(k * x.alvo);
      });
      S.fade(s._leg, F.span(t, 1.8, 2.5));
      S.rise(s._t, t, 2.0, .10, .9, 30);
    }
  });

  /* ---------- 12 · três degraus ---------- */
  S.list.push({
    id: 'degraus', num: '12', label: 'Três degraus', dur: 8.5,
    caption: 'Começa pela página que vende. Depois a marca inteira. Depois o acompanhamento.',
    build(s) {
      s._c = DATA.degraus.map((d, i) => {
        const c = put(s, 'div', 'step');
        Object.assign(c.style, { left: (110 + i * 580) + 'px', top: (438 - i * 74) + 'px' });
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
        const a = .3 + i * .55;
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
