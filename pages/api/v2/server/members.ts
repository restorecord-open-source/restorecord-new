import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                const serverId: any = req.query.guild ? req.query.guild : "all";

                const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

                const limit: any = req.query.max ? req.query.max : 50;
                const page = req.query.page ? req.query.page : 0;

                let guildIds: any = [];
                let lastId: any = 0;

                if (serverId === undefined || serverId.toLowerCase() === "all") {
                    guildIds = servers.map((server: any) => server.guildId);
                } else {
                    guildIds = serverId ? [BigInt(serverId)] : servers.map((server: any) => server.guildId);
                }

                let search: any = req.query.search ? req.query.search : undefined;
                let userIdSearch: any = search ? (search.match(/^\d{16,18}$/) ? search : undefined) : undefined;
                let ipSearch: any = search ? (search.match(/^(\d{1,3}\.){3}\d{1,3}$/) ? search : undefined) : undefined;
                let conditions: any[] = [ { guildId: { in: guildIds } } ];

                if (ipSearch) conditions.push({ ip: { equals: ipSearch } });
                else if (userIdSearch) conditions.push({ userId: { equals: BigInt(userIdSearch) as bigint } });
                else if (search) conditions.push({ username: { contains: search } });

                const count = await prisma.members.count({ where: { AND: conditions } });
                const countPullable = await prisma.members.count({ where: { AND: conditions, accessToken: { not: "unauthorized" } } });

                // get first id of the page
                const memberList = await prisma.members.findMany({
                    where: {
                        AND: conditions,
                    },
                    orderBy: { id: "asc" },
                    take: 1,
                    skip: page ? (Number(page) - 1) * limit : 0,
                });

                if (memberList.length === 0) return res.status(200).json({
                    success: true,
                    max: count,
                    pullable: countPullable,
                    maxPages: Math.ceil(count / limit) === 0 ? 1 : (Math.ceil(count / limit) - 1),
                    members: [],
                    message: "No members found."
                });

                lastId = memberList[0].id -1;

                conditions.push({ id: { gt: lastId } });
                await prisma.members.findMany({
                    where: {
                        AND: conditions,
                    },
                    orderBy: { id: "desc" },
                    take: limit,
                    skip: page ? (Number(page) - 1) * limit : 0,
                }).then((members: any) => {
                    return res.status(200).json({
                        success: true,
                        max: count,
                        pullable: countPullable,
                        maxPages: Math.ceil(count / limit) === 0 ? 1 : (Math.ceil(count / limit) - 1),
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
                            avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
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