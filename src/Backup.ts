import axios from "axios";
import { Guild } from "discord.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import {
    generateKey,
    getChannels,
    getMembers,
    getMessages,
    getRoles,
} from "./BackupUtils";
import { prisma } from "./db";
import { BackupData, channelData, MemberData, MessageData, roleData } from "./types";

const DISCORD_API_BASE = "https://discord.com/api/v10";

export const getBackupData = (backup_id: string) => {
    return new Promise(async (resolve, reject) => {
        let backupData = await prisma.backups.findUnique({ where: { backupId: backup_id } });
        if (backupData) {
            return resolve(backupData);
        } else {
            return reject("Invalid Backup Provided");
        }
    });
};

export const createBackup = async (guildId: bigint, options: { roles: boolean, channels: boolean, members: boolean, messages: boolean }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const server = await prisma.servers.findFirst({ where: { guildId: BigInt(guildId) }, });
            const backup = await prisma.backups.findFirst({ where: { guildId: BigInt(guildId) } });
            const bot = await prisma.customBots.findUnique({ where: { id: server?.customBotId } });

            if (!server) return reject("Server not found in database");
            if (!bot) return reject("Bot not found in database");

            const backupData: BackupData = {
                serverName: server.name,
                guildId: guildId,
                backupId: backup?.backupId ? backup.backupId : generateKey(10), 
                // serverId: server.id as number,
                iconURL: "",
                channels: Array<channelData>(),
                roles: Array<roleData>(),
                guildMembes: Array<MemberData>(),
                messages: Array<MessageData>(),
            };

            const guild = await axios.get(`${DISCORD_API_BASE}/guilds/${guildId}`, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                    "X-RateLimit-Precision": "millisecond",
                    "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                },
                proxy: false,
                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                validateStatus: () => true,
            });

            if (guild.status === 401) return reject({ success: false, message: "Invalid Bot Token" });
            if (guild.status !== 200) return reject({ success: false, message: "Discord Server not found" });

            if (guild.data.icon) backupData.iconURL = `https://cdn.discordapp.com/icons/${guildId}/${guild.data.icon}`;
            if (guild.data.name) backupData.serverName = guild.data.name;

            if (options.roles) backupData.roles = await getRoles(server, bot);
            if (options.channels) backupData.channels = await getChannels(server, bot);
            if (options.members) backupData.guildMembes = await getMembers(server, bot);
            if (options.messages && backupData.channels) {
                for (const channel of backupData.channels) {
                    const messages = await getMessages(channel.channelId, bot);
                    if (messages) backupData.messages.push(...messages);
                }
            }

            if (backup) {
                await deleteBackup(backup.backupId);

                const previousBackup = await prisma.backups.findFirst({
                    where: {
                        guildId: BigInt(server.guildId),
                    },
                });

                if (previousBackup) return reject({ success: false, message: "Another Backup already exists, probably on another account" });

                await makeBackup(backupData);
                return resolve({ success: true, message: "Backup Updated" });
            } else {
                await makeBackup(backupData);
            }
            return resolve({ success: true, message: "Backup Created" });
        } catch (e: any) {
            console.error(e);
            
            if (e.response && e.response.data && e.response.data.message) {
                return reject({ success: false, message: e.response.data.message });
            } else {
                return reject({ success: false, message: "Something went wrong, contact support." });
            }
        }
    });
};

export const deleteBackup = async (backup_id: string) => {
    await prisma.roles.deleteMany({ where: { backupId: backup_id } });
    const channels = await prisma.channels.findMany({ where: { backupId: backup_id } });
    for (const channel of channels) {
        await prisma.channelPermissions.deleteMany({ where: { channelId: channel.channelId } });
    }
    await prisma.messages.deleteMany({ where: { backupId: backup_id } });
    await prisma.channels.deleteMany({ where: { backupId: backup_id } });
    await prisma.guildMembers.deleteMany({ where: { backupId: backup_id } });
    await prisma.backups.deleteMany({ where: { backupId: backup_id } });

    return true;
};


const makeBackup = async(backupData: any) => {
    await prisma.backups.create({
        data: {
            serverName: backupData.serverName as string,
            guildId: BigInt(backupData.guildId),
            backupId: backupData.backupId as string,
            // serverId: backupData.serverId as number,
            iconURL: backupData.iconURL as string,
            ...(backupData.channels ? { channels: {
                createMany: {
                    data: backupData.channels.map((channel: any) => ({
                        name: channel.name as any,
                        type: Number(channel.type) as any,
                        channelId: BigInt(channel.channelId) as any,
                        nsfw: channel.nsfw ? channel.nsfw : false as any,
                        parentId: channel.parentId ? BigInt(channel.parentId) as bigint : null as any,
                        position: channel.position as any,
                        topic: channel.topic ? channel.topic : null as any,
                        bitrate: channel.bitrate ? channel.bitrate : null as any,
                        userLimit: channel.userLimit ? channel.userLimit : null as any,
                        rateLimitPerUser: channel.rateLimitPerUser ? channel.rateLimitPerUser : null as any,
                    })) as any,
                },
            } } : {}),
            ...(backupData.roles ? { roles: { 
                createMany: {
                    data: [...backupData.roles] as any,
                },
            } } : {}),
            ...(backupData.members ? { guildMembes: { 
                createMany: { 
                    data: [...backupData.guildMembes] as any,
                },
            } } : {}),
            ...(backupData.messages ? { messages: {
                createMany: {
                    data: backupData.messages.map((message: any) => ({
                        channelId: BigInt(message.channelId) as bigint,
                        username: message.username as any,
                        avatar: message.avatar as any,
                        content: message.content ? message.content : null as any,
                        // files: message.files ? message.files : null as any,
                        files: null as any,
                        messageDate: message.createdAt,
                    })) as any,
                },
            } } : {}),
        },
    });

    
    backupData.channels.map(async (channel: any) => {
        if (channel.channelPermissions) {
            channel.channelPermissions.map(async (permission: any) => {
                const Channel = await prisma.channels.findFirst({
                    where: {
                        channelId: BigInt(permission.channelId),
                    },
                });

                const existingPermission = await prisma.channelPermissions.findFirst({
                    where: {
                        AND: [
                            { channelId: BigInt(permission.channelId), },
                            { roleId: BigInt(permission.roleId), },
                            { type: permission.type as string, },
                            { allow: permission.allow, },
                            { deny: permission.deny, },
                        ]
                    },
                });

                if (Channel) {
                    if (existingPermission) {
                        await prisma.channelPermissions.update({
                            where: {
                                id: existingPermission.id,
                            },
                            data: {
                                type: permission.type as string,
                                allow: permission.allow as any,
                                deny: permission.deny as any,
                            },
                        });
                    } else {
                        await prisma.channelPermissions.createMany({
                            data: {
                                channelId: BigInt(permission.channelId),
                                roleId: BigInt(permission.roleId),
                                type: permission.type as string,
                                allow: permission.allow as any,
                                deny: permission.deny as any,
                            },
                        });
                    }
                }
            });
        }
    });
}