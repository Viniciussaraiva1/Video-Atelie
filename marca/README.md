# Base de marca do Ateliê Digital

Uma base só para o site, as peças do Instagram e o cartão de link. As vitrines das lojas seguem
[`base/base-vitrine.css`](../base/base-vitrine.css): lá quem manda é a loja.

**A ideia:** a marca mostra a vitrine da cliente, não a si mesma. Toda peça leva uma vitrine
funcionando ou o preço.

## O que tem aqui

| Arquivo | O que é |
| --- | --- |
| `base.css` | Cor, letra, medida, funções de layout e componentes |
| `simbolo.svg` | A etiqueta com o A: foto de perfil e ícone do site |
| `pecas.html` | O molde das peças (cartão de link, perfil e posts) |
| `cartao.png`, `perfil.png` | Saem de `node scripts/marca.mjs` |
| `../insta/novo/` | Os nove posts, 1080×1350 |

## As escolhas

- **Cor.** Papel `#FAF8F5`, tinta café `#2B2623` e terracota `#9A4A26`, a mesma da página antiga.
  A terracota aparece só no que precisa ser visto: o realce do título, a etiqueta de preço e os
  números dos passos. O verde `#17694A` é exclusivo do botão que abre o WhatsApp.
- **Letra.** Montserrat em tudo, títulos em peso 300. A didone itálica (Bodoni Moda) fica na palavra
  "Digital" da marca e em um realce por título, nunca em texto corrido.
- **A etiqueta.** A forma da marca é a etiqueta de roupa. Preço, prazo e condição vão sempre dentro
  dela (`.etiqueta`), e ela vira o símbolo.
- **O celular.** A vitrine aparece sempre dentro da moldura (`.celular`), viva, e não como desenho.
- **Contraste.** Texto de apoio nunca mais claro que `#6B625C` no papel (5,6:1).

## Funções de layout

| Classe | Para quê |
| --- | --- |
| `.pagina` | Largura máxima com margem lateral |
| `.secao` | Respiro vertical de seção (`.faixa` muda o fundo) |
| `.pilha` | Coluna com vão (`--vao`) |
| `.linha` | Fila que quebra, com vão (`--vao`) |
| `.grade` | Colunas automáticas a partir de uma largura mínima (`--min`) |
| `.dupla` | Duas colunas a partir de 900 px; `.inverte` troca a ordem no computador |

Componentes: `.botao` (`.zap`, `.claro`, `.largo`), `.etiqueta` (`.cheia`), `.celular`, `.cartao`
(`.destaque`), `.passos`, `.lista`, `.prova`, `.assinatura`, `.duvidas`, `.aviso`, `.topo`,
`.barra-fixa`.

## Regras de uso

1. Um botão principal por tela, e ele abre o WhatsApp.
2. Uma frase por peça. Se precisa de duas, são duas peças.
3. Nada de preço escondido e nada de título escrito dentro de imagem.
4. O estilo tátil (massinha, papel-alumínio) continua valendo para movimento, nos Reels. Nas peças
   paradas e no site, quem aparece é a vitrine.

## Gerar as peças

```bash
node scripts/marca.mjs
```

Para uma peça nova, acrescente uma entrada em `PECAS`, dentro de `pecas.html`.
