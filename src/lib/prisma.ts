import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = typeof process !== "undefined" && process.env ? process.env.DATABASE_URL : undefined;

const globalForPrisma = (typeof globalThis !== "undefined" ? globalThis : {}) as unknown as { prisma: PrismaClient };

const hasDbUrl =
  typeof connectionString === "string" &&
  connectionString.length > 0 &&
  !connectionString.includes("localhost:51213") &&
  !connectionString.includes("[SUA-SENHA]") &&
  !connectionString.includes("[YOUR-PASSWORD]");

let prismaInstance: PrismaClient;

if (hasDbUrl) {
  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
  } else {
    const adapter = new PrismaPg({ connectionString: connectionString! });
    prismaInstance = new PrismaClient({
      adapter,
      log:
        typeof process !== "undefined" && process.env?.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
} else {
  // Return a nested Proxy that acts like a Prisma Client but throws a clear connection error.
  // This allows the build to compile and API routes to gracefully fallback to mock data without throwing build-time constructor errors.
  prismaInstance = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (prop === "$disconnect" || prop === "$connect") {
        return () => Promise.resolve();
      }
      return new Proxy(
        {},
        {
          get() {
            return () => {
              throw new Error(
                "DATABASE_URL is not configured. Running in local mock mode."
              );
            };
          },
        }
      );
    },
  });
}

export const prisma = prismaInstance;

if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production" && hasDbUrl) {
  globalForPrisma.prisma = prismaInstance;
}

export default prisma;
