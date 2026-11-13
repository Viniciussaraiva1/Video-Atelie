/* ---------------------------------------------------------------
   Linha do tempo. Monta as cenas, encadeia as dissolvências e
   expõe seek(t): dado um instante, desenha o quadro exato.
   O renderizador chama seek() 30 vezes por segundo de vídeo.

   As cenas só são montadas depois que as fontes carregam: as letras
   táteis são desenhadas em canvas com elas, uma vez, na montagem.
----------------------------------------------------------------*/
const TL = (() => {

  const XF = 1.1;              /* dissolvência entre cenas, em segundos */
  const ZOOM = .018;           /* aproximação lenta dentro de cada cena */
  const FIM = 1.35;            /* respiro final até o papel */

  const palco = document.getElementById('scenes');
  const chrome = {
    num: document.getElementById('label-num'),
    sep: document.getElementById('label-sep'),
    txt: document.getElementById('label-txt'),
    bloco: document.getElementById('label'),
    cap: document.getElementById('caption'),
    mark: document.getElementById('mark'),
    prog: document.querySelector('#progress i'),
    barra: document.getElementById('progress'),
    folio: document.getElementById('folio')
  };
  const veil = document.getElementById('veil');

  /* o corte vertical traz o próprio roteiro; o filme principal usa SCENES.list */
  const cenas = window.ROTEIRO || SCENES.list;
  const ini = [];
  let acc = 0;
  cenas.forEach(c => { ini.push(acc); acc += c.dur; });
  const TOTAL = acc;
  const ultimoNum = cenas.map(c => c.num).filter(Boolean).pop() || '';

  /* monta o DOM de todas as cenas uma única vez, com o grão do papel por cima */
  let montado = false;
  function montar() {
    cenas.forEach(c => {
      const s = document.createElement('div');
      s.className = 'scene';
      s.id = 'sc-' + c.id;
      palco.appendChild(s);
      c.el = s;
      c.build(s);
    });
    const g = Galeria.grao(512, 512);
    const grao = document.getElementById('grao');
    if (grao) grao.style.backgroundImage = `url(${g.toDataURL()})`;
    montado = true;
  }

  let rotuloAtual = -1;

  function seek(t) {
    if (!montado) return;
    t = Math.max(0, Math.min(TOTAL, t));

    cenas.forEach((c, i) => {
      const a = ini[i], b = a + c.dur, ultimo = i === cenas.length - 1;
      const entra = i === 0 ? 1 : FX.smooth(FX.span(t, a, a + XF));
      const sai = ultimo ? 0 : FX.smooth(FX.span(t, b, b + XF));
      const k = FX.clamp(entra - sai);
      const viz = k > .002;
      c.el.style.opacity = k;
      c.el.style.visibility = viz ? 'visible' : 'hidden';
      if (!viz) return;
      const local = t - a;
      const z = 1 + ZOOM * FX.clamp(local / (c.dur + XF));
      c.el._zoom = z;
      c.el.style.transform = `scale(${z})`;
      c.update(c.el, local, FX.clamp(local / c.dur));
    });

    /* rótulo, legenda e assinatura: somem antes do corte e voltam depois */
    let idx = 0;
    for (let i = 0; i < cenas.length; i++) if (t >= ini[i]) idx = i;
    const c = cenas[idx];
    const prox = idx + 1 < cenas.length ? ini[idx + 1] : TOTAL + 9;
    const vis = FX.smooth(FX.span(t, ini[idx] + .15, ini[idx] + .95))
              * (1 - FX.smooth(FX.span(t, prox - .60, prox - .10)));
    if (idx !== rotuloAtual) {
      rotuloAtual = idx;
      chrome.num.textContent = c.num || '';
      chrome.txt.textContent = c.label || '';
      chrome.cap.textContent = c.caption || '';
      chrome.sep.style.display = c.num ? '' : 'none';
      if (chrome.folio) chrome.folio.textContent = c.num ? `${c.num} / ${ultimoNum}` : '';
      document.getElementById('stage').dataset.cena = c.id;
    }
    const temRotulo = !!c.label;
    chrome.bloco.style.opacity = temRotulo ? vis : 0;
    chrome.cap.style.opacity = c.caption ? vis : 0;

    /* a assinatura acompanha o miolo do filme */
    const dentro = FX.smooth(FX.span(t, ini[1] - .2, ini[1] + .9))
                 * (1 - FX.smooth(FX.span(t, ini[cenas.length - 1] - .9, ini[cenas.length - 1] + .2)));
    chrome.mark.style.opacity = dentro * .999;
    chrome.barra.style.opacity = dentro;
    if (chrome.folio) chrome.folio.style.opacity = c.num ? vis : 0;
    chrome.prog.style.width = (t / TOTAL * 100) + '%';

    veil.style.opacity = FX.smooth(FX.span(t, TOTAL - FIM, TOTAL - .12));
  }

  return { seek, montar, TOTAL, ini, cenas };
})();

/* ---- ganchos do renderizador ---- */
window.__DUR = TL.TOTAL;
window.__W = document.getElementById('stage').clientWidth;
window.__H = document.getElementById('stage').clientHeight;
window.__seek = t => TL.seek(t);
window.__ready = false;
const FONTES = ["400 100px 'Bagel Fat One'", '400 100px Anton', '400 100px Playfair', 'italic 400 100px Playfair',
                '900 100px Playfair', '400 100px Inter', '700 100px Inter', '400 100px PlexMono', '500 100px PlexMono'];
const pronto = Promise.all(FONTES.map(f => document.fonts.load(f)))
  .then(() => document.fonts.ready)
  .then(() => { TL.montar(); TL.seek(0); });
pronto.then(() => requestAnimationFrame(() => { window.__ready = true; }));

/* ---- prévia no navegador: ?play para rodar, setas para catar quadro ---- */
if (location.search.includes('play')) {
  const t0 = performance.now();
  const loop = () => {
    const t = ((performance.now() - t0) / 1000) % TL.TOTAL;
    TL.seek(t);
    requestAnimationFrame(loop);
  };
  pronto.then(loop);
} else if (location.search.includes('t=')) {
  pronto.then(() => TL.seek(parseFloat(location.search.split('t=')[1])));
}
