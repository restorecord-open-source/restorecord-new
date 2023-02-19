import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 120, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const serverId: any = req.query.guild;

                const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
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
                let ipSearch: any = search ? (search.match(/^(\d{1,3}\.){3}\d{1,3}$/) ? search : undefined) : undefined;
                let conditions: any[] = [{ guildId: { in: guildIds } }];

                if (ipSearch) conditions.push({ ip: { equals: ipSearch } }); else if (search) conditions.push({ username: { contains: search } });
                if (userIdSearch) conditions.push({ userId: { equals: userIdSearch } });
                // if (search) conditions.push({ username: { contains: search } });

                const count = await prisma.members.count({ where: { AND: conditions } });
                const countPullable = await prisma.members.count({ where: { AND: [{ accessToken: { not: "unauthorized" } }, { guildId: { in: guildIds } }, { username: { contains: search ? (userIdSearch ? '' : search) : '' } }, { userId: { equals: userIdSearch ? BigInt(userIdSearch) as bigint : undefined } }] } });

                const memberList = await prisma.members.findMany({
                    where: {
                        AND: conditions
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                });

                const lastId = Number(page) === 1 ? 0 : memberList[memberList.length - 1].id;

                conditions.push({ id: { gt: search ? 0 : lastId } });
                await prisma.members.findMany({
                    where: {
                        AND: conditions
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                }).then((members: any) => {
                    return res.status(200).json({
                        success: true,
                        max: count,
                        pullable: countPullable,
                        maxPages: Math.ceil(count / limit) === 0 ? 1 : Math.ceil(count / limit),
                        members: members.map((member: any) => {
                            return {
                                id: member.id,
                                userId: String(member.userId),
                                username: member.username,
                                avatar: member.avatar,
                                ip: user.role !== "free" ? member.ip : null,
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
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ 
                    success: false,
                    max: 1,
                    pullable: 1,
                    maxPages: 1,
                    members: [
                        {
                            id: 0,
                            userId: "0",
                            username: "Rate Limited, try again in 1 minute",
                            avatar: "https://cdn.discordapp.com/attachments/881202202202429450/881202222201733130/unknown.png",
                            ip: "127.0.0.1",
                            createdAt: new Date(),
                            guildId: "0",
                            guildName: "Rate Limited",
                            unauthorized: false,
                        }
                    ]
                });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ 
                    success: false,
                    max: 1,
                    pullable: 1,
                    maxPages: 1,
                    members: [
                        {
                            id: 0,
                            userId: "0",
                            username: "Error",
                            avatar: "https://cdn.discordapp.com/attachments/881202202202429450/881202222201733130/unknown.png",
                            ip: "127.0.0.1",
                            createdAt: new Date(),
                            guildId: "0",
                            guildName: "Error",
                            unauthorized: false,
                        }
                    ]
                });
            }
            break;
        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}

export default withAuthentication(handler);