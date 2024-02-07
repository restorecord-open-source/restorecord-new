import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
        case "GET":
            let server;
            let serverID = req.query.id as any;

            if (!req.query.id)
                return res.status(400).json({ success: false, message: "No id provided" });

            if (isNaN(Number.parseInt(req.query.id as any))) {
                server = await prisma.servers.findFirst({ select: { name: true, guildId: true, picture: true, description: true, bgImage: true, private: true, customBot: true, owner: true }, where: { name: req.query.id.toString(), } });
            } 
            else  {
                if (isNaN(Number(serverID)) || isNaN(Number(serverID)))
                    server = await prisma.servers.findFirst({ select: { name: true, guildId: true, picture: true, description: true, bgImage: true, private: true, customBot: true, owner: true }, where: { name: req.query.id.toString() } });
                if (BigInt(serverID) > 18446744073709551615 || BigInt(serverID) > 18446744073709551615)
                    server = await prisma.servers.findFirst({ select: { name: true, guildId: true, picture: true, description: true, bgImage: true, private: true, customBot: true, owner: true }, where: { name: req.query.id.toString() } });
                else 
                    server = await prisma.servers.findUnique({ select: { name: true, guildId: true, picture: true, description: true, bgImage: true, private: true, customBot: true, owner: true }, where: { guildId: BigInt(req.query.id as any) as bigint }});
            }

            if (!server) return res.status(404).json({ success: false, message: "Server not found" });

            if (!server.customBot || !server.owner) return res.status(400).json({ success: false, message: "Server is missing data" });

            return res.status(200).json({ success: true, server: {
                name: server.name,
                guildId: server.guildId.toString(),
                icon: server.picture,
                bg: server.bgImage ? server.bgImage : null,
                description: server.description,
                clientId: server.private ? null : server.customBot?.clientId.toString(),
                domain: server.private ? null : (server.customBot?.customDomain ?? "restorecord.com"), 
                // verified: members >= 1000,
            } });

        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    } catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}