# Por que o Ateliê ainda não fechou, e o que muda agora

Leitura feita em 12 de novembro de 2026, a partir do painel Caça-clientes, da Central de Clientes
(setembro), das tarefas agendadas, das páginas publicadas e deste repositório.

## O problema está no design?

Não. O que os números mostram é falta de volume e um último trecho quebrado.

| O que existe | Número |
| --- | --- |
| Lojas no painel Caça-clientes | 478 |
| Lojas que receberam a primeira mensagem | 30 (uma em 2/11 e 29 em 7/11) |
| Lojas que nunca receberam nada | 447 |
| Retornos enviados (dia 3 e dia 7) | 0 |
| Lojas que responderam | 1, a Boutique da Rosa, que mandou as cinco fotos em 3/11 |
| Prévias entregues | 0 (a da Rosa está montada e parada desde 4/11) |
| Na Central de setembro: contatos feitos | 27 (23 e-mails e 4 directs), sem resposta |
| Na Central de setembro: rascunhos que nunca saíram | 38 |
| Propostas escritas para projetos da 99Freelas | 14, nenhuma marcada como enviada |

São menos de 60 abordagens em dois meses. Com trinta mensagens frias, uma resposta é o esperado, e
com uma resposta não dá para concluir nada sobre o design, a oferta ou o texto. Não achei referência
confiável de taxa de resposta para direct frio no Brasil: os números que circulam (de 5% a 25%) vêm
de blogs de quem vende ferramenta de automação. A medida que vale é a sua, e ela precisa de 50 a 100
envios por tipo de mensagem.

O último trecho é o que mais pesa:

- **Não havia link público.** O repositório foi preparado para o GitHub Pages em 3/11, mas o Pages
  nunca foi ligado: o endereço responde "There isn't a GitHub Pages site here". Nem a página de venda
  nem a prévia da Boutique Rosa podiam ser abertas por uma loja, e os artefatos do Claude são
  privados por padrão.
- **A única loja que respondeu espera há oito dias.** A prévia dela está pronta, mas faltavam os
  preços e não havia como mostrar o que já existia.
- **No painel, o link, o WhatsApp e a assinatura estão em branco**, e a frente de e-mail nunca
  rodou: a rotina registrou "Gmail indisponível" nas onze execuções.
- **A rotina empilhava.** Todo dia entravam oito lojas novas numa fila de 447 que ninguém enviava.

### E o design, afinal?

É bom, e não era o que travava. Mas tinha três defeitos para quem compra, que foram corrigidos:

| | Antes | Agora |
| --- | --- | --- |
| Tamanho da página no celular | 19,7 telas | 7,1 telas |
| Onde aparece o preço | tela 11 | tela 4 |
| Coisas clicáveis | 298 | 17 |
| O que a primeira tela mostra | dois parágrafos | a vitrine funcionando, numa moldura de celular |
| Linguagens visuais | três (site, Instagram tátil, vitrines) | uma base (`marca/base.css`) |

O kit tátil do Instagram (massinha, papel-alumínio) é bem feito, mas mostra o gosto de quem desenha.
Quem vende roupa quer ver a própria loja. As peças novas mostram a vitrine de cada nicho.

## Os pontos fracos da ideia, do maior para o menor

1. **Concorre com o grátis.** A Nuvemshop tem plano gratuito (cobra 4,69% por venda no pagamento
   próprio) e a Vendizap entrega catálogo, pedido no WhatsApp, Pix e frete a partir de R$ 79,80 por
   mês, com sete dias de teste. A lista de recursos da página de R$ 890 é a mesma. O que o Ateliê
   vende de verdade é outra coisa: alguém monta por ela, fica com cara de marca e não tem
   mensalidade. A conversa tem de começar por aí, não pelos recursos.
2. **A dor de verdade é manter, não montar.** A sua própria busca de 5/11 achou dezenas de lojas com
   o link de compra morto, suspenso ou trancado: gente que já montou loja e deixou morrer. Uma página
   que depende de a lojista preencher planilha corre o mesmo risco. O serviço recorrente que cabe
   numa boutique pequena é "manda a foto no WhatsApp que a vitrine atualiza", a um preço baixo. O
   Plano Temporada, a R$ 490 por mês, fala com outra cliente.
3. **Nenhuma prova e nenhum rosto.** Perfil novo, sem cliente, sem nome e sem foto, oferecendo algo
   grátis por direct: para a lojista, isso parece golpe. As três primeiras clientes têm de vir de
   onde a confiança é barata: em pessoa, na sua região, e de quem já está pedindo o serviço
   (99Freelas).
4. **O canal contradiz o argumento.** A mensagem diz que o direct dela está lotado e chega pelo
   direct, de uma conta que ela não segue, na pasta de solicitações. O WhatsApp da loja é o balcão:
   lá ela responde tudo. O painel tem 59 lojas com número, e a rotina nova procura os que faltam.
5. **A oferta pedia trabalho antes de dar valor.** "Me manda cinco fotos", depois "me manda preço,
   tamanho e WhatsApp": duas rodadas de tarefa antes de ela ver qualquer coisa. Agora a primeira
   mensagem já leva um link com o nome da loja e a vitrine funcionando.
6. **Preço baixo com trabalho artesanal.** Cada prévia era feita à mão. A fábrica de prévias
   (`scripts/previa.mjs`) derruba esse custo para minutos, e a mesma página serve de entrega.
