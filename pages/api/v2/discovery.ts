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
    "gun",
    "🔞",
    "🔫",
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ success: false, message: "Method not allowed" });

    try {
        const search = req.query.q ? String(req.query.q) : undefined;
        if (search && (search.length < 3 || search.length > 99)) return res.status(200).json({ success: true, servers: [] });

        const limit: number = req.query.max ? parseInt(req.query.max as string) : 39;
        const page: number = req.query.page ? parseInt(req.query.page as string) : 0;

        let servers = await prisma.servers.findMany({
            select: {
                id: true,
                name: true,
                guildId: true,
                picture: true,
                bgImage: true,
                description: true,
                themeColor: true,
                verified: true,
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
                    { nsfw: false },
                    ...(search && (search.length >= 3 && search.length <= 99)) ? [{
                        name: {
                            contains: search
                        }
                    }] : []
                ],
                NOT: [...blockedWords.map(word => ({ name: { contains: word } }))]
            },
            take: limit > 99 ? 99 : limit,
            skip: page ? (page - 1) * limit : 0,
        });

        if (!servers || servers.length === 0) return res.status(200).json({ success: true, pages: 0, servers: [] });

        servers = servers.map(server => ({
            id: server.id,
            name: server.name,
            guildId: String(server.guildId),
            picture: server.picture,
            bgImage: server.bgImage,
            description: server.description,
            themeColor: server.themeColor,
            verified: server.verified,
            createdAt: server.createdAt,
            customBot: {
                clientId: String(server.customBot.clientId),
                customDomain: server.customBot.customDomain
            },
        })) as any;

        search ? null : await redis.set("discovery", JSON.stringify(servers), "EX", 1800);

        const serverCount = await prisma.servers.count({
            where: {
                AND: [
                    { locked: false },
                    { discoverable: 1 },
                    { nsfw: false },
                    ...(search && (search.length >= 3 && search.length <= 99)) ? [{
                        name: {
                            contains: search
                        }
                    }] : []
                ],
                NOT: [...blockedWords.map(word => ({ name: { contains: word } }))]
            },
        });

        return res.status(200).json({ success: true, pages: Math.ceil(serverCount / limit), servers });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong", servers: [] });
    }
}

