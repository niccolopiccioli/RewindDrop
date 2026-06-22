import { spawnSync } from "node:child_process";

const migrateUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL;

if (!migrateUrl) {
  console.error("No database URL configured for migrations.");
  process.exit(1);
}

const env = {
  ...process.env,
  POSTGRES_PRISMA_URL: migrateUrl,
  POSTGRES_URL: migrateUrl,
  DATABASE_URL: migrateUrl,
};

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status ?? 1);
