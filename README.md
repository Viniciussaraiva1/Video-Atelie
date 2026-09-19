# Ateliê Digital — vídeo "como funciona"

Peça de vídeo (1920×1080, 30 qps, 2 min e 10 s) que explica, função por função, o
que o **Ateliê Digital** faz: o problema do link da bio, os cinco controles da
mesa de montagem, os modelos prontos, o briefing que vai para o WhatsApp, o
estudo de tendências de onde saem as cores e os três degraus de oferta.

Tudo é feito em JavaScript, sem banco de imagens e sem trilha licenciada:

- **imagem** — uma página HTML animada, desenhada em CSS e SVG (os croquis de moda
  são caminhos vetoriais escritos à mão em `src/js/draw.js`);
- **movimento** — uma linha do tempo determinística: `seek(t)` desenha o quadro
  exato do instante `t`, sem depender de relógio ou de `requestAnimationFrame`;
- **som** — trilha sintetizada por soma de senoides em JavaScript puro
  (`scripts/music.mjs`), ambiente e sem percussão;
- **montagem** — Playwright fotografa quadro a quadro e joga tudo num cano para o
  ffmpeg, que fecha o MP4 com o áudio na mesma passada.

## Como gerar o vídeo

```bash
npm install
npm run video        # trilha + quadros + montagem, ~12 min
```

Ou por etapa:

```bash
npm run music        # out/trilha.wav  (130,5 s, estéreo, 16 bits)
npm run frames       # renderiza e monta out/atelie-digital-como-funciona.mp4
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
| 13 | Três degraus — página, identidade, acompanhamento | 115,0 s | 8,5 s |
| — | Fechamento — convite para abrir a mesa de montagem | 123,5 s | 7,0 s |

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

## Créditos técnicos

Fontes em `src/fonts/` (Playfair Display, IBM Plex Mono, Inter), todas sob a SIL
Open Font License. Nenhuma fotografia: cada peça de roupa na tela é um desenho
vetorial deste repositório.
