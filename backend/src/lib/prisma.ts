import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "info" },
      { emit: "event", level: "warn" },
    ],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// @ts-ignore
prisma.$on("query", (e: any) => {
  if (process.env.NODE_ENV === "development")
    logger.debug(
      { query: e.query, params: e.params, duration: e.duration },
      "SQL"
    );
});

// @ts-ignore
prisma.$on("error", (e: any) => {
  logger.error(e, "🔥 Prisma Database Error");
});

// @ts-ignore
prisma.$on("warn", (e: any) => {
  logger.warn(e, "⚠️ Prisma Warning");
});
