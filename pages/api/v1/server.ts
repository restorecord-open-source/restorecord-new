import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        switch (req.method) {
        case "GET":
            try {
                let server;

                if (!req.query.id) {
                    return res.status(400).json({ success: false, message: "No id provided" });
                }

                if (isNaN(Number.parseInt(req.query.id as any))) {
                    server = await prisma.servers.findFirst({
                        where: {
                            name: req.query.id.toString(),
                        },
                    });
                } else {
                    server = await prisma.servers.findUnique({
                        where: {
                            guildId: BigInt(req.query.id as any),
                        },
                    });
                }

                if (!server) return res.status(400).json({ success: false, message: "Server not found" });

                const customBot = await prisma.customBots.findUnique({
                    where: {
                        id: server?.customBotId,
                    },
                });

                const ownerAccount = await prisma.accounts.findUnique({
                    where: {
                        id: server?.ownerId,
                    },
                });

                const members = await prisma.members.findMany({
                    where: {
                        guildId: server?.guildId,
                    },
                });

                if (server) {
                    return res.status(200).json({ success: true, server: {
                        name: server.name,
                        guildId: server.guildId.toString(),
                        icon: server.picture,
                        bg: server.bgImage ? server.bgImage : null,
                        description: server.description,
                        createdAt: server.createdAt,
                        clientId: customBot?.clientId.toString(),
                        owner: ownerAccount?.username,
                        domain: server.customDomain,
                        verified: members.length >= 1000,
                    } });
                }
                else {
                    return res.status(404).json({ success: false, message: "Server not found" });
                }
                
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
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