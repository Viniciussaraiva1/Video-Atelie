#!/usr/bin/env node
/* Fábrica de prévias do Ateliê Digital.

   A prévia é a página v/index.html. Ela se monta de dois jeitos:

   1. Prévia-relâmpago, só com o link (peças de exemplo desenhadas, nenhuma foto):
        node scripts/previa.mjs link "Eva Store" --ig evastoremaraba --nicho casual --cor 9C7A45
      Nichos: casual, festa, plus, praia, fitness, modesta.

   2. Prévia de verdade, com as fotos que a loja mandou:
        node scripts/previa.mjs nova "Eva Store" --ig evastoremaraba   # cria previa/eva-store/ e o JSON
        (ponha as fotos em previa/eva-store/img/ e ajuste nome e preço no JSON)
        node scripts/previa.mjs gera previa/lojas/eva-store.json       # escreve previa/eva-store/index.html
        node scripts/previa.mjs gera --todas

   O endereço público sai de SITE (variável de ambiente) ou do padrão abaixo. */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = (process.env.SITE || 'https://viniciussaraiva1.github.io/Video-Atelie/').replace(/\/?$/, '/');
const NICHOS = ['casual', 'festa', 'plus', 'praia', 'fitness', 'modesta'];

const slug = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const opcoes = args => { const o = { _: [] }; for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) { const k = args[i].slice(2); o[k] = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true; } else o._.push(args[i]); } return o; };
const cor = c => { c = String(c || '').replace(/[^0-9a-f]/gi, ''); return c.length === 6 || c.length === 3 ? c : ''; };

/** Link da prévia-relâmpago: nada é gerado, o endereço carrega os dados. */
export function link({ nome, ig = '', nicho = '', cor: c = '', ref = '' }) {
  const q = new URLSearchParams({ l: nome });
  if (ig) q.set('i', ig.replace(/^@/, ''));
  if (nicho && nicho !== 'casual') q.set('n', nicho);
  if (cor(c)) q.set('c', cor(c));
  if (ref) q.set('r', ref);
  return SITE + 'v/?' + q.toString();
}

function nova(nome, o) {
  const s = slug(nome), pasta = join(RAIZ, 'previa', s), arq = join(RAIZ, 'previa', 'lojas', s + '.json');
  mkdirSync(join(pasta, 'img'), { recursive: true }); mkdirSync(dirname(arq), { recursive: true });
  if (existsSync(arq) && !o.forcar) { console.log('Já existe: ' + arq + ' (use --forcar para recriar)'); return; }
  const fotos = readdirSync(join(pasta, 'img')).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const pecas = (fotos.length ? fotos : ['peca-1.jpg', 'peca-2.jpg', 'peca-3.jpg', 'peca-4.jpg', 'peca-5.jpg']).map((f, i) => ({
    id: slug(basename(f, extname(f))) || 'peca-' + (i + 1), tipo: 'Vestidos', nome: 'Peça ' + (i + 1), preco: 189, selo: i < 2 ? 'Novidade' : '', esgotados: [],
    desc: 'Descrição curta da peça: tecido, modelagem e caimento.',
    cores: [{ nome: 'Cor única', hex: '#CDBBA5', img: 'img/' + f, alt: 'Foto da peça ' + (i + 1) }],
  }));
  const dados = { nome, ig: (o.ig || '').replace(/^@/, ''), whatsapp: o.whatsapp || '', cor: cor(o.cor) ? '#' + cor(o.cor) : '', ref: o.ref || (o.ig ? 'ig-' + o.ig.replace(/^@/, '') : s),
    novidades: new Date().toISOString().slice(0, 10), freteGratis: 399, tamanhos: ['P', 'M', 'G', 'GG'],
    chamada: ['Chegaram as ', 'novidades', ' da estação'], texto: '', historia: '', vantagens: ['3x sem juros no cartão', '5% de desconto no Pix', 'Envio para todo o Brasil', 'Primeira troca grátis'], pecas };
  writeFileSync(arq, JSON.stringify(dados, null, 2) + '\n');
  console.log('Criado ' + arq + (fotos.length ? ' com ' + fotos.length + ' fotos' : '') + '\nFotos em: ' + join(pasta, 'img') + '\nDepois: node scripts/previa.mjs gera previa/lojas/' + s + '.json');
}

function gera(arq) {
  const d = JSON.parse(readFileSync(arq, 'utf8')), s = slug(basename(arq, '.json')), pasta = join(RAIZ, 'previa', s);
  if (!d.nome || !Array.isArray(d.pecas) || !d.pecas.length) throw new Error(arq + ': faltam "nome" ou "pecas"');
  const faltam = d.pecas.flatMap(p => p.cores.map(c => c.img)).filter(i => !/^(https?:|data:)/.test(i) && !existsSync(join(pasta, i)));
  if (faltam.length) console.warn('  aviso: fotos que ainda não estão na pasta: ' + faltam.join(', '));
  for (const k of ['texto', 'historia', 'cor', 'whatsapp']) if (!d[k]) delete d[k];
  let html = readFileSync(join(RAIZ, 'v', 'index.html'), 'utf8');
  const marco = html.lastIndexOf('<script>', html.indexOf('/* ===== dados da prévia'));
  if (marco < 0) throw new Error('v/index.html mudou: não achei o início dos dados');
  /* "<" não pode aparecer dentro do JSON embutido na página */
  html = (html.slice(0, marco) + '<script>window.PREVIA = ' + JSON.stringify(d).replace(/</g, '\\u003c') + ';</script>\n' + html.slice(marco)).replaceAll('href="../"', 'href="../../"');
  mkdirSync(pasta, { recursive: true });
  writeFileSync(join(pasta, 'index.html'), html);
  console.log(d.nome + ' → ' + SITE + 'previa/' + s + '/');
}

const [cmd, ...resto] = process.argv.slice(2), o = opcoes(resto);
if (cmd === 'link' && o._[0]) {
  if (o.nicho && !NICHOS.includes(o.nicho)) console.warn('  aviso: nicho desconhecido, a página usa "casual". Opções: ' + NICHOS.join(', '));
  console.log(link({ nome: o._[0], ig: o.ig, nicho: o.nicho, cor: o.cor, ref: o.ref }));
} else if (cmd === 'nova' && o._[0]) nova(o._[0], o);
else if (cmd === 'gera' && (o._[0] || o.todas)) {
  const lista = o.todas ? readdirSync(join(RAIZ, 'previa', 'lojas')).filter(f => f.endsWith('.json')).map(f => join(RAIZ, 'previa', 'lojas', f)) : o._;
  lista.forEach(gera);
} else if (cmd) { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0].replace('#!/usr/bin/env node\n/* ', '')); process.exitCode = 1; }
