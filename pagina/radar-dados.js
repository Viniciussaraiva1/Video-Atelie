/* ============================================================
   RADAR DE PEÇAS — coleta de 17.09.2026
   Campos: m marca · p peça · mo modelo · e estilo · s silhueta
           t tecido · om ombro · es estrutura · fo forro
           c nome de cor · pr preço · u url · cf confiança
   "nd" = não declarado pela marca na página consultada.
   ============================================================ */
const COLETA = "17 de setembro de 2026";

const BLOQUEADAS = [
  {m:"NET-A-PORTER",r:"Verificação anti-robô (403) em todas as páginas de categoria. Não contornada."},
  {m:"Brunello Cucinelli",r:"Páginas de produto retornaram catálogo vazio — bloqueio ou renderização que o leitor não executa."},
  {m:"COMME des GARÇONS",r:"Não é bloqueio: o site oficial não lista produto nenhum. Só navegação numerada e uma galeria de campanha. A ausência de catálogo é a decisão da casa."},
];

const PECAS = [
/* ---- Acne Studios ---- */
{m:"Acne Studios",p:"Waxed canvas blouson jacket",mo:"outerwear",e:"cotidiano",s:"reta",t:"lona encerada",om:"nd",es:"nd",fo:"nd",c:"dark brown",pr:"US$ 1.750",u:"https://www.acnestudios.com/us/en/rw-wn-outw000061/A90737-ADM.html",cf:"alta"},
{m:"Acne Studios",p:"Double-breasted wool coat",mo:"outerwear",e:"alfaiataria-quiet",s:"reta",t:"lã",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 2.050",u:"https://www.acnestudios.com/us/en/rw-wn-outw000059/A90751-900.html",cf:"alta"},
{m:"Acne Studios",p:"Tailored wool coat",mo:"outerwear",e:"alfaiataria-quiet",s:"reta",t:"lã",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 1.900",u:"https://www.acnestudios.com/us/en/tailored-wool-coat-black/A90704-900.html",cf:"alta"},

/* ---- Jacquemus ---- */
{m:"Jacquemus",p:"The Paloma Jacket",mo:"outerwear",e:"editorial",s:"nd",t:"nd",om:"nd",es:"nd",fo:"nd",c:"beige",pr:"US$ 1.850",u:"https://www.jacquemus.com/en_us/the-paloma-jacket/JAW00147AW00864150.html",cf:"alta"},
{m:"Jacquemus",p:"The Tailleur Skirt",mo:"saia",e:"alfaiataria-quiet",s:"nd",t:"nd",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 1.350",u:"https://www.jacquemus.com/en_us/the-tailleur-skirt/SKW00700AW00369990.html",cf:"media"},
{m:"Jacquemus",p:"The Fiocco Skirt",mo:"saia",e:"editorial",s:"nd",t:"nd",om:"nd",es:"nd",fo:"nd",c:"dark grey",pr:"US$ 1.250",u:"https://www.jacquemus.com/en_us/the-fiocco-skirt/SKW00696AK00282970.html",cf:"media"},
{m:"Jacquemus",p:"The Fiocco Knit",mo:"malha",e:"editorial",s:"nd",t:"malha",om:"nd",es:"nd",fo:"nd",c:"dark grey",pr:"US$ 950",u:"https://www.jacquemus.com/en_us/the-fiocco-knit/TOW00923AK00282970.html",cf:"media"},
{m:"Jacquemus",p:"The Citta Pants",mo:"calca",e:"cotidiano",s:"nd",t:"nd",om:"nd",es:"nd",fo:"nd",c:"dark brown",pr:"US$ 790",u:"https://www.jacquemus.com/en_us/the-citta-pants/PAW00661AW00916880.html",cf:"media"},

/* ---- PatBO ---- */
{m:"PatBO",p:"Luma Jacquard Peplum Mini Dress",mo:"vestido",e:"editorial",s:"trapezio",t:"jacquard",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 675",u:"https://patbo.com/products/luma-jacquard-peplum-mini-dress",cf:"media"},
{m:"PatBO",p:"Luma Jacquard Feather Mini Dress",mo:"vestido",e:"editorial",s:"encurtada",t:"jacquard com pluma",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 995",u:"https://patbo.com/products/luma-jacquard-feather-mini-dress",cf:"media"},
{m:"PatBO",p:"Noemi Tweed Mini Dress",mo:"vestido",e:"alfaiataria-quiet",s:"encurtada",t:"tweed",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 795",u:"https://patbo.com/products/noemi-tweed-short-dress-1",cf:"media"},
{m:"PatBO",p:"Tina Knit Mini Dress",mo:"vestido",e:"cotidiano",s:"justa",t:"malha",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 1.095",u:"https://patbo.com/products/tina-knit-mini-dress",cf:"media"},
{m:"PatBO",p:"Isadora Knit Beaded Mini Dress",mo:"vestido",e:"editorial",s:"justa",t:"malha com bordado de contas",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 875",u:"https://patbo.com/products/isadora-knit-beaded-mini-dress",cf:"media"},

/* ---- The Row ---- */
{m:"The Row",p:"Ferro Coat",mo:"outerwear",e:"alfaiataria-quiet",s:"reta",t:"lã dupla face feltrada 78% lã 20% poliamida 2% caxemira",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 2.990",u:"https://www.therow.com/products/ferro-coat-black",cf:"alta"},
{m:"The Row",p:"Malika Coat",mo:"outerwear",e:"alfaiataria-quiet",s:"reta",t:"lã dupla face feltrada",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 2.950",u:"https://www.therow.com/products/malika-coat-black-1",cf:"alta"},
{m:"The Row",p:"Kensington Turtleneck",mo:"malha",e:"minimalismo",s:"justa",t:"nd",om:"nd",es:"nd",fo:"nd",c:"grey",pr:"US$ 1.290",u:"https://www.therow.com/products/kensington-top-grey",cf:"media"},
{m:"The Row",p:"Battersea Cardigan",mo:"malha",e:"minimalismo",s:"reta",t:"nd",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 1.390",u:"https://www.therow.com/products/battersea-cardigan-black",cf:"media"},
{m:"The Row",p:"Gala Pant",mo:"calca",e:"minimalismo",s:"reta",t:"nd",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 1.090",u:"https://www.therow.com/products/gala-pant-black-1",cf:"media"},

/* ---- CELINE ---- */
{m:"CELINE",p:"Flared DB Jacket",mo:"alfaiataria",e:"alfaiataria-quiet",s:"trapezio",t:"nd",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 4.850",u:"https://www.celine.com/en-us/women/ready-to-wear/jackets/flared-db-jacket-RM0IZ1203.38NO.html",cf:"alta"},
{m:"CELINE",p:"Trapeze DB Jacket",mo:"alfaiataria",e:"alfaiataria-quiet",s:"trapezio",t:"nd",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 3.950",u:"https://www.celine.com/en-us/women/ready-to-wear/jackets/trapeze-db-jacket-RM0IN1203.38NO.html",cf:"alta"},
{m:"CELINE",p:"Olivia Jacket in Mohair Wool",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"73% lã 27% mohair",om:"ombro natural",es:"nd",fo:"nd",c:"black",pr:"US$ 3.450",u:"https://www.celine.com/en-us/women/ready-to-wear/jackets/olivia-jacket-in-mohair-wool-RV15D523K.38NO.html",cf:"alta"},
{m:"CELINE",p:"Icone Jacket in Cashmere and Wool Natté",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"caxemira e lã natté",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 5.700",u:"https://www.celine.com/en-us/women/ready-to-wear/jackets/icone-jacket-in-cashmere-and-wool-natte-RV1YH1086.38NO.html",cf:"alta"},
{m:"CELINE",p:"Racer Jacket in Calfskin",mo:"outerwear",e:"editorial",s:"justa",t:"couro de bezerro",om:"nd",es:"nd",fo:"nd",c:"black",pr:"US$ 6.000",u:"https://www.celine.com/en-us/women/ready-to-wear/jackets/racer-jacket-in-calfskin-RV0ZD132O.38NO.html",cf:"alta"},

/* ---- LEMAIRE ---- */
{m:"LEMAIRE",p:"Wrap Coat in Double Wool",mo:"outerwear",e:"minimalismo",s:"ampla",t:"lã dupla",om:"nd",es:"nd",fo:"nd",c:"black",pr:"€ 1.250",u:"https://www.lemaire.fr/products/wrap-coat-black-fall-winter",cf:"alta"},
{m:"LEMAIRE",p:"Short Wrap Coat in Felted Wool Alpaca",mo:"outerwear",e:"minimalismo",s:"encurtada",t:"lã feltrada com alpaca",om:"nd",es:"nd",fo:"nd",c:"black",pr:"€ 1.290",u:"https://www.lemaire.fr/products/short-wrap-coat-women-bk999-black-lf1700-felted-wool-alpaca-co1165-lf1700-bk999",cf:"alta"},
{m:"LEMAIRE",p:"Short Duffle Coat in Double Wool",mo:"outerwear",e:"minimalismo",s:"encurtada",t:"lã dupla",om:"nd",es:"nd",fo:"nd",c:"black",pr:"€ 1.190",u:"https://www.lemaire.fr/products/short-duffle-coat-women-bk999-black-lf1116",cf:"alta"},
{m:"LEMAIRE",p:"Twisted Belted Pants in Heavy Black Denim",mo:"denim",e:"cotidiano",s:"ampla",t:"denim pesado",om:"nd",es:"nd",fo:"nd",c:"black",pr:"€ 490",u:"https://www.lemaire.fr/products/twisted-belted-pants-unisex-bk999-black-ld1055",cf:"alta"},
{m:"LEMAIRE",p:"High Waisted Curved Pants in Heavy Black Denim",mo:"denim",e:"minimalismo",s:"reta",t:"denim pesado",om:"nd",es:"nd",fo:"nd",c:"black",pr:"€ 490",u:"https://www.lemaire.fr/products/high-waisted-curved-pants-women-bk999-black-ld1055",cf:"alta"},

/* ---- TOTEME ---- */
{m:"TOTEME",p:"Structured Shearling Coat",mo:"outerwear",e:"minimalismo",s:"reta",t:"shearling",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"SEK 32.000",u:"https://toteme.com/en-se/collections/ready-to-wear",cf:"alta"},
{m:"TOTEME",p:"Deep Curve Stretch Wool Tank Dress",mo:"vestido",e:"minimalismo",s:"coluna",t:"lã com elastano",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"SEK 4.900",u:"https://toteme.com/en-se/collections/ready-to-wear",cf:"alta"},
{m:"TOTEME",p:"Asymmetric Cashmere Knit",mo:"malha",e:"minimalismo",s:"enviesada",t:"caxemira",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"SEK 5.900",u:"https://toteme.com/en-se/collections/ready-to-wear",cf:"alta"},
{m:"TOTEME",p:"Slit Scuba Skirt",mo:"saia",e:"minimalismo",s:"reta",t:"scuba",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"SEK 4.900",u:"https://toteme.com/en-se/collections/ready-to-wear",cf:"alta"},
{m:"TOTEME",p:"Scarf Lapel Blazer",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"nd",om:"nd",es:"nd",fo:"nd",c:"Taupe Melange",pr:"SEK 7.500",u:"https://toteme.com/en-se/collections/ready-to-wear",cf:"alta"},

/* ---- KHAITE ---- */
{m:"KHAITE",p:"Cain Sweater",mo:"malha",e:"minimalismo",s:"nd",t:"nd",om:"nd",es:"nd",fo:"nd",c:"Biscotti",pr:"US$ 2.400",u:"https://www.khaite.com/collections/knitwear/products/cain-sweater-in-biscotti",cf:"alta"},
{m:"KHAITE",p:"Karo Jean",mo:"denim",e:"minimalismo",s:"reta",t:"denim",om:"nd",es:"nd",fo:"nd",c:"Rialto",pr:"US$ 820",u:"https://www.khaite.com/collections/ready-to-wear",cf:"alta"},
{m:"KHAITE",p:"Emmylou T-Shirt",mo:"malha",e:"cotidiano",s:"justa",t:"nd",om:"nd",es:"nd",fo:"nd",c:"Chestnut",pr:"US$ 320",u:"https://www.khaite.com/collections/ready-to-wear",cf:"alta"},
{m:"KHAITE",p:"Eita Cardigan",mo:"malha",e:"minimalismo",s:"reta",t:"nd",om:"nd",es:"nd",fo:"nd",c:"Biscotti",pr:"US$ 4.500",u:"https://www.khaite.com/collections/ready-to-wear",cf:"alta"},
{m:"KHAITE",p:"Winton Skirt",mo:"saia",e:"minimalismo",s:"trapezio",t:"nd",om:"nd",es:"nd",fo:"nd",c:"Golden Ochre",pr:"US$ 2.300",u:"https://www.khaite.com/collections/ready-to-wear",cf:"alta"},

/* ---- Jil Sander ---- */
{m:"Jil Sander",p:"Lightweight Viscose Crew-Neck Dress",mo:"vestido",e:"minimalismo",s:"reta",t:"viscose leve",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"US$ 1.150",u:"https://www.jilsander.com/en-us/women/ready-to-wear",cf:"alta"},
{m:"Jil Sander",p:"Wool Sablé V-Neck Dress",mo:"vestido",e:"minimalismo",s:"coluna",t:"lã sablé",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"US$ 2.850",u:"https://www.jilsander.com/en-us/women/ready-to-wear",cf:"alta"},
{m:"Jil Sander",p:"Wool Sablé Structured Jacket",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"lã sablé",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"US$ 3.950",u:"https://www.jilsander.com/en-us/women/ready-to-wear/coats-and-jackets",cf:"alta"},
{m:"Jil Sander",p:"Fil-à-Fil Wool Tailored Jacket",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"lã fil-à-fil",om:"nd",es:"nd",fo:"nd",c:"Fog",pr:"US$ 3.750",u:"https://www.jilsander.com/en-us/women/ready-to-wear/coats-and-jackets",cf:"alta"},
{m:"Jil Sander",p:"Wool Gabardine Tailored Jacket",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"gabardine de lã",om:"nd",es:"nd",fo:"nd",c:"Dark Blue",pr:"US$ 3.250",u:"https://www.jilsander.com/en-us/women/ready-to-wear/coats-and-jackets",cf:"alta"},

/* ---- Loro Piana ---- */
{m:"Loro Piana",p:"Scotty Coat",mo:"outerwear",e:"minimalismo",s:"reta",t:"baby cashmere em dupla camada, debrum em cordeiro",om:"nd",es:"nd",fo:"sfoderata",c:"Black",pr:"US$ 9.850",u:"https://us.loropiana.com/en/p/woman/coats-and-capes/scotty-coat-FAO3277",cf:"alta"},
{m:"Loro Piana",p:"Maria Coat",mo:"outerwear",e:"minimalismo",s:"nd",t:"caxemira",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 9.250",u:"https://us.loropiana.com/en/woman/coats-and-outerwear",cf:"alta"},
{m:"Loro Piana",p:"Icer Mini Jacket",mo:"outerwear",e:"minimalismo",s:"encurtada",t:"caxemira Storm System",om:"nd",es:"nd",fo:"nd",c:"Natural Melange",pr:"US$ 7.000",u:"https://us.loropiana.com/en/woman/outerwear-jackets/icer-mini-jacket-FAO6129_A193.html",cf:"media"},
{m:"Loro Piana",p:"Wilson Parka",mo:"outerwear",e:"minimalismo",s:"ampla",t:"seda Storm System",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 6.020",u:"https://us.loropiana.com/en/woman/coats-and-outerwear",cf:"alta"},

/* ---- ZEGNA ---- */
{m:"ZEGNA",p:"Dark Brown Oasi Cashmere Suit",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"100% caxemira Oasi",om:"nd",es:"nd",fo:"forro inteiro",c:"Dark Brown",pr:"US$ 10.900",u:"https://www.zegna.com/us-en/ready-to-wear/suits/product.dark-brown-oasi-cashmere-suit.31807683/",cf:"alta"},
{m:"ZEGNA",p:"Light Grey Oasi Cashmere Suit",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"100% caxemira Oasi",om:"nd",es:"nd",fo:"forro inteiro",c:"Light Grey",pr:"US$ 10.900",u:"https://www.zegna.com/us-en/ready-to-wear/suits/product.light-grey-oasi-cashmere-suit.31806668/",cf:"alta"},

/* ---- Thom Browne ---- */
{m:"Thom Browne",p:"Twill Wool Classic Suit and Tie",mo:"alfaiataria",e:"vanguarda",s:"justa",t:"sarja de lã super 120's",om:"nd",es:"nd",fo:"nd",c:"Charcoal",pr:"US$ 3.180",u:"https://www.thombrowne.com/products/twill-wool-classic-suit-and-tie-msc001a-00626-015",cf:"alta"},
{m:"Thom Browne",p:"Super 120's Twill Classic Suit and Tie",mo:"alfaiataria",e:"vanguarda",s:"justa",t:"sarja de lã super 120's",om:"nd",es:"nd",fo:"nd",c:"Dark Grey",pr:"US$ 3.790",u:"https://www.thombrowne.com/collections/mens-suits",cf:"alta"},
{m:"Thom Browne",p:"Unconstructed Cotton Suiting Relaxed Fit Sportcoat",mo:"alfaiataria",e:"vanguarda",s:"ampla",t:"tecido de alfaiataria em algodão",om:"nd",es:"sem entretela",fo:"nd",c:"Beige",pr:"US$ 2.250",u:"https://www.thombrowne.com/collections/womens-jackets-tailoring",cf:"media"},
{m:"Thom Browne",p:"Wool Seersucker Cropped Jacket",mo:"alfaiataria",e:"vanguarda",s:"encurtada",t:"seersucker de lã",om:"nd",es:"nd",fo:"nd",c:"Light Grey",pr:"US$ 3.750",u:"https://www.thombrowne.com/collections/womens-jackets-tailoring",cf:"alta"},
{m:"Thom Browne",p:"Windowpane Plaid Cool Wool Sportcoat",mo:"alfaiataria",e:"vanguarda",s:"reta",t:"cool wool em xadrez windowpane",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"US$ 2.690",u:"https://www.thombrowne.com/collections/womens-jackets-tailoring",cf:"alta"},

/* ---- Ralph Lauren ---- */
{m:"Ralph Lauren",p:"Gregory Hand-Tailored Wool Serge Suit",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"sarja de lã",om:"nd",es:"nd",fo:"nd",c:"Classic Navy",pr:"US$ 2.995",u:"https://www.ralphlauren.com/men-clothing-suits/r/purple-label",cf:"alta"},
{m:"Ralph Lauren",p:"Kent Hand-Tailored Sharkskin Suit",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"sharkskin",om:"nd",es:"nd",fo:"nd",c:"Navy",pr:"US$ 3.295",u:"https://www.ralphlauren.com/men-clothing-suits/r/purple-label",cf:"alta"},
{m:"Ralph Lauren",p:"Hadley Hand-Tailored Sport Coat",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"nd",om:"nd",es:"nd",fo:"nd",c:"Camel",pr:"US$ 2.495",u:"https://www.ralphlauren.com/men-clothing-sportcoats-blazers/r/purple-label",cf:"alta"},
{m:"Ralph Lauren",p:"Hand-Tailored Suede Utility Jacket",mo:"outerwear",e:"cotidiano",s:"reta",t:"camurça",om:"nd",es:"nd",fo:"nd",c:"Chestnut",pr:"US$ 3.995",u:"https://www.ralphlauren.com/men-clothing-sportcoats-blazers/r/purple-label",cf:"alta"},
{m:"Ralph Lauren",p:"Gregory Handmade Barathea Dinner Jacket",mo:"alfaiataria",e:"editorial",s:"reta",t:"lã barathea",om:"nd",es:"nd",fo:"nd",c:"Cream",pr:"US$ 5.495",u:"https://www.ralphlauren.com/men-clothing-sportcoats-blazers/r/purple-label",cf:"alta"},

/* ---- Yohji Yamamoto ---- */
{m:"Yohji Yamamoto",p:"Bulky Wool Blend Asymmetric Stitch Pullover",mo:"malha",e:"vanguarda",s:"oversize",t:"mescla de lã",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 360",u:"https://theshopyohjiyamamoto.com/",cf:"alta"},
{m:"Yohji Yamamoto",p:"Vintage Military Serge Gathered Coat",mo:"outerwear",e:"vanguarda",s:"ampla",t:"sarja militar vintage",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 2.050",u:"https://theshopyohjiyamamoto.com/",cf:"alta"},
{m:"Yohji Yamamoto",p:"Mohair Faded Plaid Jacquard Long Cape Coat",mo:"outerwear",e:"vanguarda",s:"ampla",t:"jacquard de mohair em xadrez desbotado",om:"nd",es:"nd",fo:"nd",c:"plaid",pr:"US$ 2.050",u:"https://theshopyohjiyamamoto.com/collections/coats",cf:"alta"},
{m:"Yohji Yamamoto",p:"6W Corduroy Tumbler Padded Hunting Coat",mo:"outerwear",e:"cotidiano",s:"reta",t:"veludo cotelê acolchoado",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 3.970",u:"https://theshopyohjiyamamoto.com/collections/coats",cf:"alta"},
{m:"Yohji Yamamoto",p:"Washer Wool Gabardine Concealed Placket Stand Collar Coat",mo:"outerwear",e:"alfaiataria-quiet",s:"reta",t:"gabardine de lã lavada",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 730",u:"https://theshopyohjiyamamoto.com/collections/coats",cf:"alta"},

/* ---- ISSEY MIYAKE ---- */
{m:"ISSEY MIYAKE",p:"PLEATS PLEASE — Flutter",mo:"malha",e:"vanguarda",s:"justa",t:"100% poliéster plissado",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 340",u:"https://us.isseymiyake.com/products/pp68-jk454",cf:"alta"},
{m:"ISSEY MIYAKE",p:"PLEATS PLEASE — Smooth Coat",mo:"outerwear",e:"vanguarda",s:"ampla",t:"poliéster plissado",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 895",u:"https://us.isseymiyake.com/products/pp68-zc891",cf:"media"},
{m:"ISSEY MIYAKE",p:"HOMME PLISSÉ — Tailored Pleats 1 Jacket",mo:"alfaiataria",e:"vanguarda",s:"reta",t:"100% poliéster, forro 100% poliéster",om:"nd",es:"nd",fo:"forro inteiro",c:"nd",pr:"",u:"https://us-store.isseymiyake.com/products/tailored-pleats-1-jacket-3",cf:"alta"},
{m:"ISSEY MIYAKE",p:"PLEATS PLEASE — Mellow Pleats",mo:"malha",e:"minimalismo",s:"reta",t:"poliéster plissado",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 335",u:"https://us.isseymiyake.com/products/pp68-jk281",cf:"media"},

/* ---- Rick Owens ---- */
{m:"Rick Owens",p:"Customs Larry Coat",mo:"outerwear",e:"vanguarda",s:"oversize",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 5.200",u:"https://www.rickowens.eu/en-us/collections/mens-outerwear",cf:"media"},
{m:"Rick Owens",p:"Tower Coat",mo:"outerwear",e:"vanguarda",s:"coluna",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 6.430",u:"https://www.rickowens.eu/en-us/collections/mens-outerwear",cf:"media"},
{m:"Rick Owens",p:"Mastodon Trench",mo:"outerwear",e:"vanguarda",s:"ampla",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 3.675",u:"https://www.rickowens.eu/en-us/collections/mens-outerwear",cf:"media"},
{m:"Rick Owens",p:"Hoodie Robe",mo:"malha",e:"vanguarda",s:"ampla",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 2.680",u:"https://www.rickowens.eu/en-us/collections/women-jackets",cf:"media"},
{m:"Rick Owens",p:"Dafne Robe",mo:"vestido",e:"vanguarda",s:"coluna",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 2.680",u:"https://www.rickowens.eu/en-us/collections/women-jackets",cf:"media"},

/* ---- Maison Margiela ---- */
{m:"Maison Margiela",p:"Tabi Loafers",mo:"calcado",e:"vanguarda",s:"nd",t:"couro de bezerro, forro em couro de cabra",om:"nd",es:"nd",fo:"forro inteiro",c:"black",pr:"US$ 1.280",u:"https://www.maisonmargiela.com/en-us/tabi-loafers-S39WR0021P2820T8013.html",cf:"alta"},
{m:"Maison Margiela",p:"Glam Slam",mo:"bolsa",e:"editorial",s:"nd",t:"couro ovino matelassê, aplicação em bezerro, forro poliéster",om:"nd",es:"nd",fo:"forro inteiro",c:"nd",pr:"",u:"https://www.maisonmargiela.com/en-us/glam-slam-SB2WD0078P4300T8013.html",cf:"alta"},
{m:"Maison Margiela",p:"Cowl-Neck Satin Maxi Dress",mo:"vestido",e:"editorial",s:"coluna",t:"cetim",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 3.170",u:"https://www.maisonmargiela.com/en-us",cf:"media"},
{m:"MM6 Maison Margiela",p:"Anatomic Sneakers",mo:"calcado",e:"cotidiano",s:"nd",t:"couro de bezerro, forro 60% algodão 40% poliéster, sola 100% borracha",om:"nd",es:"nd",fo:"forro inteiro",c:"branco",pr:"US$ 645",u:"https://www.maisonmargiela.com/en-us/anatomic-sneakers-S66WS0106P6435T1003.html",cf:"alta"},
{m:"MM6 Maison Margiela",p:"Numeric Elastic Ballerinas",mo:"calcado",e:"editorial",s:"nd",t:"pelo de potro",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"US$ 780",u:"https://www.maisonmargiela.com/en-us/mm6/",cf:"media"},

/* ---- ZARA ---- */
{m:"ZARA",p:"Long 100% Leather Coat ZW Collection",mo:"outerwear",e:"editorial",s:"reta",t:"100% couro",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"R$ 3.299,00",u:"https://www.zara.com/br/pt/mulher-casacos-l1184.html",cf:"alta"},
{m:"ZARA",p:"Fitted Coat ZW Collection",mo:"outerwear",e:"minimalismo",s:"justa",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"R$ 1.359,00",u:"https://www.zara.com/br/pt/mulher-casacos-l1184.html",cf:"media"},
{m:"ZARA",p:"Crossed Coat with Shoulder Pads",mo:"outerwear",e:"editorial",s:"ampla",t:"nd",om:"ombro descaido",es:"nd",fo:"nd",c:"nd",pr:"R$ 629,00",u:"https://www.zara.com/br/pt/mulher-casacos-l1184.html",cf:"media"},
{m:"ZARA",p:"Wool Coat ZW Collection",mo:"outerwear",e:"cotidiano",s:"reta",t:"lã",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"R$ 899,00",u:"https://www.zara.com/br/pt/mulher-casacos-l1184.html",cf:"alta"},

/* ---- COS ---- */
{m:"COS",p:"Oversized Fluid Single-Breasted Blazer",mo:"alfaiataria",e:"alfaiataria-quiet",s:"oversize",t:"68% acetato de celulose NAIA, 32% poliéster reciclado",om:"nd",es:"sem entretela",fo:"sfoderata",c:"preto",pr:"US$ 74",u:"https://www.cos.com/en-us/women/womenswear/coatsjackets/blazers/product/oversized-fluid-single-breasted-blazer-black-1264465001",cf:"alta"},
{m:"COS",p:"Relaxed Single-Breasted Utility Blazer",mo:"alfaiataria",e:"cotidiano",s:"reta",t:"nd",om:"nd",es:"nd",fo:"nd",c:"preto",pr:"",u:"https://www.cos.com/en-us/women/womenswear/coatsjackets/blazers/product/relaxed-single-breasted-utility-blazer-black-1274424001",cf:"media"},
{m:"COS",p:"Fluid Double-Breasted Wool Blazer",mo:"alfaiataria",e:"alfaiataria-quiet",s:"reta",t:"lã",om:"nd",es:"nd",fo:"nd",c:"chocolate",pr:"",u:"https://www.cos.com/en-gb/women/womenswear/coatsjackets/blazers/product/the-fluid-double-breasted-wool-blazer-chocolate-1271456001",cf:"media"},
{m:"COS",p:"Short Wool Blazer",mo:"alfaiataria",e:"minimalismo",s:"encurtada",t:"lã",om:"nd",es:"nd",fo:"nd",c:"preto",pr:"",u:"https://www.cos.com/en-eu/women/womenswear/coatsjackets/blazers/product/short-wool-blazer-black-1267098001",cf:"media"},

/* ---- AMARO ---- */
{m:"AMARO",p:"Blazer Slim Abotoamento Duplo Alfaiataria",mo:"alfaiataria",e:"cotidiano",s:"justa",t:"78% poliéster 18% viscose 4% elastano, forro 100% poliéster",om:"ombro natural",es:"nd",fo:"forro inteiro",c:"bege",pr:"R$ 459,90",u:"https://amaro.com/products/blazer-slim-abotoamento-duplo-alfaiataria-bege",cf:"alta"},
{m:"AMARO",p:"Trench Coat Curto",mo:"outerwear",e:"cotidiano",s:"reta",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"R$ 712,41",u:"https://amaro.com/",cf:"media"},
{m:"AMARO",p:"Suéter Cashmere Deluxe Gola Alta",mo:"malha",e:"cotidiano",s:"justa",t:"caxemira",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"R$ 854,91",u:"https://amaro.com/",cf:"media"},
{m:"AMARO",p:"Calça Wide com Pregas Alfaiataria",mo:"calca",e:"cotidiano",s:"ampla",t:"nd",om:"nd",es:"nd",fo:"nd",c:"nd",pr:"R$ 303,91",u:"https://amaro.com/",cf:"media"},
{m:"AMARO",p:"Colete Alfaiataria Decote V",mo:"alfaiataria",e:"cotidiano",s:"justa",t:"nd",om:"nd",es:"nd",fo:"nd",c:"marrom escuro",pr:"",u:"https://amaro.com/products/colete-alfaiataria-decote-v-marrom-escuro",cf:"media"},

/* ---- Osklen ---- */
{m:"Osklen",p:"Camisa Classic Linen New",mo:"camisaria",e:"cotidiano",s:"nd",t:"linho",om:"nd",es:"nd",fo:"nd",c:"Marrom",pr:"R$ 797",u:"https://www.osklen.com.br/camisa-classic-linen-new-mc-marrom-77760-376/p",cf:"alta"},
{m:"Osklen",p:"Camisa Rustic Cotton",mo:"camisaria",e:"cotidiano",s:"nd",t:"algodão puro",om:"nd",es:"nd",fo:"nd",c:"Branco",pr:"R$ 497",u:"https://www.osklen.com.br/camisa-rustic-cotton-mc-branco-75465-04/p",cf:"alta"},
{m:"Osklen",p:"Calça Alfaiataria Linen Classic New",mo:"calca",e:"alfaiataria-quiet",s:"nd",t:"linho natural",om:"nd",es:"nd",fo:"nd",c:"Natural",pr:"R$ 1.397",u:"https://www.osklen.com.br/calca-alfaiataria-linen-classic-new-natural-72894-51/p",cf:"alta"},
{m:"Osklen",p:"Jaqueta Double Face Aspen",mo:"outerwear",e:"cotidiano",s:"nd",t:"construção reversível dupla face",om:"nd",es:"nd",fo:"nd",c:"Preto",pr:"R$ 1.497",u:"https://www.osklen.com.br/colecao/masculino/roupas/jaqueta-e-casaco",cf:"media"},
{m:"Osklen",p:"Calça Moletom Raw Seam",mo:"calca",e:"cotidiano",s:"nd",t:"moletom com costura raw seam",om:"nd",es:"nd",fo:"nd",c:"Preto",pr:"R$ 797",u:"https://www.osklen.com.br/calca-moletom-raw-seam-preto-75920-10/p",cf:"media"},

/* ---- FARM Rio ---- */
{m:"FARM Rio",p:"Sand Macaw Jungle Organic Cotton T-Shirt Dress",mo:"vestido",e:"editorial",s:"nd",t:"100% algodão orgânico",om:"nd",es:"nd",fo:"nd",c:"Sand Macaw Jungle",pr:"US$ 70",u:"https://farmrio.com/products/macaw-jungle-sand-mini-t-shirt-dress",cf:"alta"},
{m:"FARM Rio",p:"Black Rococo Flowers Shirt",mo:"camisaria",e:"editorial",s:"reta",t:"100% viscose",om:"nd",es:"nd",fo:"nd",c:"Rococo Flowers Black",pr:"US$ 230",u:"https://farmrio.com/products/rococo-flowers-black-shirt-1",cf:"alta"},
{m:"FARM Rio",p:"Multicolor Usiacuri Midi Skirt",mo:"saia",e:"editorial",s:"trapezio",t:"100% linho Euroflax",om:"nd",es:"nd",fo:"nd",c:"Multicolor Usiacuri",pr:"US$ 198",u:"https://farmrio.com/products/usiacuri-multicolor-maxi-skirt",cf:"alta"},

/* ---- Reformation ---- */
{m:"Reformation",p:"Pomeline Dress",mo:"vestido",e:"cotidiano",s:"ampla",t:"nd",om:"nd",es:"nd",fo:"nd",c:"White",pr:"US$ 228",u:"https://www.thereformation.com/products/pomeline-dress/1319957.html",cf:"media"},
{m:"Reformation",p:"Ginny Cotton Sweater Dress",mo:"vestido",e:"cotidiano",s:"trapezio",t:"algodão com saia de popeline contrastante",om:"nd",es:"nd",fo:"nd",c:"Black",pr:"US$ 139",u:"https://www.thereformation.com/products/ginny-cotton-sweater-dress/1315382.html",cf:"alta"},

/* ---- VEJA ---- */
{m:"VEJA",p:"V-95 Leather White Natural",mo:"calcado",e:"sustentavel",s:"nd",t:"couro Organic Traced e camurça; entressola 13% borracha amazônica, 67% EVA de cana, 11% algodão orgânico; solado 40% borracha amazônica; forro 100% poliéster reciclado",om:"nd",es:"nd",fo:"forro inteiro",c:"White / Natural",pr:"US$ 120",u:"https://www.veja-store.com/en_us/p/v-95-leather-white-natural-QZ2003683.html",cf:"alta"},
{m:"VEJA",p:"Campo ChromeFree Leather White Natural",mo:"calcado",e:"sustentavel",s:"nd",t:"couro curtido sem cromo do sul do Brasil e Uruguai; entressola 11% borracha amazônica, 45% EVA de cana, 13% EVA reciclada; solado 40% borracha amazônica; forro poliéster reciclado",om:"nd",es:"nd",fo:"forro inteiro",c:"White / Natural",pr:"US$ 175",u:"https://www.veja-store.com/en_us/campo-chromefree-leather-white-natural-natural-cp0503147a.html",cf:"alta"},
{m:"VEJA",p:"Condor 2 Alveomesh Nautico Pierre Black",mo:"calcado",e:"sustentavel",s:"nd",t:"cabedal Alveomesh 100% poliéster reciclado; entressola EVA de base biológica com 52% cana; solado 31% borracha amazônica, 30% sílica mineral",om:"nd",es:"nd",fo:"forro inteiro",c:"Nautico / Pierre / Black",pr:"US$ 72",u:"https://www.veja-store.com/en_us/p/condor-2-alveomesh-nautico-pierre-black-CL0102472.html",cf:"alta"},

/* ---- Flavia Aranha ---- */
{m:"Flavia Aranha",p:"Scrunchie Seda Textura",mo:"acessorio",e:"sustentavel",s:"nd",t:"100% seda texturizada de agricultura familiar orgânica do sul do Brasil; tingimento com crajiru, planta nativa da Amazônia",om:"nd",es:"nd",fo:"nd",c:"Bege Crajiru",pr:"",u:"https://www.flaviaaranha.com/produto/scrunchie-seda-textura-bege-crajiru-3095",cf:"alta"},
{m:"Flavia Aranha",p:"Blusa Malha Orgânica Mari",mo:"malha",e:"sustentavel",s:"ampla",t:"algodão orgânico da Paraíba, agricultura familiar; tingimento com cascas de romã e extrato de ferro",om:"nd",es:"nd",fo:"nd",c:"Verde Romã",pr:"",u:"https://www.flaviaaranha.com/produto/blusa-malha-organica-mari-2735",cf:"alta"},
{m:"Flavia Aranha",p:"Blusa Cambraia de Linho Anabel",mo:"camisaria",e:"sustentavel",s:"reta",t:"100% cambraia de linho cultivado sem agrotóxico; tingimento com catuaba, planta nativa rica em tanino",om:"nd",es:"nd",fo:"nd",c:"Laranja Catuaba",pr:"",u:"https://www.flaviaaranha.com/produto/blusa-cambraia-de-linho-anabel-2406",cf:"alta"},
{m:"Flavia Aranha",p:"Blusa Ana Linho",mo:"camisaria",e:"sustentavel",s:"ampla",t:"100% linho; tingimento com extrato de erva-mate",om:"nd",es:"nd",fo:"nd",c:"Areia",pr:"",u:"https://www.flaviaaranha.com/produto/blusa-ana-linho-areia-3001",cf:"alta"},
];

/* Preenchido pela rotina semanal: cada entrada é o diff de uma coleta.
   {data, entraram:[], sairam:[], mudaramPreco:[{m,p,de,para}], nota} */
const MOVIMENTACAO = [];

const MODELOS = {alfaiataria:"Alfaiataria",outerwear:"Outerwear",malha:"Malha",vestido:"Vestido",camisaria:"Camisaria",calca:"Calça",saia:"Saia",denim:"Denim",calcado:"Calçado",bolsa:"Bolsa",acessorio:"Acessório",resort:"Resort"};
const ESTILOS = {editorial:"Editorial",minimalismo:"Minimalismo","alfaiataria-quiet":"Quiet luxury",vanguarda:"Vanguarda",cotidiano:"Cotidiano",sustentavel:"Sustentável"};
