/* ---------------------------------------------------------------
   Peças de interface reaproveitadas pelas cenas: janela de
   navegador, prévia do site da boutique, painel da mesa de
   montagem, celular e cursor.
----------------------------------------------------------------*/
const FX = {
  clamp: (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v),
  /* progresso de t dentro da janela [a,b] */
  span(t, a, b) { return FX.clamp((t - a) / (b - a || 1e-6)); },
  ease: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: t => 1 - Math.pow(1 - t, 3),
  outQuint: t => 1 - Math.pow(1 - t, 5),
  smooth: t => t * t * (3 - 2 * t),
  lerp: (a, b, k) => a + (b - a) * k,
  /* aparece e some: 1 no meio da janela */
  pulse(t, a, b, fade = .5) {
    return Math.min(FX.span(t, a, a + fade), 1 - FX.span(t, b - fade, b));
  }
};

const UI = (() => {

  const hex2rgb = h => {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  /* mistura a com b; k=1 devolve b */
  const mix = (a, b, k) => {
    const A = hex2rgb(a), B = hex2rgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
  };
  const rgba = (h, a) => { const c = hex2rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  /* luminância relativa, para saber se a cor pede texto claro */
  const lum = h => { const c = hex2rgb(h).map(v => v / 255)
      .map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4));
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const put = (parent, tag, cls, html) => { const n = el(tag, cls, html); parent.appendChild(n); return n; };

  /* ---------------- janela de navegador ---------------- */
  function browser(scene, { x, y, w, h, url }) {
    const root = put(scene, 'div', 'browser');
    Object.assign(root.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    const bar = put(root, 'div', 'bar');
    for (let i = 0; i < 3; i++) put(bar, 'div', 'dot');
    const urlEl = put(bar, 'div', 'url', url);
    const vp = put(root, 'div', 'viewport');
    vp.style.height = (h - 44) + 'px';
    const page = put(vp, 'div', 'page');
    return { root, page, urlEl, vpH: h - 44, w };
  }

  /* ---------------- prévia do site da boutique ---------------- */
  function site(page, { loja, pecas, cards = 8 }) {
    const root = put(page, 'div', 'site');
    const head = put(root, 'div', 's-head');
    const brand = put(head, 'div', 's-brand', loja.nome);
    put(head, 'div', 's-nav', '<span>Vitrine</span><span>Sobre</span><span>Contato</span>');

    const hero = put(root, 'div', 's-hero');
    const kicker = put(hero, 'div', 's-kicker', 'Outono-Inverno 26/27');
    const h1 = put(hero, 'div', 's-h1', 'As peças da casa,<br>prontas para escolher.');
    const sub = put(hero, 'div', 's-sub',
      'Tamanho, preço e prazo escritos. Quem chega pelo Instagram decide sozinha e só chama para fechar.');

    const grid = put(root, 'div', 's-grid');
    const list = [];
    for (let i = 0; i < cards; i++) {
      const p = pecas[i % pecas.length];
      const c = put(grid, 'div', 'card');
      const art = put(c, 'div', 'art');
      const nm = put(c, 'div', 'nm', p.nome);
      const pr = put(c, 'div', 'pr', p.preco);
      list.push({ el: c, art, nm, pr, croqui: p.croqui });
    }

    /* seções opcionais — altura fixa para animar a entrada com precisão */
    const secs = {};
    const sec = (id, height, html) => {
      const s = put(root, 'div', 's-sec');
      s.dataset.sec = id;
      s.style.height = '0px'; s.style.opacity = 0;
      put(s, 'div', 'inner', html);
      secs[id] = { el: s, h: height };
      return s;
    };

    sec('sobre', 200, `<div class="s-t">Sobre a marca</div>
      <div class="s-p">${loja.nome} nasceu de uma sala com duas araras e uma régua de alfaiate.
      Hoje são peças em tecido natural, costuradas em lotes pequenos, feitas para durar mais de uma temporada.</div>`);

    sec('clientes', 252, `<div class="s-t">O que as clientes dizem</div>
      <div class="quotes">
        <div class="quote"><div class="st">★★★★★</div><div class="tx">Chegou em três dias e serviu igual à tabela de medidas.</div><div class="au">Marina · Uberlândia</div></div>
        <div class="quote"><div class="st">★★★★★</div><div class="tx">Comprei pelo site às onze da noite, sem precisar perguntar nada.</div><div class="au">Cris · Recife</div></div>
        <div class="quote"><div class="st">★★★★★</div><div class="tx">O casaco é ainda mais bonito pessoalmente. Já é o terceiro.</div><div class="au">Helô · Santos</div></div>
      </div>`);

    sec('whats', 150, `<div class="band"><div><div class="s-t" style="margin-bottom:6px;font-size:22px">Ficou com dúvida?</div>
      <div class="s-p" style="font-size:13px">A gente responde no WhatsApp, de segunda a sábado.</div></div>
      <div class="btn">${Draw.whats('#fff', 17)}<span>Falar com ${loja.nome}</span></div></div>`);

    sec('avise', 166, `<div class="band"><div style="flex:none"><div class="s-t" style="margin-bottom:6px;font-size:22px">Avise-me</div>
      <div class="s-p" style="font-size:13px">Peça esgotada? Avisamos quando voltar.</div></div>
      <div class="field"><div class="inp">seu e-mail ou WhatsApp</div><div class="btn"><span>Quero ser avisada</span></div></div></div>`);

    sec('endereco', 200, `<div class="s-t">Endereço</div>
      <div class="endr"><div class="s-p">Rua das Oficinas, 218 — loja 3<br>${loja.cidade}<br>
      Segunda a sexta, 10h às 19h · Sábado, 10h às 14h</div>
      <div class="map"><i style="left:0;top:38px;width:210px;height:3px"></i>
        <i style="left:0;top:78px;width:210px;height:2px"></i>
        <i style="left:62px;top:0;width:3px;height:112px"></i>
        <i style="left:148px;top:0;width:2px;height:112px"></i>
        <i style="left:88px;top:44px;width:16px;height:16px;border-radius:50%;background:#fff"></i></div></div>`);

    const foot = put(root, 'div', 's-foot',
      `<span>${loja.url}</span><span>Feito no Ateliê Digital</span>`);

    return { root, head, brand, kicker, h1, sub, grid, cards: list, secs, foot, _cor: null, _esp: null, loja };
  }

  /* aplica o estado da mesa de montagem na prévia */
  function applySite(S, st) {
    const f = st.fundo, cor = st.cor, L = st.letra, E = st.espaco;
    S.root.style.background = f.bg;
    S.root.style.color = f.fg;
    const escuro = lum(f.bg) < .35;

    /* tipografia */
    const head = `${L.it} ${L.peso} 1em ${L.fam}`;
    [[S.brand, 27], [S.h1, 52]].forEach(([n, base]) => {
      n.style.font = head; n.style.fontSize = (base * L.esc) + 'px';
      n.style.letterSpacing = L.ls; n.style.lineHeight = 1.05;
    });
    S.root.querySelectorAll('.s-t').forEach(n => {
      const base = n.style.fontSize === '22px' ? 22 : 26;
      n.style.font = head; n.style.fontSize = (base * L.esc) + 'px';
      n.style.letterSpacing = L.ls; n.style.lineHeight = 1.2;
    });
    S.kicker.style.color = cor.hex;
    S.kicker.style.opacity = escuro ? .95 : .8;

    /* densidade da vitrine */
    if (S._esp !== E.nome) {
      S.grid.style.gridTemplateColumns = `repeat(${E.cols},1fr)`;
      S.grid.style.gap = E.gap + 'px';
      S.cards.forEach((c, i) => {
        c.el.style.display = i < E.cols * 2 ? '' : 'none';
        c.art.style.height = E.card + 'px';
      });
      S._esp = E.nome;
    }

    /* cor da marca: croquis, fundos dos cards, botões, blocos */
    if (S._cor !== cor.hex + f.bg) {
      S.cards.forEach(c => {
        c.art.style.background = mix(f.bg, cor.hex, escuro ? .16 : .13);
        c.art.innerHTML = Draw.croqui(c.croqui, cor.hex);
      });
      S.root.querySelectorAll('.btn').forEach(b => {
        b.style.background = cor.hex;
        b.style.color = lum(cor.hex) > .6 ? '#171614' : '#fff';
      });
      S.root.querySelectorAll('.band').forEach(b => b.style.background = mix(f.bg, cor.hex, escuro ? .14 : .11));
      S.root.querySelectorAll('.quote').forEach(q => q.style.borderColor = rgba(cor.hex, .35));
      S.root.querySelectorAll('.map').forEach(m => m.style.background = mix(f.bg, cor.hex, .55));
      S._cor = cor.hex + f.bg;
    }

    /* seções ligadas/desligadas */
    let extra = 0;
    for (const id in S.secs) {
      const k = FX.clamp(st.on[id] == null ? 0 : st.on[id]);
      const s = S.secs[id];
      s.el.style.height = (s.h * k) + 'px';
      s.el.style.opacity = FX.clamp(k * 1.35);
      extra += s.h * k;
    }
    return extra;
  }

  /* ---------------- painel da mesa de montagem ---------------- */
  function panel(scene, { x, y, w, titulo = 'Mesa de montagem' }) {
    const root = put(scene, 'div', 'panel');
    Object.assign(root.style, { left: x + 'px', top: y + 'px', width: w + 'px' });
    put(root, 'h4', null, titulo);
    const api = { root, ctrls: {} };

    api.chips = (id, nome, itens) => {
      const c = put(root, 'div', 'ctrl');
      put(c, 'div', 'name', nome);
      const box = put(c, 'div', 'chips');
      const list = itens.map(t => put(box, 'div', 'chip', t));
      api.ctrls[id] = { el: c, itens: list, box };
      return api;
    };
    api.swatches = (id, nome, grupos) => {
      const c = put(root, 'div', 'ctrl');
      put(c, 'div', 'name', nome);
      const gbox = put(c, 'div', 'chips');
      const tabs = grupos.map(g => put(gbox, 'div', 'chip', g.grupo));
      gbox.style.marginBottom = '14px';
      const box = put(c, 'div', 'swatches');
      const sws = [];
      grupos.forEach(g => g.cores.forEach(k => {
        const s = put(box, 'div', 'sw'); s.style.background = k.hex;
        put(s, 'i'); s.dataset.grupo = g.grupo; sws.push({ el: s, cor: k, grupo: g.grupo });
      }));
      const tag = put(c, 'div', 'swtag', '');
      api.ctrls[id] = { el: c, tabs, sws, box, tag };
      return api;
    };
    api.checks = (id, nome, itens) => {
      const c = put(root, 'div', 'ctrl');
      put(c, 'div', 'name', nome);
      const box = put(c, 'div', 'checks');
      const list = itens.map(t => {
        const r = put(box, 'div', 'check');
        put(r, 'div', 'box', Draw.check(16));
        put(r, 'span', null, t.nome);
        return r;
      });
      api.ctrls[id] = { el: c, itens: list, box };
      return api;
    };
    return api;
  }

  /* ---------------- celular ---------------- */
  function phone(scene, { x, y, scale = 1 }) {
    const root = put(scene, 'div', 'phone');
    Object.assign(root.style, { left: x + 'px', top: y + 'px', transform: `scale(${scale})`, transformOrigin: '50% 50%' });
    put(root, 'div', 'notch');
    const screen = put(root, 'div', 'screen');
    return { root, screen };
  }

  /* ---------------- cursor ---------------- */
  function cursor(scene) {
    const el = put(scene, 'div'); el.id = 'cursor'; el.innerHTML = Draw.cursor();
    const rip = put(scene, 'div', 'ripple');
    return {
      el, rip,
      /* caminha por uma lista de pontos: [{t,x,y}] em tempo local da cena */
      path(t, pts) {
        if (!pts.length) return;
        if (t <= pts[0].t) { el.style.left = (pts[0].x - 3) + 'px'; el.style.top = (pts[0].y - 2) + 'px'; return; }
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i], b = pts[i + 1];
          if (t >= a.t && t <= b.t) {
            const k = FX.ease(FX.span(t, a.t, b.t));
            el.style.left = (FX.lerp(a.x, b.x, k) - 3) + 'px';
            el.style.top = (FX.lerp(a.y, b.y, k) - 2) + 'px';
            return;
          }
        }
        const z = pts[pts.length - 1];
        el.style.left = (z.x - 3) + 'px'; el.style.top = (z.y - 2) + 'px';
      },
      show(o) { el.style.opacity = o; },
      /* clique: anel que abre e some no instante tc */
      click(t, tc, x, y, r0 = 12) {
        const k = FX.span(t, tc, tc + .42);
        if (k <= 0 || k >= 1) { rip.style.opacity = 0; return 0; }
        const r = FX.lerp(r0, r0 + 26, FX.out(k));
        Object.assign(rip.style, {
          left: (x - r) + 'px', top: (y - r) + 'px', width: r * 2 + 'px', height: r * 2 + 'px',
          opacity: (1 - k) * .55
        });
        return 1 - k;
      }
    };
  }

  return { el, put, browser, site, applySite, panel, phone, cursor, mix, rgba, lum, hex2rgb };
})();
