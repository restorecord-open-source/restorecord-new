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

        await fetch(`https://hcaptcha.com/siteverify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `response=${data.captcha}&secret=0x2430789525882e04C6606F7Bf29EA1765dCC4492`
            })
            .then(res => res.json())
            .then(res => {
                if (!res.success) { console.log(res); throw new Error("Invalid captcha"); }
            }
            );

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
                username: account.username,
                email: account.email,
                role: account.role,
                pfp: account.pfp,
                createdAt: account.createdAt,
            },
        });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }

}