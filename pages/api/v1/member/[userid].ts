import { NextApiRequest, NextApiResponse } from "next";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../src/db";
import rateLimit from "../../../../src/rate-limit";
import { addMember, addRole, refreshTokenAddDB } from "../../../../src/Migrate";
import { ProxyCheck } from "../../../../src/proxycheck";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const servers = await prisma.servers.findMany({
                    where: {
                        ownerId: valid.id,
                    },
                });

                const account = await prisma.accounts.findFirst({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const userId: any = req.query.userid as string;
                if (!userId) return res.status(400).json({ success: false, message: "No userid provided." });

                let guildIds: any = [];
                guildIds = servers.map((server: any) => server.guildId);

                const member = await prisma.members.findFirst({
                    where: {
                        userId: BigInt(userId),
                        guildId: {
                            in: guildIds,
                        }
                    },
                });

                if (!member) return res.status(400).json({ success: false, message: "No member found." });

                await fetch(`https://discord.com/api/users/@me`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${member.accessToken}`,
                    },
                }).then(async resp => {
                    const json = await resp.json();

                    let usrIP: string = (member.ip != null) ? ((member.ip == "::1" || member.ip == "127.0.0.1") ? "1.1.1.1" : member.ip) : "1.1.1.1";
                    const pCheck = await ProxyCheck.check(usrIP, { vpn: true, asn: true });

                    console.log(`${member.username} ${resp.status}`);

                    if (resp.status !== 200) {
                        return res.status(200).json({ success: true, member: {
                            id: String(member.userId),
                            username: member.username.split("#")[0],
                            discriminator: member.username.split("#")[1],
                            avatar: member.avatar,
                            ip: account.role !== "free" ? member.ip : null,
                            location: {
                                provider: account.role === "business" ? pCheck[usrIP].provider : null,
                                continent: account.role !== "free" ? pCheck[usrIP].continent : null,
                                isocode: account.role !== "free" ? pCheck[usrIP].isocode : null,
                                country: account.role !== "free" ? pCheck[usrIP].country : null,
                                region: account.role !== "free" ? pCheck[usrIP].region : null,
                                city: account.role === "business" ? pCheck[usrIP].city : null,
                                type: account.role !== "free" ? pCheck[usrIP].type : null,
                                vpn: account.role !== "free" ? pCheck[usrIP].vpn : null,
                            }
                        } });
                    }


                    if (resp.status === 200) {
                        return res.status(200).json({ success: true, member: {
                            id: json.id,
                            username: json.username,
                            discriminator: json.discriminator,
                            avatar: json.avatar ? json.avatar : String(json.discriminator % 5),
                            bot: json.bot,
                            system: json.system,
                            mfa_enabled: account.role === "business" ? json.mfa_enabled : null,
                            locale: account.role === "business" ? json.locale : null,
                            banner: json.banner,
                            flags: json.flags,
                            premium_type: json.premium_type,
                            public_flags: json.public_flags,
                            ip: account.role !== "free" ? member.ip : null,
                            location: {
                                provider: account.role === "business" ? pCheck[usrIP].provider : null,
                                continent: account.role !== "free" ? pCheck[usrIP].continent : null,
                                isocode: account.role !== "free" ? pCheck[usrIP].isocode : null,
                                country: account.role !== "free" ? pCheck[usrIP].country : null,
                                region: account.role !== "free" ? pCheck[usrIP].region : null,
                                city: account.role === "business" ? pCheck[usrIP].city : null,
                                type: account.role !== "free" ? pCheck[usrIP].type : null,
                                vpn: account.role !== "free" ? pCheck[usrIP].vpn : null,
                            }
                        } });
                    }

                }).catch(err => {
                    console.error(err);
                    return res.status(400).json({ success: false, message: "Couldn't get user information." });
                });
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "PUT":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const userId: any = req.query.userid as string;

                const member = await prisma.members.findFirst({
                    where: {
                        userId: BigInt(userId),
                    },
                });
                
                if (!member) return res.status(400).json({ success: false, message: "No member found." });

                const server = await prisma.servers.findFirst({
                    where: {
                        ownerId: valid.id,
                        guildId: member.guildId,
                    },
                });

                if (!server) return res.status(400).json({ success: false, message: "No server found." });

                const customBot = await prisma.customBots.findFirst({
                    where: {
                        id: server.customBotId,
                    },
                });

                if (!customBot) return res.status(400).json({ success: false, message: "No custom bot found." });

                await fetch(`https://discord.com/api/users/@me`, {
                    headers: {
                        Authorization: `Bot ${customBot.botToken}`,
                        "X-RateLimit-Precision": "millisecond",
                    },
                }).then(async (resp) => {
                    if (resp.status !== 200) return res.status(400).json({ success: false, message: "Invalid Bot Token." });
                }).catch(() => {
                    return res.status(400).json({ success: false, message: "Bot token is invalid." });
                });

                await fetch(`https://discord.com/api/guilds/${server.guildId}/members?limit=1000`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bot ${customBot.botToken}`,
                        "Content-Type": "application/json"
                    }
                }).then(async (resp) => {
                    if (resp.status === 200) {
                        const data = await resp.json();
                        for (const memberData of data) {
                            if (memberData.user.id == member.userId) {
                                return res.status(200).json({ success: true, message: "Member already in server." });
                            } else {
                                addMember(server.guildId.toString(), member.userId.toString(), customBot.botToken, member.accessToken, [BigInt(server.roleId).toString()]).then(async (resp: any) => {
                                    console.log(resp?.response?.status ?? "");
                                    console.log(resp?.status ?? "");
                            
                                    if (resp?.response?.status) {
                                        switch (resp.response.status) {
                                        case 429:   
                                            const retryAfter = resp.response.headers["retry-after"];
                                            console.log(`Rate limited: ${retryAfter}`);
                                            if (retryAfter) {
                                                const retry = parseInt(retryAfter);
                                                setTimeout(async () => {
                                                    await addMember(server.guildId.toString(), member.userId.toString(), customBot.botToken, member.accessToken, [BigInt(server.roleId).toString()])
                                                }, retry);
                                            }
                                            break;
                                        case 403:
                                            refreshTokenAddDB( 
                                                member.userId.toString(), member.id, member.guildId.toString(), 
                                                customBot?.botToken, server.roleId, member.refreshToken,
                                                customBot?.clientId.toString(), customBot.botSecret.toString(), prisma);
                                            break;
                                        }
                                    }
                                    switch (resp.status) {
                                    case 403:
                                        refreshTokenAddDB(member.userId.toString(), member.id, member.guildId.toString(), customBot.botToken, server.roleId, member.refreshToken, customBot.clientId.toString(), customBot.botSecret.toString(), prisma);
                                        break;
                                    case 407:
                                        console.log(`407 Exponential Membership Growth/Proxy Authentication Required`);
                                        break;
                                    case 204:
                                        await addRole(server.guildId.toString(), member.userId.toString(), customBot.botToken, BigInt(server.roleId).toString());
                                        break;
                                    case 201:
                                        break;
                                    default:
                                        console.log(`Unknown status code: ${resp.status}`);
                                        break;
                                    }
                                }).catch(async (err: Error) => {
                                    console.error(err);
                                    await prisma.servers.update({
                                        where: {
                                            id: server.id
                                        },
                                        data: {
                                            pulling: false
                                        }
                                    });
                
                                    return res.status(400).json({ success: false, message: err?.message ? err?.message : "Something went wrong" });
                                });

                                return res.status(200).json({ success: true, message: "Member added to server." });
                            }
                        }
                    }
                }).catch(err => {
                    console.error(err);
                });

                
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
        }
    });
}