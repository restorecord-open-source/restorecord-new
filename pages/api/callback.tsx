import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";
import getIPAddress from "../../src/getIPAddress";
import { addMember, addRole, exchange, resolveUser } from "../../src/Migrate";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        const { code, state } = req.query;
        const IPAddr: any = getIPAddress(req);

        if (!code || !state) {
            const missing = [];
            if (!code) missing.push("Discord OAuth2 Code");
            if (!state) missing.push("Guild Id");
            return res.status(400).json({ success: false, message: `Missing ${missing.join(", ")}`, });
        }

        if (!Number.isInteger(Number(state))) {
            return res.status(400).json({ success: false, message: "Invalid Guild Id", });
        }

        const rGuildId: any = BigInt(req.query.state as any);


        const serverInfo = await prisma.servers.findUnique({
            where: {
                guildId: rGuildId,
            },
        });

        if (!serverInfo) {
            return res.status(400).json({ success: false, message: "No server info" });
        }

        const customBotInfo = await prisma.customBots.findUnique({
            where: {
                id: serverInfo?.customBotId,
            },
        });

        exchange(code as string, "https://restorecord.com/api/callback", customBotInfo?.clientId, customBotInfo?.botSecret).then(async (data) => {
           
            if (!data.error) {
                let account = data.access_token ? await resolveUser(data.access_token) : null;

                const userId: any = BigInt(account?.id as any);

                if (account) {
                    addMember(rGuildId.toString(), userId.toString(), customBotInfo?.botToken, data.access_token, [BigInt(serverInfo?.roleId).toString()])
                        .then(async (resp) => {
                            if (resp?.response?.status === 403) {
                                res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=30;`);
                                return res.redirect(`/verify/${state}`);
                            }
                            if (resp.status === 204) {
                                await addRole(rGuildId.toString(), userId, customBotInfo?.botToken, serverInfo?.roleId.toString())
                                    .then(async (resp) => {
                                        // console.log(resp);
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                    })
                            }
                        }).catch((err) => {
                            console.log(err);
                        });

                    const user = await prisma.members.findFirst({
                        where: {
                            AND: [
                                { guildId: rGuildId },
                                { userId: userId },
                            ]
                        },
                    });

                    if (!user) {
                        await prisma.members.create({
                            data: {
                                userId: userId,
                                guild: {
                                    connect: {
                                        guildId: serverInfo?.guildId,
                                    },
                                },
                                // guildId: serverInfo[0].id,
                                accessToken: data.access_token,
                                refreshToken: data.refresh_token,
                                ip: IPAddr,
                                username: account.username + "#" + account.discriminator,
                                avatar: account.avatar ? account.avatar : (account.discriminator as any % 5).toString(),
                            },
                        });
                    } else {
                        await prisma.members.update({
                            where: {
                                id: user.id
                            },
                            data: {
                                accessToken: data.access_token,
                                refreshToken: data.refresh_token,
                                ip: IPAddr,
                                username: account.username + "#" + account.discriminator,
                                avatar: account.avatar ? account.avatar : (account.discriminator as any % 5).toString(),
                                createdAt: new Date(),
                            },
                        });
                    }
                }

                res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=5;`);
                return res.redirect(`/verify/${state}`);
            } else {
                return res.status(400).json({
                    status: "error",
                    message: data,
                });
            }
        });
    });
}
