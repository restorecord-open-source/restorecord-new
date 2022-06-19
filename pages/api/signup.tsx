import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, accounts, Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
    }

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    if (!username || !email || !password) {
        res.status(400).json({ message: "Please provide all fields" });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const account = await prisma.accounts.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    res.status(200).json(account);

}