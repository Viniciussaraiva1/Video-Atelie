/* Ateliê Digital — "como funciona"
 * Deterministic motion composition. Everything lives on one paused GSAP
 * timeline; the renderer calls window.seekTo(t) for every frame.
 * Scene boundaries sit on musical bars (80 BPM → 1 bar = 3 s).
 */
(async function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  const DURATION = 150;
  const S = {
    intro: [0, 6], s01: [6, 15], s02: [15, 27], s03: [27, 36], s04: [36, 45], s05: [45, 54],
    s06: [54, 63], s07: [63, 69], s08: [69, 81], s09: [81, 90], s10: [90, 102], s11: [102, 111],
    s12: [111, 120], s13: [120, 132], s14: [132, 141], outro: [141, 150],
  };
  const SFX = [];
  const sfx = (t, type, gain = 1) => SFX.push({ t: +t.toFixed(4), type, gain });

  /* ------------------------------------------------------------------ */
  /* garments                                                           */
  /* ------------------------------------------------------------------ */
  const HEAD = '<circle class="gs" cx="50" cy="10" r="5.5"/><path class="gs" d="M50 15.5 L50 22"/>';
  const LEGS = (y) => `<path class="gs" d="M46 ${y} L45 146 M54 ${y} L55 146"/>`;
  const SH = (d, o = 0.13) => `<path d="${d}" fill="rgba(0,0,0,${o})"/>`;
  const GAR = {
    casaco: HEAD + LEGS(128) + '<path class="gb" d="M36 26 Q50 22 64 26 L68 34 L66 128 L34 128 L32 34 Z"/>' + SH('M44 25 L50 52 L56 25 Z', .16) + SH('M32.6 74 L67.3 74 L67.2 79 L32.7 79 Z', .2) + SH('M58 86 L66 86 L66 128 L58 128 Z', .1) + '<circle cx="50" cy="76.5" r="1.4" fill="rgba(0,0,0,.3)"/>',
    vestido: HEAD + LEGS(123) + '<path class="gs" d="M43.5 20 L44.5 32 M56.5 20 L55.5 32"/><path class="gb" d="M42 31 L58 31 L57 58 L71 122 Q50 128 29 122 L43 58 Z"/>' + SH('M53.5 58 L57 58 L71 122 Q66 124 60 125 Z', .13) + '<path d="M47 62 L40 123 M52 62 L55 125" stroke="rgba(0,0,0,.12)" stroke-width=".7" fill="none"/>' + SH('M42.6 56 L57.4 56 L57.2 59 L42.8 59 Z', .18),
    tailleur: HEAD + '<path class="gs" d="M40 138 L40 146 M60 138 L60 146"/><path class="gb" d="M36 80 L64 80 L63 138 L53 138 L50 98 L47 138 L37 138 Z"/>' + SH('M53 96 L63.4 94 L63 138 L53 138 Z', .12) + '<path class="gb" d="M34 26 Q50 22 66 26 L68 36 L67 82 L33 82 L32 36 Z"/>' + SH('M44 25 L50 50 L56 25 Z', .16) + SH('M58 40 L67.6 38 L67 82 L58 82 Z', .09) + '<circle cx="50" cy="60" r="1.4" fill="rgba(0,0,0,.35)"/>',
    capa: HEAD + LEGS(128) + '<path class="gb" d="M39 32 L61 32 L77 126 Q50 132 23 126 Z"/>' + SH('M55 32 L61 32 L77 126 Q71 128 64 129 Z', .13) + '<path class="gb" d="M40 23 L60 23 L61.5 33 L38.5 33 Z"/>' + SH('M40 23 L60 23 L61.5 33 L38.5 33 Z', .2),
    midi: HEAD + LEGS(132) + '<path class="gs" d="M44 20 L44.5 30 M56 20 L55.5 30"/><path class="gb" d="M42 30 L58 30 L59 66 L63 132 L37 132 L41 66 Z"/>' + SH('M54 68 L59 68 L63 132 L57 132 Z', .13) + SH('M41 64 L59 64 L59.2 69 L40.8 69 Z', .22),
    blazer: HEAD + LEGS(104) + '<path class="gb" d="M33 26 Q50 22 67 26 L69 36 L68 104 L32 104 L31 36 Z"/>' + SH('M44 25 L50 56 L56 25 Z', .16) + SH('M59 40 L68.6 38 L68 104 L59 104 Z', .09) + '<path d="M36 86 L45 86 M55 86 L64 86" stroke="rgba(0,0,0,.3)" stroke-width=".8"/><circle cx="50" cy="66" r="1.4" fill="rgba(0,0,0,.35)"/>',
    saia: HEAD + LEGS(122) + '<path class="gb" d="M40 28 Q50 25 60 28 L61 60 L39 60 Z"/>' + SH('M40 28 Q50 25 60 28 L61 60 L39 60 Z', .08) + '<path class="gb" d="M38 60 L62 60 L75 122 L25 122 Z"/>' + SH('M38 60 L62 60 L62.4 65 L37.6 65 Z', .22) + SH('M55 65 L62.4 65 L75 122 L66 122 Z', .12),
    camisa: HEAD + LEGS(100) + '<path class="gb" d="M34 28 Q50 24 66 28 L71 42 L65 45 L65 100 L35 100 L35 45 L29 42 Z"/>' + SH('M58 44 L65 45 L65 100 L58 100 Z', .1) + '<path d="M44 26 L50 34 L56 26" stroke="rgba(0,0,0,.3)" stroke-width=".8" fill="none"/><g fill="rgba(0,0,0,.3)"><circle cx="50" cy="46" r="1.1"/><circle cx="50" cy="60" r="1.1"/><circle cx="50" cy="74" r="1.1"/><circle cx="50" cy="88" r="1.1"/></g>',
  };
  const garment = (k) => `<svg viewBox="0 0 100 150" preserveAspectRatio="xMidYMid meet">${GAR[k]}</svg>`;

  const PRODUCTS = [
    ['Casaco Amaré', 'R$ 689', 'casaco'], ['Vestido Lis', 'R$ 420', 'vestido'], ['Tailleur Nord', 'R$ 780', 'tailleur'],
    ['Capa Inverno', 'R$ 545', 'capa'], ['Vestido Midi', 'R$ 389', 'midi'], ['Blazer Alfaiate', 'R$ 612', 'blazer'],
    ['Saia Godê', 'R$ 298', 'saia'], ['Camisa Linho', 'R$ 259', 'camisa'], ['Casaco Duna', 'R$ 640', 'casaco'],
    ['Vestido Sol', 'R$ 399', 'vestido'], ['Capa Brisa', 'R$ 510', 'capa'], ['Blazer Terra', 'R$ 590', 'blazer'],
  ];

  const ICON_LINK = '<svg viewBox="0 0 16 16" fill="none" stroke="#8C857B" stroke-width="1.4"><path d="M6.5 9.5 L9.5 6.5"/><path d="M7.2 4.6 L8.6 3.2 a2.6 2.6 0 0 1 3.7 3.7 L10.9 8.3"/><path d="M8.8 11.4 L7.4 12.8 a2.6 2.6 0 0 1 -3.7 -3.7 L5.1 7.7"/></svg>';
  const ICON_CHAT = (c = '#fff', s = 15) => `<svg width="${s}" height="${s}" viewBox="0 0 16 16" fill="none" stroke="${c}" stroke-width="1.5"><path d="M8 1.8 a6.2 6.2 0 0 0 -5.4 9.3 L1.8 14.2 L5 13.4 A6.2 6.2 0 1 0 8 1.8 Z"/><path d="M5.8 5.6 c0 2.4 2 4.5 4.4 4.6" stroke-linecap="round"/></svg>`;

  /* ------------------------------------------------------------------ */
  /* build: chrome labels + captions                                    */
  /* ------------------------------------------------------------------ */
  const CHAPTERS = [
    ['01', 'O problema', 's01'], ['02', 'O link da bio', 's02'], ['03', 'A mesa de montagem', 's03'],
    ['04', 'Fundo da página', 's04'], ['05', 'Cor da marca', 's05'], ['06', 'Jeito da letra', 's06'],
    ['07', 'Espaço entre as peças', 's07'], ['08', 'O que entra na home', 's08'], ['09', 'Modelos prontos', 's09'],
    ['10', 'Briefing no WhatsApp', 's10'], ['11', 'De onde vêm as cores', 's11'], ['12', 'A carta da temporada', 's12'],
    ['13', 'Radar de compras', 's13'], ['14', 'Três degraus', 's14'],
  ];
  const CAPTIONS = {
    s01: 'A cliente chega pelo Instagram e pergunta o que já podia estar escrito na página.',
    s02: 'O link da bio manda a cliente para uma lista de links. A vitrine resolve na mesma tela.',
    s03: 'Cinco controles de um lado, a sua página do outro. O que você mexe muda na hora.',
    s04: 'O fundo é a primeira escolha: papel, areia, névoa ou carvão.',
    s05: 'A cor vem em quatro grupos, e cada tom saiu de um estudo de tendências — não de um chute.',
    s06: 'O jeito da letra troca o tom da loja sem mudar uma palavra do texto.',
    s07: 'O espaço decide se a vitrine respira ou se enche os olhos de peça.',
    s08: 'Você liga só os blocos que a sua loja usa. O que sobra sai da página.',
    s09: 'Oito modelos por tipo de loja: dá para começar já montado e mexer depois.',
    s10: 'No fim, a própria página escreve o briefing e manda para mim no WhatsApp.',
    s11: 'As cores não são chute: saem de um estudo de tendências que acompanha o que as marcas estão usando.',
    s12: 'O estudo fecha numa carta de quinze tons — é ela que abastece a lista do controle Cor da marca.',
    s13: 'O mesmo estudo olha para o outro lado do balcão: o preço do que você compra, as ofertas e fornecedores novos.',
    s14: 'Começa pela página que vende, depois a marca inteira. O estudo de cores e o radar de compras andam por fora, todo mês.',
  };
  const numWrap = $('#label .num-wrap'), titleWrap = $('#label .title-wrap');
  const labelEls = {};
  CHAPTERS.forEach(([n, t, k]) => {
    const a = el(`<span>${n}</span>`), b = el(`<span>${t}</span>`);
    numWrap.append(a); titleWrap.append(b); labelEls[k] = [a, b];
  });
  const capEls = {};
  for (const [k, txt] of Object.entries(CAPTIONS)) {
    const c = el(`<div class="caption">${txt.split(' ').map((w) => `<span class="w">${w} </span>`).join('')}</div>`);
    $('#captions').append(c); capEls[k] = c;
  }

  /* ------------------------------------------------------------------ */
  /* build: intro                                                       */
  /* ------------------------------------------------------------------ */
  const stIntro = $('#st-intro');
  stIntro.innerHTML = `
    <div class="kicker">Vitrines para quem vende pelo Instagram</div>
    <div class="title">${[...'Ateliê Digital'].map((c) => `<span class="ch">${c}</span>`).join('')}</div>
    <div class="hr"></div>
    <div class="sub">como funciona, do começo ao fim</div>`;

  /* ------------------------------------------------------------------ */
  /* build: 01 o problema                                               */
  /* ------------------------------------------------------------------ */
  const DMS = ['quanto custa?', 'tem no P?', 'faz entrega?', 'chega em quanto tempo?', 'tem em outra cor?', 'aceita pix?',
    'ainda tem?', 'qual o tamanho da manga?', 'manda o preço?', 'tem loja física?', 'qual o tecido?', 'tem tabela de medidas?',
    'parcela?', 'qual o prazo?', 'serve em quem veste 40?', 'tem foto no corpo?', 'tem no M?', 'faz troca?',
    'ainda tem o bege?', 'manda mais fotos?', 'quanto fica o frete?', 'qual o valor?', 'vocês têm site?', 'tem no G?'];
  const st01 = $('#st-01');
  st01.innerHTML = `
    <div class="abs hl" style="left:78px;top:282px;font-family:var(--serif);font-size:112px;line-height:1.03;letter-spacing:-.005em">
      <div class="ln">Você não vende</div><div class="ln">pouco.</div><div class="ln it">Você responde demais.</div>
    </div>
    <div class="phone" style="left:1326px;top:166px;width:366px;height:726px"><div class="screen">
      <div class="notch"></div>
      <div class="dm-head"><span>DIRECT</span><b class="cnt">1 HOJE</b></div>
      <div class="dm-list-clip"><div class="dm-list">
        ${DMS.map((m, i) => `<div class="dm" style="top:${i * 53}px"><div class="av"></div><div class="bub">${m}</div><div class="tm">${9 + Math.floor(i * 0.45)}h</div></div>`).join('')}
      </div></div>
    </div></div>`;

  /* ------------------------------------------------------------------ */
  /* build: 02 link da bio                                              */
  /* ------------------------------------------------------------------ */
  const st02 = $('#st-02');
  st02.innerHTML = `
    <div class="over" style="left:435px;width:330px;top:166px;text-align:center">Link da bio</div>
    <div class="over" style="left:1155px;width:330px;top:166px;text-align:center">A sua vitrine</div>
    <div class="phone ph-l" style="left:435px;top:206px;width:330px;height:664px"><div class="screen">
      <div class="notch"></div>
      <div class="lib"><div class="avatar"></div><div class="handle">@casaamare</div><div class="bio">peças em tecido natural · BH</div>
        ${['Catálogo em PDF', 'WhatsApp', 'Instagram', 'Tabela de medidas', 'Como comprar', 'Frete e prazos'].map((b) => `<div class="btn">${ICON_LINK}${b}</div>`).join('')}
      </div></div></div>
    <div class="phone ph-r" style="left:1155px;top:206px;width:330px;height:664px"><div class="screen">
      <div class="notch"></div>
      <div class="mv"><div class="top"><div class="logo">Casa Amaré</div><div class="tag">VITRINE</div></div>
        <h3>As peças da casa,<br>prontas para escolher.</h3>
        <div class="grid2">${PRODUCTS.slice(0, 4).map(([n, p, g]) => `<div class="it2"><div class="img">${garment(g)}</div><div class="n">${n}</div><div class="p">${p}</div></div>`).join('')}</div>
        <div class="cta">${ICON_CHAT()}Chamar para fechar</div>
      </div></div></div>
    <div class="note n-l" style="left:80px;top:604px;width:320px;text-align:right">seis botões e nenhuma peça: a cliente sai daqui para perguntar.</div>
    <div class="note n-r" style="left:1522px;top:604px;width:330px">peça, preço e botão na mesma tela: a cliente decide sozinha.</div>
    <svg class="abs vs" style="left:944px;top:522px" width="32" height="32" viewBox="0 0 32 32"><path d="M8 16 H24 M18 10 L24 16 L18 22" stroke="#B3ACA2" stroke-width="1.4" fill="none"/></svg>`;

  /* ------------------------------------------------------------------ */
  /* build: mesa de montagem (03–08)                                    */
  /* ------------------------------------------------------------------ */
  const PAL = {
    terrosos: [['Muted Clay', '#C08A78'], ['Terracota', '#B5644A'], ['Areia Queimada', '#C9A27A'], ['Argila', '#A9705B']],
    profundos: [['Red Mahogany', '#7B3230'], ['Bordô', '#5E1F2B'], ['Marinho', '#1E2A44'], ['Púrpura', '#5B3A78']],
    vivos: [['Acácia', '#E3C14E'], ['Chartreuse', '#C3D14A'], ['Lilás', '#C79BC8'], ['Neptune Green', '#3E8A80']],
  };
  const SWLABELS = ['Muted Clay · #C08A78', 'Red Mahogany · #7B3230', 'Bordô · #5E1F2B', 'Chartreuse · #C3D14A', 'Neptune Green · #3E8A80'];
  const pills = (key, arr) => `<div class="pills" data-g="${key}"><div class="thumb"></div>${arr.map((p) => `<div class="pill">${p}</div>`).join('')}</div>`;
  const chk = (label, on) => `<div class="chk"><div class="box"><div class="fill"></div><svg viewBox="0 0 16 16"><path d="M4 8.4 L7 11.2 L12.4 5.2" stroke="#fff" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="14" stroke-dashoffset="${on ? 0 : 14}"/></svg></div>${label}</div>`;
  const stMesa = $('#st-mesa');
  stMesa.innerHTML = `
    <div class="panel">
      <div class="ptitle">MESA DE MONTAGEM</div>
      <div class="grp" data-grp="fundo"><h4>Fundo da página</h4>${pills('fundo', ['Papel', 'Areia', 'Névoa', 'Carvão'])}</div>
      <div class="grp" data-grp="cor"><h4>Cor da marca</h4>${pills('cor', ['Terrosos', 'Profundos', 'Vivos', 'Neutros'])}
        <div class="swatches"><div class="swring"></div>${PAL.terrosos.map(([, c]) => `<div class="sw" style="background:${c}"></div>`).join('')}</div>
        <div class="swlabel">${SWLABELS.map((s) => `<span>${s.toUpperCase()}</span>`).join('')}</div></div>
      <div class="grp" data-grp="letra"><h4>Jeito da letra</h4>${pills('letra', ['Editorial', 'Minimalista', 'Suave', 'Direto'])}</div>
      <div class="grp" data-grp="espaco"><h4>Espaço entre as peças</h4>${pills('espaco', ['Muito espaço', 'Equilíbrio', 'Vitrine cheia'])}</div>
      <div class="grp" data-grp="home"><h4>O que entra na home</h4><div class="checks">
        ${chk('Vitrine', true)}${chk('Sobre a marca')}${chk('O que as clientes dizem')}${chk('WhatsApp')}${chk('Avise-me')}${chk('Endereço')}
      </div></div>
    </div>
    <div class="browser">
      <div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><div class="url">casaamare.com.br</div></div>
      <div class="viewport"><div class="page">
        <div class="pg-head">
          <div class="logo-v v-edit" style="font-size:31px">Casa Amaré</div>
          <div class="logo-v v-mini" style="font-size:25px;letter-spacing:.12em">Casa Amaré</div>
          <div class="logo-v v-suave" style="font-size:30px">Casa Amaré</div>
          <div class="logo-v v-direto" style="font-size:28px">Casa Amaré</div>
          <div class="nav">VITRINE SOBRE CONTATO</div>
        </div>
        <div class="pg-kicker">OUTONO-INVERNO 26/27</div>
        <div class="h1wrap">
          <div class="h1v v-edit">As peças da casa,<br>prontas para escolher.</div>
          <div class="h1v v-mini">As peças da casa,<br>prontas para escolher.</div>
          <div class="h1v v-suave">As peças da casa,<br>prontas para escolher.</div>
          <div class="h1v v-direto">As peças da casa,<br>prontas para escolher.</div>
        </div>
        <div class="pg-par">Tamanho, preço e prazo escritos. Quem chega pelo Instagram decide sozinha e só chama para fechar.</div>
        <div class="grid">${PRODUCTS.map(([n, p, g]) => `<div class="card"><div class="img">${garment(g)}</div><div class="n">${n}</div><div class="p">${p}</div></div>`).join('')}</div>
        <div class="secs" style="position:absolute;left:0;width:100%">
          <div class="sec" data-sec="sobre"><div class="in" style="top:20px"><h5>Sobre a marca</h5>
            <p>A Casa Amaré nasceu de uma sala com duas araras e uma régua de alfaiate. Hoje são peças em tecido natural, costuradas em lotes pequenos, feitas para durar mais de uma temporada.</p></div></div>
          <div class="sec" data-sec="clientes"><div class="in" style="top:30px"><h5>O que as clientes dizem</h5><div class="tests">
            <div class="test"><div class="stars">★★★★★</div><div class="q">Chegou em três dias e serviu igual à tabela de medidas.</div><div class="who">MARINA · UBERLÂNDIA</div></div>
            <div class="test"><div class="stars">★★★★★</div><div class="q">Comprei pelo site às onze da noite, sem precisar perguntar nada.</div><div class="who">CRIS · RECIFE</div></div>
            <div class="test"><div class="stars">★★★★★</div><div class="q">O casaco é ainda mais bonito pessoalmente. Já é o terceiro.</div><div class="who">HELÔ · SANTOS</div></div>
          </div></div></div>
          <div class="sec" data-sec="whats"><div class="in" style="top:20px"><div class="band"><div><div class="t1">Ficou com dúvida?</div><div class="t2">A gente responde no WhatsApp, de segunda a sábado.</div></div><div class="b">${ICON_CHAT()}Falar com Casa Amaré</div></div></div></div>
          <div class="sec" data-sec="avise"><div class="in" style="top:20px"><div class="band"><div><div class="t1">Avise-me</div><div class="t2">Peça esgotada? Avisamos quando voltar.</div></div><div class="inp">seu e-mail ou WhatsApp</div><div class="b">Quero ser avisada</div></div></div></div>
          <div class="sec" data-sec="endereco"><div class="in" style="top:30px"><h5>Endereço</h5><div class="addr">
            <div class="txt">Rua das Oficinas, 218 — loja 3<br>Belo Horizonte · MG<br>Segunda a sexta, 10h às 19h · Sábado, 10h às 14h</div>
            <div class="map"><i style="left:0;right:0;top:44px;height:6px"></i><i style="left:0;right:0;top:92px;height:4px"></i><i style="left:84px;top:0;bottom:0;width:6px"></i><i style="left:170px;top:0;bottom:0;width:4px"></i><b></b></div>
          </div></div></div>
          <div class="foot" style="position:relative;margin-top:30px"><span>CASAAMARE.COM.BR</span><span>FEITO NO ATELIÊ DIGITAL</span></div>
        </div>
      </div></div>
    </div>`;

  /* ------------------------------------------------------------------ */
  /* build: 09 modelos prontos                                          */
  /* ------------------------------------------------------------------ */
  const TPL = [
    ['Moda feminina', '#C08A78', '#F8F2EC', '#1A1917', ['casaco', 'vestido', 'capa']],
    ['Moda praia', '#3E8A80', '#EDF3F1', '#1A1917', ['camisa', 'vestido', 'capa']],
    ['Festa e noivas', '#5B3A78', '#F2EFF4', '#1A1917', ['midi', 'vestido', 'capa']],
    ['Infantil', '#C79BC8', '#F1E9DE', '#1A1917', ['camisa', 'vestido', 'saia']],
    ['Joias', '#E3C14E', '#1E1C1A', '#F2EEE8', ['midi', 'vestido', 'capa']],
    ['Brechó', '#7B3230', '#EFE5D8', '#1A1917', ['casaco', 'vestido', 'capa']],
    ['Calçados e bolsas', '#1E2A44', '#EEF0F2', '#1A1917', ['blazer', 'vestido', 'capa']],
    ['Plus size', '#5E1F2B', '#F7EFEF', '#1A1917', ['casaco', 'vestido', 'capa']],
  ];
  const st09 = $('#st-09');
  st09.innerHTML = TPL.map(([n, b, bg, ink, gs], i) => `
    <div class="tpl" style="left:${146 + (i % 4) * 412}px;top:${214 + Math.floor(i / 4) * 316}px;--brand:${b};--pagebg:${bg};--pageink:${ink}">
      <div class="mini"><div class="lg">sua marca</div><div class="row">${gs.map((g) => `<div>${garment(g)}</div>`).join('')}</div><div class="sk"></div><div class="sk2"></div></div>
      <div class="nm">${n}</div><div class="md">MODELO PRONTO</div>
    </div>`).join('') + '<div class="over chosen" style="left:146px;top:856px;font-size:13px">Escolhido — a mesa já abre montada assim</div>';
  $$('.tpl', st09)[0].append(el('<div class="ring"></div>'));

  /* ------------------------------------------------------------------ */
  /* build: 10 briefing                                                 */
  /* ------------------------------------------------------------------ */
  const BRIEF = ['Marca: Casa Amaré — moda feminina', 'Fundo da página: Papel', 'Cor da marca: Muted Clay #c08a78', 'Jeito da letra: Editorial',
    'Espaço entre as peças: Equilíbrio', 'Na home: vitrine, sobre a marca,', 'depoimentos, WhatsApp e endereço', 'Vitrine inicial: 12 peças'];
  const st10 = $('#st-10');
  st10.innerHTML = `
    <div class="brief"><div class="over" style="position:relative;font-size:11.5px;margin-bottom:22px">Briefing gerado pela mesa</div>
      ${BRIEF.map(() => '<div class="bl"></div>').join('')}
      <div class="wbtn">${ICON_CHAT('#fff', 18)}Mandar no WhatsApp</div></div>
    <div class="phone" style="left:1210px;top:160px;width:366px;height:740px"><div class="screen"><div class="notch"></div>
      <div class="wa"><div class="hd"><div class="av"></div><div><div class="nm">Ateliê Digital</div><div class="st">online</div></div></div>
        <div class="day">HOJE</div>
        <div class="wb in w1" style="top:156px">Monta na mesa do jeito que você quer e me manda o briefing por aqui.</div>
        <div class="wb out w2" style="top:238px">${BRIEF.join('<br>')}<span class="tk">enviado ✓✓</span></div>
        <div class="typing" style="top:452px"><i></i><i></i><i></i></div>
        <div class="wb in w3" style="top:452px">Recebi o briefing da Casa Amaré. Já começo a montar a prévia.</div>
      </div></div></div>`;
  const caret = el('<span class="caret"></span>');

  /* ------------------------------------------------------------------ */
  /* build: 11 de onde vêm as cores                                     */
  /* ------------------------------------------------------------------ */
  const LINECOLORS = ['#C08A78', '#5E1F2B', '#E3C14E', '#3E8A80', '#B5644A', '#8C857B'];
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const CLUSTERS = [['#C08A78', 118, 128, 9], ['#3E8A80', 350, 88, 7], ['#5B3A78', 300, 196, 7]];
  const dots = [];
  CLUSTERS.forEach(([c, cx, cy, n]) => { for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r = 8 + rnd() * 34; dots.push({ c, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * .9, sx: 30 + rnd() * 440, sy: 24 + rnd() * 210, r: 6 + rnd() * 4 }); } });
  const st11 = $('#st-11');
  st11.innerHTML = `
    <div class="st-card c1" style="left:160px"><div class="no">01</div><div class="box2">
      ${LINECOLORS.map((c, i) => `<div class="mini-site" style="left:${24 + (i % 3) * 158}px;top:${28 + Math.floor(i / 3) * 112}px"><span class="b3">●●●</span>
        <i class="ln" style="top:28px;width:72px;background:${c}"></i><i class="ln" style="top:40px;width:96px;background:${c};opacity:.45"></i><i class="ln" style="top:56px;width:58px;background:#E6E1D9"></i><i class="ln" style="top:66px;width:84px;background:#EFEBE4"></i></div>`).join('')}
      </div><h6>As marcas</h6><div class="d">Vinte e oito marcas de moda acompanhadas temporada a temporada, das grandes às de ateliê.</div></div>
    <div class="st-card c2" style="left:707px"><div class="no">02</div><div class="box2">
      <div class="code"><div class="hl"></div><span class="k">:root {</span>
  --fundo: <span class="v">#faf7f1</span>;
  --marca: <span class="csw"></span><span class="v">#c08a78</span>;
  --texto: <span class="v">#171614</span>;
<span class="k">}</span></div>
      </div><h6>A cor de verdade</h6><div class="d">O tom é lido direto do código do site — o valor exato que a marca usa, não o que a foto faz parecer.</div></div>
    <div class="st-card c3" style="left:1254px"><div class="no">03</div><div class="box2">
      <svg class="circ" style="left:0;top:0" width="506" height="262"><circle cx="118" cy="128" r="64" fill="none" stroke="#B9B2A7" stroke-width="1.3" stroke-dasharray="403" stroke-dashoffset="403"/></svg>
      ${dots.map((d) => `<div class="dot" style="width:${d.r * 2}px;height:${d.r * 2}px;background:${d.c};left:${d.x - d.r}px;top:${d.y - d.r}px"></div>`).join('')}
      <div class="over ctag" style="left:62px;top:212px;font-size:9.5px;letter-spacing:.26em">MOVIMENTO · TERROSOS</div>
      </div><h6>O que se repete</h6><div class="d">Os tons que aparecem em muitas marcas ao mesmo tempo viram um movimento. Dezoito, nesta temporada.</div></div>`;

  /* ------------------------------------------------------------------ */
  /* build: 12 carta da temporada                                       */
  /* ------------------------------------------------------------------ */
  const STATS = [[28, 'Marcas acompanhadas'], [109, 'Cores lidas no código'], [18, 'Movimentos de tendência'], [15, 'Tons na carta 26/27']];
  const CARTA = [['Muted Clay', '#c08a78'], ['Terracota', '#b5644a'], ['Red Mahogany', '#7b3230'], ['Bordô', '#5e1f2b'], ['Marinho', '#1e2a44'],
    ['Púrpura', '#5b3a78'], ['Acácia', '#e3c14e'], ['Chartreuse', '#c3d14a'], ['Neptune Green', '#3e8a80']];
  const st12 = $('#st-12');
  st12.innerHTML = STATS.map(([v, l], i) => `<div class="stat" style="left:${160 + i * 400}px"><div class="v">0</div><div class="l">${l.toUpperCase()}</div></div>`).join('') +
    '<div class="ct">CARTA OUTONO-INVERNO 26/27 · 15 TONS, 9 JÁ BATIZADOS</div>' +
    CARTA.map(([n, c], i) => { const cx = 280 + i * 170; return `<div class="bar" style="left:${cx - 26}px;background:${c}"></div><div class="bn" style="left:${cx - 85}px">${n}</div><div class="bh" style="left:${cx - 85}px">${c}</div>`; }).join('') +
    '<div class="cnote">os mesmos tons que aparecem no controle Cor da marca</div>';

  /* ------------------------------------------------------------------ */
  /* build: 13 radar de compras                                         */
  /* ------------------------------------------------------------------ */
  const RADAR = [
    ['Vestido midi em viscose', 'Atacado Vila Nova · Malharia', [30, 26, 30, 36, 34, 42, 46, 48], '−12%', '#3E8A80'],
    ['Alfaiataria em lã fria', 'Lanifício Trentino · Alfaiataria', [40, 42, 38, 37, 38, 33, 33, 30], '+6%', '#B5644A'],
    ['Linho tinto em peça', 'Tecidos Aurora · Tecelagem', [32, 28, 34, 36, 33, 38, 40, 40], '−8%', '#3E8A80'],
    ['Casaco de lã batida', 'Malharia São Bento · Inverno', [36, 37, 34, 36, 37, 35, 36, 35], 'igual', '#A39C92'],
    ['Aviamentos e botões', 'Casa Marfim · Aviamentos', [24, 26, 32, 34, 40, 43, 44, 44], '−21%', '#3E8A80'],
  ];
  const spark = (ys, c) => { const pts = ys.map((y, i) => `${8 + i * 43},${y}`).join(' '); const [lx, ly] = [8 + 7 * 43, ys[7]];
    return `<svg width="330" height="56" viewBox="0 0 330 56"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><circle cx="${lx}" cy="${ly}" r="4" fill="${c}"/></svg>`; };
  const st13 = $('#st-13');
  st13.innerHTML = `
    <div class="rcard rl" style="left:110px;top:176px;width:1010px;height:536px"><div class="hdr" style="position:absolute;left:42px;top:30px">O QUE A SUA LOJA COMPRA · OITO SEMANAS DE PREÇO</div>
      ${RADAR.map(([n, s, ys, d, c], i) => `<div class="rrow" style="top:${70 + i * 90}px"><div class="hl2"></div><div class="n">${n}</div><div class="s">${s.toUpperCase()}</div>${spark(ys, c)}<div class="dl" style="color:${c}">${d}</div>${i < 4 ? '<div class="sep"></div>' : ''}</div>`).join('')}
    </div>
    <div class="rcard ro" style="left:1170px;top:176px;width:640px;height:316px"><div class="hdr" style="position:absolute;left:32px;top:28px">OFERTAS DA SEMANA</div>
      <div class="of" style="top:70px"><div class="n">Vestido midi em viscose</div><div class="s">ATACADO VILA NOVA · LOTE DE 20 PEÇAS · ATÉ SEXTA</div><div class="pr"><span class="old">R$ 68</span><span class="new">R$ 60</span><span class="sv">−R$ 160 NO LOTE</span></div></div>
      <div class="of" style="top:190px"><div class="n">Aviamentos e botões</div><div class="s">CASA MARFIM · PEDIDO FECHADO DO MÊS</div><div class="pr"><span class="old">R$ 34</span><span class="new">R$ 27</span><span class="sv">−R$ 210 NO LOTE</span></div></div>
    </div>
    <div class="rcard rf" style="left:1170px;top:512px;width:640px;height:230px"><div class="hdr" style="position:absolute;left:32px;top:28px">FORNECEDORES NOVOS</div>
      <div class="of" style="top:68px"><div class="n">Tecelagem Brandão</div><div class="s">LINHO E ALGODÃO TINTO · BLUMENAU · SC</div><div class="s">MÍNIMO 15 M · ENTREGA EM 6 DIAS</div></div>
      <div class="of" style="top:148px"><div class="n">Fio Nobre</div><div class="s">FORROS E ENTRETELAS · AMERICANA · SP</div><div class="s">MÍNIMO 10 M · ENTREGA EM 4 DIAS</div></div>
    </div>
    <div class="note rn" style="left:1172px;top:768px;font-size:25px">toda semana, sem você ter que procurar.</div>`;

  /* ------------------------------------------------------------------ */
  /* build: 14 três degraus                                             */
  /* ------------------------------------------------------------------ */
  const STEPS = [['01', 'Página de venda', 'A vitrine no ar, com as peças, os preços e o botão do WhatsApp.'],
    ['02', 'Identidade e site', 'A cara da marca inteira: cores, letra, fotos e as páginas de dentro.'],
    ['03', 'Acompanhamento', 'Troca de coleção, leitura dos números e ajuste do que não converte.']];
  const st14 = $('#st-14');
  st14.innerHTML = STEPS.map(([n, t, d], i) => `<div class="step" style="left:${110 + i * 590}px;top:${472 - i * 76}px"><div class="no">${n}</div><div class="rl"></div><h6>${t}</h6><div class="d">${d}</div></div>`).join('') +
    `<div class="svc-rule"></div><div class="svc-t">SERVIÇO ADICIONAL · ASSINATURA MENSAL</div>
     <div class="svc" style="left:110px"><div class="h"><i style="background:#C08A78"></i>Cartela de cores e tendências</div><div class="d">A carta da temporada refeita a cada estação, abastecendo a lista da mesa.</div></div>
     <div class="svc" style="left:960px"><div class="h"><i style="background:#3E8A80"></i>Radar de compras</div><div class="d">O preço do que você compra, as ofertas da semana e fornecedores novos.</div></div>`;

  /* ------------------------------------------------------------------ */
  /* build: outro                                                       */
  /* ------------------------------------------------------------------ */
  $('#st-outro').innerHTML = `<div class="kicker">A mesa de montagem está aberta</div>
    <div class="l1">Monte a sua vitrine</div><div class="l2">antes de falar comigo.</div>
    <div class="pillwrap"><div class="pill">ATELIÊ DIGITAL · MESA DE MONTAGEM</div></div><div class="small">O LINK VAI JUNTO COM ESTE VÍDEO</div>`;

  /* ------------------------------------------------------------------ */
  /* fonts + measurement (before any tween touches transforms)          */
  /* ------------------------------------------------------------------ */
  await Promise.all(['400 20px "Playfair Display"', 'italic 400 20px "Playfair Display"', '300 20px Inter', '400 20px Inter', '500 20px Inter',
    '600 20px Inter', '700 20px Inter', '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'].map((f) => document.fonts.load(f, 'AaÂêçãõéíóúÔ')));
  await document.fonts.ready;

  const pt = (e, fx = 0.5, fy = 0.5) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width * fx, y: r.top + r.height * fy }; };
  const groups = {};
  $$('.pills', stMesa).forEach((g) => {
    const ps = $$('.pill', g);
    groups[g.dataset.g] = { el: g, pills: ps, thumb: $('.thumb', g), pos: ps.map((p) => ({ x: p.offsetLeft, w: p.offsetWidth })), pts: ps.map((p) => pt(p, 0.5, 0.62)) };
  });
  const swEls = $$('.sw', stMesa);
  const swPts = swEls.map((s) => pt(s, 0.6, 0.62));
  const swX = swEls.map((s) => s.offsetLeft - 4);
  const chkEls = $$('.chk', stMesa);
  const chkPts = chkEls.map((c) => pt($('.box', c), 0.62, 0.66));
  const tplEls = $$('.tpl', st09);
  const tplPts = tplEls.map((t) => pt($('.mini', t), 0.55, 0.55));
  const wbtn = $('.wbtn', st10);
  const wbtnPt = pt(wbtn, 0.62, 0.6);
  const w2 = $('.w2', st10);

  /* ------------------------------------------------------------------ */
  /* timeline helpers                                                   */
  /* ------------------------------------------------------------------ */
  gsap.ticker.lagSmoothing(0);
  const tl = gsap.timeline({ paused: true });
  const EXPO = 'expo.out';

  const reveal = (targets, t, o = {}) => tl.fromTo(targets,
    { autoAlpha: 0, y: o.y ?? 30, x: o.x ?? 0, scale: o.s ?? 1, filter: `blur(${o.blur ?? 8}px)` },
    { autoAlpha: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)', duration: o.d ?? 1.1, ease: o.ease ?? EXPO, stagger: o.st ?? 0.07 }, t);

  const showStage = (st, t) => tl.set(st, { visibility: 'visible' }, t);
  const hideStage = (st, t, o = {}) => {
    tl.to(st, { autoAlpha: 0, y: o.y ?? -26, filter: `blur(${o.blur ?? 7}px)`, duration: o.d ?? 0.55, ease: 'power2.in' }, t);
    sfx(t + 0.05, 'whoosh', o.whoosh ?? 1);
  };

  const captionIn = (k, t) => tl.fromTo($$('.w', capEls[k]), { opacity: 0, y: 16, filter: 'blur(6px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, ease: EXPO, stagger: 0.028 }, t);
  const captionOut = (k, t) => tl.to(capEls[k], { opacity: 0, y: -10, filter: 'blur(5px)', duration: 0.45, ease: 'power2.in' }, t);

  CHAPTERS.forEach(([, , k]) => gsap.set(labelEls[k], { yPercent: 115 }));
  const labelIn = (k, t) => tl.to(labelEls[k], { yPercent: 0, duration: 0.75, ease: EXPO, stagger: 0.06 }, t);
  const labelOut = (k, t) => tl.to(labelEls[k], { yPercent: -115, duration: 0.45, ease: 'power2.in', stagger: 0.04 }, t);

  // chapter switch = label + caption, sitting on the bar line
  const chapter = (k, prev) => {
    const t = S[k][0];
    if (prev) { labelOut(prev, t - 0.5); captionOut(prev, t - 0.5); }
    labelIn(k, t - 0.02);
    captionIn(k, t + 0.35);
  };

  /* cursor */
  const cursor = $('#cursor'), ripple = $('#ripple');
  gsap.set(cursor, { x: 1500, y: 900, autoAlpha: 0 });
  const cur = { x: 1500, y: 900 };
  const cPlace = (t, p) => { tl.set(cursor, { x: p.x - 3, y: p.y - 2 }, t); cur.x = p.x; cur.y = p.y; };
  const cShow = (t, p) => { cPlace(t, { x: p.x + 40, y: p.y + 60 }); tl.to(cursor, { autoAlpha: 1, duration: 0.3 }, t); cMove(t, p, 0.8); };
  const cHide = (t) => tl.to(cursor, { autoAlpha: 0, duration: 0.35 }, t);
  function cMove(t, p, d = 0.75) {
    const dist = Math.hypot(p.x - cur.x, p.y - cur.y);
    d = d ?? Math.min(1.1, 0.45 + dist / 1400);
    tl.to(cursor, { x: p.x - 3, duration: d, ease: 'power3.inOut' }, t);
    tl.to(cursor, { y: p.y - 2, duration: d, ease: 'power2.inOut' }, t); // unequal eases → gentle arc
    cur.x = p.x; cur.y = p.y;
    return t + d;
  }
  function cClick(t) {
    tl.to(cursor, { scale: 0.82, duration: 0.08, ease: 'power2.out' }, t)
      .to(cursor, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, t + 0.08);
    tl.set(ripple, { x: cur.x, y: cur.y, scale: 0.2, opacity: 0.55 }, t)
      .to(ripple, { scale: 1.25, opacity: 0, duration: 0.6, ease: 'power2.out' }, t);
    sfx(t, 'click');
  }
  // move then click, returns click time
  const cGo = (t, p, d = 0.75) => { const at = cMove(t, p, d); cClick(at + 0.02); return at + 0.02; };

  /* ================================================================== */
  /* INTRO                                                              */
  /* ================================================================== */
  showStage(stIntro, 0);
  tl.fromTo($('.kicker', stIntro), { autoAlpha: 0, letterSpacing: '0.9em' }, { autoAlpha: 1, letterSpacing: '0.42em', duration: 2.2, ease: 'expo.out' }, 0.25);
  tl.fromTo($$('.ch', stIntro), { autoAlpha: 0, y: 46, rotation: 4, filter: 'blur(10px)' },
    { autoAlpha: 1, y: 0, rotation: 0, filter: 'blur(0px)', duration: 1.5, ease: 'expo.out', stagger: 0.05 }, 0.55);
  tl.fromTo($('.hr', stIntro), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 1.5);
  reveal($('.sub', stIntro), 2.05, { y: 18, d: 1.3 });
  tl.fromTo(stIntro, { scale: 1 }, { scale: 1.035, duration: 6, ease: 'none' }, 0);
  hideStage(stIntro, 5.35, { y: -30, d: 0.6 });

  // chrome comes in with chapter 01
  tl.fromTo('#label .rule', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 5.7);
  tl.fromTo('#brand', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 5.8);
  tl.fromTo('#progress', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 5.8);
  tl.fromTo('#progress-fill', { scaleX: 0 }, { scaleX: 1, duration: 141 - 6, ease: 'none' }, 6);

  /* ================================================================== */
  /* 01 O PROBLEMA                                                      */
  /* ================================================================== */
  chapter('s01');
  showStage(st01, 5.85);
  const lines01 = $$('.ln', st01);
  reveal(lines01.slice(0, 2), 6.0, { y: 50, st: 0.12, d: 1.3 });
  reveal(lines01[2], 7.1, { y: 50, d: 1.4 });
  const ph01 = $('.phone', st01);
  reveal(ph01, 6.25, { x: 90, y: 0, blur: 6, d: 1.5 });
  tl.to(ph01, { y: -8, duration: 3.5, ease: 'sine.inOut', repeat: 1, yoyo: true }, 7.6);
  {
    const dms = $$('.dm', st01), list = $('.dm-list', st01), cnt = $('.cnt', st01);
    let t = 7.2;
    const counter = { n: 1 };
    dms.forEach((d, i) => {
      tl.fromTo($('.bub', d), { autoAlpha: 0, scale: 0.6, x: -6 }, { autoAlpha: 1, scale: 1, x: 0, duration: 0.5, ease: 'back.out(2.2)' }, t);
      tl.fromTo([$('.av', d), $('.tm', d)], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t);
      if (i >= 11) tl.to(list, { y: -(i - 10) * 53, duration: 0.42, ease: 'power3.out' }, t - 0.05);
      tl.to(counter, { n: i + 1, duration: 0.2, onUpdate: () => { cnt.textContent = `${Math.round(counter.n)} HOJE`; } }, t);
      sfx(t, 'pop', Math.max(0.35, 1 - i * 0.025));
      t += Math.max(0.15, 0.62 * Math.pow(0.86, i));
    });
    // the tally keeps climbing after the list is full
    tl.to(counter, { n: 47, duration: 1.1, ease: 'power2.in', onUpdate: () => { cnt.textContent = `${Math.round(counter.n)} HOJE`; } }, t);
  }
  hideStage(st01, 14.5);

  /* ================================================================== */
  /* 02 LINK DA BIO                                                     */
  /* ================================================================== */
  chapter('s02', 's01');
  showStage(st02, 14.9);
  const [ovL, ovR] = $$('.over', st02);
  const phL = $('.ph-l', st02), phR = $('.ph-r', st02);
  reveal(ovL, 15.05, { y: 12 });
  reveal(phL, 15.1, { y: 60, d: 1.4 });
  reveal([$('.avatar', phL), $('.handle', phL), $('.bio', phL)], 15.5, { y: 14, st: 0.08, blur: 4 });
  reveal($$('.btn', phL), 15.75, { y: 16, st: 0.09, blur: 4, d: 0.9 });
  reveal($('.n-l', st02), 17.1, { y: 16, d: 1.2 });
  reveal($('.vs', st02), 17.9, { x: -16, y: 0, d: 0.9 });
  reveal(ovR, 18.0, { y: 12 });
  reveal(phR, 18.1, { y: 60, d: 1.4 });
  reveal([$('.logo', phR), $('.tag', phR), $('h3', phR)], 18.5, { y: 14, st: 0.08, blur: 4 });
  reveal($$('.it2', phR), 18.8, { y: 20, s: 0.94, st: 0.1, blur: 4, d: 1 });
  reveal($('.cta', phR), 19.4, { y: 16, s: 0.9, blur: 3, d: 1, ease: 'back.out(1.6)' });
  reveal($('.n-r', st02), 20.3, { y: 16, d: 1.2 });
  tl.to(phL, { autoAlpha: 0.5, scale: 0.97, filter: 'saturate(0.35) blur(0px)', duration: 1.2, ease: 'power2.inOut' }, 21.6);
  tl.to($('.n-l', st02), { autoAlpha: 0.5, duration: 1.2 }, 21.6);
  tl.to(phR, { scale: 1.025, y: -6, duration: 1.4, ease: 'power2.inOut' }, 21.6);
  tl.to($('.cta', phR), { scale: 1.05, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 }, 22.8);
  hideStage(st02, 26.5);

  /* ================================================================== */
  /* 03–08 MESA DE MONTAGEM                                             */
  /* ================================================================== */
  const panel = $('.panel', stMesa), browser = $('.browser', stMesa), page = $('.page', stMesa);
  const grps = Object.fromEntries($$('.grp', stMesa).map((g) => [g.dataset.grp, g]));

  // initial selections
  const sel = { fundo: 0, cor: 0, letra: 0, espaco: 1 };
  Object.entries(sel).forEach(([g, i]) => {
    const G = groups[g];
    gsap.set(G.thumb, { x: G.pos[i].x, width: G.pos[i].w });
    G.pills.forEach((p, j) => gsap.set(p, { color: j === i ? '#FFFFFF' : '#5A5650' }));
  });
  gsap.set($('.swring', stMesa), { x: swX[0] });
  const swLabelEls = $$('.swlabel span', stMesa);
  gsap.set(swLabelEls, { autoAlpha: 0 }); gsap.set(swLabelEls[0], { autoAlpha: 1 });
  gsap.set(browser, { '--pagebg': '#FBF8F3', '--pageink': '#1A1917', '--pagemuted': '#6E6961', '--brand': '#C08A78' });
  const selectPill = (g, i, t) => {
    const G = groups[g];
    tl.to(G.thumb, { x: G.pos[i].x, width: G.pos[i].w, duration: 0.6, ease: 'expo.inOut' }, t);
    G.pills.forEach((p, j) => tl.to(p, { color: j === i ? '#FFFFFF' : '#5A5650', duration: 0.35, ease: 'power1.inOut' }, t + 0.1));
  };
  const focus = (name, t) => Object.entries(grps).forEach(([k, g]) => tl.to(g, { opacity: !name || k === name ? 1 : 0.3, duration: 0.6, ease: 'power2.inOut' }, t));
  let swLabelCur = 0;
  const swLabel = (i, t) => {
    if (i === swLabelCur) return;
    tl.to(swLabelEls[swLabelCur], { autoAlpha: 0, y: -6, duration: 0.25 }, t);
    tl.fromTo(swLabelEls[i], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t + 0.15);
    swLabelCur = i;
  };
  const brand = (c, t) => tl.to(browser, { '--brand': c, duration: 0.7, ease: 'power2.inOut' }, t);

  // grid layouts
  const LAYOUT = {
    muito: { cols: 2, gap: 40, imgH: 300, n: 4 }, equi: { cols: 3, gap: 26, imgH: 222, n: 6 }, cheia: { cols: 4, gap: 18, imgH: 168, n: 8 },
  };
  const cards = $$('.card', stMesa);
  const layoutProps = (L, i) => {
    const w = (1068 - L.gap * (L.cols - 1)) / L.cols;
    const col = i % L.cols, row = Math.floor(i / L.cols);
    return { left: col * (w + L.gap), top: row * (L.imgH + 62 + L.gap), width: w, h: L.imgH, show: i < L.n };
  };
  const applyLayout = (name, t) => {
    const L = LAYOUT[name];
    cards.forEach((c, i) => {
      const p = layoutProps(L, i);
      if (t == null) {
        gsap.set(c, { left: p.left, top: p.top, width: p.width, autoAlpha: p.show ? 1 : 0 });
        gsap.set($('.img', c), { height: p.h });
      } else {
        tl.to(c, { left: p.left, top: p.top, width: p.width, duration: 0.95, ease: 'expo.inOut' }, t + i * 0.012);
        tl.to($('.img', c), { height: p.h, duration: 0.95, ease: 'expo.inOut' }, t + i * 0.012);
        tl.to(c, { autoAlpha: p.show ? 1 : 0, duration: p.show ? 0.5 : 0.3, ease: 'power2.out' }, t + (p.show ? 0.35 : 0));
      }
    });
  };
  // page vertical rhythm (equilíbrio, 2 rows)
  const GRID_TOP = 360;
  $('.grid', stMesa).style.top = `${GRID_TOP}px`;
  applyLayout('equi');
  const gridH = 2 * (LAYOUT.equi.imgH + 62) + LAYOUT.equi.gap;
  const SECS_TOP = GRID_TOP + gridH + 40;
  $('.secs', stMesa).style.top = `${SECS_TOP}px`;
  const SEC_H = { sobre: 170, clientes: 262, whats: 132, avise: 132, endereco: 232 };
  const secEls = Object.fromEntries($$('.sec', stMesa).map((s) => [s.dataset.sec, s]));
  Object.values(secEls).forEach((s) => gsap.set(s, { height: 0 }));
  Object.values(secEls).forEach((s) => gsap.set($('.in', s), { autoAlpha: 0, y: 24 }));

  // font variants
  const variants = ['v-edit', 'v-mini', 'v-suave', 'v-direto'].map((v) => $$(`.${v}`, browser));
  variants.forEach((vs, i) => gsap.set(vs, { autoAlpha: i === 0 ? 1 : 0 }));
  let fontCur = 0;
  const setFont = (i, t) => {
    tl.to(variants[fontCur], { autoAlpha: 0, y: -6, filter: 'blur(3px)', duration: 0.3, ease: 'power2.in' }, t);
    tl.fromTo(variants[i], { autoAlpha: 0, y: 8, filter: 'blur(4px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: EXPO, immediateRender: false }, t + 0.18);
    fontCur = i;
  };

  // --- 03 enter
  chapter('s03', 's02');
  showStage(stMesa, 26.9);
  reveal(panel, 27.05, { x: -60, y: 0, d: 1.5 });
  reveal([$('.ptitle', panel), ...Object.values(grps)], 27.35, { y: 18, st: 0.08, blur: 4, d: 1 });
  reveal(browser, 27.3, { x: 70, y: 0, d: 1.6 });
  reveal([$('.pg-head', browser), $('.pg-kicker', browser), $('.h1wrap', browser), $('.pg-par', browser)], 27.8, { y: 22, st: 0.09, blur: 5 });
  reveal(cards.slice(0, 6), 28.3, { y: 36, s: 0.97, st: 0.07, blur: 5, d: 1.2 });
  // a gentle "breathing" of the brand to show the live link: pulse the chosen swatch ring
  tl.fromTo($('.swring', stMesa), { scale: 1 }, { scale: 1.12, duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }, 31.8);

  // --- 04 fundo
  chapter('s04', 's03');
  focus('fundo', 36.0);
  const BG = [
    { '--pagebg': '#FBF8F3', '--pageink': '#1A1917', '--pagemuted': '#6E6961' },
    { '--pagebg': '#F1E8DA', '--pageink': '#1A1917', '--pagemuted': '#6E6961' },
    { '--pagebg': '#ECEEEC', '--pageink': '#1A1917', '--pagemuted': '#676B6B' },
    { '--pagebg': '#1E1C1A', '--pageink': '#F2EEE8', '--pagemuted': '#A8A197' },
  ];
  const setBg = (i, t) => { selectPill('fundo', i, t); tl.to(browser, { ...BG[i], duration: 0.8, ease: 'power2.inOut' }, t + 0.05); };
  cShow(36.3, groups.fundo.pts[1]);
  setBg(1, cGo(37.3, groups.fundo.pts[1], 0.3));
  setBg(2, cGo(38.6, groups.fundo.pts[2], 0.6));
  setBg(3, cGo(40.3, groups.fundo.pts[3], 0.6));
  setBg(0, cGo(42.7, groups.fundo.pts[0], 0.95));

  // --- 05 cor da marca
  chapter('s05', 's04');
  focus('cor', 45.0);
  const setPalette = (name, t) => swEls.forEach((s, i) => tl.to(s, { backgroundColor: PAL[name][i][1], duration: 0.55, ease: 'power2.inOut' }, t + i * 0.05));
  const ring = (i, t) => tl.to($('.swring', stMesa), { x: swX[i], duration: 0.55, ease: 'expo.inOut' }, t);
  let c;
  c = cGo(45.4, groups.cor.pts[1], 0.9); selectPill('cor', 1, c); setPalette('profundos', c); ring(0, c); swLabel(1, c); brand('#7B3230', c);
  c = cGo(47.0, swPts[1], 0.7); ring(1, c); swLabel(2, c); brand('#5E1F2B', c);
  c = cGo(48.5, groups.cor.pts[2], 0.7); selectPill('cor', 2, c); setPalette('vivos', c); ring(1, c); swLabel(3, c); brand('#C3D14A', c);
  c = cGo(50.1, swPts[3], 0.7); ring(3, c); swLabel(4, c); brand('#3E8A80', c);
  c = cGo(51.8, groups.cor.pts[0], 0.8); selectPill('cor', 0, c); setPalette('terrosos', c); ring(0, c); swLabel(0, c); brand('#C08A78', c);

  // --- 06 jeito da letra
  chapter('s06', 's05');
  focus('letra', 54.0);
  c = cGo(54.4, groups.letra.pts[1], 0.9); selectPill('letra', 1, c); setFont(1, c);
  c = cGo(56.4, groups.letra.pts[2], 0.6); selectPill('letra', 2, c); setFont(2, c);
  c = cGo(58.2, groups.letra.pts[3], 0.6); selectPill('letra', 3, c); setFont(3, c);
  c = cGo(60.3, groups.letra.pts[0], 0.9); selectPill('letra', 0, c); setFont(0, c);

  // --- 07 espaço entre as peças
  chapter('s07', 's06');
  focus('espaco', 63.0);
  c = cGo(63.2, groups.espaco.pts[0], 0.8); selectPill('espaco', 0, c); applyLayout('muito', c);
  c = cGo(65.1, groups.espaco.pts[2], 0.7); selectPill('espaco', 2, c); applyLayout('cheia', c);
  c = cGo(67.0, groups.espaco.pts[1], 0.6); selectPill('espaco', 1, c); applyLayout('equi', c);

  // --- 08 o que entra na home
  chapter('s08', 's07');
  focus('home', 69.0);
  const CHK_ORDER = [['sobre', 1], ['clientes', 2], ['whats', 3], ['avise', 4], ['endereco', 5]];
  const VIEW_H = 744 - 42;
  let acc = 0;
  let ct = 69.35;
  CHK_ORDER.forEach(([sec, ci], k) => {
    const at = cGo(ct, chkPts[ci], k === 0 ? 0.8 : 0.6);
    const box = $('.box', chkEls[ci]);
    tl.fromTo($('.fill', box), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, at);
    tl.to($('path', box), { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, at + 0.1);
    acc += SEC_H[sec];
    tl.to(secEls[sec], { height: SEC_H[sec], duration: 0.95, ease: 'expo.inOut' }, at + 0.05);
    tl.to($('.in', secEls[sec]), { autoAlpha: 1, y: 0, duration: 0.9, ease: EXPO }, at + 0.35);
    tl.to(page, { y: -(SECS_TOP + acc + 24 - VIEW_H), duration: 1.1, ease: 'expo.inOut' }, at + 0.05);
    ct = at + 1.0;
  });
  gsap.set($$('.box .fill', stMesa).slice(1), { scale: 0 });
  // settle on the footer: the whole page, assembled
  tl.to(page, { y: -(SECS_TOP + acc + 30 + 72 - VIEW_H), duration: 1.4, ease: 'power2.inOut' }, ct + 0.1);
  cHide(ct + 0.3);
  focus(null, ct + 0.6);
  hideStage(stMesa, 80.5);

  /* ================================================================== */
  /* 09 MODELOS PRONTOS                                                 */
  /* ================================================================== */
  chapter('s09', 's08');
  showStage(st09, 80.9);
  // stagger outward from the top-left, row by row
  reveal(tplEls, 81.05, { y: 40, s: 0.95, st: { each: 0.08, grid: [2, 4], from: 0 }, blur: 6, d: 1.3 });
  cShow(83.2, tplPts[6]);
  tl.to($('.mini', tplEls[6]), { y: -6, duration: 0.5, ease: 'power2.out' }, 83.9);
  tl.to($('.mini', tplEls[6]), { y: 0, duration: 0.5, ease: 'power2.inOut' }, 85.0);
  cMove(84.3, tplPts[3], 0.8);
  tl.to($('.mini', tplEls[3]), { y: -6, duration: 0.5, ease: 'power2.out' }, 84.9);
  tl.to($('.mini', tplEls[3]), { y: 0, duration: 0.5, ease: 'power2.inOut' }, 85.7);
  c = cGo(85.4, tplPts[0], 0.95);
  tl.fromTo($('.ring', tplEls[0]), { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: EXPO }, c);
  tl.to(tplEls.slice(1), { autoAlpha: 0.45, duration: 0.8, ease: 'power2.inOut' }, c + 0.1);
  reveal($('.chosen', st09), c + 0.4, { y: 10 });
  cHide(88.4);
  hideStage(st09, 89.5);

  /* ================================================================== */
  /* 10 BRIEFING NO WHATSAPP                                            */
  /* ================================================================== */
  chapter('s10', 's09');
  showStage(st10, 89.9);
  const briefCard = $('.brief', st10), ph10 = $('.phone', st10);
  reveal(briefCard, 90.05, { y: 50, d: 1.4 });
  reveal($('.over', briefCard), 90.4, { y: 10 });
  reveal(ph10, 90.3, { x: 80, y: 0, d: 1.5 });
  reveal([$('.hd', ph10), $('.day', ph10)], 90.7, { y: -10, st: 0.1, blur: 3 });
  reveal($('.w1', ph10), 91.2, { y: 14, s: 0.9, d: 0.8, ease: 'back.out(1.8)' }); sfx(91.2, 'recv', 0.7);
  gsap.set(wbtn, { backgroundColor: '#CFEBD9', color: '#FFFFFF' });
  tl.fromTo(wbtn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 90.9);
  {
    const lines = $$('.bl', briefCard);
    const total = BRIEF.reduce((a, s) => a + s.length, 0);
    const T0 = 91.5, T1 = 95.1;
    const typ = { n: 0 };
    lines[0].append(caret);
    tl.to(typ, { n: total, duration: T1 - T0, ease: 'none', onUpdate: () => {
      let left = Math.floor(typ.n), li = 0;
      lines.forEach((ln, i) => { const s = BRIEF[i]; const k = Math.max(0, Math.min(s.length, left)); ln.textContent = s.slice(0, k); left -= s.length; if (k > 0) li = i; });
      lines[li].append(caret);
    } }, T0);
    tl.fromTo(caret, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: 'steps(1)', repeat: 7, yoyo: true }, T1);
    // typing clicks: every ~2 chars, skipping spaces
    const full = BRIEF.join('');
    for (let i = 0; i < total; i += 2) if (full[i] !== ' ') sfx(T0 + (i / total) * (T1 - T0), 'type', 0.5 + ((i * 37) % 10) / 20);
  }
  tl.to(wbtn, { backgroundColor: '#1FA855', duration: 0.5, ease: 'power2.inOut' }, 95.3);
  tl.fromTo(wbtn, { scale: 1 }, { scale: 1.04, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }, 95.5);
  cShow(95.2, wbtnPt);
  c = cGo(96.1, wbtnPt, 0.3);
  tl.to(wbtn, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 }, c);
  reveal(w2, c + 0.35, { y: 40, s: 0.85, d: 0.9, blur: 3, ease: 'back.out(1.4)' }); sfx(c + 0.35, 'send');
  cHide(c + 0.7);
  const typing = $('.typing', ph10);
  tl.fromTo(typing, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 97.7);
  tl.fromTo($$('i', typing), { y: 0 }, { y: -4, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 5, stagger: 0.12 }, 97.8);
  tl.to(typing, { autoAlpha: 0, duration: 0.2 }, 99.2);
  reveal($('.w3', ph10), 99.25, { y: 14, s: 0.9, d: 0.8, ease: 'back.out(1.8)' }); sfx(99.25, 'recv');
  hideStage(st10, 101.5);

  /* ================================================================== */
  /* 11 DE ONDE VÊM AS CORES                                            */
  /* ================================================================== */
  chapter('s11', 's10');
  showStage(st11, 101.9);
  const [c1, c2, c3] = $$('.st-card', st11);
  [c1, c2, c3].forEach((cd, i) => {
    const t = 102.05 + i * 0.55;
    reveal($('.no', cd), t, { y: 10 });
    reveal($('.box2', cd), t + 0.05, { y: 40, d: 1.3 });
    reveal([$('h6', cd), $('.d', cd)], t + 0.3, { y: 20, st: 0.1, blur: 5 });
  });
  reveal($$('.mini-site', c1), 102.4, { y: 16, s: 0.94, st: 0.08, blur: 3, d: 0.9 });
  tl.fromTo($$('.mini-site .ln', c1), { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.7, ease: EXPO, stagger: 0.03 }, 102.8);
  reveal($('.code', c2), 103.0, { y: 10, blur: 3 });
  const hl = $('.hl', c2);
  tl.fromTo(hl, { top: 2, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 103.8);
  tl.to(hl, { top: 36, duration: 0.5, ease: 'power3.inOut' }, 104.1);
  tl.to(hl, { top: 70, duration: 0.5, ease: 'power3.inOut' }, 104.8);
  tl.fromTo($('.csw', c2), { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 105.2);
  const dotEls = $$('.dot', c3);
  dotEls.forEach((d, i) => { const D = dots[i]; gsap.set(d, { x: D.sx - D.x, y: D.sy - D.y }); });
  tl.fromTo(dotEls, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.03 }, 103.4);
  tl.to(dotEls, { x: 0, y: 0, duration: 1.8, ease: 'expo.inOut', stagger: 0.02 }, 104.6);
  tl.to($('circle', c3), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' }, 106.4);
  reveal($('.ctag', c3), 107.1, { y: 8, blur: 2 });
  hideStage(st11, 110.5);

  /* ================================================================== */
  /* 12 A CARTA DA TEMPORADA                                            */
  /* ================================================================== */
  chapter('s12', 's11');
  showStage(st12, 110.9);
  $$('.stat', st12).forEach((s, i) => {
    const t = 111.1 + i * 0.25, v = $('.v', s), o = { n: 0 };
    reveal(s, t, { y: 30, d: 1.2 });
    tl.to(o, { n: STATS[i][0], duration: 1.6, ease: 'power3.out', onUpdate: () => { v.textContent = Math.round(o.n); } }, t + 0.05);
  });
  reveal($('.ct', st12), 113.2, { y: 10 });
  tl.fromTo($$('.bar', st12), { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: 'expo.out', stagger: 0.11 }, 113.5);
  reveal($$('.bn', st12), 113.75, { y: 10, st: 0.11, blur: 3, d: 0.9 });
  reveal($$('.bh', st12), 113.85, { y: 8, st: 0.11, blur: 2, d: 0.9 });
  CARTA.forEach((_, i) => sfx(113.5 + i * 0.11, 'tick', 0.45));
  reveal($('.cnote', st12), 116.4, { y: 14, d: 1.2 });
  hideStage(st12, 119.5);

  /* ================================================================== */
  /* 13 RADAR DE COMPRAS                                                */
  /* ================================================================== */
  chapter('s13', 's12');
  showStage(st13, 119.9);
  const rl = $('.rl', st13), ro = $('.ro', st13), rf = $('.rf', st13);
  reveal(rl, 120.05, { y: 50, d: 1.4 });
  reveal($('.hdr', rl), 120.4, { y: 8 });
  const rows = $$('.rrow', rl);
  reveal(rows, 120.5, { y: 16, st: 0.1, blur: 4, d: 1 });
  tl.to($$('polyline', rl), { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.14 }, 120.9);
  tl.fromTo($$('.rrow circle', rl), { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.4, ease: 'back.out(3)', stagger: 0.14 }, 122.0);
  reveal($$('.dl', rl), 122.1, { x: 10, y: 0, st: 0.14, blur: 3, d: 0.8 });
  const hls = $$('.hl2', rl);
  gsap.set(hls, { autoAlpha: 0 });
  [0, 4].forEach((ri, k) => {
    tl.to(hls[ri], { autoAlpha: 1, duration: 0.4 }, 123.4 + k * 1.5);
    tl.to(hls[ri], { autoAlpha: 0, duration: 0.5 }, 124.7 + k * 1.5);
  });
  reveal(ro, 123.6, { x: 50, y: 0, d: 1.4 });
  reveal($$('.hdr, .of', ro), 123.9, { y: 14, st: 0.12, blur: 3 });
  reveal(rf, 125.3, { x: 50, y: 0, d: 1.4 });
  reveal($$('.hdr, .of', rf), 125.6, { y: 14, st: 0.12, blur: 3 });
  reveal($('.rn', st13), 127.2, { y: 12, d: 1.2 });
  hideStage(st13, 131.5);

  /* ================================================================== */
  /* 14 TRÊS DEGRAUS                                                    */
  /* ================================================================== */
  chapter('s14', 's13');
  showStage(st14, 131.9);
  $$('.step', st14).forEach((s, i) => {
    const t = 132.1 + i * 0.5;
    reveal($('.no', s), t, { y: 10 });
    tl.fromTo($('.rl', s), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, t);
    reveal([$('h6', s), $('.d', s)], t + 0.3, { y: 24, st: 0.1, blur: 5, d: 1.2 });
    sfx(t, 'tick', 0.6);
  });
  tl.fromTo($('.svc-rule', st14), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 134.4);
  reveal($('.svc-t', st14), 134.8, { y: 8 });
  reveal($$('.svc', st14), 135.0, { y: 18, st: 0.18, blur: 4, d: 1.2 });
  hideStage(st14, 140.5);

  /* ================================================================== */
  /* OUTRO                                                              */
  /* ================================================================== */
  labelOut('s14', 140.5); captionOut('s14', 140.5);
  tl.to(['#label .rule', '#brand', '#progress'], { autoAlpha: 0, duration: 0.6 }, 140.6);
  const stO = $('#st-outro');
  showStage(stO, 140.9);
  reveal($('.kicker', stO), 141.2, { y: 10, d: 1.2 });
  reveal($('.l1', stO), 141.45, { y: 40, blur: 10, d: 1.5 });
  reveal($('.l2', stO), 142.0, { y: 40, blur: 10, d: 1.6 });
  tl.fromTo($('.pill', stO), { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'expo.out' }, 143.0);
  reveal($('.small', stO), 143.7, { y: 8, d: 1.2 });
  tl.fromTo(stO, { scale: 1 }, { scale: 1.02, duration: 9, ease: 'none' }, 141);
  tl.to('#fade', { opacity: 1, duration: 1.4, ease: 'power1.in' }, DURATION - 1.4);
  tl.set({}, {}, DURATION);

  /* ------------------------------------------------------------------ */
  window.__duration = DURATION;
  window.__sfx = SFX.sort((a, b) => a.t - b.t);
  window.__scenes = S;
  window.seekTo = (t) => { tl.seek(t, false); };
  tl.seek(0);
  window.__ready = true;

  // preview mode: ?t=12.5 jumps to a time, ?play plays in real time
  const q = new URLSearchParams(location.search);
  if (q.has('t')) tl.seek(parseFloat(q.get('t')));
  if (q.has('play')) tl.play(parseFloat(q.get('play')) || 0);
})();
