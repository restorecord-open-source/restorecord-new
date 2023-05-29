import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../../src/db";
import withAuthentication from "../../../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        if (user.role !== "business" && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });
        const serverId: any = String(req.query.serverid) as any;

        const server = await prisma.servers.findFirst({ where: { AND: [ { guildId: BigInt(serverId) as bigint }, { ownerId: user.id } ] } });
        if (!server) return res.status(404).json({ success: false, message: "Server not found" });

        const backup = await prisma.backups.findUnique({ where: { guildId: BigInt(serverId) as bigint } });
        if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

        const channels = await prisma.channels.findMany({ where: { backupId: backup.backupId } });
        const roles = await prisma.roles.findMany({ where: { backupId: backup.backupId } });

        const backupData = {
            name: backup.serverName,
            icon: backup.iconURL,
            channels: channels.map((channel) => {
                return {
                    name: channel.name,
                    type: channel.type,
                    position: channel.position,
                    parentId: channel.parentId ? String(channel.parentId) as string : null,
                    topic: channel.topic,
                    nsfw: channel.nsfw,
                    userLimit: channel.userLimit,
                    createdAt: channel.createdAt,
                }
            }),
            roles: roles.map((role) => {
                return {
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    permissions: String(role.permissions) as string,
                    mentionable: role.mentionable,
                    position: role.position,
                    isEveryone: role.isEveryone,
                    createdAt: role.createdAt,
                }
            }),
            createdAt: backup.createdAt,
        };

        return res.status(200).json({ success: true, backup: backupData });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);