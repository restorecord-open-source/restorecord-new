import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, accounts } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const accounts: accounts[] = await prisma.accounts.findMany();
    
    res.status(200).json(accounts);
}