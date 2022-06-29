import { NextApiRequest, NextApiResponse } from "next";
import { accounts } from "@prisma/client";
import { prisma } from "../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const accounts: accounts[] = await prisma.accounts.findMany();
    
    res.status(200).json(accounts);
}