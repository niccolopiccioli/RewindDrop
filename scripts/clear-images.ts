import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

  const images = await prisma.image.updateMany({ data: { url: "" } });
  const categories = await prisma.category.updateMany({ data: { image: null } });

  console.log(
    `Cleared ${images.count} product images and ${categories.count} category images`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
