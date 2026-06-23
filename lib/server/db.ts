import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function appendQueryParam(url: string, key: string, value: string): string {
  if (url.includes(`${key}=`)) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${value}`;
}

/**
 * Optimize DATABASE_URL for Supabase + Prisma on serverless (Vercel).
 *
 * - Transaction pooler (6543): requires pgbouncer=true for Prisma
 * - Serverless: connection_limit=1 per lambda instance to avoid pool exhaustion
 */
const getOptimizedDatabaseUrl = (): string => {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) return "";

  const isVercel = process.env.VERCEL === "1";
  const isTransactionPooler =
    dbUrl.includes(":6543") || dbUrl.includes("pooler.supabase.com:6543");

  if (isTransactionPooler) {
    let optimized = appendQueryParam(dbUrl, "pgbouncer", "true");
    if (isVercel || process.env.NODE_ENV === "production") {
      optimized = appendQueryParam(optimized, "connection_limit", "1");
    }
    return optimized;
  }

  // Session pooler (5432) — limit connections on Vercel; prefer 6543 in production
  if (dbUrl.includes("pooler.supabase.com") && isVercel) {
    return appendQueryParam(dbUrl, "connection_limit", "1");
  }

  return dbUrl;
};

const dbUrl = getOptimizedDatabaseUrl();

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: dbUrl || process.env.DATABASE_URL || "",
      },
    },
  });

// Reuse client within the same serverless instance (dev + production)
globalForPrisma.prisma = prisma;

export default prisma;
