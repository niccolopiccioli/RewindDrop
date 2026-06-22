import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { EDITORIAL_IMAGES } from "../src/lib/mock-images";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.category.update({
    where: { slug: "felpe" },
    data: {
      image: EDITORIAL_IMAGES.felpe,
      imageAlt: "Modelle in passerella backstage durante una sfilata",
    },
  });

  await prisma.category.update({
    where: { slug: "t-shirts" },
    data: {
      image: EDITORIAL_IMAGES.tShirts,
      imageAlt: "Gruppo in abbigliamento casual di stile",
    },
  });

  await prisma.category.update({
    where: { slug: "giacche" },
    data: {
      image: EDITORIAL_IMAGES.giacche,
      imageAlt: "Uomo con giacca nera",
    },
  });

  await prisma.homeSpot.update({
    where: { key: "lookbook" },
    data: {
      image: EDITORIAL_IMAGES.lookbook,
      imageAlt: "Ritratto in bianco e nero di donna con maglia a maniche lunghe",
    },
  });

  await prisma.homeSpot.update({
    where: { key: "details" },
    data: {
      image: EDITORIAL_IMAGES.details,
      imageAlt: "Manichino davanti alle vetrine",
    },
  });

  console.log("Homepage category banners updated");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
