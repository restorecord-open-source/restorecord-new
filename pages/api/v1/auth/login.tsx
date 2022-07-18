import { NextApiRequest, NextApiResponse } from "next";
import { sign } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { LoginSchema } from "../../../../src/schemas";
import dotenv from "dotenv";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";
dotenv.config({ path: "../../" });


const limiter = rateLimit({
    interval: 10 * 6000, 
    uniqueTokenPerInterval: 500,
    limit: 10,
})
  

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") 
        return res.status(405).json({ message: "Method not allowed" });

    try {
        await limiter.check(res, "CACHE_TOKEN");

        // const data = await LoginSchema.validate(req.body);

        const data = {...req.body};

        if (!data.username || !data.password) {
            return res.status(400).json({ message: "Missing username or password" });
        }

        if (data.password.length !== 60) {
            return res.status(400).json({ message: "Invalid password" });
        }

        if (data.username.length < 3 || data.username.length > 30) {
            return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
        }

        if (!data) return res.status(400).json({ message: "Please provide all fields" });

        const account = await prisma.accounts.findFirst({
            where: {
                username: data.username.toLowerCase()
            }
        });

        if (!account) return res.status(400).json({ message: "Account not found" });

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

        // res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Max-Age=${30 * 24 * 60 * 60}; Path=/`);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
        });
    }
    catch (err: any) {
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
        if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.errors[0] });
        return res.status(500);
    } 
}