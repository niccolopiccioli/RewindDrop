import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  CATEGORY_IMAGES,
  getProductImageUrl,
  type CategoryImageKey,
} from "../src/lib/mock-images";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

type CategoryKey =
  | "t-shirts"
  | "felpe"
  | "pantaloni"
  | "cappelli"
  | "borse"
  | "giacche";

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  featured?: boolean;
  tags: string[];
  category: CategoryKey;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
};

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const SIZES_NO_XS = ["S", "M", "L", "XL"] as const;

const PRODUCTS: ProductSeed[] = [
  // T-Shirts (8)
  {
    name: "Essential Tee - Nero",
    slug: "essential-tee-nero",
    description:
      "Maglietta in cotone premium con fit relax. Logo ricamato sul petto. Perfetta per il quotidiano con uno stile streetwear autentico.",
    price: 39.99,
    comparePrice: 49.99,
    sku: "ET-001-NER",
    featured: true,
    tags: ["tee", "nero", "essenziale", "cotone"],
    category: "t-shirts",
    sizes: [...SIZES],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Essential Tee - Bianco",
    slug: "essential-tee-bianco",
    description:
      "Maglietta in cotone premium con fit relax. Logo ricamato sul petto. Un classico che non passa mai di moda.",
    price: 39.99,
    sku: "ET-002-BIA",
    featured: true,
    tags: ["tee", "bianco", "essenziale", "cotone"],
    category: "t-shirts",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Bianco", hex: "#FFFFFF" }],
  },
  {
    name: "Oversized Graphic Tee",
    slug: "oversized-graphic-tee",
    description:
      "T-shirt oversize in cotone pesante con stampa frontale minimal. Spalle cadenti e manica lunga.",
    price: 44.99,
    comparePrice: 54.99,
    sku: "OGT-003-NER",
    featured: true,
    tags: ["tee", "oversize", "graphic", "nero"],
    category: "t-shirts",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Vintage Wash Tee",
    slug: "vintage-wash-tee",
    description:
      "Maglietta con trattamento vintage wash per un look consumato autentico. Taglio regular fit.",
    price: 42.99,
    sku: "VWT-004-GRG",
    tags: ["tee", "vintage", "grigio", "wash"],
    category: "t-shirts",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Grigio", hex: "#808080" }],
  },
  {
    name: "Long Sleeve Basic",
    slug: "long-sleeve-basic",
    description:
      "Maglietta a manica lunga in jersey di cotone. Ideale come base layer o pezzo standalone.",
    price: 49.99,
    sku: "LSB-005-NER",
    tags: ["tee", "manica-lunga", "basic", "nero"],
    category: "t-shirts",
    sizes: [...SIZES_NO_XS],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Bianco", hex: "#FFFFFF" },
    ],
  },
  {
    name: "Box Fit Logo Tee",
    slug: "box-fit-logo-tee",
    description:
      "T-shirt box fit con logo stampato sul retro. Tessuto spesso 240gsm per una silhouette strutturata.",
    price: 45.99,
    comparePrice: 55.99,
    sku: "BFL-006-OLI",
    featured: true,
    tags: ["tee", "box-fit", "logo", "olive"],
    category: "t-shirts",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Olive", hex: "#556B2F" }],
  },
  {
    name: "Ribbed Tank Top",
    slug: "ribbed-tank-top",
    description:
      "Canotta a coste in cotone elasticizzato. Perfetta sotto giacche e felpe o da sola in estate.",
    price: 29.99,
    sku: "RTT-007-NER",
    tags: ["tee", "canotta", "coste", "estate"],
    category: "t-shirts",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Bianco", hex: "#FFFFFF" },
    ],
  },
  {
    name: "Pocket Tee - Navy",
    slug: "pocket-tee-navy",
    description:
      "T-shirt con taschino sul petto in cotone pettinato. Dettaglio minimal per un look pulito.",
    price: 38.99,
    sku: "PTN-008-NAV",
    tags: ["tee", "taschino", "navy", "cotone"],
    category: "t-shirts",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Navy", hex: "#000080" }],
  },

  // Felpe (6)
  {
    name: "Urban Hoodie - Grigio",
    slug: "urban-hoodie-grigio",
    description:
      "Felpa con cappuccio in felpa pesante. Tasca canguro frontale e cappuccio regolabile. Ideale per le serate fresche.",
    price: 89.99,
    comparePrice: 109.99,
    sku: "UH-001-GRG",
    featured: true,
    tags: ["hoodie", "grigio", "urban", "felpa"],
    category: "felpe",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Grigio", hex: "#808080" }],
  },
  {
    name: "Essential Hoodie - Nero",
    slug: "essential-hoodie-nero",
    description:
      "Hoodie essenziale in french terry 400gsm. Interno spazzolato, cordino piatto e logo ricamato discreto.",
    price: 94.99,
    comparePrice: 119.99,
    sku: "EH-002-NER",
    featured: true,
    tags: ["hoodie", "nero", "essenziale", "french-terry"],
    category: "felpe",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Zip Hoodie - Charcoal",
    slug: "zip-hoodie-charcoal",
    description:
      "Felpa con zip integrale e tasche laterali. Cappuccio doppio strato per maggiore struttura.",
    price: 99.99,
    sku: "ZH-003-CHR",
    tags: ["hoodie", "zip", "charcoal", "felpa"],
    category: "felpe",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Charcoal", hex: "#36454F" }],
  },
  {
    name: "Crewneck Sweatshirt",
    slug: "crewneck-sweatshirt",
    description:
      "Felpa girocollo in cotone organico. Taglio relaxed con polsini e fondo a coste.",
    price: 79.99,
    sku: "CS-004-BEI",
    tags: ["felpa", "crewneck", "beige", "cotone"],
    category: "felpe",
    sizes: [...SIZES_NO_XS],
    colors: [
      { name: "Beige", hex: "#D4C4A8" },
      { name: "Nero", hex: "#000000" },
    ],
  },
  {
    name: "Oversized Hoodie",
    slug: "oversized-hoodie",
    description:
      "Hoodie oversize con spalle cadenti e maniche ampie. Il pezzo statement della collezione.",
    price: 104.99,
    comparePrice: 129.99,
    sku: "OH-005-NER",
    featured: true,
    tags: ["hoodie", "oversize", "nero", "statement"],
    category: "felpe",
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Half-Zip Pullover",
    slug: "half-zip-pullover",
    description:
      "Pullover con mezza zip e colletto alto. Tessuto tecnico misto cotone-poly per comfort tutto l'anno.",
    price: 89.99,
    sku: "HZP-006-GRG",
    tags: ["felpa", "half-zip", "pullover", "grigio"],
    category: "felpe",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Grigio", hex: "#808080" }],
  },

  // Pantaloni (5)
  {
    name: "Cargo Joggers",
    slug: "cargo-joggers",
    description:
      "Joggers con tasche cargo laterali. Fit rilassato con cintura elasticata e caviglie. Perfetti per un look casual.",
    price: 79.99,
    sku: "CJ-001-NER",
    tags: ["pantaloni", "cargo", "joggers", "nero"],
    category: "pantaloni",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Wide Leg Trousers",
    slug: "wide-leg-trousers",
    description:
      "Pantaloni wide leg in twill di cotone. Vita alta e piega frontale per un taglio sartoriale street.",
    price: 89.99,
    comparePrice: 109.99,
    sku: "WLT-002-NER",
    featured: true,
    tags: ["pantaloni", "wide-leg", "twill", "nero"],
    category: "pantaloni",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Tech Fleece Joggers",
    slug: "tech-fleece-joggers",
    description:
      "Joggers in tech fleece con interno termico. Tasche zip e logo tono su tono.",
    price: 84.99,
    sku: "TFJ-003-GRG",
    tags: ["pantaloni", "tech-fleece", "joggers", "grigio"],
    category: "pantaloni",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Grigio", hex: "#808080" }],
  },
  {
    name: "Denim Carpenter Pants",
    slug: "denim-carpenter-pants",
    description:
      "Pantaloni carpenter in denim pesante con tasche laterali e loop per martello. Fit straight.",
    price: 99.99,
    sku: "DCP-004-IND",
    tags: ["pantaloni", "denim", "carpenter", "indaco"],
    category: "pantaloni",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Indaco", hex: "#3F5277" }],
  },
  {
    name: "Parachute Pants",
    slug: "parachute-pants",
    description:
      "Pantaloni parachute in nylon leggero con coulisse in vita e caviglie. Silhouette voluminosa anni '90.",
    price: 74.99,
    comparePrice: 94.99,
    sku: "PP-005-NER",
    featured: true,
    tags: ["pantaloni", "parachute", "nylon", "nero"],
    category: "pantaloni",
    sizes: [...SIZES_NO_XS],
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Olive", hex: "#556B2F" },
    ],
  },

  // Cappelli (4)
  {
    name: "Classic Dad Cap",
    slug: "classic-dad-cap",
    description:
      "Cappetto classico con visiera ricurva. Logo cucito sul fronte. Regolabile con chiusura metallica.",
    price: 29.99,
    sku: "CDC-001-NER",
    featured: true,
    tags: ["cappello", "cap", "nero", "classic"],
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
    description:
      "Beanie in lana merino. Fit classico con etichetta ricamata. Perfetto per completare il tuo look streetwear.",
    price: 24.99,
    sku: "SB-001-NER",
    tags: ["beanie", "cappello", "nero", "inverno"],
    category: "cappelli",
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Grigio", hex: "#808080" },
    ],
  },
  {
    name: "5-Panel Cap",
    slug: "5-panel-cap",
    description:
      "Cappellino 5 pannelli in cotone canvas. Visiera piatta e chiusura snapback regolabile.",
    price: 32.99,
    sku: "5PC-003-BEI",
    tags: ["cappello", "5-panel", "canvas", "beige"],
    category: "cappelli",
    colors: [
      { name: "Beige", hex: "#D4C4A8" },
      { name: "Nero", hex: "#000000" },
    ],
  },
  {
    name: "Bucket Hat",
    slug: "bucket-hat",
    description:
      "Bucket hat in cotone twill con cuciture rinforzate. Protezione solare con stile urban.",
    price: 34.99,
    sku: "BH-004-OLI",
    tags: ["cappello", "bucket", "estate", "olive"],
    category: "cappelli",
    colors: [{ name: "Olive", hex: "#556B2F" }],
  },

  // Borse (4)
  {
    name: "Crossbody Bag",
    slug: "crossbody-bag",
    description:
      "Borsa a tracolla con chiusura a zip. Tasca principale e tasca posteriore. Tracolla regolabile.",
    price: 59.99,
    comparePrice: 79.99,
    sku: "CBB-001-NER",
    featured: true,
    tags: ["borsa", "crossbody", "nero", "accessori"],
    category: "borse",
    colors: [
      { name: "Nero", hex: "#000000" },
      { name: "Olive", hex: "#556B2F" },
    ],
  },
  {
    name: "Mini Backpack",
    slug: "mini-backpack",
    description:
      "Zaino compatto in nylon balistico. Scomparto laptop 13\" e tasche organizer interne.",
    price: 79.99,
    comparePrice: 99.99,
    sku: "MB-002-NER",
    featured: true,
    tags: ["borsa", "zaino", "mini", "nero"],
    category: "borse",
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Tote Bag Canvas",
    slug: "tote-bag-canvas",
    description:
      "Tote bag in canvas pesante con manici rinforzati. Stampa serigrafica minimal su un lato.",
    price: 39.99,
    sku: "TBC-003-BEI",
    tags: ["borsa", "tote", "canvas", "beige"],
    category: "borse",
    colors: [
      { name: "Beige", hex: "#D4C4A8" },
      { name: "Nero", hex: "#000000" },
    ],
  },
  {
    name: "Belt Bag",
    slug: "belt-bag",
    description:
      "Marsupio con cintura regolabile e tasche zip. Ideale per tenere l'essenziale a portata di mano.",
    price: 49.99,
    sku: "BB-004-NER",
    tags: ["borsa", "marsupio", "belt-bag", "nero"],
    category: "borse",
    colors: [{ name: "Nero", hex: "#000000" }],
  },

  // Giacche (5)
  {
    name: "Bomber Jacket",
    slug: "bomber-jacket",
    description:
      "Giacca bomber in nylon con fodera interna. Tasche laterali e tasca interna. Chiusura zip con pulsanti.",
    price: 149.99,
    comparePrice: 189.99,
    sku: "BJ-001-NER",
    featured: true,
    tags: ["giacca", "bomber", "nero", "outerwear"],
    category: "giacche",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Puffer Jacket",
    slug: "puffer-jacket",
    description:
      "Giacca imbottita leggera con ripieno sintetico riciclato. Compressibile e calda senza volume eccessivo.",
    price: 179.99,
    comparePrice: 219.99,
    sku: "PJ-002-NER",
    featured: true,
    tags: ["giacca", "puffer", "imbottita", "inverno"],
    category: "giacche",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Nero", hex: "#000000" }],
  },
  {
    name: "Coach Jacket",
    slug: "coach-jacket",
    description:
      "Coach jacket in nylon leggero con fodera mesh. Colletto, polsini e fondo a coste elasticizzate.",
    price: 129.99,
    sku: "CJ-003-NAV",
    tags: ["giacca", "coach", "nylon", "navy"],
    category: "giacche",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Navy", hex: "#000080" }],
  },
  {
    name: "Denim Trucker Jacket",
    slug: "denim-trucker-jacket",
    description:
      "Giacca trucker in denim medio con bottoni metallici. Taglio classico con tasche petto a patta.",
    price: 139.99,
    sku: "DTJ-004-IND",
    tags: ["giacca", "denim", "trucker", "indaco"],
    category: "giacche",
    sizes: [...SIZES_NO_XS],
    colors: [{ name: "Indaco", hex: "#3F5277" }],
  },
  {
    name: "Windbreaker",
    slug: "windbreaker",
    description:
      "Giacca antivento in nylon ripstop con cappuccio nascosto. Leggera, pieghevole e resistente all'acqua.",
    price: 119.99,
    comparePrice: 149.99,
    sku: "WB-005-OLI",
    featured: true,
    tags: ["giacca", "windbreaker", "nylon", "olive"],
    category: "giacche",
    sizes: [...SIZES_NO_XS],
    colors: [
      { name: "Olive", hex: "#556B2F" },
      { name: "Nero", hex: "#000000" },
    ],
  },
];

