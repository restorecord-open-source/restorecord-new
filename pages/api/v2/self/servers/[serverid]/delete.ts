import { NextApiRequest, NextApiResponse } from "next";
import { accounts } from "@prisma/client";

import { prisma } from "../../../../../../src/db";

import withAuthentication from "../../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "DELETE") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const serverId: any = BigInt(req.query.serverid as any);
        if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });
        
        const server = await prisma.servers.findFirst({
            where: {
                AND: [
                    { ownerId: user.id },
                    { guildId: serverId }
                ]
            }
        });
        
        if (!server) return res.status(400).json({ success: false, message: "Server not found" });
        
        const backup = await prisma.backups.findFirst({ where: { guildId: server.guildId } });

        if (backup) {
            await prisma.roles.deleteMany({ where: { backupId: backup.backupId } });
            const channels = await prisma.channels.findMany({ where: { backupId: backup.backupId } });
            for (const channel of channels) {
                await prisma.channelPermissions.deleteMany({ where: { channelId: channel.channelId } });
            }
            await prisma.channels.deleteMany({ where: { backupId: backup.backupId } });
            await prisma.guildMembers.deleteMany({ where: { backupId: backup.backupId } });
            await prisma.backups.deleteMany({ where: { backupId: backup.backupId } });
        }
        
        await prisma.members.deleteMany({ where: { guildId: serverId } });
        await prisma.blacklist.deleteMany({ where: { guildId: serverId } });
        
        await prisma.servers.delete({ where: { guildId: serverId, } });
        
        return res.status(200).json({ success: true, message: "Server has been successfully deleted" });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);