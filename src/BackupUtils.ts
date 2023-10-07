import { customBots, servers } from "@prisma/client";
import axios from "axios";
import { randomBytes } from "crypto";
import { CategoryChannel, Guild, OverwriteData, GuildChannelCreateOptions, PremiumTier, } from "discord.js";
import { HttpsProxyAgent } from "https-proxy-agent";
import { sleep } from "./Migrate";
import { ChannelPermissionsData, MessageData, VoiceChannelData, roleData, channelData, MemberData, BaseChannelData, } from "./types";

const DISCORD_API_BASE = "https://discord.com/api/v10";

const MaxBitratePerTier: Record<PremiumTier, number> = {
    NONE: 64000,
    TIER_1: 128000,
    TIER_2: 256000,
    TIER_3: 384000,
};

export function generateKey(size = 32) {
    return randomBytes(size).toString("hex").slice(0, size);
}

export async function getMembers(guild: servers, bot: customBots) {
    try {
        const memberRoles: MemberData[] = [];
        let done;

        const members = await axios.get(`${DISCORD_API_BASE}/guilds/${guild.guildId}/members?limit=1000`, {
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

        if (members.status !== 200) return [];
        if (members.data.length === 0 || !members.data) return [];

        while (!done) {
            const lastMember = members.data[members.data.length - 1];
            const moreMembers = await axios.get(`${DISCORD_API_BASE}/guilds/${guild.guildId}/members?limit=1000&after=${lastMember.user.id}`, {
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
            members.data.push(...moreMembers.data);

            if (moreMembers.data.length < 1000) done = true;
        }

        for (const member of members.data) {
            memberRoles.push({
                guildId: BigInt(guild.guildId) as bigint,
                userId: BigInt(member.user.id) as bigint,
                roles: member.roles.join(","),
                nickname: member.nick,
            });
        }

        return memberRoles;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getChannels(guild: servers, bot: customBots) {
    const channels: channelData[] = [];

    const channelsData = await axios.get(`${DISCORD_API_BASE}/guilds/${guild.guildId}/channels`, {
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

    if (channelsData.status !== 200) return [];
    if (channelsData.data.length === 0 || !channelsData.data) return [];

    const others = channelsData.data.filter((ch: any) => {
        return (ch.type !== 6 && ch.type !== 10 && ch.type !== 11 && ch.type !== 12);
    });

    for (const channel of others) {
        const permissions: ChannelPermissionsData[] = [];

        for (const permission of channel.permission_overwrites) {
            permissions.push({
                channelId: BigInt(channel.id) as bigint,
                roleId: BigInt(permission.id) as bigint,
                type: String(permission.type) as string,
                allow: BigInt(permission.allow) as bigint,
                deny: BigInt(permission.deny) as bigint,
            });
        }


        channels.push({
            name: channel.name,
            type: Number(channel.type) as number,
            channelId: BigInt(channel.id) as bigint,
            nsfw: channel.nsfw ? channel.nsfw : false,
            parentId: channel.parent_id ? BigInt(channel.parent_id) as bigint : null,
            position: channel.position,
            topic: channel.topic ? channel.topic : null,
            bitrate: channel.bitrate ? channel.bitrate : null,
            userLimit: channel.user_limit ? channel.user_limit : null,
            rateLimitPerUser: channel.rate_limit_per_user ? channel.rate_limit_per_user : null,
            // channelPermissions: {
            //     upsert: { 
            //         where: { channelId: BigInt(channel.id) as bigint },
            //         create: permissions,
            //         update: permissions,
            //     }
            // }
            channelPermissions: permissions
        });
    }

    return channels;
}

export async function getRoles(guild: servers, bot: customBots) {
    const roles: roleData[] = [];

    const rolesData = await axios.get(`${DISCORD_API_BASE}/guilds/${guild.guildId}/roles`, {
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

    if (rolesData.status !== 200) return [];
    if (!rolesData.data || rolesData.data.length === 0) return [];

    for (const role of rolesData.data) {
        // if (!role.tags) {
        const roleData = {
            name: role.name,
            roleId: BigInt(role.id) as bigint,
            color: String(role.color) as string,
            hoist: role.hoist,
            permissions: role.permissions ? BigInt(role.permissions) as bigint : BigInt(0) as bigint,
            mentionable: role.mentionable,
            position: role.position,
            isEveryone: (role.name === "@everyone" && role.position === 0) ? true : false,
            botId: role.tags ? (role.tags.bot_id ? BigInt(role.tags.bot_id) as bigint : null) : null,
        };
        roles.push(roleData);
        // }
    }

    return roles;
}

export async function getMessages(channelId: bigint, bot: customBots) {
    const messages: MessageData[] = [];
    let done;

    const messagesData = await axios.get(`${DISCORD_API_BASE}/channels/${channelId}/messages?limit=50`, {
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

    if (messagesData.status !== 200) return [];
    if (!messagesData.data || messagesData.data.length === 0) return [];

    // while (!done) {
    //     const lastMessage = messagesData.data[messagesData.data.length - 1];
    //     const moreMessages = await axios.get(`${DISCORD_API_BASE}/channels/${channelId}/messages?limit=50&before=${lastMessage.id}`, {
    //         headers: {
    //             "Authorization": `Bot ${bot.botToken}`,
    //             "Content-Type": "application/json",
    //             "X-RateLimit-Precision": "millisecond",
    //             "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
    //         },
    //         proxy: false,
    //         httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
    //         validateStatus: () => true,
    //     });

    //     messagesData.data.push(...moreMessages.data);

    //     if (moreMessages.data.length < 50) done = true;
    // }

    for (const message of messagesData.data) {
        if (!message.author) continue;
        if (message.type !== 0 && message.type !== 19) continue;

        const messageData: MessageData = {
            channelId: BigInt(channelId) as bigint,
            username: message.author.username ? message.author.username : "Unknown",
            avatar: message.author.avatar ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}` : `https://cdn.discordapp.com/embed/avatars/${Number(message.author.discriminator) % 5}.png`,
            content: message.content ? message.content : null,
            // embeds: message.embeds ? message.embeds : null,
            files: message.attachments.length >= 1 ? (message.attachments.map((a: any) => a.url).join(",")) : null,
            createdAt: new Date(message.timestamp),
        };

        if (!messageData.content && !messageData.files) continue;

        messages.push(messageData);
    }

    return messages;
}

// export async function fetchChannelsMessages(channel: TextChannel | NewsChannel) {
//     let messages: MessageData[] = [];
//     const messageCount: number = isNaN(options.maxMessagesPerChannel) ? 10 : options.maxMessagesPerChannel;
//     const fetchOptions: ChannelLogsQueryOptions = { limit: 100 };
//     let lastMessageId: Snowflake;
//     let fetchComplete: boolean = false;
//     while (!fetchComplete) {
//         // @ts-ignore
//         if (lastMessageId) {
//             fetchOptions.before = lastMessageId;
//         }
//         const fetched: Collection<Snowflake, Message> =
// 			await channel.messages.fetch(fetchOptions);
//         if (fetched.size === 0) {
//             break;
//         }
//         // @ts-ignore
//         lastMessageId = fetched.last().id;
//         await Promise.all(
//             fetched.map(async (msg) => {
//                 if (!msg.author || messages.length >= messageCount) {
//                     fetchComplete = true;
//                     return;
//                 }
//                 const files = await Promise.all(
//                     msg.attachments.map(async (a) => {
//                         let attach = a.url;
//                         return {
//                             name: a.name,
//                             attachment: attach,
//                         };
//                     })
//                 );
//                 messages.push({
//                     username: msg.author.username,
//                     avatar: msg.author.displayAvatarURL(),
//                     content: msg.cleanContent,
//                     embeds: msg.embeds,
//                     // @ts-ignore
//                     files,
//                     pinned: msg.pinned,
//                 });
//             })
//         );
//     }
//     return messages;
// }


export async function loadCategory(categoryData: { name: string; permissions: { roleName: string; allow: string; deny: string; }[]; children: Array<TextChannelData | VoiceChannelData>; }, guild: Guild) {
    return new Promise<CategoryChannel>((resolve) => {
        guild.channels.create(categoryData.name, {
            type: "GUILD_CATEGORY",
        }).then(async (category) => {
            const finalPermissions: OverwriteData[] = [];
            categoryData.permissions.forEach((perm) => {
                const role = guild.roles.cache.find((r) => r.name === perm.roleName);
                if (role) {
                    finalPermissions.push({
                        id: role.id,
                        allow: BigInt(perm.allow),
                        deny: BigInt(perm.deny),
                    });
                }
            });
            await category.permissionOverwrites.set(finalPermissions);
            resolve(category);
        });
    });
}

export interface TextChannelData extends BaseChannelData {
    nsfw: boolean;
    parent?: string | undefined | null;
    topic?: string | undefined | null;
    rateLimitPerUser?: number;
    isNews: boolean;
    messages: MessageData[];
}

// export async function loadChannel(channelData: TextChannelData | VoiceChannelData, guild: Guild,category?: CategoryChannel | null) {
//     return new Promise(async (resolve) => {
//         const createOptions: GuildChannelCreateOptions = {
//             type: undefined,
//             parent: category ? category : undefined,
//         };

//         if (channelData.type === "GUILD_TEXT" || channelData.type === "GUILD_NEWS" || channelData.type === "text") {
//             createOptions.topic = (channelData as TextChannelData).topic ?? undefined;
//             createOptions.nsfw = (channelData as TextChannelData).nsfw;
//             createOptions.rateLimitPerUser = (channelData as TextChannelData).rateLimitPerUser;
//             createOptions.type = (channelData as TextChannelData).isNews && guild.features.includes("NEWS") ? "GUILD_NEWS" : "GUILD_TEXT";
//         } else if (channelData.type === "GUILD_VOICE" || channelData.type === "voice" ) {
//             let bitrate = (channelData as VoiceChannelData).bitrate;
//             const bitrates = Object.values(MaxBitratePerTier);
//             while (bitrate > MaxBitratePerTier[guild.premiumTier]) {
//                 bitrate = bitrates[Object.keys(MaxBitratePerTier).indexOf(guild.premiumTier) - 1];
//             }
//             createOptions.bitrate = bitrate;
//             createOptions.userLimit = (channelData as VoiceChannelData).userLimit;
//             createOptions.type = "GUILD_VOICE";
//         }
//         guild.channels.create(channelData.name, createOptions).then(async (channel) => {
//             const finalPermissions: OverwriteData[] = [];
//             channelData.permissions.forEach((perm: any) => {
//                 const role = guild.roles.cache.find((r) => r.name === perm.roleName);
//                 if (role) {
//                     finalPermissions.push({
//                         id: role.id,
//                         allow: BigInt(perm.allow),
//                         deny: BigInt(perm.deny),
//                     });
//                 }
//             });
//             await channel.permissionOverwrites.set(finalPermissions);

//             if (channelData.type === "GUILD_TEXT" || channelData.type === "text") {
//                 // let webhook: Webhook | void;
//                 // if ((channelData as TextChannelData).messages.length > 0) {
//                 //     webhook = await loadMessages(channel as TextChannel, (channelData as TextChannelData).messages).catch(() => {});
//                 // }
//                 return channel;
//             } else {
//                 resolve(channel);
//             }
//         });
//     });
// }

/**
 * Delete all roles, all channels, all emojis, etc... of a guild
 */
export const clearGuild = async(server: servers, bot: customBots, channels: boolean = true, roles: boolean = true) => {
    if (channels) {
        const channels = await getChannels(server, bot);

        for (const channel of channels) {
            await new Promise((resolve) => setTimeout(resolve, 500));

            const resp = await axios.delete(`${DISCORD_API_BASE}/channels/${channel.channelId}`, {
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

            if (!resp.status.toString().startsWith("2")) { console.error(`[Restore] [Clear] [Channels] ${resp.status} ${resp.statusText} ${JSON.stringify(resp.data)}`); }

            if (resp.data.retry_after) {
                await new Promise((resolve) => setTimeout(resolve, ((resp.data.retry_after * 3) ?? 1000)));
                await axios.delete(`${DISCORD_API_BASE}/channels/${channel.channelId}`, {
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
            }
        }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (roles) {
        const roles = await getRoles(server, bot);

        for (const role of roles) {
            if (role.isEveryone) continue;
            await new Promise((resolve) => setTimeout(resolve, 750));

            const resp = await axios.delete(`${DISCORD_API_BASE}/guilds/${server.guildId}/roles/${role.roleId}`, {
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

            if (!resp.status.toString().startsWith("2")) { console.error(`[Restore] [Clear] [Roles] ${resp.status} ${resp.statusText} ${JSON.stringify(resp.data)}`); }

            if (resp.data.retry_after) {
                await new Promise((resolve) => setTimeout(resolve, ((resp.data.retry_after * 3) ?? 1000)));
                await axios.delete(`${DISCORD_API_BASE}/guilds/${server.guildId}/roles/${role.roleId}`, {
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
            }
        }
    }

    await new Promise((resolve) => setTimeout(resolve, 10000));
}