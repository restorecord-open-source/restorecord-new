import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 60, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });
                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });
                
                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findUnique({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const servers = await prisma.servers.findMany({ where: { ownerId: account.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });


                const formatted = servers.map(async (server: any) => {
                    const members = await prisma.members.findMany({
                        where: 
                        {
                            guildId: server.guildId,
                            // if ?from and ?to are set only get members that have createdAt between that date, if it isnt set get the last 14 days
                            createdAt: req.query.from && req.query.to ? {
                                gte: new Date(req.query.from as string), lte: new Date(req.query.to as string) 
                            } : {
                                gte: new Date(new Date().setDate(new Date().getDate() - 14))
                            }
                        },
                    });

                    return {
                        id: server.id,
                        name: server.name,
                        members: members.map((member: any) => {
                            return {
                                id: member.id,
                                userId: String(member.userId) as string,
                                username: member.username,
                                avatar: member.avatar,
                                createdAt: member.createdAt
                            }
                        }),
                        createdAt: server.createdAt
                    }
                });

                return res.status(200).json({ success: true, servers: await Promise.all(formatted) });
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}