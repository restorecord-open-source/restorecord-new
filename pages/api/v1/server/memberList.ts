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

                prisma.accounts.findUnique({
                    where: {
                        id: valid.id
                    }
                }).then((account: any) => {
                    prisma.servers.findMany({
                        where: {
                            ownerId: account.id
                        },
                    }).then((servers: any) => {
                        let guildIds: any = servers.map((server: any) => server.guildId);

                        prisma.members.findMany({
                            where: {
                                guildId: {
                                    in: guildIds
                                },
                            },
                            orderBy: {
                                createdAt: "desc"
                            },
                        }).then((members: any) => {
                            res.status(200).json({
                                success: true,
                                members: members.map((member: any) => {
                                    return {
                                        id: member.id,
                                        userId: member.userId.toString(),
                                        username: member.username,
                                        avatar: member.avatar,
                                        createdAt: member.createdAt,
                                        guildName: servers.find((server: any) => server.guildId === member.guildId).name,
                                    }
                                })
                            });
                        });
                    });
                });
            }
            catch (err: any) {
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