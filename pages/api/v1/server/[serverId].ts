import { NextApiRequest, NextApiResponse } from "next";
import { verify } from "jsonwebtoken";
import { prisma } from "../../../../src/db";
import { getBrowser, getIPAddress, getPlatform } from "../../../../src/getIPAddress";
import { addMember, addRole, refreshTokenAddDB, shuffle, sleep } from "../../../../src/Migrate";
import rateLimit from "../../../../src/rate-limit";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 60, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const server = await prisma.servers.findFirst({
                    where: {
                        guildId: BigInt(`${req.query.serverId}`),
                    }
                });

                if (!server) return res.status(400).json({ success: false, message: "Server not found." });

                const members = await prisma.members.findMany({
                    where: {
                        guildId: BigInt(`${req.query.serverId}`),
                    }
                });

                res.status(200).json({ 
                    success: true,
                    server: {
                        name: server.name,
                        id: server.guildId,
                        owner: server.ownerId,
                        memberCount: members.length,
                    }
                });
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "DELETE":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });

                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findFirst({
                    where: {
                        id: valid.id
                    }
                });

                if (!account) return res.status(400).json({ success: false, message: "Account not found" });

                const server = await prisma.servers.findFirst({
                    where: {
                        AND: [
                            { ownerId: account.id },
                            { guildId: BigInt(`${req.query.serverId}`) }
                        ]
                    }
                });

                if (!server) return res.status(400).json({ success: false, message: "Server not found" });

                await prisma.members.deleteMany({
                    where: {
                        AND: [
                            { guildId: BigInt(`${req.query.serverId}`) },
                        ]
                    }
                });

                await prisma.servers.delete({
                    where: {
                        guildId: BigInt(`${req.query.serverId}`),
                    }
                });

                res.status(200).json({ success: true, message: "Server has been successfully deleted" });
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

                const guildId: any = req.query.serverId;
                
                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });
                
                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findFirst({
                    where: {
                        id: valid.id
                    }
                });

                if (!account) return res.status(400).json({ success: false, message: "Account not found" });

                const server = await prisma.servers.findFirst({
                    where: {
                        AND: [
                            { ownerId: account.id },
                            { guildId: BigInt(guildId) }
                        ]
                    }
                });

                if (!server) return res.status(400).json({ success: false, message: "Server not found" });

                const bot = await prisma.customBots.findFirst({
                    where: {
                        AND: [
                            { ownerId: account.id },
                            { id: server.customBotId }
                        ]
                    }
                });

                if (!bot) return res.status(400).json({ success: false, message: "Bot not found" });

                const members = await prisma.members.findMany({
                    where: {
                        guildId: BigInt(guildId)
                    }
                });

                if (members.length === 0) return res.status(400).json({ success: false, message: "No members found" });

                if (server.pulling === true) return res.status(400).json({ success: false, message: "You are already pulling" });

                if (server.pullTimeout !== null) if (server.pullTimeout > new Date()) return res.status(400).json({ success: false, message: "You're on cooldown, you can pull again on the " + server.pullTimeout.toLocaleString() });

                if (account.role !== "free") {
                    await prisma.servers.update({
                        where: {
                            id: server.id 
                        },
                        data: {
                            pulling: true,
                            pullTimeout: new Date(Date.now() + 1000 * 60 * 60)
                        }
                    });
                } else {
                    await prisma.servers.update({
                        where: {
                            id: server.id 
                        },
                        data: {
                            pulling: true,
                            pullTimeout: new Date(Date.now() + 1000 * 60 * 60 * 12)
                        }
                    });
                }

                fetch(`https://discord.com/api/v9/users/@me`, {
                    headers: {
                        Authorization: `Bot ${bot.botToken}`,
                        "X-RateLimit-Precision": "millisecond",
                    },
                }).then(async (resp) => {
                    if (resp.status !== 200) return res.status(400).json({ success: false, message: "Invalid Bot Token." });
                }).catch(() => {
                    return res.status(400).json({ success: false, message: "Bot token is invalid." });
                });

                fetch(`https://discord.com/api/v9/guilds/${server.guildId}/members?limit=1000`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bot ${bot.botToken}`,
                        "Content-Type": "application/json"
                    }
                }).then(async (res) => {
                    if (res.status === 200) {
                        const data = await res.json();
                        for (const memberData of data) {
                            const member = members.find(m => m.userId == memberData.user.id);
                            if (member) {
                                members.splice(members.indexOf(member), 1);
                            }
                        }
                    }
                }).catch(err => {
                    console.error(err);
                });

                let succPulled: number = 0;
                const pullingProcess = new Promise<void>(async (resolve, reject) => {
                    let membersNew = await shuffle(members);
                    let delay: number = 300;

                    await prisma.logs.create({
                        data: {
                            title: "Started Pulling",
                            body: `${account.username} started pulling to ${server.name}, ip: ${getIPAddress(req)}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
                        }
                    });

                    for (const member of membersNew) { 
                        const newServer = await prisma.servers.findFirst({
                            where: {
                                id: server.id
                            }
                        });

                        if (!newServer) return reject("Server not found");
                        // if (!newServer.pulling) return reject();

                        console.log(`Adding ${member.username} to ${server.name}`);
                        await addMember(server.guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, [BigInt(server.roleId).toString()]).then(async (resp: any) => {
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
                                            await addMember(server.guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, [BigInt(server.roleId).toString()])
                                        }, retry);
                                        delay += retry;
                                    }
                                    break;
                                case 403:
                                    refreshTokenAddDB( 
                                        member.userId.toString(), member.id, guildId.toString(), 
                                        bot?.botToken, server.roleId, member.refreshToken,
                                        bot?.clientId.toString(), bot?.botSecret.toString(), prisma);
                                    break;
                                }
                            }
                            switch (resp.status) {
                            case 403:
                                refreshTokenAddDB(member.userId.toString(), member.id, guildId.toString(), bot?.botToken, server.roleId, member.refreshToken, bot?.clientId.toString(), bot?.botSecret.toString(), prisma);
                                break;
                            case 407:
                                console.log(`407 Exponential Membership Growth/Proxy Authentication Required`);
                                break;
                            case 204:
                                succPulled++;
                                await addRole(server.guildId.toString(), member.userId.toString(), bot?.botToken, BigInt(server.roleId).toString());
                                resolve();
                                break;
                            case 201:
                                succPulled++;
                                if (delay > 500) delay -= delay / 2;
                                resolve();
                                break;
                            default:
                                reject("Unknown error");
                                break;
                            }
                        }).catch(async (err: Error) => {
                            return res.status(400).json({ success: false, message: err?.message ? err?.message : "Something went wrong" });
                        });

                        await sleep(delay);
                    }
                }).catch(async (err: Error) => {
                    console.log(`3 ${err}`);
                });

                let esimatedTime: any = members.length * 300 * 5;

                if (esimatedTime > 60000) {
                    esimatedTime = esimatedTime / (60 * 1000);
                    esimatedTime = Math.round(esimatedTime);
                    esimatedTime = esimatedTime + " minutes";
                } else if (esimatedTime > 3600000) {
                    esimatedTime = esimatedTime / (3600 * 1000);
                    esimatedTime = Math.round(esimatedTime);
                    esimatedTime = esimatedTime + " hours";
                } else {
                    esimatedTime = esimatedTime / 1000;
                    esimatedTime = Math.round(esimatedTime);
                    esimatedTime = esimatedTime + " seconds";
                }

                // when pulling is done update the db
                pullingProcess.then(async () => {
                    await prisma.servers.update({
                        where: {
                            id: server.id
                        },
                        data: {
                            pulling: false,
                        }
                    });
                }).catch(async (err: Error) => {
                    console.log(`4 ${err}`);
                });
            
                return res.status(200).json({ success: true, message: `Started Pull Process, this will take around ${esimatedTime}` });
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
        default:
            res.setHeader("Allow", "GET, PUT, DELETE");
            res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
            break;
        }
    })
}