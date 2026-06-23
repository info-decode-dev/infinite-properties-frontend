import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getOptimizedDatabaseUrl = (): string => {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) return "";

  if (dbUrl.includes(":6543") || dbUrl.includes("pooler.supabase.com")) {
    let optimizedUrl = dbUrl;
    if (optimizedUrl.includes("pgbouncer=true")) {
      optimizedUrl = optimizedUrl.replace(/[?&]pgbouncer=true/g, "");
    }
    if (optimizedUrl.includes("connection_limit=")) {
      optimizedUrl = optimizedUrl.replace(/[?&]connection_limit=\d+/g, "");
    }
    optimizedUrl = optimizedUrl.replace(/\?&/g, "?").replace(/&&/g, "&");
    if (optimizedUrl.endsWith("?") || optimizedUrl.endsWith("&")) {
      optimizedUrl = optimizedUrl.slice(0, -1);
    }
    return optimizedUrl;
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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
