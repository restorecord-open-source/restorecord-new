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

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, } }); 

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const serverId: any = req.query.guild;

                const account = await prisma.accounts.findUnique({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const servers = await prisma.servers.findMany({ where: { ownerId: account.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

                const next: any = req.query.after ? req.query.after : 0;

                const limit: any = req.query.max ? req.query.max : 30;
                const page = req.query.page ?? ''


                let guildIds: any = [];

                if (serverId !== undefined && serverId.toLowerCase() === "all") {
                    guildIds = servers.map((server: any) => server.guildId);
                } else {
                    guildIds = serverId ? [BigInt(serverId)] : servers.map((server: any) => server.guildId);
                }

                const count = await prisma.members.count({ where: { guildId: { in: guildIds } } });

                const members = await prisma.members.findMany({
                    where: {
                        AND: [
                            { guildId: { in: guildIds } },
                        ],
                    },
                    take: Number(limit),
                    skip: page ? Number(page) * Number(limit) : 0,
                    orderBy: {
                        createdAt: "desc"
                    },
                });

                return res.status(200).json({
                    success: true,
                    max: count,
                    nextId: members.length === limit ? members[limit - 1].id : undefined,
                    maxPages: Math.ceil(count / limit) - 1,
                    members: members.map((member: any) => {
                        return {
                            id: member.id,
                            userId: member.userId.toString(),
                            username: member.username,
                            avatar: member.avatar,
                            ip: account.role !== "free" ? member.ip : null,
                            createdAt: member.createdAt,
                            guildId: member.guildId.toString(),
                            guildName: (servers.find((server: any) => server.guildId === member.guildId) as any).name,
                        }
                    })
                });


            }
            catch (err: any) {
                console.log(err);
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
