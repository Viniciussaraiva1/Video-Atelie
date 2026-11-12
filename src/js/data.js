/* ---------------------------------------------------------------
   Conteúdo do vídeo: tudo que aparece escrito na tela mora aqui.
   Trocar texto, cor ou nome de loja é mexer só neste arquivo.
----------------------------------------------------------------*/
const DATA = {
  /* boutiques fictícias usadas nas demonstrações */
  lojas: [
    { nome: 'Casa Amaré', url: 'casaamare.com.br', cidade: 'Belo Horizonte · MG' },
    { nome: 'Studio Lis', url: 'studiolis.com.br', cidade: 'Curitiba · PR' },
    { nome: 'Ateliê Nord', url: 'atelienord.com.br', cidade: 'Florianópolis · SC' }
  ],

  /* DMs que a lojista responde no braço, todo dia */
  dms: ['quanto custa?', 'tem no P?', 'faz entrega?', 'chega em quanto tempo?',
        'tem em outra cor?', 'aceita pix?', 'ainda tem?', 'qual o tamanho da manga?',
        'manda o preço?', 'tem loja física?'],

  /* CONTROLE 1 — Fundo da página */
  fundos: [
    { nome: 'Papel',  bg: '#faf7f1', fg: '#171614' },
    { nome: 'Areia',  bg: '#efe5d7', fg: '#171614' },
    { nome: 'Névoa',  bg: '#f2f2f0', fg: '#171614' },
    { nome: 'Carvão', bg: '#1b1a18', fg: '#f4f1ea' }
  ],

  /* CONTROLE 2 — Cor da marca, nos grupos do site.
     Os tons nomeados vêm da carta Outono-Inverno 26/27 do estudo de tendências. */
  grupos: [
    { grupo: 'Terrosos', cores: [
      { nome: 'Muted Clay', hex: '#c08a78' }, { nome: 'Terracota', hex: '#b5644a' },
      { nome: 'Areia tostada', hex: '#c9a17a' }, { nome: 'Argila', hex: '#a9705b' } ] },
    { grupo: 'Profundos', cores: [
      { nome: 'Red Mahogany', hex: '#7b3230' }, { nome: 'Bordô', hex: '#5e1f2b' },
      { nome: 'Marinho', hex: '#1e2a44' }, { nome: 'Púrpura', hex: '#5b3a78' } ] },
    { grupo: 'Saturados', cores: [
      { nome: 'Acacia', hex: '#e3c14e' }, { nome: 'Chartreuse', hex: '#c3d14a' },
      { nome: 'Foxglove', hex: '#c39bc4' }, { nome: 'Neptune Green', hex: '#3e8a80' } ] },
    { grupo: 'Neutros', cores: [
      { nome: 'Cru', hex: '#e2dacb' }, { nome: 'Pedra', hex: '#9a958c' },
      { nome: 'Grafite', hex: '#3b3a37' }, { nome: 'Tinta', hex: '#171614' } ] }
  ],

  /* CONTROLE 3 — Jeito da letra */
  letras: [
    { nome: 'Editorial',   fam: "'Playfair',serif",     peso: 400, ls: '-.02em', it: 'italic', esc: 1.00 },
    { nome: 'Minimalista', fam: "'Inter',sans-serif",   peso: 300, ls: '.16em',  it: 'normal', esc: .72 },
    { nome: 'Suave',       fam: "'Playfair',serif",     peso: 400, ls: '.01em',  it: 'normal', esc: .92 },
    { nome: 'Direto',      fam: "'Inter',sans-serif",   peso: 700, ls: '-.025em',it: 'normal', esc: .84 }
  ],

  /* CONTROLE 4 — Espaço entre as peças */
  espacos: [
    { nome: 'Muito espaço',  cols: 2, gap: 40, card: 300 },
    { nome: 'Equilíbrio',    cols: 3, gap: 26, card: 230 },
    { nome: 'Vitrine cheia', cols: 4, gap: 14, card: 176 }
  ],

  /* CONTROLE 5 — O que entra na home */
  secoes: [
    { id: 'vitrine',  nome: 'Vitrine',                 fixa: true },
    { id: 'sobre',    nome: 'Sobre a marca' },
    { id: 'clientes', nome: 'O que as clientes dizem' },
    { id: 'whats',    nome: 'WhatsApp' },
    { id: 'avise',    nome: 'Avise-me' },
    { id: 'endereco', nome: 'Endereço' }
  ],

  /* os 12 modelos prontos da página do Ateliê, com o mesmo nome, fundo e cor */
  modelos: [
    { nome: 'Boutique de vestido',   cor: '#7a6a5b', fundo: '#fdfbf7', letra: 0 },
    { nome: 'Marca autoral',         cor: '#101012', fundo: '#ffffff', letra: 1 },
    { nome: 'Alfaiataria feminina',  cor: '#1e2a44', fundo: '#f2f0ee', letra: 1 },
    { nome: 'Slow fashion e linho',  cor: '#bfccb6', fundo: '#f4eee2', letra: 2 },
    { nome: 'Tricot e malharia',     cor: '#c19a6b', fundo: '#efe7da', letra: 0 },
    { nome: 'Festa e noiva',         cor: '#6b1f26', fundo: '#17151a', letra: 2 },
    { nome: 'Beachwear e resort',    cor: '#3e8a92', fundo: '#e8ede9', letra: 1 },
    { nome: 'Lingerie e loungewear', cor: '#e0cdc0', fundo: '#f2f0ee', letra: 2 },
    { nome: 'Curve autoral',         cor: '#a8305f', fundo: '#fdfbf7', letra: 0 },
    { nome: 'Denim autoral',         cor: '#2b3a67', fundo: '#ffffff', letra: 3 },
    { nome: 'Multimarcas curada',    cor: '#a99c8c', fundo: '#f4eee2', letra: 0 },
    { nome: 'Vintage garimpado',     cor: '#8a7439', fundo: '#141b2b', letra: 0 }
  ],

  /* peças da vitrine de demonstração */
  pecas: [
    { nome: 'Casaco Amaré',    preco: 'R$ 689',  croqui: 'casaco'  },
    { nome: 'Vestido Lis',     preco: 'R$ 420',  croqui: 'vestido' },
    { nome: 'Tailleur Nord',   preco: 'R$ 780',  croqui: 'tailleur'},
    { nome: 'Capa Inverno',    preco: 'R$ 545',  croqui: 'capa'    },
    { nome: 'Vestido Midi',    preco: 'R$ 389',  croqui: 'vestido' },
    { nome: 'Blazer Alfaiate', preco: 'R$ 612',  croqui: 'tailleur'},
    { nome: 'Sobretudo',       preco: 'R$ 890',  croqui: 'casaco'  },
    { nome: 'Capa Curta',      preco: 'R$ 468',  croqui: 'capa'    }
  ],

  /* pedido de prévia que a mesa escreve sozinha. Vai pelo WhatsApp com
     cinco fotos de peças, e a prévia volta montada antes de qualquer pagamento. */
  briefing: [
    'Loja: Casa Amaré — moda feminina, BH',
    'Modelo: Boutique de vestido',
    'Fundo: Papel · Cor: Muted Clay',
    'Letra: Editorial · Vitrine: Equilíbrio',
    'Na home: sobre, depoimentos e WhatsApp'
  ],
  previa: {
    prazo: 'em até 2 dias úteis',
    fotos: ['casaco', 'vestido', 'tailleur', 'capa', 'vestido'],
    convite: 'Me manda o que você montou e cinco fotos de peças. A prévia é por minha conta.',
    resposta: 'Recebi! A sua vitrine fica pronta em até 2 dias úteis. Se não gostar, não paga nada.'
  },

  /* acompanhamento de compras: o que a loja compra, ofertas e fornecedores novos.
     Os preços são por peça ou por metro, lidos semana a semana. */
  compras: {
    radar: [
      { peca: 'Vestido midi em viscose', seg: 'Malharia',    forn: 'Atacado Vila Nova',
        serie: [68, 70, 69, 66, 67, 63, 61, 60], vr: '−12%', dir: 'desce' },
      { peca: 'Alfaiataria em lã fria',  seg: 'Alfaiataria', forn: 'Lanifício Trentino',
        serie: [82, 81, 83, 84, 83, 86, 86, 87], vr: '+6%',  dir: 'sobe' },
      { peca: 'Linho tinto em peça',     seg: 'Tecelagem',   forn: 'Tecidos Aurora',
        serie: [51, 52, 50, 49, 50, 48, 47, 47], vr: '−8%',  dir: 'desce' },
      { peca: 'Casaco de lã batida',     seg: 'Inverno',     forn: 'Malharia São Bento',
        serie: [96, 95, 97, 96, 95, 96, 97, 96], vr: 'igual', dir: 'igual' },
      { peca: 'Aviamentos e botões',     seg: 'Aviamentos',  forn: 'Casa Marfim',
        serie: [34, 33, 31, 30, 28, 27, 27, 27], vr: '−21%', dir: 'desce' }
    ],
    /* o que o radar achou no mês. A economia é diferença de preço vezes a
       quantidade que a loja já ia comprar, e o fornecedor novo entra aqui
       quando sai mais barato que o de sempre. */
    ofertas: [
      { peca: 'Vestido midi em viscose', forn: 'Atacado Vila Nova',
        de: 'R$ 68', por: 'R$ 60', nota: 'lote de 40 peças · até sexta', ganho: 320 },
      { peca: 'Linho tinto em peça', forn: 'Tecelagem Brandão · fornecedor novo', novo: true,
        de: 'R$ 47', por: 'R$ 42', nota: 'preço do metro · 80 m · entrega em 6 dias', ganho: 400 },
      { peca: 'Aviamentos e botões', forn: 'Casa Marfim',
        de: 'R$ 34', por: 'R$ 27', nota: '45 kits · pedido fechado do mês', ganho: 315 }
    ],
    mes: { economia: 1035, radar: 340 }
  },

  /* números do estudo de tendências que sustentam as escolhas de cor */
  numeros: [
    { n: '28',  t: 'marcas acompanhadas' },
    { n: '109', t: 'cores lidas no código' },
    { n: '18',  t: 'movimentos de tendência' },
    { n: '15',  t: 'tons na carta 26/27' }
  ],

  /* a oferta em dois passos, com os mesmos preços da página do Ateliê:
     primeiro a vitrine, com pagamento único; depois a temporada, mês a mês */
  precos: [
    { k: 'Passo 1 · a vitrine', s: 'pagamento único', itens: [
      { t: 'Página de venda', p: 'R$ 890',
        d: 'Vitrine com carrinho, Pix, cartão e frete pelo CEP. No ar em 7 dias úteis.' },
      { t: 'Identidade e site', p: 'R$ 2.490', selo: 'o mais pedido',
        d: 'Tudo da página, mais cartela exclusiva, manual da marca e ficha de cada peça.' } ] },
    { k: 'Passo 2 · a temporada', s: 'mensal, sem fidelidade', itens: [
      { t: 'Plano Temporada', p: 'R$ 490', u: '/mês',
        d: 'Os números do mês, o ajuste do que não vende e a cartela refeita a cada coleção.' },
      { t: 'Radar de compra', p: '+ R$ 340', u: '/mês',
        d: 'O preço do que você compra, as ofertas da semana e fornecedores novos.' } ] }
  ],

  /* o que vem junto e não muda o preço — as mesmas regras da página */
  inclusos: ['Sem mensalidade na página', 'Pix e cartão caem direto na sua conta',
             'Catálogo sem limite de peças', 'A cartela e o manual ficam com você'],

  /* o risco sai das costas da lojista */
  semRisco: [
    { n: '01', t: 'Prévia grátis', d: 'Cinco peças suas montadas na vitrine, em até 2 dias úteis. Não gostou, não paga.' },
    { n: '02', t: 'Metade para começar', d: 'Aprovou a prévia: 50% para começar e o resto só com a página no ar.' },
    { n: '03', t: 'No ar em 7 dias úteis', d: 'Com uma rodada de ajuste. Mensalidade só se você quiser a temporada.' }
  ]
};
