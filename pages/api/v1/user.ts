import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../src/rate-limit";
import { prisma } from "../../../src/db";

const limiter = rateLimit({
    interval: 10 * 1000, 
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
                
                prisma.accounts.findFirst({
                    where: {
                        id: valid.id
                    }
                }).then(account => {
                    if (!account) return res.status(400).json({ success: false });

                    prisma.servers.findMany({
                        where: {
                            ownerId: account.id
                        }
                    }).then(servers => {
                        prisma.customBots.findMany({
                            where: {
                                ownerId: account.id
                            }
                        }).then(bots => {
                            return res.status(200).json({
                                success: true,
                                username: account.username,
                                email: account.email,
                                role: account.role,
                                pfp: account.pfp,
                                createdAt: account.createdAt,
                                servers: servers.map(server => {
                                    return {
                                        id: server.id,
                                        name: server.name,
                                        guildId: Number(server.guildId),
                                        roleId: Number(server.roleId),
                                        picture: server.picture,
                                        description: server.description,
                                        createdAt: server.createdAt
                                    }
                                }),
                                bots: bots.map(bot => {
                                    return {
                                        id: bot.id,
                                        name: bot.name,
                                        clientId: Number(bot.clientId),
                                        botToken: bot.botToken,
                                        botSecret: bot.botSecret,
                                    }
                                })
                            });
                        });
                    });
                });
                
                
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") === "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong", r: res.getHeader("x-ratelimit-remaining"), error: err });
            }
            break;
        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}
