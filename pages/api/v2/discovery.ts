import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import { createRedisInstance } from "../../../src/Redis";
import { Prisma } from "@prisma/client";

const redis = createRedisInstance();

const blockedWords = [
    "porn",
    "nsfw",
    "sex",
    "s3x",
    "p0rn",
    "invites",
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ success: false, message: "Method not allowed" });

    try {
        const search = req.query.q ? String(req.query.q) : undefined;
        if (search && (search.length < 3 || search.length > 99)) return res.status(200).json({ success: true, servers: [] });

        const limit: number = req.query.max ? parseInt(req.query.max as string) : 39;
        const page: number = req.query.page ? parseInt(req.query.page as string) : 0;

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
                    { locked: false },
                    { discoverable: 1 },
                    ...(search && (search.length >= 3 && search.length <= 99)) ? [{
                        name: {
                            contains: search
                        }
                    }] : []
                ],
                NOT: [...blockedWords.map(word => ({ name: { contains: word } }))]
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: page ? (page - 1) * limit : 0,
            take: limit > 99 ? 99 : limit
        });

        if (!servers || servers.length === 0) return res.status(200).json({ success: true, pages: 0, servers: [] });

        const serverCount = await prisma.servers.count({
            where: {
                AND: [
                    { locked: false },
                    { discoverable: 1 },
                    ...(search && (search.length >= 3 && search.length <= 99)) ? [{
                        name: {
                            contains: search
                        }
                    }] : []
                ],
                NOT: [...blockedWords.map(word => ({ name: { contains: word } }))]
            },
            take: 1000,
        });

        servers.forEach(server => {
            server.guildId = String(server.guildId) as any;
            server.customBot.clientId = server.customBot?.clientId ? String(server.customBot.clientId) : "0" as any;
            server.customBot.customDomain = server.customBot?.customDomain ? String(server.customBot.customDomain) : "restorecord.com" as any;
        });

        search ? null : await redis.set("discovery", JSON.stringify(servers), "EX", 1800);

        return res.status(200).json({ success: true, pages: Math.ceil(serverCount / limit), servers });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}