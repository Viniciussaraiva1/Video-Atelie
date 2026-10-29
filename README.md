# Ateliê Digital — filmes de venda

Duas peças de vídeo que vendem o **Ateliê Digital** para boutiques que vendem
pelo Instagram:

- **o filme** (1920×1080, 30 qps, 1 min 46 s) — o problema do link da bio, a
  mesa de montagem, os doze modelos prontos, a prévia grátis, o estudo de
  tendências por trás das cores, o radar de compra, o preço em dois passos e
  o que tira o risco da lojista;
- **o corte vertical** (1080×1920, 30 qps, 42 s) — o mesmo argumento em seis
  frases grandes, para Reels, Stories e Status do WhatsApp.

O porquê de cada escolha comercial está em
[`docs/repaginada.md`](docs/repaginada.md): o diagnóstico do negócio, os pontos
fracos que existiam e a oferta nova.

Tudo é feito em JavaScript, sem banco de imagens:

- **imagem** — páginas HTML animadas, desenhadas em CSS e SVG (os croquis de
  moda são caminhos vetoriais escritos à mão em `src/js/draw.js`);
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
npm run video                                   # o filme, sai mudo, ~7 min
npm run vertical                                # o corte vertical, ~3 min

node scripts/music.mjs 106                      # out/trilha.wav, no total do filme
node scripts/music.mjs 42 trilha-vertical.wav   # trilha do corte vertical
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
DE=49 ATE=61 node scripts/render.mjs 30 trecho.mp4
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
| — | Abertura — "a sua loja respondendo por você" | 0,0 s | 4,5 s |
| 01 | O problema — "Você não vende pouco. Você responde demais." | 4,5 s | 7,0 s |
| 02 | O link da bio — Linktree × vitrine, nos dois celulares | 11,5 s | 8,5 s |
| 03 | A mesa de montagem — os cinco controles e o fundo da página | 20,0 s | 6,5 s |
| 04 | Cor e letra — tons da carta de tendências, quatro jeitos de letra | 26,5 s | 7,5 s |
| 05 | Vitrine e seções — espaço entre as peças e os blocos da home | 34,0 s | 8,0 s |
| 06 | Doze modelos prontos — os mesmos da página do Ateliê | 42,0 s | 7,5 s |
| 07 | Prévia grátis — o pedido, as cinco fotos e a resposta no WhatsApp | 49,5 s | 11,0 s |
| 08 | Cor com estudo — os números do estudo e os tons batizados | 60,5 s | 8,0 s |
| 09 | Radar de compra — preço do que a loja compra, achados e a conta do mês | 68,5 s | 11,5 s |
| 10 | Quanto custa — a vitrine (pagamento único) e a temporada (mensal) | 80,0 s | 11,0 s |
| 11 | Sem risco — prévia grátis, metade para começar, no ar em 7 dias | 91,0 s | 8,0 s |
| — | Fechamento — "Me manda cinco peças. Eu devolvo a sua vitrine." | 99,0 s | 7,0 s |

As cenas 03 a 05 usam a mesma composição, nas mesmas coordenadas: com a
dissolvência de 1,1 s entre elas, a sequência lê como um plano só, com a câmera
parada e uma aproximação de 1,8 % por cena. O estado da mesa no fim de uma cena
é o estado em que a seguinte começa.

## Roteiro do corte vertical

| cena | entra em | dura |
|---|---|---|
| "Você não vende pouco. Você responde demais." — o direct enchendo | 0,0 s | 6,0 s |
| "Troque o link da bio por uma vitrine." — o Linktree vira vitrine no mesmo celular | 6,0 s | 7,0 s |
| "Monte a sua e veja na hora." — cor, fundo e letra trocando | 13,0 s | 7,5 s |
| "Prévia grátis, com cinco peças suas." — a conversa no WhatsApp | 20,5 s | 7,5 s |
| "Quanto custa" — os quatro preços em dois passos | 28,0 s | 8,0 s |
| "Me manda cinco peças. Eu devolvo a sua vitrine." — o convite | 36,0 s | 6,0 s |

O título do gancho já está na tela no primeiro quadro, que o Instagram usa como
capa. Tudo que importa fica entre 220 e 1500 px de altura, longe da faixa que o
aplicativo cobre com o nome do perfil, a legenda e os botões.

## Onde mexer

| quero mudar | arquivo |
|---|---|
| textos, preços, prazo da prévia, modelos, números, radar | `src/js/data.js` |
| croquis das peças (casaco, vestido, tailleur, capa) e ícones | `src/js/draw.js` |
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

Fontes em `src/fonts/` (Playfair Display, IBM Plex Mono, Inter), todas sob a SIL
Open Font License. Nenhuma fotografia: cada peça de roupa na tela é um desenho
vetorial deste repositório.
