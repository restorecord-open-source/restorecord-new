import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

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

export async function addMember(guildId: string, userId: string, botToken: any, access_token: string, roles: string[]) {
    return await axios.put(`https://discordapp.com/api/guilds/${guildId}/members/${userId}`, {
        access_token: access_token,
        roles: roles,
        ValidateStatus: () => true
    }, {
        headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function addRole(guildId: string, userId: string, botToken: any, roleId: string) {
    return await axios.put(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
        ValidateStatus: () => true
    }, {
        headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function refreshToken(refreshToken: string, clientId: string, clientSecret: string) {
    return await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        client_id: clientId,
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
        client_id: clientId,
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
    }).then(async (resp) => {
        if (resp.data.access_token && resp.data.refresh_token) {
            await prisma.members.update({
                where: {
                    id: memberId,
                },
                data: {
                    accessToken: resp.data.access_token,
                    refreshToken: resp.data.refresh_token
                }
            }).catch(async (err: any) => {
                console.log(`${err}`);
            });
            await addMember(guildId, userId, botToken, resp.data.access_token, [BigInt(roleId).toString()])
        }
    }).catch(async (err) => { 
        await prisma.members.update({
            where: {
                id: memberId,
            },
            data: {
                accessToken: "unauthorized",
            }
        }).catch(async (err: any) => {
            console.log(`${err}`);
        });
        console.log(`[refreshTokenAddDB] unauth ${err}: (memid: ${memberId})`);
    });
}

export async function exchange(excode: string, redirectUri: string, clientId: any, clientSecret: any) {
    return await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: excode,
        redirect_uri: redirectUri,
        scope: "identify+guilds.join",
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

export async function resolveUser(token: string): Promise<User> {
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

    return await axios.get("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
        proxy: false,
        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
    }).then(async (res: any) => { return res.data; } );
}


interface User {
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


export async function  shuffle(array: any) {
    let currentIndex = array.length,  randomIndex;

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
