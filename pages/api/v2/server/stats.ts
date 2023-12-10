import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import { accounts, members } from "@prisma/client";
import withAuthentication from "../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
        if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

        let query = req.query.q as string;
        let limit = req.query.limit as string | undefined | null | number;

        if (limit && Number(limit) > 100) limit = 100;

        switch (query) {
        case "recent":
            const members = await prisma.members.findMany({
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                },
                select: {
                    id: true,
                    username: true,
                    userId: true,
                    avatar: true,
                    createdAt: true,
                },
                orderBy: { id: "desc" },
                take: Number(limit) || 10,
            });
              
            const formattedMembers = members.map(member => ({
                ...member,
                userId: String(member.userId),
            }));
              
            return res.status(200).json({ success: true, content: formattedMembers });              
            break;
        case "isp":
            if (user.role !== "business" && user.role !== "enterprise") return res.status(403).json({ success: false, message: "You must be a Business subscriber to use this feature." });

            const ispCount = await prisma.members.groupBy({
                by: ["isp"],
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    isp: {
                        not: null,
                    },
                },
                _count: {
                    isp: true,
                },
                orderBy: {
                    _count: {
                        isp: "desc",
                    },
                },
                take: Number(limit) || 10,
            });
              
            const formattedIspCount = ispCount.map(entry => ({
                name: entry.isp,
                count: entry._count.isp,
            }));
              
            return res.status(200).json({ success: true, content: formattedIspCount });
            break;
        case "state":
            if (user.role !== "business" && user.role !== "enterprise") return res.status(403).json({ success: false, message: "You must be a Business subscriber to use this feature." });
              
            const stateCount = await prisma.members.groupBy({
                by: ["state"],
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    state: {
                        not: null,
                    },
                },
                _count: {
                    state: true,
                },
                orderBy: {
                    _count: {
                        state: "desc",
                    },
                },
                take: Number(limit) || 10,
            });
              
            const formattedStateCount = stateCount.map(entry => ({
                name: entry.state,
                count: entry._count.state,
            }));
              
            return res.status(200).json({ success: true, content: formattedStateCount });
            break;
        case "city":
            if (user.role !== "business" && user.role !== "enterprise") return res.status(403).json({ success: false, message: "You must be a Business subscriber to use this feature." });
              
            const cityCount = await prisma.members.groupBy({
                by: ["city"],
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    city: {
                        not: null,
                    },
                },
                _count: {
                    city: true,
                },
                orderBy: {
                    _count: {
                        city: "desc",
                    },
                },
                take: Number(limit) || 10,
            });
              
            const formattedCityCount = cityCount.map(entry => ({
                name: entry.city,
                count: entry._count.city,
            }));
              
            return res.status(200).json({ success: true, content: formattedCityCount });
            break;
        case "country":
            const countryCount = await prisma.members.groupBy({
                by: ["country"],
                where: {
                    guildId: {
                        in: servers.map(server => server.guildId),
                    },
                    country: {
                        not: null,
                    },
                },
                _count: {
                    country: true,
                },
                orderBy: {
                    _count: {
                        country: "desc",
                    },
                },
                take: Number(limit) || 10,
            });
              
            const formattedCountryCount = countryCount.map(entry => ({
                name: entry.country,
                count: entry._count.country,
            }));
              
            return res.status(200).json({ success: true, content: formattedCountryCount });
            break;
        case "server":
            var memberCount = await prisma.servers.findMany({
                where: {
                    ownerId: user.id,
                },
                select: {
                    name: true,
                    guildId: true,
                    customBotId: true,
                },
            }) as any[];
              
            memberCount = await Promise.all(memberCount.map(async (server) => {
                var customBot = await prisma.customBots.findUnique({ where: { id: server.customBotId } });
                var count = await prisma.members.count({ where: { guildId: server.guildId } });
                return { name: server.name, count: count, link: `https://${customBot?.customDomain || req.headers.host}/verify/${server.guildId}` };
            }));
              
            return res.status(200).json({ success: true, content: memberCount });              
            break;
        case "vpn":
            break;
        default:
            return res.status(400).json({ success: false, content: [], message: "Invalid query" });
        }
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);