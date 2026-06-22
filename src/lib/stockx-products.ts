import type { MockProduct } from "@/lib/mock-products";
import { stockxGalleryImage, stockxProductImage } from "@/lib/stockx-images";

export const SNEAKER_SIZES = [
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
  "10.5",
  "11",
  "11.5",
  "12",
] as const;

export const SNEAKER_SIZES_WOMENS = [
  "5",
  "5.5",
  "6",
  "6.5",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
] as const;

export const SNEAKER_SIZES_GS = [
  "3.5Y",
  "4Y",
  "4.5Y",
  "5Y",
  "5.5Y",
  "6Y",
  "6.5Y",
  "7Y",
] as const;

export const BIRKENSTOCK_SIZES = [
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
] as const;

type StockxCatalogProduct = MockProduct & {
  stockxSlug: string;
  image?: string;
  extraImages?: { colorIndex: number; frame?: string }[];
};

function sneaker(
  base: Omit<StockxCatalogProduct, "category" | "sizes"> & {
    sizes?: MockProduct["sizes"];
    womens?: boolean;
    gs?: boolean;
  }
): StockxCatalogProduct {
  const sizes = base.sizes
    ? base.sizes
    : base.gs
      ? [...SNEAKER_SIZES_GS]
      : base.womens
        ? [...SNEAKER_SIZES_WOMENS]
        : [...SNEAKER_SIZES];

  const { womens, gs, ...rest } = base;

  return {
    ...rest,
    category: "sneakers",
    sizes,
    tags: [...(rest.tags ?? []), ...(womens ? ["women"] : []), ...(gs ? ["gs"] : [])],
    image: rest.image ?? stockxProductImage(rest.stockxSlug),
  };
}

