import { NextApiRequest, NextApiResponse } from "next";
import withAuthentication from "../../../../../../src/withAuthentication";
import { accounts } from "@prisma/client";
import { prisma } from "../../../../../../src/db";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "DELETE") return res.status(405).json({ code: 0, message: "Method not allowed", });

    try {
        const serverId: any = String(req.query.serverid) as any;
        if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });


        const server = await prisma.servers.findFirst({ where: { AND: [ { guildId: BigInt(serverId) as bigint }, { ownerId: user.id } ] } });
        if (!server) return res.status(400).json({ success: false, message: "Server not found" });

        if (!server.pulling) return res.status(400).json({ success: false, message: "Server is not pulling" });

        await prisma.servers.update({ where: { id: server.id }, data: { pulling: false } });
        return res.status(200).json({ success: true, message: "Pulling has been stopped" });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);