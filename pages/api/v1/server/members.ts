import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";

const limiter = rateLimit({
    interval: 10 * 60, 
    uniqueTokenPerInterval: 500,
    limit: 60,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, "CACHE_TOKEN");
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const maxCount = req.query.max as string;

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
                        const guildIds = servers.map((server: any) => server.guildId);

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
                                        userId: member.userId.toString(),
                                        username: member.username,
                                        avatar: member.avatar,
                                        ip: member.ip,
                                        createdAt: member.createdAt,
                                        guildId: member.guildId.toString(),
                                        guildName: servers.find((server: any) => server.guildId === member.guildId).name,
                                    }
                                })
                            });
                        });
                    });
                });
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") === "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
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
