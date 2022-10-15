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
                limiter.check(res, 120, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const serverId: any = req.query.guild;

                const account = await prisma.accounts.findUnique({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const servers = await prisma.servers.findMany({ where: { ownerId: account.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

                const limit: any = req.query.max ? req.query.max : 50;
                const page = req.query.page ?? '';


                let guildIds: any = [];

                if (serverId !== undefined && serverId.toLowerCase() === "all") {
                    guildIds = servers.map((server: any) => server.guildId);
                } else {
                    guildIds = serverId ? [BigInt(serverId)] : servers.map((server: any) => server.guildId);
                }

                let search: any = req.query.search ?? '';
                let userIdSearch: any = search ? (isNaN(search) ? undefined : BigInt(search)) : undefined;
                const count = await prisma.members.count({ where: { AND: [{ guildId: { in: guildIds } }, { username: { contains: search ? (userIdSearch ? '' : search) : '' } }, { userId: { equals: userIdSearch ? BigInt(userIdSearch) as bigint : undefined } }] } });

                const memberList = await prisma.members.findMany({
                    where: {
                        AND: [
                            { guildId: { in: guildIds } },
                            { username: { contains: search ? (userIdSearch ? '' : search) : '' } },
                            { userId: { equals: userIdSearch ? BigInt(userIdSearch) as bigint : undefined } }
                        ]
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                });

                // const highestId = memberList.find((member: any) => member.id === Math.max(...memberList.map((member: any) => member.id)))?.id;
                const lowestId = memberList.find((member: any) => member.id === Math.min(...memberList.map((member: any) => member.id)))?.id ?? 1;

                await prisma.members.findMany({
                    where: {
                        AND: [
                            { guildId: { in: guildIds } },
                            { id: { gt: search ? 0 : (lowestId - 1) } },
                            { username: { contains: search ? (userIdSearch ? '' : search) : '' } },
                            { userId: { equals: userIdSearch ? BigInt(userIdSearch) as bigint : undefined } }
                        ],
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                }).then((members: any) => {
                    return res.status(200).json({
                        success: true,
                        max: count,
                        maxPages: Math.ceil(count / limit) === 0 ? 1 : Math.ceil(count / limit),
                        members: members.map((member: any) => {
                            return {
                                id: member.id,
                                userId: String(member.userId),
                                username: member.username,
                                avatar: member.avatar,
                                ip: account.role !== "free" ? member.ip : null,
                                createdAt: member.createdAt,
                                guildId: String(member.guildId),
                                guildName: servers.find((server: any) => server.guildId === member.guildId)?.name,
                                unauthorized: (member.accessToken === "unauthorized"),
                            };
                        })
                    })
                })
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
