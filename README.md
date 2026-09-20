# Ateliê Digital — vídeo "como funciona"

Peça de vídeo (1920×1080, 30 qps, 2 min e 25 s) que explica, função por função, o
que o **Ateliê Digital** faz: o problema do link da bio, os cinco controles da
mesa de montagem, os modelos prontos, o briefing que vai para o WhatsApp, o
estudo de tendências de onde saem as cores, o radar de compras e os degraus de
oferta.

Tudo é feito em JavaScript, sem banco de imagens:

- **imagem** — uma página HTML animada, desenhada em CSS e SVG (os croquis de moda
  são caminhos vetoriais escritos à mão em `src/js/draw.js`);
- **movimento** — uma linha do tempo determinística: `seek(t)` desenha o quadro
  exato do instante `t`, sem depender de relógio ou de `requestAnimationFrame`;
- **som** — trilha lo-fi sintetizada em JavaScript puro (`scripts/music.mjs`):
  piano elétrico abafado, baixo redondo, uma batida quase só sentida, ondulação
  de fita e chiado de vinil. É ambientação: fica embaixo da imagem e não disputa
  com ela;
- **montagem** — Playwright fotografa quadro a quadro e joga tudo num cano para o
  ffmpeg, que fecha o MP4 na mesma passada.

## Como gerar o vídeo

```bash
npm install
npm run video                                   # quadros + montagem, sai mudo, ~10 min
node scripts/music.mjs 145                      # out/trilha.wav, no total do filme
node scripts/mux.mjs atelie-digital-como-funciona.mp4 trilha.wav
```

O render sai mudo de propósito e a trilha entra por cima: assim dá para mexer na
música sem refazer os 4.350 quadros. Para tirar a música de volta:

```bash
node scripts/mux.mjs atelie-digital-como-funciona.mp4 mudo
```

Conferir um trecho sem esperar o filme todo:

```bash
DE=39 ATE=50 node scripts/render.mjs 30 trecho.mp4
node scripts/shot.mjs 43 52 96          # quadros avulsos em out/f_*.png
```

Ver no navegador: abra `src/index.html?play` (roda em laço) ou
`src/index.html?t=43` (congela num instante).

> O Chromium usado é o do Playwright. Em outra máquina, aponte o caminho com
> `CHROME=/caminho/para/chrome node scripts/render.mjs`.

## Roteiro

| | cena | entra em | dura |
|---|---|---|---|
| — | Abertura | 0,0 s | 5,5 s |
| 01 | O problema — "Você não vende pouco. Você responde demais." | 5,5 s | 8,0 s |
| 02 | O link da bio — Linktree × vitrine, nos dois celulares | 13,5 s | 10,0 s |
| 03 | A mesa de montagem — os cinco controles e a prévia | 23,5 s | 7,5 s |
| 04 | Fundo da página — papel, areia, névoa, carvão | 31,0 s | 8,0 s |
| 05 | Cor da marca — terrosos, profundos, vivos, neutros | 39,0 s | 11,5 s |
| 06 | Jeito da letra — editorial, minimalista, suave, direto | 50,5 s | 8,5 s |
| 07 | Espaço entre as peças — muito espaço, equilíbrio, vitrine cheia | 59,0 s | 8,0 s |
| 08 | O que entra na home — os seis blocos, ligando e desligando | 67,0 s | 10,5 s |
| 09 | Modelos prontos — oito, por tipo de loja | 77,5 s | 8,5 s |
| 10 | Briefing no WhatsApp — escrito pela página e enviado | 86,0 s | 11,0 s |
| 11 | De onde vêm as cores — as três etapas do estudo de tendências | 97,0 s | 9,5 s |
| 12 | A carta da temporada — os números e os tons batizados | 106,5 s | 8,5 s |
| 13 | Radar de compras — preço do que a loja compra, ofertas, fornecedores novos | 115,0 s | 12,5 s |
| 14 | Três degraus — página, identidade, acompanhamento, mais o adicional | 127,5 s | 10,5 s |
| — | Fechamento — convite para abrir a mesa de montagem | 138,0 s | 7,0 s |

As cenas 03 a 08 usam a mesma composição, nas mesmas coordenadas: com a
dissolvência de 1,1 s entre elas, a sequência lê como um plano só, com a câmera
parada e uma aproximação de 1,8 % por cena.

## Onde mexer

| quero mudar | arquivo |
|---|---|
| textos, cores, nomes de loja, modelos, briefing, números | `src/js/data.js` |
| croquis das peças (casaco, vestido, tailleur, capa) e ícones | `src/js/draw.js` |
| prévia do site, painel de controles, celular, cursor | `src/js/ui.js` |
| o que cada cena faz e quando | `src/js/scenes.js`, `src/js/scenes2.js` |
| duração, dissolvência, rótulos e legendas | `src/js/timeline.js` |
| harmonia, melodia e mistura da trilha | `scripts/music.mjs` |

Mudou a duração de alguma cena? Nada mais precisa ser ajustado: a linha do tempo
soma as durações sozinha, e a trilha aceita o novo total em
`node scripts/music.mjs <segundos>`.

## Decisões de conteúdo

- **Boutiques fictícias.** As demonstrações usam Casa Amaré, Studio Lis e Ateliê
  Nord — nenhum cliente real aparece.
- **Fechamento sem dado pessoal.** A última cartela convida a abrir a mesa de
  montagem; o @ e o telefone ficam fora da tela, para irem na DM junto com o link.
- **Cores nomeadas.** Só os nove tons da carta Outono-Inverno 26/27 que já estão
  medidos aparecem com nome e código; o restante da carta entra como número.
- **O estudo aparece sem nome próprio.** As cenas 11 e 12 explicam o método —
  marcas acompanhadas, cor lida no código, o que se repete vira movimento — e
  fecham na carta da temporada, sem citar o nome do levantamento.
- **O radar de compras é o mesmo estudo virado para o outro lado.** A cena 13
  mostra o serviço adicional: o preço do que a loja compra semana a semana, as
  ofertas achadas e fornecedores novos. Peças, fornecedores e preços são
  fictícios, como as boutiques. A linha de preço usa a faixa da própria série,
  com piso de 14 % — preço parado desenha linha reta, e não serra.
- **O adicional é vendido junto com as cores.** A cena 14 mantém os três degraus
  e põe embaixo, numa faixa à parte, a assinatura mensal: cartela de cores e
  tendências mais radar de compras.
- **A trilha é ambientação, não tema.** Roda de jazz em dó maior a 72 bpm, com
  pico em −6,7 dBFS e nível médio em −25 dBFS. Medida com ponderação A, a faixa
  abaixo de 120 Hz responde por 0,3 % do que se ouve: nada de peso no grave, que
  foi o que fez a trilha anterior soar pesada. A batida entra só aos 18 s e sai
  20 s antes do fim, para abertura e fechamento ficarem só com os acordes.

## Créditos técnicos

Fontes em `src/fonts/` (Playfair Display, IBM Plex Mono, Inter), todas sob a SIL
Open Font License. Nenhuma fotografia: cada peça de roupa na tela é um desenho
vetorial deste repositório.
