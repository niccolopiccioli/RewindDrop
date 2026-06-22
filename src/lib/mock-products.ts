/**
 * Catalogo demo — modifica questo file per cambiare nome, prezzo, SKU, tag, ecc.
 * Poi esegui: npm run db:seed
 */

import type { CategoryImageKey } from "./mock-images";

export type MockCategorySlug =
  | "t-shirts"
  | "felpe"
  | "pantaloni"
  | "cappelli"
  | "borse"
  | "giacche"
  | "sneakers";

export type MockProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  featured?: boolean;
  tags: string[];
  category: MockCategorySlug;
  /** Taglie disponibili — omesso per accessori taglia unica */
  sizes?: string[];
  colors?: { name: string; hex: string }[];
};

export const MOCK_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export const MOCK_SIZES_NO_XS = ["S", "M", "L", "XL"] as const;

/** 30 prodotti — 5 per categoria */
export const MOCK_PRODUCTS: MockProduct[] = [
  // —— T-Shirts ——
  {
    name: "Essential Tee - Nero",
    slug: "essential-tee-nero",
    description: "Maglietta in cotone premium, fit relax. Logo ricamato sul petto.",
    price: 39.99,
    comparePrice: 49.99,
    sku: "ET-001-NER",
    featured: true,
    tags: ["tee", "nero", "cotone"],
    category: "t-shirts",
    sizes: [...MOCK_SIZES],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Essential Tee - Bianco",
    slug: "essential-tee-bianco",
    description: "Classico bianco in cotone pettinato, logo discreto.",
    price: 39.99,
    sku: "ET-002-BIA",
    featured: true,
    tags: ["tee", "bianco", "cotone"],
    category: "t-shirts",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Bianco", hex: "#FFFFFF" }],
  },
  {
    name: "Oversized Graphic Tee",
    slug: "oversized-graphic-tee",
    description: "T-shirt oversize 240gsm con stampa frontale minimal.",
    price: 44.99,
    comparePrice: 54.99,
    sku: "OGT-003-NER",
    tags: ["tee", "oversize", "graphic"],
    category: "t-shirts",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Vintage Wash Tee",
    slug: "vintage-wash-tee",
    description: "Trattamento vintage wash, taglio regular fit.",
    price: 42.99,
    sku: "VWT-004-GRG",
    tags: ["tee", "vintage", "grigio"],
    category: "t-shirts",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Grigio", hex: "#808080" }],
  },
  {
    name: "Long Sleeve Basic",
    slug: "long-sleeve-basic",
    description: "Manica lunga in jersey di cotone, base layer versatile.",
    price: 49.99,
    sku: "LSB-005-NER",
    tags: ["tee", "manica-lunga", "basic"],
    category: "t-shirts",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Bianco", hex: "#FFFFFF" },
    ],
  },

  // —— Felpe ——
  {
    name: "Urban Hoodie - Grigio",
    slug: "urban-hoodie-grigio",
    description: "Felpa pesante con tasca canguro e cappuccio regolabile.",
    price: 89.99,
    comparePrice: 109.99,
    sku: "UH-001-GRG",
    featured: true,
    tags: ["hoodie", "grigio", "felpa"],
    category: "felpe",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Grigio", hex: "#808080" }],
  },
  {
    name: "Essential Hoodie - Nero",
    slug: "essential-hoodie-nero",
    description: "French terry 400gsm, interno spazzolato, logo ricamato.",
    price: 94.99,
    comparePrice: 119.99,
    sku: "EH-002-NER",
    featured: true,
    tags: ["hoodie", "nero", "french-terry"],
    category: "felpe",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Zip Hoodie - Charcoal",
    slug: "zip-hoodie-charcoal",
    description: "Felpa con zip integrale e tasche laterali.",
    price: 99.99,
    sku: "ZH-003-CHR",
    tags: ["hoodie", "zip", "charcoal"],
    category: "felpe",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Charcoal", hex: "#36454F" }],
  },
  {
    name: "Crewneck Sweatshirt",
    slug: "crewneck-sweatshirt",
    description: "Girocollo in cotone organico, polsini e fondo a coste.",
    price: 79.99,
    sku: "CS-004-BEI",
    tags: ["felpa", "crewneck", "beige"],
    category: "felpe",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [
      { name: "Beige", hex: "#D4C4A8" },
      { name: "Nero", hex: "#000000" },
    ],
  },
  {
    name: "Oversized Hoodie",
    slug: "oversized-hoodie",
    description: "Silhouette oversize con spalle cadenti e maniche ampie.",
    price: 104.99,
    comparePrice: 129.99,
    sku: "OH-005-NER",
    featured: true,
    tags: ["hoodie", "oversize", "statement"],
    category: "felpe",
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Nero", hex: "#000000" }],
  },

  // —— Pantaloni ——
  {
    name: "Cargo Joggers",
    slug: "cargo-joggers",
    description: "Joggers con tasche cargo, cintura elasticata e caviglie.",
    price: 79.99,
    sku: "CJ-001-NER",
    tags: ["pantaloni", "cargo", "joggers"],
    category: "pantaloni",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Wide Leg Trousers",
    slug: "wide-leg-trousers",
    description: "Wide leg in twill di cotone, piega frontale sartoriale.",
    price: 89.99,
    comparePrice: 109.99,
    sku: "WLT-002-NER",
    featured: true,
    tags: ["pantaloni", "wide-leg", "twill"],
    category: "pantaloni",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Tech Fleece Joggers",
    slug: "tech-fleece-joggers",
    description: "Tech fleece termico con tasche zip.",
    price: 84.99,
    sku: "TFJ-003-GRG",
    tags: ["pantaloni", "tech-fleece", "joggers"],
    category: "pantaloni",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Grigio", hex: "#808080" }],
  },
  {
    name: "Denim Carpenter Pants",
    slug: "denim-carpenter-pants",
    description: "Carpenter in denim pesante, fit straight.",
    price: 99.99,
    sku: "DCP-004-IND",
    tags: ["pantaloni", "denim", "carpenter"],
    category: "pantaloni",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Indaco", hex: "#3F5277" }],
  },
  {
    name: "Parachute Pants",
    slug: "parachute-pants",
    description: "Nylon leggero con coulisse, silhouette anni '90.",
    price: 74.99,
    comparePrice: 94.99,
    sku: "PP-005-NER",
    featured: true,
    tags: ["pantaloni", "parachute", "nylon"],
    category: "pantaloni",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Olive", hex: "#556B2F" },
    ],
  },

  // —— Cappelli ——
  {
    name: "Classic Dad Cap",
    slug: "classic-dad-cap",
    description: "Visiera ricurva, logo cucito, chiusura metallica.",
    price: 29.99,
    sku: "CDC-001-NER",
    featured: true,
    tags: ["cappello", "cap", "classic"],
    category: "cappelli",
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Olive", hex: "#556B2F" },
      { name: "Navy", hex: "#000080" },
    ],
  },
  {
    name: "Street Beanie",
    slug: "street-beanie",
    description: "Beanie in lana merino con etichetta ricamata.",
    price: 24.99,
    sku: "SB-002-NER",
    tags: ["beanie", "cappello", "inverno"],
    category: "cappelli",
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Grigio", hex: "#808080" },
    ],
  },
  {
    name: "5-Panel Cap",
    slug: "5-panel-cap",
    description: "5 pannelli in canvas, visiera piatta, snapback.",
    price: 32.99,
    sku: "5PC-003-BEI",
    tags: ["cappello", "5-panel", "canvas"],
    category: "cappelli",
    colors: [
      { name: "Beige", hex: "#D4C4A8" },
      { name: "Nero", hex: "#000000" },
    ],
  },
  {
    name: "Bucket Hat",
    slug: "bucket-hat",
    description: "Bucket in twill con cuciture rinforzate.",
    price: 34.99,
    sku: "BH-004-OLI",
    tags: ["cappello", "bucket", "estate"],
    category: "cappelli",
    colors: [{ name: "Olive", hex: "#556B2F" }],
  },
  {
    name: "Snapback Logo Cap",
    slug: "snapback-logo-cap",
    description: "Snapback strutturato con logo 3D sul fronte.",
    price: 31.99,
    sku: "SLC-005-NAV",
    tags: ["cappello", "snapback", "logo"],
    category: "cappelli",
    colors: [{ name: "Navy", hex: "#000080" }],
  },

  // —— Borse ——
  {
    name: "Crossbody Bag",
    slug: "crossbody-bag",
    description: "Tracolla regolabile, chiusura zip, tasca posteriore.",
    price: 59.99,
    comparePrice: 79.99,
    sku: "CBB-001-NER",
    featured: true,
    tags: ["borsa", "crossbody", "accessori"],
    category: "borse",
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Olive", hex: "#556B2F" },
    ],
  },
  {
    name: "Mini Backpack",
    slug: "mini-backpack",
    description: "Zaino compatto in nylon, scomparto laptop 13\".",
    price: 79.99,
    comparePrice: 99.99,
    sku: "MB-002-NER",
    featured: true,
    tags: ["borsa", "zaino", "mini"],
    category: "borse",
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Tote Bag Canvas",
    slug: "tote-bag-canvas",
    description: "Canvas pesante, manici rinforzati, stampa serigrafica.",
    price: 39.99,
    sku: "TBC-003-BEI",
    tags: ["borsa", "tote", "canvas"],
    category: "borse",
    colors: [
      { name: "Beige", hex: "#D4C4A8" },
      { name: "Nero", hex: "#000000" },
    ],
  },
  {
    name: "Belt Bag",
    slug: "belt-bag",
    description: "Marsupio con cintura regolabile e tasche zip.",
    price: 49.99,
    sku: "BB-004-NER",
    tags: ["borsa", "marsupio", "belt-bag"],
    category: "borse",
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Weekender Duffle",
    slug: "weekender-duffle",
    description: "Borsone weekend in nylon balistico, tracolla removibile.",
    price: 89.99,
    sku: "WD-005-GRG",
    tags: ["borsa", "duffle", "weekender"],
    category: "borse",
    colors: [{ name: "Grigio", hex: "#808080" }],
  },

  // —— Giacche ——
  {
    name: "Bomber Jacket",
    slug: "bomber-jacket",
    description: "Bomber in nylon con fodera, tasche laterali e zip.",
    price: 149.99,
    comparePrice: 189.99,
    sku: "BJ-001-NER",
    featured: true,
    tags: ["giacca", "bomber", "outerwear"],
    category: "giacche",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Puffer Jacket",
    slug: "puffer-jacket",
    description: "Imbottitura sintetica riciclata, leggera e compressibile.",
    price: 179.99,
    comparePrice: 219.99,
    sku: "PJ-002-NER",
    featured: true,
    tags: ["giacca", "puffer", "inverno"],
    category: "giacche",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Coach Jacket",
    slug: "coach-jacket",
    description: "Nylon leggero con fodera mesh, coste elasticizzate.",
    price: 129.99,
    sku: "COJ-003-NAV",
    tags: ["giacca", "coach", "nylon"],
    category: "giacche",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Navy", hex: "#000080" }],
  },
  {
    name: "Denim Trucker Jacket",
    slug: "denim-trucker-jacket",
    description: "Trucker in denim medio, bottoni metallici, tasche a patta.",
    price: 139.99,
    sku: "DTJ-004-IND",
    tags: ["giacca", "denim", "trucker"],
    category: "giacche",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [{ name: "Indaco", hex: "#3F5277" }],
  },
  {
    name: "Windbreaker",
    slug: "windbreaker",
    description: "Antivento ripstop con cappuccio nascosto, resistente all'acqua.",
    price: 119.99,
    comparePrice: 149.99,
    sku: "WB-005-OLI",
    featured: true,
    tags: ["giacca", "windbreaker", "nylon"],
    category: "giacche",
    sizes: [...MOCK_SIZES_NO_XS],
    colors: [
      { name: "Olive", hex: "#556B2F" },
      { name: "Nero", hex: "#000000" },
    ],
  },
];

export function buildMockVariants(product: MockProduct) {
  const colors = product.colors ?? [{ name: "Default", hex: "#000000" }];
  const sizes = product.sizes;

  if (!sizes) {
    return colors.map((color, i) => {
      const colorCode = color.name.slice(0, 3).toUpperCase();
      return {
        name: "UNI",
        sku: `${product.sku}-${colorCode}-UNI`,
        color: color.name,
        colorHex: color.hex,
        stock: 20 + i * 5,
      };
    });
  }

  return sizes.flatMap((size, si) =>
    colors.map((color, ci) => {
      const colorCode = color.name.slice(0, 3).toUpperCase();
      return {
        name: size,
        sku: `${product.sku}-${colorCode}-${size}`,
        size,
        color: color.name,
        colorHex: color.hex,
        stock: 10 + si * 2 + ci * 3,
      };
    })
  );
}

export type { CategoryImageKey };
