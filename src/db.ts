import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient()
} else {
    if (!(global.db as any)) {
        global.db = new PrismaClient()
    }
    prisma = global.db
}

export { prisma };