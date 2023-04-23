import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        switch (req.method) {
        case "GET":
            try {
                let server;
                let serverID = req.query.id as any;

                if (!req.query.id) {
                    return res.status(400).json({ success: false, message: "No id provided" });
                }

                if (isNaN(Number.parseInt(req.query.id as any))) {
                    server = await prisma.servers.findFirst({ where: { name: req.query.id.toString(), } });
                } else {
                    try {
                        if (isNaN(Number(serverID)) || isNaN(Number(serverID))) await prisma.servers.findFirst({ where: { name: req.query.id.toString() } });
                        if (BigInt(serverID) > 18446744073709551615 || BigInt(serverID) > 18446744073709551615) await prisma.servers.findFirst({ where: { name: req.query.id.toString() } });

                        server = await prisma.servers.findUnique({ where: { guildId: BigInt(req.query.id as any) as bigint }});
                    } catch {
                        server = await prisma.servers.findFirst({ where: { name: req.query.id.toString() } });
                    }
                }

                if (!server) return res.status(404).json({ success: false, message: "Server not found" });

                const customBot = await prisma.customBots.findUnique({ where: { id: server.customBotId }});
                const ownerAccount = await prisma.accounts.findUnique({ where: { id: server.ownerId }});
                // const members = await prisma.members.count({ where: { guildId: server.guildId }});

                if (!customBot || !ownerAccount) return res.status(400).json({ success: false, message: "Server is missing data" });

                if (server) {
                    return res.status(200).json({ success: true, server: {
                        name: server.name,
                        guildId: server.guildId.toString(),
                        icon: server.picture,
                        bg: server.bgImage ? server.bgImage : null,
                        description: server.description,
                        clientId: customBot?.clientId.toString(),
                        domain: customBot?.customDomain,
                        // verified: members >= 1000,
                    } });
                }
                else {
                    return res.status(404).json({ success: false, message: "Server not found" });
                }
                
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