import { NextApiRequest, NextApiResponse } from "next";
import { accounts } from "@prisma/client";

import { prisma } from "../../../../../../src/db";

import withAuthentication from "../../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const serverId: any = String(req.query.serverid) as any;

        const server = await prisma.servers.findFirst({ where: { guildId: BigInt(serverId), ownerId: user.id } });
        if (!server) return res.status(400).json({ success: false, message: "Server not found." });

        return res.status(200).json({ 
            success: true,
            server: {
                id: server.id,
                name: server.name,
                guildId: String(server.guildId) as string,
                owner: server.ownerId,
            }
        });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);