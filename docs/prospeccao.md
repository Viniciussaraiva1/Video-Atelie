# Prospecção do Ateliê Digital

Como a máquina funciona no dia a dia. O porquê de cada escolha está em
[`diagnostico.md`](diagnostico.md).

## O dia, em quinze minutos

1. **7h39** (segunda a sábado): a rotina monta a fila e manda o resumo para o seu celular.
2. Abra o painel **Caça-clientes** (https://claude.ai/artifact/6K4QzMzteg5woABzsmmvSu). Em
   "Para hoje", a ordem já é a certa:
   - **Responder** (verde): quem respondeu vem antes de tudo.
   - **Retornos** (ouro): o lembrete do dia 3 e a última mensagem do dia 7.
   - **Enviar** (vermelho): as lojas da fila do dia, da maior prioridade para a menor.
3. Em cada ficha: "Abrir WhatsApp com a mensagem" (ou "Copiar mensagem" e "Abrir Instagram"),
   envie, e toque em **Já enviei**.
4. A loja respondeu? Cole a resposta na ficha e use **Sugerir resposta**. É esse registro que
   ensina a revisão semanal.

Envie uma por vez, à mão, e no máximo a fila do dia. Quem disser que não quer sai da lista e não
recebe mais nada.

## O que roda sozinho

| Quando | O quê | Onde está escrito |
| --- | --- | --- |
| Segunda a sábado, 7h39 | Rotina diária: fila, mensagens, retornos, projetos da 99Freelas | [`rotina/diaria.md`](../rotina/diaria.md) |
| Domingo, 19h47 | Revisão semanal: funil, pesos, modelos de mensagem, legendas | [`rotina/semanal.md`](../rotina/semanal.md) |

As duas são tarefas agendadas do Claude e leem e escrevem só o banco do painel. Elas não têm
conector de e-mail. Os textos em `rotina/` são a cópia do que está agendado: mudou um, mude o outro.

### Como a fila é escolhida

Cada loja ganha uma nota de 0 a 100, somando os pesos de `config/pesos` no banco do painel:

| Sinal | Peso inicial |
| --- | --- |
| Tem WhatsApp comercial publicado | 25 |
| O link de compra dela está quebrado (conferido no dia) | 25 |
| Fica na sua região (`config.regiao`) | 20 |
| Catálogo improvisado (Drive, álbum, destaques) | 15 |
| Várias vendedoras ou grupo VIP | 12 |
| Nota A | 10 |
| Só uma lista de links | 8 |
| Sinal conferido nos últimos 7 dias | 5 |

A revisão semanal sobe ou desce cada peso em até 5 pontos, conforme o que rendeu resposta.

### Os modelos de mensagem

Ficam em `config/variantes` e são sorteados pelo peso. Os quatro iniciais (cópia em
[`rotina/padroes.json`](../rotina/padroes.json)):

| Modelo | Ideia que testa |
| --- | --- |
| `v1-pergunta` | A mensagem antiga: pede permissão antes de mostrar |
| `v2-rascunho` | Mostra o rascunho da vitrine da loja já montado |
| `v3-defeito` | Só para link quebrado: começa pelo defeito conferido no dia |
| `v4-curta` | Duas linhas e o link |

A revisão semanal redistribui os pesos, aposenta o modelo que rende menos da metade do melhor e
cria uma desafiante por vez. Com menos de 30 envios na semana ela não mexe em nada.

## A prévia

```bash
node scripts/previa.mjs link "Eva Store" --ig evastoremaraba --nicho casual
```

Devolve o link da prévia-relâmpago: a vitrine com o nome da loja e peças de exemplo desenhadas.
Nichos: `casual`, `festa`, `plus`, `praia`, `fitness`, `modesta`. Nada é gerado: o endereço carrega
os dados, e a rotina monta esse link sozinha para cada loja da fila.

Quando a loja manda as fotos:

```bash
node scripts/previa.mjs nova "Eva Store" --ig evastoremaraba
```

```bash
node scripts/previa.mjs gera previa/lojas/eva-store.json
```

O primeiro comando cria `previa/eva-store/img/` (ponha as fotos ali) e o JSON com uma peça por
foto. Ajuste nome e preço, rode o segundo, faça o commit e o link `…/previa/eva-store/` está pronto.

## Lojas da sua região, para visitar com a vitrine no celular

| Loja | Instagram | Prévia |
| --- | --- | --- |
| Núbia Ribeiro (Marabá) | @nubiaribeirooficial | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=N%C3%BAbia+Ribeiro&i=nubiaribeirooficial&r=ig-nubiaribeirooficial |
| Exclusiva Fashion (Marabá) | @exclusivamaraba | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Exclusiva+Fashion&i=exclusivamaraba&r=ig-exclusivamaraba |
| Eva Store (Marabá) | @evastoremaraba | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Eva+Store&i=evastoremaraba&r=ig-evastoremaraba |
| Modinha (Marabá) | @modinha.mba | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Modinha&i=modinha.mba&r=ig-modinha.mba |
| Charmosa (Marabá) | @charmosa.mab | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Charmosa&i=charmosa.mab&r=ig-charmosa.mab |
| Donna Parauapebas | @donnastorepa | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Donna+Parauapebas&i=donnastorepa&r=ig-donnastorepa |
| Bella Mafia Moda Fitness (Eldorado e Canaã) | @bellamafiamodafitnnes | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Bella+Mafia&i=bellamafiamodafitnnes&n=fitness&r=ig-bellamafiamodafitnnes |
| Big Loja (Canaã dos Carajás) | @bigloja.canaa | https://viniciussaraiva1.github.io/Video-Atelie/v/?l=Big+Loja&i=bigloja.canaa&r=ig-bigloja.canaa |

Os links só abrem depois que o GitHub Pages estiver ligado. A ficha de cada loja está no painel;
confira o perfil antes de ir, porque algumas vieram de diretório.

## Quem chega sozinho

Comentário "VITRINE" ou "PRÉVIA" nos posts → resposta automática no direct com o link do site. A
Meta permite porque a pessoa falou primeiro. Configure uma vez no ManyChat (parceiro oficial da
Meta, plano grátis): gatilho "comentário com palavra-chave", em todos os posts, mensagem:

> Oi! Que bom que quer ver a sua vitrine. Me manda o nome da loja e 5 fotos de peças (pode ser
> print do feed) que eu devolvo a prévia montada em até 2 dias úteis, de graça.

## O que a rotina nunca faz

- Enviar direct, WhatsApp, e-mail ou proposta. Quem envia é você.
- Entrar em conta, criar conta ou contornar bloqueio de site.
- Afirmar um defeito que não conferiu no dia, ou inventar fato sobre a loja.
- Dar desconto ou prometer algo fora do campo "Condições" dos Ajustes.
- Fechar negócio. Proposta aceita, pagamento e contrato passam por você.
