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

        const servers = await prisma.servers.findMany({
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

        servers.sort(() => Math.random() - 0.5);

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