function buildVariants(product: ProductSeed) {
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

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.image.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryData = [
    { name: "T-Shirts", slug: "t-shirts", description: "Magliette streetwear di tendenza", image: CATEGORY_IMAGES["t-shirts"] },
    { name: "Felpe", slug: "felpe", description: "Felpe e hoodie per ogni occasione", image: CATEGORY_IMAGES.felpe },
    { name: "Pantaloni", slug: "pantaloni", description: "Pantaloni e joggers moderni", image: CATEGORY_IMAGES.pantaloni },
    { name: "Cappelli", slug: "cappelli", description: "Cappelli, beanie e accessori per la testa", image: CATEGORY_IMAGES.cappelli },
    { name: "Borse", slug: "borse", description: "Zaini, borse a tracolla e clutch", image: CATEGORY_IMAGES.borse },
    { name: "Giacche", slug: "giacche", description: "Giacche e cappotti per ogni stagione", image: CATEGORY_IMAGES.giacche },
  ] as const;

  const categories = await Promise.all(
    categoryData.map((cat) => prisma.category.create({ data: cat }))
  );

  const categoryMap = Object.fromEntries(
    categories.map((cat) => [cat.slug, cat.id])
  ) as Record<CategoryKey, string>;

  console.log("Categories created:", categories.length);

  const categoryCounters: Record<CategoryKey, number> = {
    "t-shirts": 0,
    felpe: 0,
    pantaloni: 0,
    cappelli: 0,
    borse: 0,
    giacche: 0,
  };

  const products = await Promise.all(
    PRODUCTS.map((product) => {
      const imageIndex = categoryCounters[product.category]++;
      const imageUrl = getProductImageUrl(
        product.category as CategoryImageKey,
        imageIndex
      );

      return prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          sku: product.sku,
          featured: product.featured ?? false,
          tags: product.tags,
          category: { connect: { id: categoryMap[product.category] } },
          images: {
            create: [{ url: imageUrl, alt: product.name, position: 0 }],
          },
          variants: { create: buildVariants(product) },
        },
      });
    })
  );

  console.log("Products created:", products.length);

  // Gender tags for nav filters
  const menProducts = products.filter((_, i) => i % 2 === 0);
  const womenProducts = products.filter((_, i) => i % 2 === 1);
  await Promise.all([
    ...menProducts.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: { tags: { push: "men" } },
      })
    ),
    ...womenProducts.map((p) =>
      prisma.product.update({
        where: { id: p.id },
        data: { tags: { push: "women" } },
      })
    ),
  ]);

  const customerPassword = await bcrypt.hash("cliente123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "cliente@eshop.local" },
    update: { password: customerPassword, role: "CUSTOMER", name: "Cliente Demo" },
    create: {
      email: "cliente@eshop.local",
      name: "Cliente Demo",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      name: "Cliente Demo",
      street: "Via Roma 10",
      city: "Milano",
      province: "MI",
      postalCode: "20100",
      country: "IT",
      phone: "+39 333 1234567",
      isDefault: true,
    },
  });

  const sampleVariant = await prisma.variant.findFirst({
    where: { productId: products[0].id },
  });

  if (sampleVariant) {
    await prisma.order.create({
      data: {
        number: "ORD-DEMO-001",
        userId: customer.id,
        status: "DELIVERED",
        subtotal: 39.99,
        shipping: 5.99,
        tax: 0,
        total: 45.98,
        paymentMethod: "mock",
        shippingAddr: {
          name: "Cliente Demo",
          street: "Via Roma 10",
          city: "Milano",
          postalCode: "20100",
          country: "IT",
        },
        items: {
          create: [{
            productId: products[0].id,
            variantId: sampleVariant.id,
            name: products[0].name,
            sku: sampleVariant.sku,
            quantity: 1,
            price: 39.99,
            total: 39.99,
          }],
        },
      },
    });

    await prisma.order.create({
      data: {
        number: "ORD-DEMO-002",
        userId: customer.id,
        status: "PAID",
        subtotal: 89.99,
        shipping: 0,
        tax: 0,
        total: 89.99,
        paymentMethod: "mock",
        shippingAddr: {
          name: "Cliente Demo",
          street: "Via Roma 10",
          city: "Milano",
          postalCode: "20100",
          country: "IT",
        },
        items: {
          create: [{
            productId: products[2]?.id ?? products[0].id,
            variantId: (await prisma.variant.findFirst({
              where: { productId: products[2]?.id ?? products[0].id },
            }))!.id,
            name: products[2]?.name ?? products[0].name,
            sku: sampleVariant.sku,
            quantity: 1,
            price: 89.99,
            total: 89.99,
          }],
        },
      },
    });
  }

  await prisma.review.createMany({
    data: [
      {
        userId: customer.id,
        productId: products[0].id,
        rating: 5,
        title: "Ottima qualità",
        comment: "Tessuto premium, vestibilità perfetta.",
        approved: true,
      },
      {
        userId: customer.id,
        productId: products[2]?.id ?? products[0].id,
        rating: 4,
        comment: "Molto comoda, consigliata.",
        approved: true,
      },
    ],
  });

  await prisma.newsletterSubscriber.create({
    data: { email: "newsletter@eshop.local" },
  });

  console.log("Demo customer: cliente@eshop.local / cliente123");

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@eshop.local" },
    update: {
      password: adminPassword,
      role: "ADMIN",
      name: "Admin",
    },
    create: {
      email: "admin@eshop.local",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created: admin@eshop.local / admin123");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
