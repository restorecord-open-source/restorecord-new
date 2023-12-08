import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        const serverId: any = req.query.guild ? req.query.guild : "all";

        const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
        if (!servers || servers.length === 0) {
            return res.status(200).json({ success: true, max: 0, pullable: 0, maxPages: 1, members: [], message: "No servers found." });
        }

        const limit: number = req.query.max ? parseInt(req.query.max as string, 10) : 50;
        const page: number = req.query.page ? parseInt(req.query.page as string, 10) : 0;

        let guildIds: BigInt[] = [];

        if (serverId === undefined || serverId.toLowerCase() === "all") {
            guildIds = servers.map((server: any) => server.guildId);
        } else {
            guildIds = serverId ? [BigInt(serverId)] : servers.map((server: any) => server.guildId);
        }

        const search: string | undefined = req.query.search ? req.query.search as string : undefined;
        const userIdSearch: string | undefined = search && search.match(/^\d{15,20}$/) ? search : undefined;
        const ipSearch: string | undefined = search && search.match(/^(\d{1,3}\.){3}\d{1,3}$/) ? search : undefined;
        const conditions: any[] = [{ guildId: { in: guildIds } }];

        if (ipSearch) conditions.push({ ip: { equals: ipSearch } });
        else if (userIdSearch) conditions.push({ userId: { equals: BigInt(userIdSearch) as bigint } });
        else if (search) conditions.push({ username: { contains: search.replace("@", "") } });

        const count = await prisma.members.count({
            where: {
                AND: conditions,
            },
        });

        const countPullable = await prisma.members.count({
            where: {
                AND: [...conditions, { accessToken: { not: "unauthorized" } }],
            },
        });

        const memberList = await prisma.members.findMany({
            where: {
                AND: conditions,
            },
            orderBy: { id: "desc" },
            skip: page ? (page - 1) * limit : 0,
            take: limit,
        });

        if (memberList.length === 0) {
            return res.status(200).json({
                success: true,
                max: count,
                pullable: countPullable,
                maxPages: Math.ceil(count / limit),
                members: [],
                message: "No members found.",
            });
        }

        const memberListFixed = memberList.map((member: any) => {
            return {
                id: member.id,
                userId: String(member.userId),
                username: member.username,
                avatar: member.avatar,
                ip: user.role !== "free" ? member.ip : null,
                createdAt: member.createdAt,
                guildId: String(member.guildId),
                guildName: servers.find((server: any) => server.guildId === member.guildId)?.name,
                unauthorized: member.accessToken === "unauthorized",
            };
        });

        return res.status(200).json({
            success: true,
            max: count,
            pullable: countPullable,
            maxPages: Math.ceil(count / limit),
            members: memberListFixed,
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