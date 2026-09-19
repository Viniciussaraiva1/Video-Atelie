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
    { grupo: 'Vivos', cores: [
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

  /* 8 modelos prontos por tipo de loja */
  modelos: [
    { nome: 'Moda feminina',   cor: '#c08a78', fundo: '#faf7f1', letra: 0 },
    { nome: 'Moda praia',      cor: '#3e8a80', fundo: '#f2f2f0', letra: 1 },
    { nome: 'Festa e noivas',  cor: '#5b3a78', fundo: '#faf7f1', letra: 2 },
    { nome: 'Infantil',        cor: '#c39bc4', fundo: '#efe5d7', letra: 2 },
    { nome: 'Joias',           cor: '#e3c14e', fundo: '#1b1a18', letra: 0 },
    { nome: 'Brechó',          cor: '#7b3230', fundo: '#efe5d7', letra: 3 },
    { nome: 'Calçados e bolsas', cor: '#1e2a44', fundo: '#f2f2f0', letra: 1 },
    { nome: 'Plus size',       cor: '#5e1f2b', fundo: '#faf7f1', letra: 3 }
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

  /* briefing gerado automaticamente ao fim da montagem */
  briefing: [
    'Marca: Casa Amaré — moda feminina',
    'Fundo da página: Papel',
    'Cor da marca: Muted Clay #c08a78',
    'Jeito da letra: Editorial',
    'Espaço entre as peças: Equilíbrio',
    'Na home: vitrine, sobre a marca,',
    'depoimentos, WhatsApp e endereço',
    'Vitrine inicial: 12 peças'
  ],

  /* números do estudo de tendências que sustentam as escolhas de cor */
  numeros: [
    { n: '28',  t: 'marcas acompanhadas' },
    { n: '109', t: 'cores lidas no código' },
    { n: '18',  t: 'movimentos de tendência' },
    { n: '15',  t: 'tons na carta 26/27' }
  ],

  /* três degraus de oferta */
  degraus: [
    { n: '01', t: 'Página de venda',   d: 'A vitrine no ar, com as peças, os preços e o botão do WhatsApp.' },
    { n: '02', t: 'Identidade e site', d: 'A cara da marca inteira: cores, letra, fotos e as páginas de dentro.' },
    { n: '03', t: 'Acompanhamento',    d: 'Troca de coleção, leitura dos números e ajuste do que não converte.' }
  ]
};
