import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../../src/db";
import { createBackup } from "../../../../../../../src/Backup";
import withAuthentication from "../../../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "POST") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        if (user.role !== "business" && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });
        const serverId: any = String(req.query.serverid) as any;

        const server = await prisma.servers.findFirst({ where: { guildId: BigInt(serverId) as bigint, ownerId: user.id } });
        if (!server) return res.status(404).json({ success: false, message: "Server not found" });

        const backup: any = await createBackup(BigInt(serverId) as bigint, { channels: true, members: true, roles: true, messages: true });

        if (backup.success) {
            return res.status(200).json(backup);
        } else {
            return res.status(400).json(backup);
        }
    }
    catch (err: any) {
        console.error(err);
        if (err.message) return res.status(400).json({ success: false, message: err.message });
        else return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);