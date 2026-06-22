import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  return candidates.find((value) => value && value.trim().length > 0);
}

function getDatabaseHost(connectionString: string) {
  try {
    return new URL(connectionString.replace(/^postgres(ql)?:/, "http:"))
      .hostname;
  } catch {
    return "unknown";
  }
}

function needsSupabaseSsl(connectionString: string) {
  const host = getDatabaseHost(connectionString);
  if (host === "localhost" || host === "127.0.0.1") {
    return false;
  }

  return /supabase\.(com|co)|pooler\.supabase\.com/i.test(connectionString);
}

function normalizeConnectionString(connectionString: string) {
  if (!needsSupabaseSsl(connectionString)) {
    return connectionString;
  }

  const normalized = connectionString
    .replace(/([?&])sslmode=[^&]*/gi, "$1")
    .replace(/([?&])sslcert=[^&]*/gi, "$1")
    .replace(/([?&])sslrootcert=[^&]*/gi, "$1")
    .replace(/\?&/, "?")
    .replace(/&&+/g, "&")
    .replace(/[?&]$/, "");

  const separator = normalized.includes("?") ? "&" : "?";
  return `${normalized}${separator}sslmode=no-verify`;
}

function getPgPoolConfig(connectionString: string): PoolConfig {
  const normalizedConnectionString = normalizeConnectionString(connectionString);

  return {
    connectionString: normalizedConnectionString,
    ssl: needsSupabaseSsl(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  };
}

function createPrismaClient() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL or POSTGRES_PRISMA_URL is not set");
  }

  const poolConfig = getPgPoolConfig(connectionString);

  const adapter = new PrismaPg(poolConfig);

  return new PrismaClient({
    adapter,
  });
}

function isPrismaClientStale(client: PrismaClient): boolean {
  return typeof (client as PrismaClient & { homeSpot?: unknown }).homeSpot === "undefined";
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && !isPrismaClientStale(cached)) {
    return cached;
  }

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
