import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
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
  console.log("Admin user ready: admin@eshop.local / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
