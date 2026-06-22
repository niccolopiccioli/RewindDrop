import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";

export type ProductListParams = {
  category?: string;
  sale?: boolean;
  gender?: "men" | "women";
  sort?: string;
  search?: string;
  sizes?: string[];
  page?: number;
  limit?: number;
  fullImages?: boolean;
  featured?: boolean;
};

export async function listProducts(params: ProductListParams = {}) {
  const {
    category,
    sale,
    gender,
    sort = "newest",
    search,
    sizes,
    page = 1,
    limit = 20,
    fullImages = false,
    featured,
  } = params;

  const where: Prisma.ProductWhereInput = {
    active: true,
  };

  if (category) {
    where.category = { slug: category };
  }

  if (sale) {
    where.comparePrice = { not: null };
  }

  if (featured) {
    where.featured = true;
  }

  if (gender === "men" || gender === "women") {
    where.tags = { has: gender };
  }

  if (sizes && sizes.length > 0) {
    where.variants = {
      some: {
        active: true,
        size: { in: sizes },
        stock: { gt: 0 },
      },
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { has: search } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { position: "asc" },
          ...(fullImages ? {} : { take: 1 }),
        },
        variants: {
          where: { active: true },
          select: {
            size: true,
            color: true,
            colorHex: true,
            stock: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((product) => serializeProduct(product)),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

const homepageProductInclude = {
  images: {
    orderBy: { position: "asc" as const },
  },
  variants: {
    where: { active: true },
    select: {
      size: true,
      color: true,
      colorHex: true,
      stock: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
};

export async function getHomepageProducts() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: homepageProductInclude,
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const serialized = products.map((product) => serializeProduct(product));
  const newest = serialized.slice(0, 8);
  const featured = serialized.filter((product) => product.featured).slice(0, 8);

  return {
    newest,
    bestSellers: featured.length >= 4 ? featured : newest,
    dropHero: newest[0] ?? null,
    dropSupporting: newest.slice(1, 4),
  };
}
