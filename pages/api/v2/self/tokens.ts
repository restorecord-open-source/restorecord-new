import { accounts, sessions } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import { sign } from "jsonwebtoken";


async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    switch (req.method) {
    case "GET":
        try {
            const sessions = await prisma.sessions.findMany({
                select: {
                    id: true,
                    name: true,
                    token: true,
                    expiry: true,
                    createdAt: true,
                },
                where: {
                    accountId: user.id,
                    api: true
                }
            });

            return res.status(200).json({ success: true, sessions: sessions });
        }
        catch (err: any) {
            console.error(err);
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }
        break; // pointless but whatever

    case "POST":
        try {
            const { name, expiration } = req.body;

            if (!name || !expiration) return res.status(400).json({ success: false, message: "Missing parameters" });
            if (name.length < 3 || name.length > 99) return res.status(400).json({ success: false, message: "Name must be between 3 and 99 characters" });
            if (expiration < 1 || expiration > 365) return res.status(400).json({ success: false, message: "Expiration must be between 1 and 365 days" });

            const sessions = await prisma.sessions.findMany({
                where: {
                    accountId: user.id,
                    api: true
                }
            });

            if (sessions.length >= 5) return res.status(400).json({ success: false, message: "You have reached the maximum amount of tokens" });
            if (sessions.map(session => session.name).includes(name)) return res.status(400).json({ success: false, message: "Name already in use" });

            const token = sign({ id: user.id, time: Date.now() }, `${process.env.JWT_SECRET}`, { expiresIn: `${expiration}d` });

            await prisma.sessions.create({
                data: {
                    accountId: user.id,
                    token: token,
                    name: name,
                    expiry: new Date(Date.now() + (expiration * 24 * 60 * 60 * 1000)),
                    api: true
                }
            });

            return res.status(200).json({ success: true, message: "Token created successfully", token: token });
        }
        catch (err: any) {
            console.error(err);
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }
        break; // pointless but whatever


    case "DELETE":
        try {
            const { id } = req.body;

            if (!id) return res.status(400).json({ success: false, message: "Missing parameters" });

            const session = await prisma.sessions.findFirst({
                where: {
                    id: id,
                    accountId: user.id,
                    api: true
                }
            });

            if (!session) return res.status(400).json({ success: false, message: "Session not found" });

            await prisma.sessions.delete({ where: { id: id } });

            return res.status(200).json({ success: true, message: "Session deleted successfully" });
        }
        catch (err: any) {
            console.error(err);
            return res.status(400).json({ success: false, message: "Something went wrong" });
        }
        break; // pointless but whatever


    default:
        res.setHeader("Allow", ["GET", "POST", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        break;
    }
}


export default withAuthentication(handler);