export const STOCKX_PRODUCTS: StockxCatalogProduct[] = [
  sneaker({
    stockxSlug: "air-jordan-5-retro-black-university-blue-2026",
    name: "Air Jordan 5 Retro Black University Blue (2026)",
    slug: "air-jordan-5-retro-black-university-blue-2026",
    description:
      "Jordan 5 Retro con base nera, accenti University Blue e dettagli argento.",
    price: 229,
    comparePrice: 259,
    sku: "SX-AJ5-BUB26",
    featured: true,
    tags: ["jordan", "sneakers", "stockx"],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "University Blue", hex: "#054ADA" },
    ],
    extraImages: [{ colorIndex: 1, frame: "10" }],
  }),
  sneaker({
    stockxSlug: "air-jordan-5-retro-fire-red-black-tongue-2025",
    name: "Air Jordan 5 Retro Fire Red Black Tongue (2025)",
    slug: "air-jordan-5-retro-fire-red-black-tongue-2025",
    description: "Classico Fire Red con lingua nera e suola iceman.",
    price: 199,
    sku: "SX-AJ5-FR25",
    tags: ["jordan", "sneakers", "stockx"],
    colors: [
      { name: "Fire Red", hex: "#DD2233" },
      { name: "Nero", hex: "#000000" },
      { name: "Bianco", hex: "#FFFFFF" },
    ],
    extraImages: [
      { colorIndex: 1, frame: "12" },
      { colorIndex: 2, frame: "18" },
    ],
  }),
  sneaker({
    stockxSlug: "air-jordan-5-retro-black-university-blue-2026-gs",
    name: "Air Jordan 5 Retro Black University Blue (2026) GS",
    slug: "air-jordan-5-retro-black-university-blue-2026-gs",
    description: "Versione grade school del Jordan 5 University Blue.",
    price: 149,
    sku: "SX-AJ5-BUB26-GS",
    tags: ["jordan", "sneakers", "stockx"],
    gs: true,
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "University Blue", hex: "#054ADA" },
    ],
    extraImages: [{ colorIndex: 1, frame: "10" }],
  }),
  sneaker({
    stockxSlug: "air-jordan-1-retro-low-og-sp-travis-scott-sail-tropical-pink",
    name: "Air Jordan 1 Retro Low OG SP Travis Scott Sail Tropical Pink",
    slug: "air-jordan-1-retro-low-travis-scott-sail-tropical-pink",
    description: "Collaborazione Travis Scott con base sail e accenti tropical pink.",
    price: 349,
    comparePrice: 399,
    sku: "SX-AJ1-TS-STP",
    featured: true,
    tags: ["jordan", "travis-scott", "sneakers", "stockx"],
    colors: [
      { name: "Sail", hex: "#F5F0E6" },
      { name: "Tropical Pink", hex: "#FF6B9D" },
    ],
    extraImages: [{ colorIndex: 1, frame: "14" }],
  }),
  {
    stockxSlug: "adidas-mexico-26-third-jersey-black",
    name: "Adidas Mexico 26 Third Jersey Black",
    slug: "adidas-mexico-26-third-jersey-black",
    description: "Maglia third del Messico 2026, edizione nera.",
    price: 89,
    sku: "SX-AD-MX26-T3",
    tags: ["adidas", "jersey", "stockx", "football"],
    category: "t-shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Nero", hex: "#000000" }],
    image: stockxProductImage("adidas-mexico-26-third-jersey-black"),
  },
  sneaker({
    stockxSlug: "nike-mind-001-slide-black-chrome",
    name: "Nike Mind 001 Slide Black Chrome",
    slug: "nike-mind-001-slide-black-chrome",
    description: "Slide Nike Mind 001 con finitura black chrome.",
    price: 79,
    sku: "SX-NK-MIND-001",
    tags: ["nike", "slide", "sneakers", "stockx"],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Chrome", hex: "#C0C0C0" },
    ],
    extraImages: [{ colorIndex: 1, frame: "09" }],
  }),
  sneaker({
    stockxSlug: "asics-gel-1130-black-pure-silver",
    name: "ASICS Gel 1130 Black Pure Silver",
    slug: "asics-gel-1130-black-pure-silver",
    description: "Runner ASICS Gel 1130 in mesh nero con dettagli silver.",
    price: 119,
    sku: "SX-AS-1130-BPS",
    tags: ["asics", "sneakers", "stockx"],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Pure Silver", hex: "#C0C0C0" },
    ],
    extraImages: [{ colorIndex: 1, frame: "11" }],
  }),
  sneaker({
    stockxSlug: "nike-air-force-1-low-white-07",
    name: "Nike Air Force 1 Low White '07",
    slug: "nike-air-force-1-low-white-07",
    description: "Iconica AF1 Low bianca, versione '07.",
    price: 109,
    sku: "SX-NK-AF1-W07",
    featured: true,
    tags: ["nike", "af1", "sneakers", "stockx"],
    colors: [{ name: "Bianco", hex: "#FFFFFF" }],
  }),
  sneaker({
    stockxSlug: "new-balance-9060-triple-black",
    name: "New Balance 9060 Triple Black",
    slug: "new-balance-9060-triple-black",
    description: "New Balance 9060 total black con suola scultorea.",
    price: 179,
    sku: "SX-NB-9060-TB",
    tags: ["new-balance", "sneakers", "stockx"],
    colors: [{ name: "Triple Black", hex: "#111111" }],
  }),
  {
    stockxSlug: "adidas-mexico-26-third-authentic-jersey-black",
    name: "Adidas Mexico 26 Third Authentic Jersey Black",
    slug: "adidas-mexico-26-third-authentic-jersey-black",
    description: "Versione authentic player della third jersey Messico 2026.",
    price: 129,
    sku: "SX-AD-MX26-T3A",
    tags: ["adidas", "jersey", "stockx", "football"],
    category: "t-shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Nero", hex: "#000000" }],
    image: stockxProductImage("adidas-mexico-26-third-authentic-jersey-black"),
  },
  sneaker({
    stockxSlug: "mihara-yasuhiro-hank-og-sole-canvas-low-black",
    name: "Mihara Yasuhiro Hank OG Sole Canvas Low Black",
    slug: "mihara-yasuhiro-hank-og-sole-canvas-low-black",
    description: "Sneaker canvas con suola sculpt OG di Mihara Yasuhiro.",
    price: 289,
    sku: "SX-MY-HANK-BLK",
    tags: ["mihara-yasuhiro", "sneakers", "stockx"],
    colors: [{ name: "Nero", hex: "#000000" }],
  }),
  sneaker({
    stockxSlug: "asics-gel-kayano-14-white-graphite-grey",
    name: "ASICS Gel Kayano 14 White Graphite Grey",
    slug: "asics-gel-kayano-14-white-graphite-grey",
    description: "Kayano 14 in mesh bianco con overlay graphite grey.",
    price: 159,
    sku: "SX-AS-K14-WGG",
    tags: ["asics", "sneakers", "stockx"],
    colors: [
      { name: "Bianco", hex: "#FFFFFF" },
      { name: "Graphite Grey", hex: "#4B5563" },
    ],
    extraImages: [{ colorIndex: 1, frame: "10" }],
  }),
  sneaker({
    stockxSlug: "birkenstock-boston-soft-footbed-suede-taupe",
    name: "Birkenstock Boston Soft Footbed Suede Taupe",
    slug: "birkenstock-boston-soft-footbed-suede-taupe",
    description: "Clog Boston in suede taupe con soft footbed.",
    price: 139,
    sku: "SX-BK-BOSTON-TAU",
    tags: ["birkenstock", "sneakers", "stockx"],
    sizes: [...BIRKENSTOCK_SIZES],
    colors: [{ name: "Taupe", hex: "#8B7D6B" }],
  }),
  sneaker({
    stockxSlug: "timberland-6-inch-premium-waterproof-wheat",
    name: "Timberland 6 Inch Premium Waterproof Wheat",
    slug: "timberland-6-inch-premium-waterproof-wheat",
    description: "Stivale Timberland 6-inch premium waterproof in wheat nubuck.",
    price: 219,
    sku: "SX-TB-6IN-WHT",
    tags: ["timberland", "boots", "sneakers", "stockx"],
    colors: [{ name: "Wheat", hex: "#C19A6B" }],
  }),
  {
    stockxSlug:
      "palace-x-nike-england-dri-fit-football-jersey-pewter-grey-bright-crimson",
    name: "Palace x Nike England Dri-FIT Football Jersey",
    slug: "palace-nike-england-jersey-pewter-crimson",
    description: "Jersey Palace x Nike England in pewter grey e bright crimson.",
    price: 149,
    sku: "SX-PL-ENG-JRS",
    tags: ["palace", "nike", "jersey", "stockx"],
    category: "t-shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Pewter Grey", hex: "#6B6E70" },
      { name: "Bright Crimson", hex: "#DC143C" },
    ],
    image: stockxProductImage(
      "palace-x-nike-england-dri-fit-football-jersey-pewter-grey-bright-crimson"
    ),
    extraImages: [{ colorIndex: 1, frame: "12" }],
  },
  {
    stockxSlug: "youngla-x-batman-stealth-hoodie-black-wash",
    name: "YoungLA x Batman Stealth Hoodie Black Wash",
    slug: "youngla-batman-stealth-hoodie-black-wash",
    description: "Hoodie YoungLA x Batman in black wash con grafica stealth.",
    price: 89,
    sku: "SX-YL-BAT-HDY",
    tags: ["youngla", "batman", "hoodie", "stockx"],
    category: "felpe",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Black Wash", hex: "#1A1A1A" }],
    image: stockxProductImage("youngla-x-batman-stealth-hoodie-black-wash"),
  },
  {
    stockxSlug: "adidas-bringbacks-remixed-mexico-jersey-bold-green",
    name: "Adidas Bringbacks Remixed Mexico Jersey Bold Green",
    slug: "adidas-bringbacks-mexico-jersey-bold-green",
    description: "Jersey Mexico Bringbacks remixed in bold green.",
    price: 99,
    sku: "SX-AD-MX-BRG",
    tags: ["adidas", "jersey", "stockx", "football"],
    category: "t-shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Bold Green", hex: "#228B22" }],
    image: stockxProductImage("adidas-bringbacks-remixed-mexico-jersey-bold-green"),
  },
  sneaker({
    stockxSlug: "adidas-samba-og-preloved-red-leopard-womens",
    name: "Adidas Samba OG Preloved Red Leopard (Womens)",
    slug: "adidas-samba-og-preloved-red-leopard-womens",
    description: "Samba OG donna in suede preloved red leopard.",
    price: 119,
    sku: "SX-AD-SAMBA-RL",
    womens: true,
    tags: ["adidas", "samba", "sneakers", "stockx"],
    colors: [
      { name: "Preloved Red", hex: "#C41E3A" },
      { name: "Leopard", hex: "#8B5A2B" },
    ],
    extraImages: [{ colorIndex: 1, frame: "15" }],
  }),
  {
    stockxSlug: "adidas-womens-satin-polka-dots-wide-leg-pant-off-white",
    name: "Adidas Satin Polka Dots Wide Leg Pant Off White",
    slug: "adidas-satin-polka-dots-wide-leg-pant-off-white",
    description: "Pantaloni wide leg in satin con pois, off white.",
    price: 89,
    sku: "SX-AD-PNT-POL",
    tags: ["adidas", "pants", "women", "stockx"],
    category: "pantaloni",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Off White", hex: "#F5F5F0" },
      { name: "Nero", hex: "#000000" },
    ],
    image: stockxProductImage("adidas-womens-satin-polka-dots-wide-leg-pant-off-white"),
    extraImages: [{ colorIndex: 1, frame: "10" }],
  },
  {
    stockxSlug: "alo-yoga-accolade-cotton-blend-hoodie-black",
    name: "Alo Yoga Accolade Cotton Blend Hoodie Black",
    slug: "alo-yoga-accolade-hoodie-black",
    description: "Hoodie Alo Yoga Accolade in cotton blend nero.",
    price: 98,
    sku: "SX-ALO-ACC-BLK",
    tags: ["alo-yoga", "hoodie", "stockx"],
    category: "felpe",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Nero", hex: "#000000" }],
    image: stockxProductImage("alo-yoga-accolade-cotton-blend-hoodie-black"),
  },
  sneaker({
    stockxSlug: "air-jordan-1-retro-low-og-sp-travis-scott-canary-womens",
    name: "Air Jordan 1 Retro Low OG SP Travis Scott Canary (Womens)",
    slug: "air-jordan-1-retro-low-travis-scott-canary-womens",
    description: "Travis Scott x Jordan 1 Low Canary, edizione donna.",
    price: 329,
    comparePrice: 379,
    sku: "SX-AJ1-TS-CAN",
    featured: true,
    womens: true,
    tags: ["jordan", "travis-scott", "sneakers", "stockx"],
    colors: [
      { name: "Canary", hex: "#FFD700" },
      { name: "Nero", hex: "#000000" },
    ],
    extraImages: [{ colorIndex: 1, frame: "12" }],
  }),
];

export function buildStockxImages(product: StockxCatalogProduct) {
  const colors = product.colors ?? [{ name: "Default", hex: "#000000" }];
  const primary = product.image ?? stockxProductImage(product.stockxSlug);

  return colors.map((color, index) => {
    const extra = product.extraImages?.find((item) => item.colorIndex === index);
    const url =
      index === 0
        ? primary
        : extra
          ? stockxGalleryImage(product.stockxSlug, extra.frame ?? "08")
          : primary;

    return {
      url,
      alt: `${product.name} ${color.name}`,
      position: index,
      colorHex: color.hex,
    };
  });
}
