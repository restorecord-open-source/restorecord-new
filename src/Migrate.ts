import { accounts } from "@prisma/client";
import { HttpsProxyAgent } from "https-proxy-agent";
import axios from "axios";
import { prisma } from "./db";

export async function sendWebhook(webhookUrl: string, content: string, username: string, avatarUrl: string) {
    return await axios.post(webhookUrl, {
        username: username,
        content: content,
        avatar_url: avatarUrl,
    }, {
        headers: {
            "Content-Type": "application/json",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    });
}

export async function addMember(guildId: string, userId: string, botToken: any, access_token: string, roles?: string[]) {
    const payload: Partial<{ access_token: string; roles?: string[] }> = { access_token, };
    if (roles && roles.length > 0) {
        payload.roles = roles;
    }

    return await axios.put(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, payload, {
        headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    })
        .then(async (res: any) => {  return res; })
        .catch(async (err: any) => { return err; });
}
  

export async function addRole(guildId: string, userId: string, botToken: any, roleId: string) {
    return await axios.put(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`, {}, {
        headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        validateStatus: () => true,
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function refreshToken(refreshToken: string, clientId: string, clientSecret: string) {
    return await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        client_id: String(clientId) as string,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function refreshTokenAddDB(userId: any, memberId: any, guildId: any, botToken: any, roleId: any, refreshToken: any, clientId: any, clientSecret: any, prisma: any) {
    return await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        client_id: String(clientId) as string,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
        validateStatus: () => true
    }).then(async (resp) => {
        if (resp?.data?.access_token && resp?.data?.refresh_token) {
            await prisma.members.update({
                where: {
                    id: Number(memberId as number),
                },
                data: {
                    accessToken: resp.data.access_token,
                    refreshToken: resp.data.refresh_token
                }
            }).then(async() => {
                console.log(`[INFO] Refreshed ${userId} in ${guildId} (access_token: ${resp?.data?.access_token}, refresh_token: ${resp?.data?.refresh_token})`);
                if (resp.status === 200) {
                    console.log(`[INFO] Updated ${userId} in ${guildId}`);
                    await addMember(guildId, userId, botToken, resp.data.access_token, roleId ? [BigInt(roleId).toString()] : undefined).then(async (res: any) => {
                        if ((res?.status === 204 || res?.status === 201) || (res?.response?.status === 204 || res?.response?.status === 201)) {
                            console.log(`[INFO] Added ${userId} to ${guildId}`);
                            return true;
                        } else {
                            console.error(`[ERROR] 2 Failed to add ${userId} to ${guildId} (status: ${res?.status || res?.response?.status}) ${JSON.stringify(res?.data || res?.response?.data)}}`);
                            await prisma.members.update({
                                where: {
                                    id: Number(memberId as number),
                                },
                                data: {
                                    accessToken: "unauthorized",
                                }
                            }).then(async () => {
                                console.log(`[INFO] 1 Updated ${userId} in ${guildId} (access_token: unauthorized)`);
                                return false;
                            }).catch(async (err: any) => {
                                console.error(`[refreshTokenAddDB] 3 unauth ${err}: (memid: ${memberId})`);
                                return false;
                            });
                            return false;
                        }
                    }).catch(async (err: any) => {
                        console.error(`[ERROR] 4 Failed to add ${userId} to ${guildId} (error: ${err})`);
                        return false;
                    });
                    return true;
                } else {
                    console.error(`[ERROR] 5 Failed to Add ${userId} to ${guildId} ${resp?.status} ${JSON.stringify(resp?.data)}: (memid: ${memberId})`);
                    await prisma.members.update({
                        where: {
                            id: Number(memberId as number),
                        },
                        data: {
                            accessToken: "unauthorized",
                        }
                    }).catch(async (err: any) => {
                        console.error(`[refreshTokenAddDB] 6 unauth ${err}: (memid: ${memberId})`);
                        return false;
                    });
                    return false;
                }
            }).catch(async (err: any) => {
                console.error(`[ERROR] 1 Failed to update ${userId} in ${guildId} (error: ${err})`);
                return false;
            });
            return true;
        } else {
            console.error(`[ERROR] 6 Failed to refresh ${userId} in ${guildId} ${resp?.status} ${JSON.stringify(resp?.data)}: (memid: ${memberId})`);
            await prisma.members.update({
                where: {
                    id: Number(memberId as number),
                },
                data: {
                    accessToken: "unauthorized",
                }
            }).catch(async (err: any) => {
                console.error(`[refreshTokenAddDB] 6 unauth ${err}: (memid: ${memberId})`);
                return false;
            });
            return false;
        }
    }).catch(async (err) => {
        console.error(`[refreshTokenAddDB] 7 unauth ${err}: (memid: ${memberId})`);
        await prisma.members.update({
            where: {
                id: Number(memberId as number),
            },
            data: {
                accessToken: "unauthorized",
            }
        }).catch(async (err: any) => {
            console.error(`[refreshTokenAddDB] 8 unauth ${err}: (memid: ${memberId})`);
            return false;
        });
        return false;
    });
}

export async function exchange(code: string, redirectUri: string, clientId: any, clientSecret: any, scope = "identify+guilds.join") {
    return await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        scope: scope,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function resolveUser(token: string) {
    // const request = await fetch("https://discord.com/api/users/@me", {
    //     headers: {
    //         Authorization: `Bearer ${token}`,
    //         "X-RateLimit-Precision": "millisecond",
    //         "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
    //     },
    // });

    // const response: User = await request.json();

    // if (!response.id) {
    //     return null as any;
    // }

    // return response;

    return await axios.get("https://discord.com/api/v10/users/@me", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    }).then(async (res: any) => { return res.data; } );
}

export async function snowflakeToDate(snowflake: string) {
    return new Date(parseInt(snowflake) / 4194304 + 1420070400000);
}

export async function resolveOAuth2User(token: string) {
    return await axios.get("https://discord.com/api/oauth2/@me", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}


export async function sendWebhookMessage(webhookUrl: string, title: string = "Successfully Verified", description: string | null | undefined = undefined, serverOwner: accounts, pCheck: any, IPAddr: string | null, account: User, type: number = 1) {
    if (!webhookUrl) return;
   
    const createdAt: number = account.id / 4194304 + 1420070400000;
    let operator = "Unknown";
    if (IPAddr !== null && pCheck[IPAddr].proxy === "yes")
        operator = pCheck[IPAddr].operator ? `[\`${pCheck[IPAddr].operator.name}\`](${pCheck[IPAddr].operator.url})` : "Unknown";

    const username = account.discriminator === "0" ? `@${account.username}` : `${account.username}#${account.discriminator}`;

    await axios.post(webhookUrl, {
        content: `<@${account.id}> (${username})`,
        embeds: [
            {
                title: title,
                ...(description ? { description: description } : {}),
                timestamp: new Date().toISOString(),
                color: type === 0 ? 0xff0000 : type === 1 ? 0x00ff00 : type === 2 ? 0xffff00 : 0x000000,
                author: {
                    name: `${username}`,
                    url: `https://discord.id/?prefill=${account.id}`,
                    icon_url: account.avatar ? `https://cdn.discordapp.com/avatars/${account.id}/${account.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${account.discriminator % 5}.png`,
                },
                fields: [
                    {
                        name: ":bust_in_silhouette: User:",
                        value: `${account.id}`,
                        inline: true,
                    },
                    {
                        name: ":earth_americas: Client IP:",
                        value: `${IPAddr ? `||${IPAddr}||` : "Unavailable"}`,
                        inline: true,
                    },
                    {
                        name: ":clock1: Account Age:",
                        value: `<t:${Math.floor(createdAt / 1000)}:R>`,
                        inline: true,
                    },
                    ...(IPAddr ? [
                        {
                            name: `:flag_${pCheck[IPAddr].isocode ? pCheck[IPAddr].isocode.toLowerCase() : "us"}: IP Info:`,
                            value: `**Country:** \`${pCheck[IPAddr].country}\`\n**Provider:** \`${pCheck[IPAddr].provider}\``,
                            inline: true,
                        },
                        {
                            name: ":globe_with_meridians: Connection Info:",
                            value: serverOwner.role === "business" ? `**Type**: \`${pCheck[IPAddr].type}\`\n**VPN**: \`${pCheck[IPAddr].proxy}\`${pCheck[IPAddr].proxy === "yes" ? `\n**Operator**: ${operator}` : ""}` : "Upgrade to Business plan to view",
                            inline: true,
                        }
                    ] : []),
                ],
            },
        ],
    },
    {
        proxy: false, 
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    }).catch(async (err) => {
        if (err?.response?.status === 404 && webhookUrl !== null) {
            console.error(`${webhookUrl.split("/")[5]} Webhook not found (webhook removed from config)`);
            const servers = await prisma.servers.findMany({
                where: {
                    webhook: webhookUrl,
                }
            });

            for (const server of servers) {
                await prisma.servers.update({
                    where: {
                        id: server.id,
                    },
                    data: {
                        webhook: null,
                    },
                });
            }
        } else if (err?.response?.status === 429) {
            console.error(`${webhookUrl.split("/")[5]} Webhook ratelimited`);
        } else {
            console.error(err);
        }
    });
}

export interface User {
	id: number;
	username: string;
	discriminator: any;
	avatar: string;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	banner?: string;
	accent_color?: number;
	locale?: string;
	verified?: boolean;
	flags?: string;
}


export async function shuffle(array: any) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}


export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
