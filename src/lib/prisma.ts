import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  // Vercel + Supabase integration provides POSTGRES_* vars
  return (
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL
  );
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

  let normalized = connectionString
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
  const normalizedConnectionString = poolConfig.connectionString as string;

  // #region agent log
  console.error(
    JSON.stringify({
      sessionId: "090a4e",
      hypothesisId: "C2",
      location: "src/lib/prisma.ts:createPrismaClient",
      message: "Prisma pool config",
      data: {
        envSource: process.env.POSTGRES_PRISMA_URL
          ? "POSTGRES_PRISMA_URL"
          : process.env.POSTGRES_URL
            ? "POSTGRES_URL"
            : "DATABASE_URL",
        host: getDatabaseHost(connectionString),
        sslEnabled: Boolean(poolConfig.ssl),
        sslMode: normalizedConnectionString.includes("sslmode=no-verify")
          ? "no-verify"
          : "default",
      },
      timestamp: Date.now(),
    })
  );
  // #endregion

  const adapter = new PrismaPg(poolConfig);

  return new PrismaClient({
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
