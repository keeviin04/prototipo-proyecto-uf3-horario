/**
 * Cliente Prisma como singleton.
 *
 * En desarrollo, Next.js recarga módulos en caliente y eso puede provocar
 * la creación de múltiples instancias del cliente Prisma (con su consiguiente
 * agotamiento de conexiones a la BBDD). Para evitarlo, lo cacheamos en
 * globalThis durante el desarrollo.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
