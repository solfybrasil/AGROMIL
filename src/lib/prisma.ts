import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

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
        process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
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

if (process.env.NODE_ENV !== "production" && hasDbUrl) {
  globalForPrisma.prisma = prismaInstance;
}

export default prisma;
