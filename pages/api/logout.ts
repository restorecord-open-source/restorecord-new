import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

    const token = req.headers.authorization as string;
    const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

    if (!valid) return res.status(400).json({ success: false });

    const sess = await prisma.sessions.findMany({
        where: {
            accountId: valid.id,
        }
    });

    if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

    await prisma.sessions.deleteMany({
        where: {
            accountId: valid.id,
        }
    });

    return res.redirect("/");
}