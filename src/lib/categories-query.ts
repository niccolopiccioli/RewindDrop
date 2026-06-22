import { prisma } from "@/lib/prisma";

export async function listStoreCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      image: true,
      imageAlt: true,
    },
  });
}
