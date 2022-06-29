import { customBots, Prisma, PrismaPromise, servers } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma }  from "../../src/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {

        const { code, access_token, state } = req.query;

        const rGuildId: number = parseInt(req.query.state as any);

        if (access_token) {
            let account = access_token ? await resolveUser(access_token as string) : null;


            res.status(200).json({
                status: "success",
                user: account
            });
            return;
        }

        if (!code && !state) {
            return res.status(400).json({
                status: "error",
                message: "No code or state"
            });
        }

        const serverInfo = await prisma.servers.findUnique({
            where: {
                guildId: 909132204293107783n
            }
        });

        if (!serverInfo) {
            return res.status(400).json({
                status: "error",
                message: "No server info"
            });
        }


        const customBotInfo = await prisma.customBots.findUnique({
            where: {
                id: serverInfo?.customBotId
            }
        });

        exchange(code as string, "https://ce7e-88-64-212-31.ngrok.io/api/callback", customBotInfo?.clientId, customBotInfo?.botSecret)
            .then(async data => {
                if (!data.error) {
                    // res.setHeader("Set-Cookie", [
                    //     `access_token=${data.access_token}, Path=/, Expires=${new Date(Date.now() + Number(data.expires_in) * 1000)}`,
                    //     `refresh_token=${data.refresh_token}, Path=/, Expires=${new Date(Date.now() + 31556952000)}`
                    // ]);

                    let account = data.access_token ? await resolveUser(data.access_token) : null;

                    const userId: number = parseInt(account?.id as any);

                    if (account) {
                        await prisma.members.create({
                            data: {
                                userId: userId,
                                guild: {
                                    connect: {
                                        guildId: serverInfo?.guildId
                                    }
                                },
                                // guildId: serverInfo[0].id,
                                accessToken: data.access_token,
                                refreshToken: data.refresh_token,
                                ip: "aaaaaaaa",
                                username: account.username + "#" + account.discriminator,
                                avatar: account.avatar,
                            }
                        });
                    }

                    return res.status(200).json({
                        status: "success",
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        scope: data.scope,
                        user: account
                    });
                }
                else {
                    return res.status(400).json({
                        status: "error",
                        message: data
                    });
                }
            })
    });

}


interface User {
    id: number;
    username: string;
    discriminator: string;
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

async function exchange(code: string, redirect_uri: string, client_id: any, client_secret: any) {
    const request = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams({
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "scope": "identify+guilds.join"
        })
    });

    return await request.json();
}

async function resolveUser(token: string): Promise<User> {
    const request = await fetch("https://discord.com/api/users/@me", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const response: User = await request.json();

    if (!response.id) {
        return null as any;
    }

    return response;
}