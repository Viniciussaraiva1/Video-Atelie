# Video-Ateliê

Vídeo "Ateliê Digital — como funciona", refeito do zero como composição programável.

**Resultado:** `output/atelie-digital-como-funciona.mp4` (1920×1080, 60 fps, H.264 BT.709, AAC 320 kbps, −14 LUFS)

## O que mudou em relação à versão anterior

| | Antes | Agora |
|---|---|---|
| Imagem | 30 fps, ~1,1 Mbps (texto com artefatos de compressão) | 60 fps, CRF 14 com `tune animation`, cor BT.709 marcada. Texto e traços nítidos |
| Transições | cortes/fades entre cenas | Capítulos entram no tempo da música (1 compasso = 3 s). Rótulo do capítulo desliza, legenda entra palavra por palavra com desfoque, e as cenas 03–08 formam um só plano contínuo (a mesa e o site não saem da tela, só o foco muda) |
| Interação | cursor seco | Cursor com trajetória em arco, clique com onda, seletor "pílula" que desliza entre opções, cores e fundos que interpolam, grade que se reorganiza (FLIP) |
| Correções | lista de DMs passava por cima do cabeçalho; legendas sobrepostas aos celulares | Lista com máscara abaixo do cabeçalho; layout reservando faixa própria para a legenda |
| Trilha | lo-fi genérica | Lo-fi bossa original, feita para o tema (ver abaixo) |

## Trilha: "bossa lo-fi de ateliê"

Composta e sintetizada em `music/compose.py`, sem samples nem gravações de terceiros:

- Rhodes quente (FM), violão de nylon (Karplus-Strong) com batida de bossa, baixo acústico, bateria de escovinha com aro no padrão de bossa, celesta com um motivo curto.
- 80 BPM: cada mudança de capítulo cai exatamente numa barra.
- Foley de ateliê integrado à edição: **máquina de costura** "costura" as passagens entre capítulos, **tesoura** corta a abertura e anuncia o fechamento, **tecido** faz o papel dos whooshes. Cliques, notificações e digitação são sincronizados a partir dos eventos da timeline.
- Chiado de vinil, wow/flutter de fita e saturação suave. Abertura abafada ("atrás da cortina") que se abre.

## Estrutura

```
composition/   index.html + style.css + app.js — todas as cenas numa timeline GSAP pausada
render/        render.js (Chromium headless → quadros → x264, em paralelo), snap.js (stills de revisão)
music/         compose.py — trilha, efeitos e mix
build.sh       gera tudo: quadros → áudio → mux + loudnorm
```

## Como gerar de novo

Requisitos: Node + Playwright (Chromium), Python 3 com `numpy` e `scipy`, `ffmpeg`.

```bash
./build.sh                       # ~12 min em 4 núcleos
node render/snap.js /tmp 12 40   # stills de revisão em 12 s e 40 s
```

Para pré-visualizar no navegador: abra `composition/index.html?play` (toca em tempo real) ou `?t=45` (vai direto para 45 s).
