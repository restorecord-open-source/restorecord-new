import { loadCategory } from "./BackupUtils";
import { backups, channels, customBots, roles, servers } from "@prisma/client";
import axios from "axios";
import { prisma } from "./db";
import { sleep } from "./Migrate";
import { HttpsProxyAgent } from "https-proxy-agent";

const DISCORD_API_BASE = "https://discord.com/api/v10";


export const loadConfig = async(server: servers, bot: customBots, backup: backups) => {
    let image;
    if (backup.iconURL !== null && backup.iconURL !== "") {
        image = await axios.get(backup.iconURL, { responseType: "arraybuffer", validateStatus: () => true });
    }
    
    const modify = await axios.patch(`${DISCORD_API_BASE}/guilds/${server.guildId}`, {
        name: backup.serverName,
        icon: backup.iconURL !== null && backup.iconURL !== "" ? `data:image/png;base64,${image ? image.data.toString("base64") : ""}` : null,
    }, {
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

    if (modify.data.retry_after) {
        await new Promise((resolve) => setTimeout(resolve, modify.data.retry_after));
    }

    return modify.data;
};

/**
 * Restore the guild roles
 */
export const loadRoles = async(server: servers, bot: customBots, backup: backups) => {
    // const rolePromises: Promise<Role>[] = [];
    // backupData.roles.forEach((roleData) => {
    //     if (roleData.isEveryone) {
    //         rolePromises.push(
    //             guild.roles.cache.get(guild.id)!.edit({
    //                 name: roleData.name,
    //                 color: roleData.color,
    //                 permissions: BigInt(roleData.permissions),
    //                 mentionable: roleData.mentionable,
    //             }),
    //         );
    //     } else {
    //         rolePromises.push(
    //             guild.roles.create({
    //                 name: roleData.name,
    //                 color: roleData.color,
    //                 hoist: roleData.hoist,
    //                 permissions: BigInt(roleData.permissions),
    //                 mentionable: roleData.mentionable,
    //             }),
    //         );
    //     }
    // });
    // return Promise.all(rolePromises);

    // for each backup.roles create a role

    const backupRoles = await prisma.roles.findMany({
        where: {
            backupId: backup.backupId,
        },
    });

    const everyoneRole = backupRoles.find((r) => r.isEveryone);
    if (everyoneRole) {
        const roles = await axios.get(`${DISCORD_API_BASE}/guilds/${server.guildId}/roles`, {
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

        if (!roles.status.toString().startsWith("2")) {
            roles.data = [];
            console.error(`[Restore] [Roles] [Everyone] ${roles.status} ${roles.statusText} ${JSON.stringify(roles.data)}`);
        }

        const everyoneRole = roles.data.find((r: any) => r.name === "@everyone") ?? server.guildId;

        const modify = await axios.patch(`${DISCORD_API_BASE}/guilds/${server.guildId}/roles/${everyoneRole.id}`, {
            color: everyoneRole.color,
            permissions: everyoneRole.permissions,
            mentionable: everyoneRole.mentionable,
        }, {
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

        if (modify.data.retry_after) {
            await new Promise((resolve) => setTimeout(resolve, modify.data.retry_after));
        }
    }

    const rolePromises: Promise<roles>[] = [];
    const rolesArr = backupRoles.filter((role) => role.name !== "@everyone" && role.botId == null).sort((a, b) => b.position - a.position);

    for (const roleData of rolesArr) {
        await new Promise((resolve) => setTimeout(resolve, 1800));

        const resp = await axios.post(`${DISCORD_API_BASE}/guilds/${server.guildId}/roles`, {
            name: roleData.name,
            permissions: String(roleData.permissions) as string,
            color: roleData.color,
            hoist: roleData.hoist,
            mentionable: roleData.mentionable,
        }, {
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

        rolePromises.push(resp.data);

        if (!resp.status.toString().startsWith("2")) { console.error(`[Restore] [Roles] [Create] ${resp.status} ${resp.statusText} ${JSON.stringify(resp.data)}`); }
        if (resp.data.retry_after) { await new Promise((resolve) => setTimeout(resolve, resp.data.retry_after)); }

    }

    return Promise.all(rolePromises);
};

/**
 * Restore the guild channels
 */
export const loadChannels = async(server: servers, bot: customBots, backup: backups, messages: boolean) => {
    // for each backup.channels create a channel

    const backupChannels = await prisma.channels.findMany({
        where: {
            backupId: backup.backupId,
        },
    });

    const channelPromises: Promise<channels>[] = [];

    // const categoriesPromise = new Promise((resolve, reject) => {
    // backupChannels.filter((channel) => channel.type === 4).forEach(async (channelData) => {
    for (const channelData of backupChannels.filter((channel) => channel.type === 4)) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const permissions = await prisma.channelPermissions.findMany({ where: { channelId: channelData.channelId } }) ?? [];
        const backupRoles = await prisma.roles.findMany({ where: { backupId: backup.backupId } });

        const roles = await axios.get(`${DISCORD_API_BASE}/guilds/${server.guildId}/roles`, {
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

        const resp = await axios.post(`${DISCORD_API_BASE}/guilds/${server.guildId}/channels`, {
            name: channelData.name,
            type: channelData.type,
            user_limit: channelData.userLimit ? channelData.userLimit : undefined,
            rate_limit_per_user: channelData.rateLimitPerUser ? channelData.rateLimitPerUser : undefined,
            position: channelData.position,
            nsfw: channelData.nsfw ? channelData.nsfw : undefined,
            permission_overwrites: permissions.map((permission) => {
                // check if the role exists
                if (!backupRoles.find((r) => r.roleId === permission.roleId)) {
                    return;
                }

                return {
                    id: String(roles.data.find((r: any) => r.name === backupRoles.find((r) => r.roleId === permission.roleId)?.name)?.id) as string ?? "" as string,
                    type: permission.type,
                    allow: String(permission.allow) as string,
                    deny: String(permission.deny) as string,
                };
            }),
        }, {
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

        if (!resp.status.toString().startsWith("2")) { console.error(`[Restore] [Channels] [Categories] ${resp.status} ${resp.statusText} ${JSON.stringify(resp.data)}`); }
        if (resp.data.retry_after) {
            await new Promise((resolve) => setTimeout(resolve, resp.data.retry_after));
        }
        // });
    }
    // });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const channels = await axios.get(`${DISCORD_API_BASE}/guilds/${server.guildId}/channels`, {
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

    if (channels.data.retry_after) { await new Promise((resolve) => setTimeout(resolve, channels.data.retry_after)); }
    if (!channels.status.toString().startsWith("2")) { channels.data = []; console.error(`[Restore] [Channels] ${channels.status} ${channels.statusText} ${JSON.stringify(channels.data)}`); }

    // backupChannels.filter((channel) => channel.type !== 4).forEach(async (channelData) => {
    for (const channelData of backupChannels.filter((channel) => channel.type !== 4)) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const permissions = await prisma.channelPermissions.findMany({ where: { channelId: channelData.channelId } }) ?? [];
        const backupRoles = await prisma.roles.findMany({ where: { backupId: backup.backupId } });

        const roles = await axios.get(`${DISCORD_API_BASE}/guilds/${server.guildId}/roles`, {
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

        const parentOwner = await prisma.channels.findFirst({ where: { backupId: backup.backupId, type: 4, channelId: channelData.parentId ?? 0 } });
        const parent = channels.data.find((c: any) => c.name === parentOwner?.name && c.type === 4) ?? undefined;

        const resp = await axios.post(`${DISCORD_API_BASE}/guilds/${server.guildId}/channels`, {
            name: channelData.name,
            type: channelData.type,
            topic: channelData.topic,
            ...(channelData.bitrate ? { bitrate: channelData.bitrate > 96000 ? 96000 : channelData.bitrate } : {}),
            user_limit: channelData.userLimit ? channelData.userLimit : undefined,
            rate_limit_per_user: channelData.rateLimitPerUser ? channelData.rateLimitPerUser : undefined,
            position: channelData.position,
            parent_id: parent ? parent.id : undefined,
            nsfw: channelData.nsfw ? channelData.nsfw : undefined,
            permission_overwrites: permissions.map((permission) => {
                if (!backupRoles.find((r) => r.roleId === permission.roleId)) {
                    return;
                }

                console.log(String(roles.data.find((r: any) => r.name === backupRoles.find((r) => r.roleId === permission.roleId)?.name)?.id) as string ?? "" as string)

                return {
                    id: String(roles.data.find((r: any) => r.name === backupRoles.find((r) => r.roleId === permission.roleId)?.name)?.id) as string ?? "" as string,
                    type: permission.type,
                    allow: String(permission.allow) as string,
                    deny: String(permission.deny) as string,
                };
            }),
        }, {
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

        channelPromises.push(resp.data);

        if (!resp.status.toString().startsWith("2")) { console.error(`[Restore] [Channels] [Create] ${resp.status} ${resp.statusText} ${JSON.stringify(resp.data)}`); }
        if (resp.data.retry_after) { await new Promise((resolve) => setTimeout(resolve, resp.data.retry_after)); }

        if (resp.data.id && channelData.type === 0 && messages) {
            await loadMessages(channelData, resp.data.id, bot, backup);
        }
    }
    // });


    return Promise.all(channelPromises);
};

/**
 * Restore server messages
 */
export const loadMessages = async(channel: channels, channelId: bigint, bot: customBots, backup: backups) => {

    const backupMessages = await prisma.messages.findMany({
        where: {
            backupId: backup.backupId,
            channelId: channel.channelId,
        },
    });

    const messages = backupMessages.sort((a, b) => new Date(a.messageDate).getTime() - new Date(b.messageDate).getTime());

    const webhook = await axios.post(`${DISCORD_API_BASE}/channels/${channelId}/webhooks`, {
        name: "rc",
    }, {
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

    console.log(webhook?.data?.id ?? webhook.data);

    const messagePromises: Promise<channels>[] = [];

    for (const messageData of messages) {
        await new Promise((resolve) => setTimeout(resolve, 150));

        if (messageData?.content && messageData?.content.length > 2000) messageData.content = messageData?.content.slice(0, 2000);

        const payload = {
            content: messageData.content ?? "",
            username: messageData.username ?? "Deleted User",
            avatar_url: messageData.avatar,
        };

        // const formData = new FormData()

        // if (messageData.files !== null) {
        //     formData.append("payload_json", JSON.stringify(payload));

        //     // split all files with "," then send a request to the file (link) and get the buffer
        //     const files = messageData.files.split(",");
        //     for (const file of files) {
        //         const fileData = await axios.get(file, { headers: { "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)" }, responseType: "arraybuffer", proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`), validateStatus: () => true, });
        //         const blob = new Blob([fileData.data], { type: "image/png" });

        //         // add the file to the form data like so file[index], file, filename
        //         formData.append(`file[${files.indexOf(file)}]`, blob, file.split("?")[0].split("/").pop());
        //     }
        // }

        const resp = await axios.post(`${DISCORD_API_BASE}/webhooks/${webhook.data.id}/${webhook.data.token}`, payload, {
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

        if (!resp.status.toString().startsWith("2")) { 
            console.error(`[Restore] [Messages] ${resp.status} ${resp.statusText} ${JSON.stringify(resp.data)}`); 
            if (resp.status === 404) break;
        }
        if (resp.data.retry_after) { await new Promise((resolve) => setTimeout(resolve, resp.data.retry_after)); }
    }

    // once done delete webhook
    await axios.delete(`${DISCORD_API_BASE}/webhooks/${webhook.data.id}/${webhook.data.token}`, {
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

    return Promise.all(messagePromises);
};

/**
 * Restore member roles.
 */
// export const loadMemberRoles = async (
//     guild: Guild,
//     backupData: BackupData,
// ) => {
//     // add roles after 10 seconds to make sure they got restored.
//     setTimeout(async () => {
//         const loadMemberRolesPromises: Promise<void | unknown>[] = [];
//         const members = await guild.members.fetch();
//         await guild.roles.fetch(undefined, {
//             cache: true,
//         });
//         backupData.members?.forEach((member) => {
//             const valid = members.find((m) => m.id === member.id);
//             if (!valid) return;
//             else {
//                 const roles: Collection<Snowflake, Role> = new Collection<
//                     Snowflake,
//                     Role
//                 >();
//                 member.roles?.forEach((r) => {
//                     const role = guild.roles.cache.find(
//                         (v) => v.name === r.roleName,
//                     );
//                     if (role) {
//                         if (!roles.get(role.id)) {
//                             roles.set(role.id, role);
//                         }
//                     }
//                 });
//                 loadMemberRolesPromises.push(
//                     valid.roles
//                         .set(roles, "Member Role Restore")
//                         .catch(() => {}),
//                 );
//             }
//         });
//         return Promise.all(loadMemberRolesPromises);
//     }, 10000);
// };

/**
 * Restore the afk configuration
 */
// export const loadAFK = (
//     guild: Guild,
//     backupData: BackupData,
// ): Promise<Guild[]> => {
//     const afkPromises: Promise<Guild>[] = [];
//     if (backupData.afk) {
//         afkPromises.push(
//             guild.setAFKChannel(
//                 guild.channels.cache.find(
//                     (ch) =>
//                         // @ts-ignore
//                         ch.name === backupData.afk.name && ch.type === "GUILD_VOICE",
//                 ) as VoiceChannel,
//             ),
//         );
//         afkPromises.push(guild.setAFKTimeout(backupData.afk.timeout));
//     }
//     return Promise.all(afkPromises);
// };

/**
 * Restore guild emojis
 */
// export const loadEmojis = (
//     guild: Guild,
//     backupData: BackupData,
// ): Promise<Emoji[]> => {
//     const emojiPromises: Promise<Emoji>[] = [];
//     backupData.emojis.forEach((emoji) => {
//         if (emoji.url) {
//             // @ts-ignore
//             emojiPromises.push(guild.emojis.create(emoji.url, emoji.name));
//         } else if (emoji.base64) {
//             emojiPromises.push(
//                 guild.emojis.create(
//                     Buffer.from(emoji.base64, "base64"),
//                     // @ts-ignore
//                     emoji.name,
//                 ),
//             );
//         }
//     });
//     return Promise.all(emojiPromises);
// };

/**
 * Restore guild bans
 */
// export const loadBans = (
//     guild: Guild,
//     backupData: BackupData,
// ): Promise<string[]> => {
//     const banPromises: Promise<string>[] = [];
//     backupData.bans.forEach((ban) => {
//         banPromises.push(
//             guild.members.ban(ban.id, {
//                 reason: ban.reason ?? undefined,
//             }) as Promise<string>,
//         );
//     });
//     return Promise.all(banPromises);
// };

/**
 * Restore embedChannel configuration
 */
// export const loadEmbedChannel = (
//     guild: Guild,
//     backupData: BackupData,
// ): Promise<Guild[]> => {
//     const embedChannelPromises: Promise<Guild>[] = [];
//     if (backupData.widget.channel) {
//         embedChannelPromises.push(
//             guild.setWidgetSettings({
//                 // @ts-ignore
//                 enabled: backupData.widget.enabled,
//                 // @ts-ignore
//                 channel: guild.channels.cache.find(
//                     (ch) => ch.name === backupData.widget.channel,
//                 ),
//             }),
//         );
//     }
//     return Promise.all(embedChannelPromises);
// };
