import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const hasDbUrl =
  typeof process !== "undefined" &&
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("localhost:51213") &&
  !process.env.DATABASE_URL.includes("[SUA-SENHA]") &&
  !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");

let prismaInstance: PrismaClient;

if (hasDbUrl) {
  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
} else {
  // Return a nested Proxy that acts like a Prisma Client but throws a clear connection error.
  // This allows the build to compile and API routes to gracefully fallback to mock data without throwing build-time constructor errors.
  prismaInstance = new Proxy({} as any, {
    get(target, prop) {
      if (prop === "$disconnect" || prop === "$connect") {
        return () => Promise.resolve();
      }
      return new Proxy({} as any, {
        get() {
          return () => {
            throw new Error("DATABASE_URL is not configured. Running in local mock mode.");
          };
        },
      });
    },
  });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production" && hasDbUrl) {
  globalForPrisma.prisma = prismaInstance;
}

export default prisma;
