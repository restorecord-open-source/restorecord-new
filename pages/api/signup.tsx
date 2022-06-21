import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { SignupSchema } from "../../src/schemas";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") res.status(405).json({ message: "Method not allowed" });

    try {
        const data = await SignupSchema.validate(req.body);

        if (!data) res.status(400).json({ message: "Please provide all fields" }); 
    

        const accounts = await prisma.accounts.findMany({
            where: {
                username: data.username
            }
        });

        if (accounts.length > 0) res.status(400).json({ message: "Username is already in use" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const account = await prisma.accounts.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
            },
        });

        res.status(200).json({ 
            success: true,
            message: "Account created successfully",
            account: {
                id: account.id,
            },
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }

}