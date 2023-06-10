import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import { createRedisInstance } from "../../../src/Redis";
import { Prisma } from "@prisma/client";

const redis = createRedisInstance();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ success: false, message: "Method not allowed" });

    try {
        const search = req.query.q ? String(req.query.q) : undefined;
        const cached = await redis.get(`discovery`);
        if (cached && !search) return res.status(200).json({ success: true, servers: JSON.parse(cached) });
        if (search && (search.length < 3 || search.length > 99)) return res.status(200).json({ success: true, servers: [] });

        // check if ?q= is in the url
        // select id,name,guildId,picture,bgImage,description,themeColor,,createdAt from the `servers` table and then query all members from the `members` table where the guildId is equal to the server id and then sort which server has the most members in the last 14 days
        const servers = await prisma.servers.findMany({
            orderBy: {
                members: {
                    _count: "desc"
                }
            },
            select: {
                id: true,
                name: true,
                guildId: true,
                picture: true,
                bgImage: true,
                description: true,
                themeColor: true,
                createdAt: true,
                customBot: {
                    select: {
                        clientId: true,
                        customDomain: true
                    }
                }
            },
            where: {
                AND: [
                    {
                        locked: false,
                    },
                    {
                        discoverable: 1
                    },
                    ...(search && (search.length >= 3 && search.length <= 99)) ? [{
                        name: {
                            contains: search
                        }
                    }] : []
                ]
            },
            take: 39
        });

        servers.forEach(server => {
            server.guildId = String(server.guildId) as any;
            server.customBot.clientId = server.customBot?.clientId ? String(server.customBot.clientId) : "0" as any;
            server.customBot.customDomain = server.customBot?.customDomain ? String(server.customBot.customDomain) : "restorecord.com" as any;
        });

        // cache the servers for 1 hour
        search ? null : await redis.set("discovery", JSON.stringify(servers), "EX", 3600);

        return res.status(200).json({ success: true, servers });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}