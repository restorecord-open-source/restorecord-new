import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import { accounts } from "@prisma/client";
import withAuthentication from "../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
        if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

        const formatted = servers.map(async (server: any) => {
            const members = await prisma.members.findMany({
                select: {
                    id: true,
                    createdAt: true
                },
                where: {
                    guildId: server.guildId,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
                orderBy: { id: "desc" },
                take: 99999
            });

            return {
                id: server.id,
                name: server.name,
                members: members.map((member: any) => {
                    return {
                        id: member.id,
                        createdAt: member.createdAt
                    }
                }),
                createdAt: server.createdAt
            }
        });

        return res.status(200).json({ success: true, servers: await Promise.all(formatted) });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);