7. **Produto demais para quem ainda não tem cliente.** Cinco preços na mesma tela. Até fechar cinco
   lojas, vale vender uma coisa só: a página de venda de R$ 890.
8. **Depende da sua disciplina diária.** Mensagem para quem não falou com você só pode sair da sua
   mão: robô de direct derruba o perfil e disparo em massa derruba o número. O sistema não muda
   isso. Ele só faz caber em quinze minutos por dia.

## O que foi feito nesta rodada

| Peça | Onde | O que faz |
| --- | --- | --- |
| Página de venda enxuta | `index.html` | A vitrine na primeira tela, um preço, um botão. Aceita a loja no link (`?l=Nome`) e personaliza título, vitrine e mensagem do WhatsApp. |
| Prévia por link | `v/` | Monta a vitrine de qualquer loja a partir do endereço: nome, @, nicho e cor. Seis nichos com peças de exemplo desenhadas. Termina no convite "mande cinco fotos". |
| Fábrica de prévias | `scripts/previa.mjs` | Gera a prévia com as fotos da loja a partir de um JSON. A da Boutique Rosa já saiu dela, com o botão "Quero colocar no ar". |
| Base de marca | `marca/` | Cor, letra, funções de layout e componentes numa folha só. A etiqueta de roupa vira a forma da marca. Cartão de link, foto de perfil e nove posts gerados por `scripts/marca.mjs`. |
| Rotina diária nova | `rotina/diaria.md` | Monta a fila do dia (15 lojas por prioridade), reconfere o defeito antes de afirmar, procura o WhatsApp, escreve a mensagem com o link da prévia e para de empilhar loja. |
| Revisão semanal | `rotina/semanal.md` | Todo domingo mede o funil, ajusta os pesos e os modelos de mensagem (só com 30 envios ou mais na semana) e escreve três legendas. |
| Painel | `painel/caca-clientes.html` | Mostra a fila do dia, põe o WhatsApp em um toque, grava o canal do envio e a data da resposta, e mostra a taxa de resposta no topo. Salvar os ajustes não apaga mais os campos da rotina. |

## Como isso cresce

As contas abaixo são ordem de grandeza, não previsão. A revisão semanal troca cada hipótese por
número medido.

- **Agora: três lojas fundadoras.** Quinze envios por dia dão uns 330 por mês. Se 3% responderem (o
  que os seus trinta envios mostraram), são dez conversas, cinco prévias e uma ou duas vendas. Se a
  mensagem com link e o WhatsApp levarem a resposta a 8%, são 26 conversas e de três a seis vendas.
  A diferença entre os dois cenários é o que a rotina passa a medir.
- **Com o primeiro caso real: quem chega sozinho.** Os nove posts prontos, a palavra VITRINE nos
  comentários respondida pelo ManyChat (parceiro oficial da Meta; é permitido porque a pessoa falou
  primeiro) e anúncio de clique para WhatsApp com teto de R$ 300. O custo por conversa citado para a
  América Latina é de US$ 1 a 3, em fonte de fornecedor. Corte o anúncio se a prévia pedida passar
  de R$ 60.
- **Depois: quem já tem a confiança das lojas.** Social media, gestor de tráfego, fotógrafo de moda
  e os polos de atacado que já estão no painel. Cada um atende dezenas de boutiques. Comissão por
  página fechada.
- **Produto.** Testar um plano de manutenção de R$ 97 a R$ 149 por mês (ela manda a foto, a vitrine
  atualiza) no lugar do Plano Temporada como primeira mensalidade.

## O que só você pode fazer

1. **Ligar o site.** No GitHub: Settings → Pages → Deploy from a branch → escolha a branch e a pasta
   `/ (root)`. Depois abra `https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Teste`.
2. **Responder a Boutique da Rosa hoje**, com o link `…/previa/boutique-rosa/`, pedindo só os
   preços, os tamanhos e o WhatsApp dos pedidos.
3. **Preencher os Ajustes do painel**: assinatura e WhatsApp.
4. **Ir às lojas da sua região com a vitrine delas no celular.** Os links estão em
   [`docs/prospeccao.md`](prospeccao.md).
5. **Quinze minutos por dia na fila do painel**, começando pelas respostas e pelos retornos.
6. **Trocar as peças do Instagram** pelas de `insta/novo/` e pôr o endereço do site na bio.
7. **Pôr nome, cidade e foto na página** (`QUEM`, no fim de `index.html`). É o que tira a cara de
   anúncio anônimo.

## Fontes

- [Nuvemshop, planos e preços](https://www.nuvemshop.com.br/planos-e-precos), lida em 12/11/2026
- [Vendizap](https://www.vendizap.com/), lida em 12/11/2026
- Custo por conversa em anúncio de clique para WhatsApp: resumo de uma busca de 12/11/2026 entre
  guias de fornecedores de ferramenta, como o da
  [Aurora Inbox](https://www.aurorainbox.com/pt/2026/05/13/o-que-sao-anuncios-clique-para-whatsapp/)
  e o da [Clint](https://www.clint.digital/blog/?p=3691). Não abri cada guia para conferir de qual
  deles sai o número, e nenhum é dado auditado.
- Taxa de resposta de mensagem fria: resumo de uma busca de 12/11/2026 entre blogs de ferramentas
  de automação, como o [DM Champ](https://dmchamp.com/resources/cold-dm-reply-rate-audit/). Nenhum
  publica o método.
