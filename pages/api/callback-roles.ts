import { NextApiRequest, NextApiResponse } from "next";
import { exchange, resolveUser } from "../../src/Migrate";
import { prisma } from "../../src/db";
import { getIPAddress } from "../../src/getIPAddress";
import { verify } from "jsonwebtoken";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

function handler(req: NextApiRequest, res: NextApiResponse) {
    let code: any = null;
    let domain: any = null;
    let userId: any = null;
    let customBotInfo: any = null;
    let newMember: any = null;

    return new Promise(async (resolve, reject) => {
        try {
            switch (req.method) {
            case "GET":

                code = req.query.code;
                if (!code) throw new Error(10401 as any);
            
                const IPAddr: any = getIPAddress(req);

                customBotInfo = await prisma.customBots.findUnique({ where: { clientId: BigInt("904341059851661372") as bigint } });
                if (!customBotInfo) throw new Error(10002 as any);

                domain = customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host;

                exchange(code as string, `https://${domain}/api/callback-roles`, String(customBotInfo.clientId) as string, customBotInfo.botSecret, "identify+role_connections.write").then(async (respon) => {
                    if (respon.status !== 200) throw new Error(10001 as any);
                    if (!respon.data.access_token) throw new Error(990001 as any);

                    const account = await resolveUser(respon.data.access_token);
                    if (!account || account === null) throw new Error(10001 as any);

                    userId = BigInt(account.id as any);

                    await prisma.members.upsert({
                        where: {
                            userId_guildId: {
                                userId: userId,
                                guildId: 0,
                            },
                        },
                        update: {
                            accessToken: respon.data.access_token,
                            refreshToken: respon.data.refresh_token,
                            ip: IPAddr ?? "127.0.0.1",
                            username: account.username + "#" + account.discriminator,
                            avatar: account.avatar ? account.avatar : ((account.discriminator as any) % 5).toString(),
                            createdAt: new Date(),
                        },
                        create: {
                            userId: userId,
                            guildId: 0,
                            // guild: {
                            //     connect: {
                            //         guildId: rGuildId,
                            //     },
                            // },
                            accessToken: respon.data.access_token,
                            refreshToken: respon.data.refresh_token,
                            ip: IPAddr ?? "127.0.0.1",
                            username: account.username + "#" + account.discriminator,
                            avatar: account.avatar ? account.avatar : ((account.discriminator as any) % 5).toString(),
                        },
                    });

                    return res.redirect(`/dashboard/link?id=${newMember.id}&t=${newMember.accessToken}`);
                });
                break;
            case "POST":
                const token = req.headers.authorization;
                const { id, t } = req.body;
                
                if (!id || !t) throw new Error(10401 as any);
                if (!token || typeof token !== "string") throw new Error(50014 as any);

                let JWTInfo = verify(token, process.env.JWT_SECRET!) as { id: number; };
                if (!JWTInfo) throw new Error(50014 as any);
        
                const sessions = await prisma.sessions.findMany({ where: { accountId: JWTInfo.id, token: token } });
                if (sessions.length === 0) throw new Error(50014 as any);
        
                const user = await prisma.accounts.findFirst({ where: { id: JWTInfo.id } });
                if (!user) throw new Error(10001 as any);

                customBotInfo = await prisma.customBots.findUnique({ where: { clientId: BigInt("904341059851661372") as bigint } });
                if (!customBotInfo) throw new Error(10002 as any);

                let member = await prisma.members.findFirst({ where: {
                    AND: [
                        { id: Number(id) as number },
                        { accessToken: t },
                    ]
                }});
                if (!member) throw new Error(10001 as any);

                if (user.userId && user.userId !== null) { 
                    if (user.userId !== member.userId) {
                        return res.status(200).json({ error: true, message: "You already have a different account linked." });
                    }
                }

                await prisma.accounts.update({
                    where: { id: Number(user.id) as number, },
                    data: { userId: member.userId, }
                });

                const metadata = {
                    platform_name: "RestoreBot",
                    platform_username: String(user.id) as string,
                    metadata: {
                        plan: user.role === "free" ? 0 : (user.role === "premium" ? 1 : (user.role === "business" ? 2 : 3)),
                        created_at: String(user.createdAt.toISOString()) as string,
                    }
                };

                await axios.put(`https://discord.com/api/v10/users/@me/applications/${customBotInfo.clientId}/role-connection`, metadata, {
                    headers: {
                        "Authorization": `Bearer ${member.accessToken}`,
                    },
                    validateStatus: () => true,
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                }).catch((err) => { console.error(err); });

                return res.status(200).json({ error: false, message: "Successfully linked your account" });
            }

        } catch (err: any) {
            err.message = parseInt(err.message);
            switch (err.message) {
            case 10001: return res.status(400).json({ error: "Member not found, retry verification" });
            case 10401: return res.status(400).json({ error: "Invalid request" });
            case 50014: return res.status(401).json({ error: "Unauthorized" });

            default: console.error(err); return res.status(500).json({ error: "Internal server error" });
            }
        }
    }).catch((err) => {
        err.message = parseInt(err.message);
        switch (err.message) {
        case 10001: return res.status(400).json({ error: "Member not found, retry verification" });
        case 10401: return res.status(400).json({ error: "Invalid request" });
        case 50014: return res.status(401).json({ error: "Unauthorized" });
            
        default: console.error(err); return res.status(500).json({ error: "Internal server error" });
        }
    });
}

export default handler;