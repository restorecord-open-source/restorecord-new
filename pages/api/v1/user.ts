import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../src/rate-limit";
import { prisma } from "../../../src/db";

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 30, "CACHE_TOKEN");
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, } }); 

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });
                
                prisma.accounts.findFirst({
                    where: {
                        id: valid.id
                    }
                }).then((account: any) => {
                    if (!account) return res.status(400).json({ success: false });

                    prisma.servers.findMany({
                        where: {
                            ownerId: account.id
                        }
                    }).then((servers: any) => {
                        prisma.customBots.findMany({
                            where: {
                                ownerId: account.id
                            }
                        }).then((bots: any) => {
                            return res.status(200).json({
                                success: true,
                                username: account.username,
                                email: account.email,
                                role: account.role,
                                admin: account.admin,
                                pfp: account.pfp,
                                createdAt: account.createdAt,
                                servers: servers.map((server: any) => {
                                    return {
                                        id: server.id,
                                        name: server.name,
                                        guildId: server.guildId.toString(),
                                        roleId: server.roleId.toString(),
                                        picture: server.picture,
                                        description: server.description,
                                        createdAt: server.createdAt
                                    }
                                }),
                                bots: bots.map((bot: any) => {
                                    return {
                                        id: bot.id,
                                        name: bot.name,
                                        clientId: bot.clientId.toString(),
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
