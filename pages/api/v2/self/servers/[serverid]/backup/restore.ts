import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../../../src/db";
import { startRestore } from "../../../../../../../src/Restore";
import withAuthentication from "../../../../../../../src/withAuthentication";
import axios from "axios";

function iconUrlToBase64(url: string) {
    return axios.get(url, {
        responseType: "arraybuffer",
    }).then((res) => Buffer.from(res.data, "binary").toString("base64"));
}

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "POST") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const data = { ...req.body };
        const serverId: any = String(req.query.serverid) as any;

        if (data.clearGuild === undefined || data.settings === undefined || data.channels === undefined || data.roles === undefined || data.messages === undefined || serverId === undefined) {
            let errors = [];
            if (!data.clearGuild) errors.push("clearGuild");
            if (!data.settings) errors.push("settings");
            if (!data.channels) errors.push("channels");
            if (!data.roles) errors.push("roles");
            if (!data.messages) errors.push("messages");

            return res.status(400).json({ success: false, message: `Missing arguments ${errors}` });
        }

        if (user.role !== "business" && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });

        const server = await prisma.servers.findFirst({ where: { guildId: BigInt(serverId) as bigint, ownerId: user.id } });
        if (!server) return res.status(404).json({ success: false, message: "Server not found" });

        const backup = await prisma.backups.findFirst({ where: { guildId: server.guildId } });
        if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

        const bot = await prisma.customBots.findFirst({ where: { id: server.customBotId, ownerId: user.id } });
        if (!bot) return res.status(404).json({ success: false, message: "Bot not found" });

        if (data.instant && !data.discordId && !data.guildId) {
            const roles = await prisma.roles.findMany({ where: { backupId: backup.backupId } });
            const channels = await prisma.channels.findMany({ where: { backupId: backup.backupId } });
            const channelPermissions = await prisma.channelPermissions.findMany({ where: { channelId: { in: channels.map((c) => c.channelId) } } });

            channels.sort((a, b) => {
                if (a.parentId && !b.parentId) return 1;
                if (!a.parentId && b.parentId) return -1;
                if (a.parentId && b.parentId) return 0;
                if (a.type === 4 && b.type !== 4) return -1;
                if (a.type !== 4 && b.type === 4) return 1;
                return 0;
            });

            channels.forEach((c) => {
                if (c.type === 5) c.type = 0;
                if (c.type === 15) c.type = 0;
                if (c.type === 10) c.type = 0;
                if (c.type === 11) c.type = 0;
                if (c.type === 13) c.type = 2;
            });

            const createGuild = await axios.post(`https://discord.com/api/v10/guilds`, {
                name: backup.serverName,
                icon: await iconUrlToBase64(backup.iconURL),
                roles: roles.map((r) => ({
                    id: String(r.roleId) as string,
                    name: r.name,
                    color: r.color,
                    hoist: r.hoist,
                    position: r.position,
                    permissions: String(r.permissions) as string,
                    mentionable: r.mentionable,
                })),
                channels: channels.map((c) => ({
                    id: String(c.channelId) as string,
                    name: c.name,
                    type: c.type,
                    ...c.topic && { topic: c.topic },
                    nsfw: c.nsfw,
                    ...c.bitrate && { bitrate: c.bitrate },
                    ...c.userLimit && { user_limit: c.userLimit },
                    ...c.rateLimitPerUser && { rate_limit_per_user: c.rateLimitPerUser },
                    position: c.position,
                    ...channelPermissions.filter((p) => p.channelId === c.channelId).length && {
                        permission_overwrites: channelPermissions.filter((p) => p.channelId === c.channelId).map((p) => ({
                            id: String(p.roleId) as string,
                            type: p.type,
                            allow: String(p.allow),
                            deny: String(p.deny),
                        })),
                    },
                    ...c.parentId && { parent_id: String(c.parentId) as string },
                })),
            }, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                },
                validateStatus: () => true,
            });

            if (!createGuild.data.id) return res.status(400).json({ success: false, message: "Failed to create guild, your bot may not be eligable" });

            
            const newChannels = await axios.get(`https://discord.com/api/v10/guilds/${createGuild.data.id}/channels`, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                },
                validateStatus: () => true,
            });

            if (!newChannels.data.find((c: any) => c.type === 0)) return res.status(400).json({ success: false, message: "Failed to create guild, your bot may not be eligable" });


            const createInvite = await axios.post(`https://discord.com/api/v10/channels/${newChannels.data.find((c: any) => c.type === 0).id}/invites`, {}, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                },
                validateStatus: () => true,
            });
           
            if (!createInvite.data.code) return res.status(400).json({ success: false, message: "Failed to create invite, your bot may not be eligable" });


            return res.status(200).json({ success: true, invite: createInvite.data.code, guildId: createGuild.data.id });
        } else if (data.guildId && data.discordId) {
            const patchGuild = await axios.patch(`https://discord.com/api/v10/guilds/${data.guildId}`, {
                owner_id: data.discordId,
            }, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                },
                validateStatus: () => true,
            });

            if (patchGuild.status === 404) return res.status(404).json({ success: false, message: "You have not joined this server" });

            return res.status(200).json({ success: true, message: "Server ownership transferred" });
        } else {

            if (!(data.settings && data.channels && data.roles)) return res.status(400).json({ success: false, message: "Nothing to restore" });

            const restore = await startRestore(server, bot, backup, data.clearGuild, data.settings, data.channels, data.roles, data.messages);

            return res.status(200).json({ success: true, message: restore });
        }
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);