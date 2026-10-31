# Ateliê Digital — filmes de venda

Duas peças de vídeo que vendem o **Ateliê Digital** para boutiques que vendem
pelo Instagram:

- **o filme** (1920×1080, 30 qps, 1 min 51 s) — o problema do link da bio, a
  mesa de montagem, a cor da marca, os doze modelos prontos, a prévia grátis,
  o estudo de tendências por trás das cores, o radar de compra, o preço em dois
  passos e o que tira o risco da lojista;
- **o corte vertical** (1080×1920, 30 qps, 43,5 s) — o mesmo argumento em seis
  frases grandes, para Reels, Stories e Status do WhatsApp.

## O estilo: tátil, em galeria

Dois pedaços de referência viraram a linguagem dos dois filmes:

- **o movimento** vem dos estudos de galeria feitos no Cavalry
  ([Sinan Karaçam](https://www.instagram.com/p/DcgTUJKCQZz/)): as peças correm
  por uma espiral no espaço e se reorganizam em grade, anel ou linha, uma depois
  da outra, com número, nome de arquivo, linha-guia passando pelos centros, fios
  até um ponto de ancoragem e profundidade de campo. A cor da marca, os modelos
  e o estudo de tendências aparecem assim (`src/js/galeria.js`);
- **a matéria** vem do design tátil: letras e objetos que parecem massinha,
  pasta de bisnaga, papel-alumínio amassado e plástico transparente. Nada é foto
  nem 3D: a forma é desenhada num canvas, vira mapa de altura e cada pixel é
  iluminado em JavaScript (`src/js/tatil.js`). As peças são calculadas uma vez,
  quando a página abre; no filme elas só se movem.

Onde cada material aparece: massinha no título, em "responde demais.", no tom
escolhido e no "Eu devolvo a sua vitrine."; pasta verde na economia do radar;
papel-alumínio nos números do estudo e nos três passos sem risco; e a bolha de
plástico passeando pelo cartaz final, com a tipografia ampliada por baixo dela,
como lente.

O porquê de cada escolha comercial está em
[`docs/repaginada.md`](docs/repaginada.md): o diagnóstico do negócio, os pontos
fracos que existiam e a oferta nova.

Tudo é feito em JavaScript, sem banco de imagens:

- **imagem** — páginas HTML animadas, desenhadas em CSS, SVG e canvas (os croquis
  de moda são caminhos vetoriais escritos à mão em `src/js/draw.js`; as letras
  táteis e as fotos da galeria são iluminadas pixel a pixel em `src/js/tatil.js`);
- **movimento** — uma linha do tempo determinística: `seek(t)` desenha o quadro
  exato do instante `t`, sem depender de relógio ou de `requestAnimationFrame`;
- **som** — trilha lo-fi sintetizada em JavaScript puro (`scripts/music.mjs`):
  piano elétrico abafado, baixo redondo, uma batida quase só sentida, ondulação
  de fita e chiado de vinil. É ambientação: fica embaixo da imagem e não disputa
  com ela;
- **montagem** — Playwright fotografa quadro a quadro e joga tudo num cano para o
  ffmpeg, que fecha o MP4 na mesma passada.

## Como gerar os vídeos

```bash
npm install
npm run video                                   # o filme, sai mudo, ~10 min
npm run vertical                                # o corte vertical, ~4 min

node scripts/music.mjs 111                      # out/trilha.wav, no total do filme
node scripts/music.mjs 43.5 trilha-vertical.wav # trilha do corte vertical
node scripts/mux.mjs atelie-digital-como-funciona.mp4 trilha.wav
node scripts/mux.mjs atelie-digital-vertical.mp4 trilha-vertical.wav
```

O render sai mudo de propósito e a trilha entra por cima: assim dá para mexer na
música sem refazer os quadros. Em filme curto, a trilha encolhe a entrada da
batida junto. Para tirar a música de volta:

```bash
node scripts/mux.mjs atelie-digital-como-funciona.mp4 mudo
```

Conferir um trecho sem esperar o filme todo:

```bash
DE=27 ATE=37 node scripts/render.mjs 30 trecho.mp4
node scripts/shot.mjs 29 58 86                  # quadros avulsos do filme em out/f_*.png
PAGINA=vertical.html node scripts/shot.mjs 0 15 # quadros do corte vertical em out/v_*.png
```

Ver no navegador: abra `src/index.html?play` (roda em laço) ou
`src/index.html?t=43` (congela num instante). O corte vertical é
`src/vertical.html`, com os mesmos parâmetros.

> O Chromium usado é o que vem instalado em `/opt/pw-browsers/chromium`. Em
> outra máquina, aponte o caminho com
> `CHROME=/caminho/para/chrome node scripts/render.mjs`.

## Roteiro do filme

| | cena | entra em | dura |
|---|---|---|---|
| — | Abertura — "Ateliê Digital" em massinha, caindo sobre a galeria em espiral | 0,0 s | 5,0 s |
| 01 | O problema — "Você não vende pouco. Você responde demais." | 5,0 s | 7,0 s |
| 02 | O link da bio — Linktree × vitrine, nos dois celulares | 12,0 s | 8,5 s |
| 03 | A mesa de montagem — os cinco controles e o fundo da página | 20,5 s | 6,5 s |
| 04 | A cor da marca — dezesseis tons em galeria: espiral, grade e o tom escolhido | 27,0 s | 10,0 s |
| 05 | Letra e vitrine — jeito da letra, espaço entre as peças e blocos da home | 37,0 s | 8,5 s |
| 06 | Doze modelos prontos — em anel, depois em grade | 45,5 s | 8,0 s |
| 07 | Prévia grátis — o pedido, as cinco fotos e a resposta no WhatsApp | 53,5 s | 11,0 s |
| 08 | Cor com estudo — os números em papel-alumínio e a carta em espiral | 64,5 s | 8,5 s |
| 09 | Radar de compra — preço do que a loja compra, achados e a conta do mês | 73,0 s | 11,5 s |
| 10 | Quanto custa — a vitrine (pagamento único) e a temporada (mensal) | 84,5 s | 11,0 s |
| 11 | Sem risco — prévia grátis, metade para começar, no ar em 7 dias | 95,5 s | 8,0 s |
| — | Fechamento — o cartaz "Me manda cinco peças", com a bolha de plástico | 103,5 s | 7,5 s |

As cenas 03 e 05 usam a mesma composição da mesa, nas mesmas coordenadas, e a
cena 04 entre elas tira a cor de dentro da mesa e a mostra como galeria. O tom
que a galeria escolhe (Muted Clay) é o mesmo com que a cena 05 começa.

## Roteiro do corte vertical

| cena | entra em | dura |
|---|---|---|
| "Você não vende pouco. Você responde demais." — o direct enchendo | 0,0 s | 6,0 s |
| "Troque o link da bio por uma vitrine." — o Linktree vira vitrine no mesmo celular | 6,0 s | 7,0 s |
| "Escolha a cor e veja na hora." — a galeria sobe em espiral, vira grade e destaca um tom | 13,0 s | 8,5 s |
| "Prévia grátis, com cinco peças suas." — a conversa no WhatsApp | 21,5 s | 7,5 s |
| "Quanto custa" — os quatro preços em dois passos | 29,0 s | 8,0 s |
| "Me manda cinco peças. Eu devolvo a sua vitrine." — o cartaz com a bolha | 37,0 s | 6,5 s |

O gancho inteiro, tipo de cartaz e massinha, já está na tela no primeiro quadro,
que o Instagram usa como capa. Tudo que importa fica entre 220 e 1500 px de altura, longe da faixa que o
aplicativo cobre com o nome do perfil, a legenda e os botões.

## Onde mexer

| quero mudar | arquivo |
|---|---|
| textos, preços, prazo da prévia, modelos, números, radar | `src/js/data.js` |
| croquis das peças (casaco, vestido, tailleur, capa) e ícones | `src/js/draw.js` |
| massinha, pasta, papel-alumínio e plástico: luz, borda, sombra | `src/js/tatil.js` |
| arranjos da galeria (espiral, grade, anel, linha), foco, números | `src/js/galeria.js` |
| prévia do site, painel de controles, celular, cursor | `src/js/ui.js` |
| o que cada cena do filme faz e quando | `src/js/scenes.js`, `src/js/scenes2.js` |
| as cenas do corte vertical | `src/js/vertical.js`, `src/css/vertical.css` |
| duração, dissolvência, rótulos e legendas | `src/js/timeline.js` |
| harmonia, melodia e mistura da trilha | `scripts/music.mjs` |

Mudou a duração de alguma cena? Nada mais precisa ser ajustado: a linha do tempo
soma as durações sozinha, e a trilha aceita o novo total em
`node scripts/music.mjs <segundos>`.

## Decisões de conteúdo

- **Os preços são os da página do Ateliê.** Página de venda R$ 890, identidade
  e site R$ 2.490, Plano Temporada R$ 490/mês e radar de compra + R$ 340/mês.
  Se um preço mudar na página, muda em `DATA.precos` também.
- **A prévia grátis é a porta de entrada.** É o que os scripts de direct já
  ofereciam; agora é o convite do filme inteiro e do fechamento.
- **Boutiques fictícias.** As demonstrações usam Casa Amaré, Studio Lis e Ateliê
  Nord — nenhum cliente real aparece. Quando houver lojas fundadoras com
  permissão, elas entram no lugar.
- **Fechamento sem dado pessoal.** O @ e o telefone ficam fora da tela, para
  irem na conversa junto com o vídeo.
- **O estudo aparece sem nome próprio.** A cena 08 mostra os números e os tons
  batizados da carta Outono-Inverno 26/27, sem citar o nome do levantamento.
- **O radar mostra a conta.** Peças, fornecedores e preços são fictícios, como
  as boutiques, e a legenda diz que é um exemplo. A economia é diferença de
  preço vezes a quantidade que a loja já ia comprar: R$ 1.035 no mês, três
  vezes a mensalidade. A linha de preço usa a faixa da própria série, com piso
  de 14 % — preço parado desenha linha reta, e não serra.
- **A trilha é ambientação, não tema.** Roda de jazz em dó maior a 72 bpm, pico
  em −6,7 dBFS e nível médio perto de −25 dBFS. Medida com ponderação A, a faixa
  abaixo de 120 Hz responde por menos de 1 % do que se ouve. No filme, a batida
  entra aos 18 s e sai 20 s antes do fim; no corte vertical, tudo isso encolhe
  na mesma proporção.

## Créditos técnicos

Fontes em `src/fonts/` (Playfair Display, IBM Plex Mono, Inter, Anton e Bagel
Fat One), todas sob a SIL Open Font License. Anton é o tipo de cartaz; Bagel Fat
One é a letra que vira massinha. Nenhuma fotografia: cada peça de roupa na tela é um desenho
vetorial deste repositório.
