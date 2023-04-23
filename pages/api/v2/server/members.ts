import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ success: false, message: "Method not allowed." });

    try {
        const serverId: any = req.query.guild;

        const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
        if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

        const limit: any = req.query.max ? req.query.max : 50;
        const page = req.query.page ?? '';


        let guildIds: any = "";

        if (serverId !== undefined && serverId.toLowerCase() === "all") {
            guildIds = servers.map((server: any) => server.guildId).join(",");
        } else {
            guildIds = serverId ? serverId : servers.map((server: any) => server.guildId).join(",");
        }

        let search: any = req.query.search ?? '';
        search = `%${search}%`
        // let userIdSearch: any = search ? (isNaN(search) ? undefined : BigInt(search)) : undefined;
        // let ipSearch: any = search ? (search.match(/^(\d{1,3}\.){3}\d{1,3}$/) ? search : undefined) : undefined;
        // let conditions: any[] = [{ guildId: { in: guildIds } }];

        // if (ipSearch) conditions.push({ ip: { equals: ipSearch } }); else if (search) conditions.push({ username: { contains: search } });
        // if (userIdSearch) conditions.push({ userId: { equals: userIdSearch } });
        // if (search) conditions.push({ username: { contains: search } });

        // const count = await prisma.members.count({ where: { AND: conditions } });
        // const countPullable = await prisma.members.count({ where: { AND: [{ accessToken: { not: "unauthorized" } }, { guildId: { in: guildIds } }, { username: { contains: search ? (userIdSearch ? '' : search) : '' } }, { userId: { equals: userIdSearch ? BigInt(userIdSearch) as bigint : undefined } }] } });

        // const memberList = await prisma.members.findMany({
        //     where: {
        //         AND: conditions
        //     },
        //     take: search ? undefined : (Number(page) * Number(limit)),
        // });

        // const count queryraw where guildId in (guildIds) and (username like %search% or userId = search or ip = search)
        const count: any = await prisma.$queryRaw`SELECT COUNT(*) FROM members WHERE guildId IN (${guildIds}) AND (username LIKE ${search} OR userId = ${search.replace(/%/g, '')} OR ip = ${search.replace(/%/g, '')})`;
        const countPullable: any = await prisma.$queryRaw`SELECT COUNT(*) FROM members WHERE guildId IN (${guildIds}) AND (username LIKE ${search} OR userId = ${search.replace(/%/g, '')} OR ip = ${search.replace(/%/g, '')}) AND accessToken != 'unauthorized'`;

        const memberList: any = await prisma.$queryRaw`SELECT * FROM members WHERE guildId IN (${guildIds}) AND (username LIKE ${search} OR userId = ${search.replace(/%/g, '')} OR ip = ${search.replace(/%/g, '')}) ORDER BY id DESC LIMIT ${Number(page) * Number(limit)}`;

        if (memberList.length === 0) return res.status(200).json({
            success: true,
            max: Number(count[0]['COUNT(*)']),
            pullable: Number(countPullable[0]['COUNT(*)']),
            maxPages: Math.ceil(Number(count[0]['COUNT(*)']) / limit) === 0 ? 1 : Math.ceil(Number(count[0]['COUNT(*)']) / limit),
            members: []
        });

        const lastId = Number(page) === 1 ? 0 : memberList[memberList.length - 1].id;

        // conditions.push({ id: { gt: search ? 0 : lastId } });
        // await prisma.members.findMany({
        //     where: {
        //         AND: conditions
        //     },
        //     take: search ? undefined : (Number(page) * Number(limit)),
        // }).then((members: any) => {
        //     return res.status(200).json({
        //         success: true,
        //         max: count,
        //         pullable: countPullable,
        //         maxPages: Math.ceil(count / limit) === 0 ? 1 : Math.ceil(count / limit),
        //         members: members.map((member: any) => {
        //             return {
        //                 id: member.id,
        //                 userId: String(member.userId),
        //                 username: member.username,
        //                 avatar: member.avatar,
        //                 ip: user.role !== "free" ? member.ip : null,
        //                 createdAt: member.createdAt,
        //                 guildId: String(member.guildId),
        //                 guildName: servers.find((server: any) => server.guildId === member.guildId)?.name,
        //                 unauthorized: (member.accessToken === "unauthorized"),
        //             };
        //         })
        //     })
        // })

        const members: any = await prisma.$queryRaw`SELECT * FROM members WHERE guildId IN (${guildIds}) AND (username LIKE ${search} OR userId = ${search.replace(/%/g, '')} OR ip = ${search.replace(/%/g, '')}) AND id > ${lastId} ORDER BY id DESC LIMIT ${limit}`;

        return res.status(200).json({
            success: true,
            max: Number(count[0]['COUNT(*)']),
            pullable: Number(countPullable[0]['COUNT(*)']),
            maxPages: Math.ceil(Number(count[0]['COUNT(*)']) / limit) === 0 ? 1 : Math.ceil(Number(count[0]['COUNT(*)']) / limit),
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
        });
                
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
}

export default withAuthentication(handler);