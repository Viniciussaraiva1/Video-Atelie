/* ---------------------------------------------------------------
   Linha do tempo. Monta as cenas, encadeia as dissolvências e
   expõe seek(t): dado um instante, desenha o quadro exato.
   O renderizador chama seek() 30 vezes por segundo de vídeo.
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
    barra: document.getElementById('progress')
  };
  const veil = document.getElementById('veil');

  const cenas = SCENES.list;
  const ini = [];
  let acc = 0;
  cenas.forEach(c => { ini.push(acc); acc += c.dur; });
  const TOTAL = acc;

  /* monta o DOM de todas as cenas uma única vez */
  cenas.forEach((c, i) => {
    const s = document.createElement('div');
    s.className = 'scene';
    s.id = 'sc-' + c.id;
    palco.appendChild(s);
    c.el = s;
    c.build(s);
  });

  let rotuloAtual = -1;

  function seek(t) {
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
    }
    const temRotulo = !!c.label;
    chrome.bloco.style.opacity = temRotulo ? vis : 0;
    chrome.cap.style.opacity = c.caption ? vis : 0;

    /* a assinatura acompanha o miolo do filme */
    const dentro = FX.smooth(FX.span(t, ini[1] - .2, ini[1] + .9))
                 * (1 - FX.smooth(FX.span(t, ini[cenas.length - 1] - .9, ini[cenas.length - 1] + .2)));
    chrome.mark.style.opacity = dentro * .999;
    chrome.barra.style.opacity = dentro;
    chrome.prog.style.width = (t / TOTAL * 1920) + 'px';

    veil.style.opacity = FX.smooth(FX.span(t, TOTAL - FIM, TOTAL - .12));
  }

  return { seek, TOTAL, ini, cenas };
})();

/* ---- ganchos do renderizador ---- */
window.__DUR = TL.TOTAL;
window.__seek = t => TL.seek(t);
window.__ready = false;
document.fonts.ready.then(() => { TL.seek(0); requestAnimationFrame(() => { window.__ready = true; }); });

/* ---- prévia no navegador: ?play para rodar, setas para catar quadro ---- */
if (location.search.includes('play')) {
  const t0 = performance.now();
  const loop = () => {
    const t = ((performance.now() - t0) / 1000) % TL.TOTAL;
    TL.seek(t);
    requestAnimationFrame(loop);
  };
  document.fonts.ready.then(loop);
} else if (location.search.includes('t=')) {
  document.fonts.ready.then(() => TL.seek(parseFloat(location.search.split('t=')[1])));
}
