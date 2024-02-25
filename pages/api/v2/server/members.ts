import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        const serverId: any = req.query.guild ? req.query.guild : "all";
        const limit: number = req.query.max ? parseInt(req.query.max as string) : 50;
        const page: number = req.query.page ? parseInt(req.query.page as string) : 0;
        const search: string | undefined = req.query.search ? req.query.search as string : undefined;

        const servers = await prisma.servers.findMany({ where: { ownerId: user.id, guildId: serverId === "all" ? undefined : BigInt(serverId) } });
        if (!servers || servers.length === 0) {
            return res.status(200).json({ success: true, max: 0, pullable: 0, maxPages: 0, members: [], message: "No servers found." });
        }

      
        let guildIds: bigint[] = [];

        if (serverId === undefined || serverId.toLowerCase() === "all") {
            guildIds = servers.filter((server: any) => server.ownerId === user.id).map((server: any) => server.guildId);
        } else {
            guildIds = serverId ? (servers.find((server: any) => server.guildId === BigInt(serverId)) ? [BigInt(serverId)] : []) : servers.filter((server: any) => server.ownerId === user.id).map((server: any) => server.guildId);
        }


        const whereClause = {
            guildId: { in: guildIds },
            ...(search && {
                OR: [
                    { userId: /^\d{15,21}$/.test(search) ? BigInt(search) : undefined },
                    { ip: /^(\d{1,3}\.){3}\d{1,3}$/.test(search) ? search : undefined },
                    { username: { contains: search.replace("@", "") } },
                ].filter(Boolean),
            }),
        };

        const [countResult, countPullable, members] = await prisma.$transaction([
            prisma.members.count({ where: whereClause }),
            prisma.members.count({ where: { ...whereClause, accessToken: { not: "unauthorized" } } }),
            prisma.members.findMany({
                select: {
                    id: true,
                    userId: true,
                    accessToken: true,
                    username: true,
                    avatar: true,
                    createdAt: true,
                    guildId: true,
                },
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip: page ? (page - 1) * limit : 0,
                take: limit,
            }),
        ]);


        const memberList = members.map((member: any) => {
            return {
                id: member.id,
                userId: String(member.userId),
                username: member.username,
                avatar: member.avatar,
                createdAt: member.createdAt,
                guildId: String(member.guildId),
                guildName: servers.find((server: any) => server.guildId === member.guildId)?.name,
                unauthorized: member.accessToken === "unauthorized",
            };
        });

        return res.status(200).json({
            success: true,
            max: countResult,
            pullable: countPullable,
            maxPages: Math.ceil(countResult / limit),
            members: memberList,
            message: memberList.length > 0 ? "" : "No members found.",
        });
    } catch (err: any) {
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
                },
            ],
        });
    }
}

export default withAuthentication(handler);