import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { clearProductCartItems } from "@/lib/cart-availability";

type DbClient = Prisma.TransactionClient | typeof prisma;

export async function hardDeleteProductById(id: string, db: DbClient = prisma) {
  await clearProductCartItems(id);
  await db.product.delete({ where: { id } });
}

export async function hardDeleteProducts(where: Prisma.ProductWhereInput) {
  const products = await prisma.product.findMany({
    where,
    select: { id: true },
  });

  if (products.length === 0) {
    return { deleted: 0 };
  }

  const ids = products.map((p) => p.id);

  await prisma.$transaction(async (tx) => {
    await clearProductCartItems(ids);
    await tx.product.deleteMany({ where: { id: { in: ids } } });
  });

  return { deleted: ids.length };
}
