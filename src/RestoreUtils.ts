import { loadCategory, loadChannel } from "./BackupUtils";
import { backups, channels, customBots, roles, servers } from "@prisma/client";
import axios from "axios";
import { prisma } from "./db";
import { sleep } from "./Migrate";
import { HttpsProxyAgent } from "https-proxy-agent";

const DISCORD_API_BASE = "https://discord.com/api/v10";


export const loadConfig = async(server: servers, bot: customBots, backup: backups) => {
    // send a request to PATCH https://discord.com/api/v10/guilds/ and update name and icon

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
        }

        const everyoneRole = roles.data.find((r: any) => r.name === "@everyone");

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

        if (resp.data.retry_after) {
            await new Promise((resolve) => setTimeout(resolve, resp.data.retry_after));
        }

        await sleep(100);
    }

    return Promise.all(rolePromises);
};

/**
 * Restore the guild channels
 */
export const loadChannels = async(server: servers, bot: customBots, backup: backups) => {
    // for each backup.channels create a channel

    const backupChannels = await prisma.channels.findMany({
        where: {
            backupId: backup.backupId,
        },
    });

    const channelPromises: Promise<channels>[] = [];

    const categoriesPromise = new Promise((resolve, reject) => {
        backupChannels.filter((channel) => channel.type === 4).forEach(async (channelData) => {
            const permissions = await prisma.channelPermissions.findMany({ where: { channelId: channelData.channelId } });
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
                    return {
                        id: String(roles.data.find((r: any) => r.name === backupRoles.find((r) => r.roleId === permission.roleId)?.name)?.id) as string,
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

            if (resp.data.retry_after) {
                await new Promise((resolve) => setTimeout(resolve, resp.data.retry_after));
            }

            await new Promise((resolve) => setTimeout(resolve, 300));
        });
        // wait 1s for all categories to be created then resolve
        setTimeout(() => {
            resolve(true);
        }, 1000);
    }).then(async () => {

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

        backupChannels.filter((channel) => channel.type !== 4).forEach(async (channelData) => {
            const permissions = await prisma.channelPermissions.findMany({ where: { channelId: channelData.channelId } });
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
            const parent = channels.data.find((c: any) => c.name === parentOwner?.name && c.type === 4);

            const resp = await axios.post(`${DISCORD_API_BASE}/guilds/${server.guildId}/channels`, {
                name: channelData.name,
                type: channelData.type,
                topic: channelData.topic,
                bitrate: channelData.bitrate ? channelData.bitrate : undefined,
                user_limit: channelData.userLimit ? channelData.userLimit : undefined,
                rate_limit_per_user: channelData.rateLimitPerUser ? channelData.rateLimitPerUser : undefined,
                position: channelData.position,
                parent_id: parent ? parent.id : undefined,
                nsfw: channelData.nsfw ? channelData.nsfw : undefined,
                permission_overwrites: permissions.map((permission) => {
                    return {
                        id: String(roles.data.find((r: any) => r.name === backupRoles.find((r) => r.roleId === permission.roleId)?.name)?.id) as string,
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

            if (resp.data.retry_after) { await new Promise((resolve) => setTimeout(resolve, resp.data.retry_after)); }

            await new Promise((resolve) => setTimeout(resolve, 300));
        });
    });


    return Promise.all(channelPromises);
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
