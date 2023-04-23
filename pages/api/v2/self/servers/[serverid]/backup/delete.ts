import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { deleteBackup } from "../../../../../../../src/Backup";
import { prisma } from "../../../../../../../src/db";
import withAuthentication from "../../../../../../../src/withAuthentication";


async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "DELETE") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        if (user.role !== "business" && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You need to be a Business subscriber to use this feature." });
        const serverId: any = String(req.query.serverid) as any;

        const server = await prisma.servers.findFirst({ where: { guildId: BigInt(serverId) as bigint, ownerId: user.id } });
        if (!server) return res.status(404).json({ success: false, message: "Server not found" });

        const backup = await prisma.backups.findFirst({ where: { guildId: server.guildId } });
        if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

        await deleteBackup(backup.backupId).then(async () => {
            return res.status(200).json({ success: true, message: "Backup Deleted" });
        }).catch((err) => {
            console.error(`[ERROR] Backup Delete: ${err}`);
            return res.status(500).json({ success: false, message: "An error occured while deleting the backup" });
        });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);