import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import { accounts } from "@prisma/client";
import withAuthentication from "../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });


                const formatted = servers.map(async (server: any) => {
                    const members = await prisma.members.findMany({
                        where: {
                            guildId: server.guildId,
                        },
                        orderBy: { id: "desc" },
                    });

                    return {
                        id: server.id,
                        name: server.name,
                        members: members.map((member: any) => {
                            return {
                                id: member.id,
                                userId: String(member.userId) as string,
                                username: member.username,
                                avatar: member.avatar,
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
            break;
        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}

export default withAuthentication(handler);