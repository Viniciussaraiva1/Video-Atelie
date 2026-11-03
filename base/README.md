# Base de design das vitrines

Toda vitrine e todo site do Ateliê partem destas regras. Elas saíram de um
estudo de Zara, Riachuelo e Farm Rio, feito em 3 de novembro de 2026.

- `base-vitrine.css`: os valores e as peças prontas (cabeçalho, atalhos, grade,
  cartão, ficha, tamanhos e botão de pedido). Cada loja troca só os valores
  marcados com "loja".
- O estudo completo, com as fontes e o desenho do caminho da cliente, está no
  documento "Base de design do Ateliê: Zara, Riachuelo e Farm Rio", no Claude.

## Como o estudo foi feito

- **Farm Rio**: medida na tela, num navegador de teste, no computador (1440 px)
  e no celular (390 px). Foram vistas a página inicial, a vitrine de vestidos e
  uma página de produto.
- **Zara e Riachuelo**: os dois sites recusaram o navegador de teste com
  "Access Denied" (erro 403). Não houve tentativa de contornar o bloqueio.
  - A Zara foi lida em três análises publicadas, de 2023 a 2026.
  - A Riachuelo foi lida na ficha oficial do app e em reportagens sobre a nova
    marca.
  - O layout do site da Riachuelo ficou de fora: nenhuma fonte o descreve.

## As 12 regras

| Gosto | Valor na base | De onde vem |
| --- | --- | --- |
| A foto manda | Foto da peça em 2:3, sem moldura nem sombra; no celular, de ponta a ponta | Farm (2:3 medido); Zara |
| Interface quieta | Fundo branco ou papel #FAF8F5, texto #2B2623, apoio #6B625C, linhas #E7E2DC. A cor fica na foto | Farm (#333 e #999); Zara |
| Contraste que se lê | Texto de apoio nunca mais claro que #6B625C (5,9:1 no branco). O #999 da Farm dá 2,8:1 e não passa | crítica à Zara; medida na Farm |
| Uma letra limpa | Montserrat em tudo, títulos em peso 300; a serifa didone fica só no nome da loja. Corpo de 16 a 17 px, nome da peça em 14 px, nada abaixo de 12 px | Farm (Montserrat, 17 e 14 px, título 300); Zara e Riachuelo (sem serifa na interface, didone só na marca da Zara) |
| Caixa alta com moderação | Só em rótulos de até três palavras, de 11 a 12 px, com espaçamento de 0,14em | Zara (o uso); Farm (a moderação) |
| Grade densa | 2 colunas no celular com 4 px entre as fotos; 3 colunas a partir de 900 px e 4 a partir de 1280 px; botão para trocar a densidade | Farm; Zara (botão VER) |
| Cartão enxuto | Foto, nome numa linha só (corta com reticências), preço inteiro e condição em cinza; um "+" escolhe o tamanho sem sair da grade | Zara (+); Farm |
| Ficha da peça completa | Tamanhos em círculos de 44 px; esgotado riscado com "Avise-me"; medidas por tamanho; composição; frete pelo CEP quando a loja envia | Farm; falhas da Zara |
| Botão de pedido sempre à mão | No celular, fixo no rodapé da ficha; escuro e em pílula. A cor da loja só entra nele quando ela pede | Zara (fixo); Farm (pílula escura) |
| Voz da loja nos botões | "Quero esse", "vem ver as novidades" e "pedir no WhatsApp" em vez de "Comprar". O preço nunca entra na brincadeira | Farm |
| Vitrine em ciclo curto | Novidades na entrada, trocadas a cada 15 dias, com a data à mostra | Riachuelo (loja conceito) |
| Nada por cima da peça | Sem pop-up, sem botão flutuante sobre a foto e nenhuma área que prenda a rolagem | Farm (o que evitar); conserto da página do Ateliê |

Três coisas ficam fora de qualquer produção:

- letra pequena em cinza-claro;
- preço escondido;
- título escrito dentro da imagem, que a busca e o leitor de tela não leem.

## Fontes

- [TYPENORM, "Zara UX Teardown"](https://typenorm.com/articles/zara-ux-teardown) (agosto de 2026)
- [UXmatters, "Usability Audit of the Zara Web Site"](https://www.uxmatters.com/mt/archives/2023/09/usability-audit-of-the-zara-web-site.php) (setembro de 2023)
- [Christine Corbin, auditoria de CRO da Zara](https://www.christinecorbin.com/add-to-cart/zara-cro-ux-audit) (março de 2025)
- [ELLE Brasil, loja conceito e nova identidade da Riachuelo](https://elle.com.br/moda/riachuelo-inaugura-loja-conceito-e-nova-identidade-visual) (dezembro de 2025)
- [Grande Ponto, nova marca da Riachuelo](https://www.grandeponto.com.br/noticia/riachuelo-relanca-marca-com-nova-logo-cor-e-apelido-confira) (junho de 2026)
- [Paraíba Business, Riachuelo e a experiência na loja](https://paraibabusiness.com.br/riachuelo-aposta-em-experiencia-para-conquistar-o-consumidor/) (julho de 2026)
- [App da Riachuelo na App Store](https://apps.apple.com/br/app/riachuelo-roupas-e-compras/id1488532824)
- Farm Rio: [página inicial](https://www.farmrio.com.br/), [vitrine de vestidos](https://www.farmrio.com.br/produtos/vestido) e [uma página de produto](https://www.farmrio.com.br/vestido-curto-estampado-mapa-rio-mapa-rio_multicolorido-376332-61083/p?brand=farm), vistas em 3 de novembro de 2026
