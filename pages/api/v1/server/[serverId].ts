import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import { getBrowser, getIPAddress, getPlatform } from "../../../../src/getIPAddress";
import { addMember, addRole, refreshTokenAddDB, shuffle, sleep } from "../../../../src/Migrate";
import rateLimit from "../../../../src/rate-limit";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { formatEstimatedTime } from "../../../../src/functions";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 60, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const server = await prisma.servers.findFirst({ where: { guildId: BigInt(`${req.query.serverId}`) } });
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

                const serverId: any = BigInt(req.query.serverId as any);
                if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });

                const server = await prisma.servers.findFirst({
                    where: {
                        AND: [
                            { ownerId: user.id },
                            { guildId: serverId }
                        ]
                    }
                });

                if (!server) return res.status(400).json({ success: false, message: "Server not found" });

                const backup = await prisma.backups.findFirst({ where: { guildId: server.guildId } });

                if (backup) {
                    await prisma.roles.deleteMany({ where: { backupId: backup.backupId } });
                    const channels = await prisma.channels.findMany({ where: { backupId: backup.backupId } });
                    for (const channel of channels) {
                        await prisma.channelPermissions.deleteMany({ where: { channelId: channel.channelId } });
                    }
                    await prisma.channels.deleteMany({ where: { backupId: backup.backupId } });
                    await prisma.guildMembers.deleteMany({ where: { backupId: backup.backupId } });
                    await prisma.backups.deleteMany({ where: { backupId: backup.backupId } });
                }

                await prisma.members.deleteMany({where: { guildId: serverId } });
                await prisma.blacklist.deleteMany({ where: { guildId: serverId } });
                
                await prisma.servers.delete({
                    where: {
                        guildId: serverId,
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
                
                const serverId: number = req.query.serverId as any;
                if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });

                // get ?server=123123 from url
                const guildId = req.query.server as string;
                if (!guildId) return res.status(400).json({ success: false, message: "Server not provided" });

                const roleId = req.query.role as string;
                const pullCount = req.query.pullCount as string;

                const server = await prisma.servers.findFirst({ where: { AND: [ { id: Number(serverId) as number }, { ownerId: user.id } ] } });
                if (!server) return res.status(400).json({ success: false, message: "Server not found" });

                const bot = await prisma.customBots.findFirst({ where: { AND: [ { ownerId: user.id }, { id: server.customBotId } ] } });
                if (!bot) return res.status(400).json({ success: false, message: "Bot not found" });

                const members = await prisma.members.findMany({ where: { AND: [ { guildId: BigInt(server.guildId) }, { accessToken: { not: "unauthorized" } } ] } });
                if (members.length === 0) return res.status(400).json({ success: false, message: "No members found" });

                await axios.get(`https://discord.com/api/v10/users/@me`, {
                    headers: {
                        "Authorization": `Bot ${bot.botToken}`,
                        "Content-Type": "application/json",
                        "X-RateLimit-Precision": "millisecond",
                        "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                    },
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                    validateStatus: () => true,
                }).then((response) => {
                    if (response.status !== 200) return res.status(400).json({ success: false, message: "Invalid bot token" });
                });

                // check if the server exists on discord (guildId)
                await axios.get(`https://discord.com/api/v10/guilds/${guildId}`, {
                    headers: {
                        "Authorization": `Bot ${bot.botToken}`,
                        "Content-Type": "application/json",
                        "X-RateLimit-Precision": "millisecond",
                        "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                    },
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                    validateStatus: () => true,
                }).then((resp) => {
                    if (resp?.status !== 200 || resp?.status != 200) return res.status(400).json({ success: false, message: "Discord server not found, invite bot or try again." });
                }).catch((err) => {
                    console.error(err);
                    return res.status(400).json({ success: false, message: "Something went wrong" });
                });

                if (roleId) {
                    await axios.put(`https://discord.com/api/v10/guilds/${guildId}/members/${bot.clientId}/roles/${roleId}`, {}, {
                        headers: {
                            "Authorization": `Bot ${bot.botToken}`,
                            "Content-Type": "application/json",
                            "X-RateLimit-Precision": "millisecond",
                            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                        },
                        proxy: false,
                        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                        validateStatus: () => true,
                    }).then((resp) => {
                        if (resp?.status === 403 || resp?.status == 403) return res.status(400).json({ success: false, message: "Bot doesn't have permissions to give verified role" });
                        if (resp?.status === 404 || resp?.status == 404) return res.status(400).json({ success: false, message: "Verified role not found" });
                    }).catch((err) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Something went wrong" });
                    });
                }

                if (server.pulling === true) return res.status(400).json({ success: false, message: "You are already pulling" });
                if (server.pullTimeout !== null) if (server.pullTimeout > new Date()) return res.status(400).json({ success: false, message: "You're on cooldown, you can pull again in", pullTimeout: server.pullTimeout });


                // let done;
                const serverMemberList = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
                    headers: {
                        "Authorization": `Bot ${bot.botToken}`,
                        "Content-Type": "application/json",
                        "X-RateLimit-Precision": "millisecond",
                        "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache"
                    },
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                    validateStatus: () => true,
                });
                
                if (!serverMemberList.status.toString().startsWith("2")) {
                    serverMemberList.data = [];
                }

                for (const serverMemberData of serverMemberList.data) {
                    if (serverMemberList.data.length === 0) return;

                    const member = members.find((m) => m.userId == serverMemberData.user.id);
                    if (member) {
                        members.splice(members.indexOf(member), 1)
                    }
                }

                if (members.length === 0) return res.status(400).json({ success: false, message: "No pullable members found" });

                if (user.role !== "free") {
                    await prisma.servers.update({ where: { id: server.id }, data: { pulling: true, pullTimeout: new Date(Date.now() + 1000 * 60 * 30) } });
                } else { 
                    await prisma.servers.update({ where: { id: server.id }, data: { pulling: true, pullTimeout: new Date(Date.now() + 1000 * 60 * 60 * 12) } });
                }

                let succPulled: number = 0;
                let erroPulled: number = 0;
                const pullingProcess = new Promise<void>(async (resolve, reject) => {
                    let membersNew = await shuffle(members);
                    let delay: number = 500;

                    await prisma.logs.create({
                        data: {
                            title: "Started Pulling",
                            body: `${user.username} started pulling to ${server.name}, ip: ${getIPAddress(req)}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
                        }
                    });

                    for (const member of membersNew) { 
                        const newServer = await prisma.servers.findFirst({ where: { id: server.id } });

                        if (!newServer) return reject(`[${server.name}] Server not found`);
                        //if (!newServer.pulling) return reject(`[${server.name}] Pulling stopped`);

                        console.log(`[${server.name}] [${member.username}] Pulling...`);
                        await addMember(guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, roleId ? [BigInt(roleId).toString()] : []).then(async (resp: any) => {
                            let status = resp?.response?.status || resp?.status;
                            let response = ((resp?.response?.data?.message || resp?.response?.data?.code) || (resp?.data?.message || resp?.data?.code)) ? (resp?.response?.data || resp?.data) : "";
                            
                            console.log(`[${server.name}] [${member.username}] ${status} ${JSON.stringify(response).toString() ?? null}`);
                    
                            switch (status) {
                            case 429:   
                                const retryAfter = resp.response.headers["retry-after"];
                                console.log(`[${server.name}] [${member.username}] 429 | retry-after: ${retryAfter} | delay: ${delay}ms`);
                                if (retryAfter) {
                                    const retry = parseInt(retryAfter);
                                    setTimeout(async () => {
                                        await addMember(guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, roleId ? [BigInt(roleId).toString()] : [])
                                    }, retry);
                                    delay += retry;
                                }
                                break;
                            case 403:
                                if (await refreshTokenAddDB(member.userId.toString(), member.id, guildId.toString(), bot?.botToken, roleId, member.refreshToken, bot?.clientId.toString(), bot?.botSecret.toString(), prisma)) {
                                    console.log(`[${server.name}] [${member.username}] 403 | Refreshed token`);
                                    succPulled++;
                                } else {
                                    console.log(`[${server.name}] [${member.username}] 403 | Refreshed token failed`);
                                    erroPulled++;
                                }
                                break;
                            case 407:
                                console.log(`407 Exponential Membership Growth/Proxy Authentication Required`);
                                break;
                            case 204:
                                await addRole(guildId.toString(), member.userId.toString(), bot?.botToken, roleId ? BigInt(roleId).toString() : "");
                                succPulled++;
                                break;
                            case 201:
                                succPulled++;

                                if (delay > 1000) delay -= 1000;
                                else if (delay < 500) delay = 550;
                                
                                break;
                            case 400:
                                console.error(`[FATAL ERROR] [${server.name}] [${member.id}]-[${member.username}] 400 | ${JSON.stringify(response)}`);
                                erroPulled++;
                                break;
                            default:
                                console.error(`[FATAL ERROR] [UNDEFINED STATUS] [${server.name}] [${member.id}]-[${member.username}] ${status} | ${JSON.stringify(response)} | ${JSON.stringify(resp)}`);
                                break;
                            }
                        }).catch(async (err: Error) => {
                            console.error(`[${server.name}] [addMember.catch] [${member.username}] ${err}`);
                            erroPulled++;
                            // return res.status(400).json({ success: false, message: err?.message ? err?.message : "Something went wrong" });
                        });

                        if (erroPulled >= 200) {
                            console.log(`[${server.name}] [${member.username}] 200 errors reached`);
                            console.log(`[${server.name}] Finished pulling`);
                            await prisma.servers.update({
                                where: {
                                    id: server.id
                                },
                                data: {
                                    pulling: false,
                                }
                            }).catch(async (err: Error) => {
                                console.error(`[${server.name}] [PULLING] 5 ${err}`);
                            });
        
                            resolve();
                            return;
                        }

                        if (succPulled >= Number(pullCount)) {
                            console.log(`[${server.name}] [${member.username}] ${pullCount} members have been pulled`);
                            console.log(`[${server.name}] Finished pulling`);
                            await prisma.servers.update({
                                where: {
                                    id: server.id
                                },
                                data: {
                                    pulling: false,
                                }
                            }).catch(async (err: Error) => {
                                console.error(`[${server.name}] [PULLING] 5 ${err}`);
                            });

                            resolve();
                            return;
                        }

                        console.log(`[${server.name}] [${member.username}] Success: ${succPulled}/${pullCount ? pullCount : "∞"} (${members.length}) | Errors: ${erroPulled}/200 | Delay: ${delay}ms`);

                        await sleep(delay);
                    }

                    console.log(`[${server.name}] Finished pulling`);
                    await prisma.servers.update({
                        where: {
                            id: server.id
                        },
                        data: {
                            pulling: false,
                        }
                    }).catch(async (err: Error) => {
                        console.error(`[${server.name}] [PULLING] 5 ${err}`);
                    });

                    resolve();
                }).catch(async (err: Error) => {
                    console.error(`[PULLING] 3 ${err}`);
                });

                let esimatedTime: any = members.length * 1500; 
                esimatedTime = formatEstimatedTime(esimatedTime);

                pullingProcess.then(async () => {
                    console.log(`[${server.name}] Pulling done with ${succPulled} members pulled`);
                    await prisma.servers.update({
                        where: {
                            id: server.id
                        },
                        data: {
                            pulling: false,
                        }
                    }).catch(async (err: Error) => {
                        console.error(`[${server.name}] [PULLING] 6 ${err}`);
                    });
                }).catch(async (err: Error) => {
                    console.error(`[${server.name}] [PULLING] 4 ${err}`);
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

export default withAuthentication(handler);