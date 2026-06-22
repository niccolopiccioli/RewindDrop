import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  CATEGORY_IMAGES,
  EDITORIAL_IMAGES,
  getProductImageUrl,
} from "../src/lib/mock-images";
import {
  MOCK_PRODUCTS,
  buildMockVariants,
  type MockCategorySlug,
} from "../src/lib/mock-products";
import { STOCKX_PRODUCTS, buildStockxImages } from "../src/lib/stockx-products";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

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
  await prisma.homeSpot.deleteMany();
  await prisma.category.deleteMany();

  const categoryData = [
    {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Magliette streetwear di tendenza",
      image: EDITORIAL_IMAGES.tShirts,
      imageAlt: "Gruppo in abbigliamento casual di stile",
      bannerSubtitle: "Essenziali",
    },
    {
      name: "Felpe",
      slug: "felpe",
      description: "Felpe e hoodie per ogni occasione",
      image: EDITORIAL_IMAGES.felpe,
      imageAlt: "Modelle in passerella backstage durante una sfilata",
      bannerSubtitle: "Comfort e stile",
    },
    {
      name: "Pantaloni",
      slug: "pantaloni",
      description: "Pantaloni e joggers moderni",
      image: CATEGORY_IMAGES.pantaloni,
      imageAlt: "Pantaloni",
    },
    {
      name: "Cappelli",
      slug: "cappelli",
      description: "Cappelli, beanie e accessori per la testa",
      image: CATEGORY_IMAGES.cappelli,
      imageAlt: "Cappelli",
    },
    {
      name: "Borse",
      slug: "borse",
      description: "Zaini, borse a tracolla e clutch",
      image: CATEGORY_IMAGES.borse,
      imageAlt: "Borse",
    },
    {
      name: "Giacche",
      slug: "giacche",
      description: "Giacche e cappotti per ogni stagione",
      image: EDITORIAL_IMAGES.giacche,
      imageAlt: "Uomo con giacca nera",
      bannerSubtitle: "Outerwear",
    },
    {
      name: "Sneakers",
      slug: "sneakers",
      description: "Sneaker, slide e calzature streetwear",
      image: CATEGORY_IMAGES.sneakers,
      imageAlt: "Sneakers",
    },
  ] as const;

  const categories = await Promise.all(
    categoryData.map((cat) => prisma.category.create({ data: cat }))
  );

  const categoryMap = Object.fromEntries(
    categories.map((cat) => [cat.slug, cat.id])
  ) as Record<MockCategorySlug, string>;

  console.log("Categories created:", categories.length);

  await prisma.homeSpot.createMany({
    data: [
      {
        key: "lookbook",
        title: "Lookbook",
        subtitle: "Milano",
        href: "/prodotti",
        image: EDITORIAL_IMAGES.lookbook,
        imageAlt: "Ritratto in bianco e nero di donna con maglia a maniche lunghe",
      },
      {
        key: "details",
        title: "Dettagli",
        subtitle: "Texture & materiali",
        href: "/prodotti",
        image: EDITORIAL_IMAGES.details,
        imageAlt: "Manichino davanti alle vetrine",
      },
    ],
  });

  console.log("Home spots created");

  const categoryCounters: Record<MockCategorySlug, number> = {
    "t-shirts": 0,
    felpe: 0,
    pantaloni: 0,
    cappelli: 0,
    borse: 0,
    giacche: 0,
    sneakers: 0,
  };

  const products = await Promise.all([
    ...MOCK_PRODUCTS.map((product) => {
      const imageIndex = categoryCounters[product.category]++;
      const colors = product.colors ?? [{ name: "Default", hex: "#000000" }];

      const images = colors.map((color, colorIndex) => ({
        url: getProductImageUrl(product.category, imageIndex + colorIndex),
        alt: `${product.name} ${color.name}`,
        position: colorIndex,
        colorHex: color.hex,
      }));

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
          images: { create: images },
          variants: { create: buildMockVariants(product) },
        },
      });
    }),
    ...STOCKX_PRODUCTS.map((product) => {
      categoryCounters[product.category]++;

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
          images: { create: buildStockxImages(product) },
          variants: { create: buildMockVariants(product) },
        },
      });
    }),
  ]);

  console.log("Products created:", products.length);

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
