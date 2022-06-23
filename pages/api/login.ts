import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { LoginSchema } from "../../src/schemas";
import dotenv from "dotenv";
import rateLimit from "../../src/rate-limit";
dotenv.config({ path: "../../" });

const prisma = new PrismaClient();

const limiter = rateLimit({
    interval: 10 * 1000, 
    uniqueTokenPerInterval: 500,
    limit: 20,
})
  

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

    try {
        await limiter.check(res, "CACHE_TOKEN");

        const data = await LoginSchema.validate(req.body);

        if (!data) return res.status(400).json({ message: "Please provide all fields" });

        const accounts = await prisma.accounts.findMany({
            where: {
                username: data.username
            }
        });

        if (accounts.length === 0) return res.status(400).json({ message: "Account not found" });

        const account = accounts[0];
        const isValid = await bcrypt.compare(data.password, account.password);

        if (!isValid) return res.status(400).json({ message: "Some Credentials are incorrect" });

        const token = sign({
            id: account.id,
            username: account.username,
            email: account.email,
            role: account.role,
            pfp: account.pfp,
            createdAt: account.createdAt,
        }, `${process.env.JWT_SECRET}`, { expiresIn: "30d" });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
        });
    }
    catch (err: any) {
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
        if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.errors[0] });
        return res.status(400).json({ success: false, message: "Something went wrong", r: res.getHeader("x-ratelimit-remaining") });
    } 
}