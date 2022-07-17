// import { PrismaClient } from '@prisma/client'

// export const prisma = new PrismaClient()

import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient;

//check if we are running in production mode
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
} else {
//check if there is already a connection to the database
    if (!(global.db as any)) {
        global.db = new PrismaClient()
    }
    prisma = global.db
}

export { prisma };