import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../../src/db";
import { startRestore } from "../../../../../../../src/Restore";
import withAuthentication from "../../../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "POST") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const data = { ...req.body };
        const serverId: any = String(req.query.serverid) as any;

        if (data.clearGuild === undefined || data.settings === undefined || data.channels === undefined || data.roles === undefined || serverId === undefined) {
            let errors = [];
            if (!data.clearGuild) errors.push("clearGuild");
            if (!data.settings) errors.push("settings");
            if (!data.channels) errors.push("channels");
            if (!data.roles) errors.push("roles");

            return res.status(400).json({ success: false, message: `Missing arguments ${errors}` });
        }

        if (!data.settings && !data.channels && !data.roles) return res.status(400).json({ success: false, message: "Nothing to restore" });

        if (user.role !== "business") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });

        const server = await prisma.servers.findFirst({ where: { guildId: BigInt(serverId) as bigint, ownerId: user.id } });
        if (!server) return res.status(404).json({ success: false, message: "Server not found" });

        const backup = await prisma.backups.findFirst({ where: { guildId: server.guildId } });
        if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

        const bot = await prisma.customBots.findFirst({ where: { id: server.customBotId, ownerId: user.id } });
        if (!bot) return res.status(404).json({ success: false, message: "Bot not found" });

        const restore = await startRestore(server, bot, backup, data.clearGuild, data.settings, data.channels, data.roles);

        return res.status(200).json({ success: true, message: restore });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);