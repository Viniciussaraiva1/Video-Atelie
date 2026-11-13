/* ---------------------------------------------------------------
   Desenho vetorial. Nada de banco de imagens: os croquis são
   caminhos SVG desenhados aqui, pintados com a cor da marca que
   estiver escolhida na mesa de montagem.
----------------------------------------------------------------*/
const Draw = (() => {

  const INK = '#171614';
  const wrap = (inner, vb = '0 0 300 420', px = null) =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" style="${px ? `width:${px}px;height:${px}px` : 'width:100%;height:100%'};display:block;flex:none">${inner}</svg>`;

  /* figura insinuada atrás da roupa — cabeça, pescoço, pernas */
  const figura = (hem, o = .16) => `
    <g stroke="${INK}" stroke-opacity="${o}" fill="none" stroke-width="2" stroke-linecap="round">
      <ellipse cx="150" cy="40" rx="15" ry="19"/>
      <path d="M150 59 L150 78"/>
      <path d="M137 ${hem} L133 410"/>
      <path d="M163 ${hem} L168 410"/>
      <path d="M126 408 L142 408"/><path d="M161 408 L177 408"/>
    </g>`;

  /* sombra e luz genéricas: funcionam sobre qualquer cor de marca */
  const sombra = d => `<path d="${d}" fill="rgba(0,0,0,.13)"/>`;
  const luz    = d => `<path d="${d}" fill="rgba(255,255,255,.15)"/>`;
  const linhas = (d, o = .30, w = 1.4) =>
    `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity="${o}" stroke-width="${w}" stroke-linecap="round"/>`;
  const contorno = d =>
    `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity=".62" stroke-width="2.1" stroke-linejoin="round"/>`;

  const PECAS = {

    /* vestido evasê, alça fina, cintura marcada */
    vestido(c) {
      const corpo = 'M116 104 C140 116 160 116 184 104 L176 198 C190 250 202 306 216 350 '
                  + 'C180 364 120 364 84 350 C98 306 110 250 124 198 Z';
      return figura(352) + `<path d="${corpo}" fill="${c}"/>`
        + sombra('M176 198 C190 250 202 306 216 350 C202 356 186 360 169 361 C173 306 175 250 176 198 Z')
        + luz('M124 198 C110 250 98 306 84 350 C96 356 110 359 124 360 C124 306 124 250 124 198 Z')
        + linhas('M124 198 C145 206 155 206 176 198', .34)
        + linhas('M140 212 C136 262 134 306 131 350', .22)
        + linhas('M161 210 C165 260 168 306 171 350', .22)
        + linhas('M126 62 L118 106', .5, 2.2) + linhas('M174 62 L182 106', .5, 2.2)
        + contorno(corpo);
    },

    /* casaco longo, gola alfaiataria, cinto */
    casaco(c) {
      const corpo = 'M104 92 C120 84 180 84 196 92 C208 100 215 140 217 186 L212 270 L210 376 '
                  + 'C170 382 130 382 90 376 L88 270 L83 186 C85 140 92 100 104 92 Z';
      return figura(378, .12) + `<path d="${corpo}" fill="${c}"/>`
        + sombra('M212 270 L210 376 C196 379 182 380 168 381 L172 270 Z')
        + sombra('M196 92 C208 100 215 140 217 186 L206 188 C204 142 198 108 188 98 Z')
        + luz('M104 92 C92 100 85 140 83 186 L94 188 C96 142 102 108 112 98 Z')
        + `<path d="M150 196 L116 99 C130 92 142 92 150 100 Z" fill="rgba(0,0,0,.14)"/>`
        + `<path d="M150 196 L184 99 C170 92 158 92 150 100 Z" fill="rgba(0,0,0,.08)"/>`
        + `<rect x="87" y="214" width="126" height="15" fill="rgba(0,0,0,.20)"/>`
        + `<circle cx="150" cy="221" r="7" fill="rgba(255,255,255,.22)"/>`
        + linhas('M124 102 C116 152 114 224 117 300', .2)
        + linhas('M176 102 C184 152 186 224 183 300', .2)
        + linhas('M150 240 L150 372', .16)
        + contorno(corpo);
    },

    /* tailleur: blazer e calça de alfaiataria */
    tailleur(c) {
      const blazer = 'M106 92 C120 84 180 84 194 92 C206 100 213 138 215 180 L211 240 L89 240 L85 180 '
                   + 'C87 138 94 100 106 92 Z';
      const calca  = 'M92 240 L208 240 L200 394 L163 394 L150 300 L137 394 L100 394 Z';
      return figura(396, .10)
        + `<path d="${calca}" fill="${c}"/>`
        + sombra('M208 240 L200 394 L182 394 L186 240 Z')
        + linhas('M150 248 L150 300', .22) + linhas('M119 250 L110 392', .18) + linhas('M181 250 L190 392', .18)
        + contorno(calca)
        + `<path d="${blazer}" fill="${c}"/>`
        + sombra('M194 92 C206 100 213 138 215 180 L211 240 L192 240 L196 150 Z')
        + luz('M106 92 C94 100 87 138 85 180 L89 240 L107 240 L104 150 Z')
        + `<path d="M150 178 L115 99 C130 91 142 91 150 100 Z" fill="rgba(0,0,0,.14)"/>`
        + `<path d="M150 178 L185 99 C170 91 158 91 150 100 Z" fill="rgba(0,0,0,.08)"/>`
        + `<circle cx="150" cy="196" r="4.4" fill="rgba(0,0,0,.3)"/>`
        + contorno(blazer);
    },

    /* capa de inverno, gola alta e queda larga */
    capa(c) {
      const corpo = 'M120 98 C140 88 160 88 180 98 C196 150 216 258 244 352 C200 368 100 368 56 352 '
                  + 'C84 258 104 150 120 98 Z';
      const gola  = 'M126 70 C140 61 160 61 174 70 L181 100 C160 92 140 92 119 100 Z';
      return figura(360, .10) + `<path d="${corpo}" fill="${c}"/>`
        + sombra('M180 98 C196 150 216 258 244 352 C226 358 206 362 186 364 C184 258 182 150 180 98 Z')
        + luz('M120 98 C104 150 84 258 56 352 C74 358 94 362 114 364 C116 258 118 150 120 98 Z')
        + linhas('M150 96 L150 362', .14)
        + linhas('M134 100 C124 180 108 278 88 358', .18)
        + linhas('M166 100 C176 180 192 278 212 358', .18)
        + contorno(corpo)
        + `<path d="${gola}" fill="${c}"/>` + sombra('M174 70 L181 100 C172 96 164 94 156 93 L158 66 Z')
        + contorno(gola);
    }
  };

  return {
    /* croqui pronto para entrar num card da vitrine */
    croqui(kind, cor) { return wrap(PECAS[kind] ? PECAS[kind](cor) : PECAS.vestido(cor)); },

    cursor() {
      return wrap(`<path d="M3 2 L3 27 L10 20.5 L14.4 30 L18.6 28 L14.2 18.8 L23 18.4 Z"
        fill="#fff" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/>`, '0 0 26 34');
    },
    check(px = 16) {
      return wrap(`<path d="M2 8.6 L6.2 12.8 L14 3.4" fill="none" stroke="#fff" stroke-width="2.4"
        stroke-linecap="round" stroke-linejoin="round"/>`, '0 0 16 16', px);
    },
    whats(c = '#fff', px = null) {
      return wrap(`<path fill="${c}" d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.52 3.76 1.44 5.32L2 22l4.98-1.6
        a9.8 9.8 0 0 0 5.06 1.4c5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2zm0 17.8c-1.64 0-3.18-.46-4.48-1.28l-.32-.2
        -2.96.96.96-2.88-.2-.32a7.9 7.9 0 0 1-1.24-4.24c0-4.38 3.56-7.94 7.94-7.94 4.38 0 7.94 3.56 7.94 7.94
        0 4.38-3.56 7.96-7.64 7.96zm4.36-5.94c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94
        -.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.42-1.34-1.66-.14-.24-.02-.38.1-.5.11-.11.24-.28.36-.42
        .12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3
        -.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1
        .46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>`, '0 0 24 24', px);
    },
    /* ícones pequenos do celular e dos blocos */
    link(px = 16) { return wrap(`<path d="M9 15 L15 9 M10.5 6.5 A4 4 0 0 1 17.5 13.5 L16 15
      M13.5 17.5 A4 4 0 0 1 6.5 10.5 L8 9" fill="none" stroke="${INK}" stroke-opacity=".5"
      stroke-width="1.7" stroke-linecap="round"/>`, '0 0 24 24', px); }
  };
})();
