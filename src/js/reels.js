/* ---------------------------------------------------------------
   Moldura do Reels em volta do filme principal (src/reels.html).
   Usa a mesma linha do tempo: a cada seek(t), desenha o quadro do
   filme e atualiza título, legenda e capítulos do lado de fora,
   com a mesma entrada e saída que o rótulo tem dentro do filme.
----------------------------------------------------------------*/
(() => {
  /* abertura e fechamento não têm rótulo no filme; no Reels, têm */
  const EXTRA = {
    abertura: { tit: 'Para boutique<em>que vende pelo Instagram</em>',
                leg: 'Como funciona o Ateliê Digital, do link da bio ao preço.' },
    fecho:    { tit: 'Prévia grátis<em>com cinco peças suas</em>',
                leg: 'Comente <strong>VITRINE</strong> ou chame no direct que eu te explico como mandar.' }
  };
  const el = id => document.getElementById(id);
  const num = el('r-num'), tit = el('r-tit'), leg = el('r-leg'), topo = el('r-topo'), caps = el('r-capitulos');

  const cenas = TL.cenas, ini = TL.ini, TOTAL = TL.TOTAL;
  const numeradas = cenas.map((c, i) => ({ c, i })).filter(o => o.c.num);
  const ultimo = numeradas[numeradas.length - 1].c.num;
  const barras = numeradas.map(() => {
    const b = document.createElement('b'); b.appendChild(document.createElement('i')); caps.appendChild(b);
    return b.firstChild;
  });

  let atual = -1;
  function moldura(t) {
    t = Math.max(0, Math.min(TOTAL, t));
    let idx = 0;
    for (let i = 0; i < cenas.length; i++) if (t >= ini[i]) idx = i;
    const c = cenas[idx];
    const prox = idx + 1 < cenas.length ? ini[idx + 1] : TOTAL + 9;
    /* o texto entra um pouco antes do rótulo do filme: no celular, ele é a primeira coisa lida */
    const vis = (idx === 0 ? 1 : FX.smooth(FX.span(t, ini[idx] + .05, ini[idx] + .75)))
              * (1 - FX.smooth(FX.span(t, prox - .55, prox - .05)));
    if (idx !== atual) {
      atual = idx;
      const x = EXTRA[c.id];
      num.textContent = c.num ? `${c.num} / ${ultimo}` : '';
      num.style.visibility = c.num ? 'visible' : 'hidden';
      tit.innerHTML = x ? x.tit : c.label;
      leg.innerHTML = x ? x.leg : (c.caption || '');
    }
    const sobe = (1 - vis) * 18;
    topo.style.opacity = vis;
    topo.style.transform = `translateY(${sobe}px)`;
    leg.style.opacity = vis;
    leg.style.transform = `translateY(${sobe * .6}px)`;

    numeradas.forEach((o, k) => {
      const a = ini[o.i], b = a + o.c.dur;
      barras[k].style.width = (FX.clamp((t - a) / (b - a)) * 100) + '%';
    });
    caps.style.opacity = 1 - FX.smooth(FX.span(t, TOTAL - 1.35, TOTAL - .12));
  }

  /* troca o seek da própria linha do tempo: vale para o render e para ?play e ?t= no navegador */
  const seekFilme = TL.seek;
  TL.seek = t => { seekFilme(t); moldura(t); };
  window.__W = 1080;
  window.__H = 1920;

  pronto.then(() => {
    const g = el('grao').style.backgroundImage;
    el('r-grao').style.backgroundImage = g;
    moldura(0);
  });
})();
