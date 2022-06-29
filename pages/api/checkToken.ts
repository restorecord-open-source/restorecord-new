import { NextApiRequest, NextApiResponse } from "next";
import { verify } from "jsonwebtoken";
import rateLimit from "../../src/rate-limit";
import { prisma } from "../../src/db";

const limiter = rateLimit({
    interval: 10 * 1000, 
    uniqueTokenPerInterval: 500,
    limit: 20,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

    try {
        await limiter.check(res, "CACHE_TOKEN");

        const token = req.headers.authorization as string;
        const valid = verify(token, `${process.env.JWT_SECRET}`);

        if (!valid) return res.status(400).json({ success: false });

        return res.status(200).json({ success: true });
    }
    catch (err: any) {
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
        if (err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "Session Expired" });
        return res.status(400).json({ success: false, message: "Something went wrong", r: res.getHeader("x-ratelimit-remaining"), error: err });
    }
}