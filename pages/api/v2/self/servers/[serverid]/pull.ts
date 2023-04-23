import { NextApiRequest, NextApiResponse } from "next";
import { HttpsProxyAgent } from "https-proxy-agent";
import { accounts, members } from "@prisma/client";

import { prisma } from "../../../../../../src/db";
import { addMember, addRole, refreshToken, shuffle, sleep } from "../../../../../../src/Migrate";
import { getBrowser, getIPAddress, getPlatform } from "../../../../../../src/getIPAddress";
import { formatEstimatedTime } from "../../../../../../src/functions";

import axios from "axios";
import withAuthentication from "../../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "PUT") return res.status(405).json({ code: 0, message: "Method not allowed", });

    try {
        const serverId: any = String(req.query.serverid) as any;
        const guildId = req.query.server as string;
        const roleId = req.query.role as string;
        let pullCount = Number(req.query.pullCount) || Number.MAX_SAFE_INTEGER;

        if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });
        if (!guildId) return res.status(400).json({ success: false, message: "Server not provided" });
        if (pullCount === undefined || pullCount === null) pullCount = Number.MAX_SAFE_INTEGER;

        const server = await prisma.servers.findFirst({ where: { AND: [ { guildId: BigInt(serverId) as bigint }, { ownerId: user.id } ] } });
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

        let delay: number = 500;
        let pullTimeout: Date = new Date(Date.now() + 1000 * 60 * 60 * 18);

        if (members.length === 0) return res.status(400).json({ success: false, message: "No pullable members found" });


        switch (user.role) {
        case "free":
            delay = 1250;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 60 * 18);
            if (members.length <= 5) pullTimeout = new Date(Date.now() + 1000 * 60 * 60);
            break;
        case "premium":
            delay = 850;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 60 * 2);
            if (members.length <= 5) pullTimeout = new Date(Date.now() + 1000 * 60 * 60);
            break;
        case "business":
            delay = 600;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 60);
            break;
        case "enterprise":
            delay = 350;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 5);
            break;
        }

        await prisma.servers.update({ where: { id: server.id }, data: { pulling: true, pullTimeout: pullTimeout } });

        let trysPulled: number = 0;
        let succPulled: number = 0;
        let erroPulled: number = 0;
        new Promise<void>(async (resolve, reject) => {
            let membersNew: members[] = await shuffle(members);
            console.log(`[${server.name}] Total members: ${members.length}, pulling: ${membersNew.length}`);

            await prisma.logs.create({
                data: {
                    title: "Started Pulling",
                    body: `${user.username} started pulling to ${server.name}, ip: ${getIPAddress(req)}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
                }
            });
                    
            console.log(`[${server.name}] Started Pulling`);

            // const MAX_PULL_TIME = 1000 * 60 * 5;
            const MAX_PULL_TIME = 1000 * 15;

            for (const member of membersNew) {
                const newServer = await prisma.servers.findFirst({ where: { id: server.id } });

                if (!newServer) return reject(`[${server.name}] Server not found`);
                if (!newServer.pulling) return reject(`[${server.name}] Pulling stopped`);

                console.log(`[${server.name}] [${member.username}] Pulling...`);

                let isDone = false;
                const pullPromise = addMember(guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, roleId ? [BigInt(roleId).toString()] : []).then(async (resp: any) => {
                    trysPulled++;
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
                            }, retry + 100);
                            delay += retry;
                        }
                        break;
                    case 403:
                        const refreshed = await refreshToken(member.refreshToken, bot?.clientId.toString(), bot?.botSecret.toString());
                        if (refreshed?.data?.access_token && refreshed?.data?.refresh_token) {
                            await prisma.members.update({
                                where: {
                                    id: Number(member.id as number),
                                },
                                data: {
                                    accessToken: refreshed.data.access_token,
                                    refreshToken: refreshed.data.refresh_token
                                }
                            });

                            console.log(`[${server.name}] [${member.username}] Refreshed (access_token: ${refreshed.data.access_token}, refresh_token: ${refreshed.data.refresh_token})`);
                            await addMember(guildId.toString(), member.userId.toString(), bot?.botToken, refreshed.data.access_token, roleId ? [BigInt(roleId).toString()] : []).then(async (respon: any) => {
                                if ((respon?.status === 204 || respon?.status === 201) || (respon?.response?.status === 204 || respon?.response?.status === 201)) {
                                    succPulled++;
                                    console.log(`[${server.name}] [${member.username}] ${respon?.status || respon?.response?.status} Refresh PULLED`); 
                                } else {
                                    erroPulled++;
                                    console.log(`[${server.name}] [${member.username}] ${respon?.status || respon?.response?.status} Refresh FAILED`);
                                }
                            });
                        } else {
                            await prisma.members.update({
                                where: {
                                    id: Number(member.id as number),
                                },
                                data: {
                                    accessToken: "unauthorized"
                                }
                            });
                            console.log(`[${server.name}] [${member.username}] 403 | Refresh Failed`);
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
                        break;
                    case 400:
                        if (response?.code !== 30001) {
                            console.error(`[FATAL ERROR] [${server.name}] [${member.id}]-[${member.username}] 400 | ${JSON.stringify(response)}`);
                        }
                        erroPulled++;
                        break;
                    case 404:
                        console.error(`[FATAL ERROR] [${server.name}] [${member.id}]-[${member.username}] 404 | ${JSON.stringify(response)}`);
                        erroPulled++;
                        break;
                    case 401:
                        console.error(`[${server.name}] [${member.id}]-[${member.username}] Bot token invalid stopped pulling...`);
                        reject(`[${server.name}] Bot token invalid stopped pulling...`);
                        break;
                    default:
                        console.error(`[FATAL ERROR] [UNDEFINED STATUS] [${server.name}] [${member.id}]-[${member.username}] ${status} | ${JSON.stringify(response.message)} | ${JSON.stringify(resp.message)}`);
                        erroPulled++;
                        break;
                    }
                }).catch(async (err: Error) => {
                    clearTimeout(pullTimeout);
                    console.error(`[${server.name}] [addMember.catch] [${member.username}] ${err}`);
                    erroPulled++;
                }).finally(() => {
                    console.log(`[${server.name}] [${member.username}] Pulled`);
                    clearTimeout(pullTimeout);
                    isDone = true;
                });

                const pullTimeout = setTimeout(async () => {
                    if (isDone) {
                        return;
                    }
                  
                    console.error(`[${server.name}] [${member.username}] Pulling timed out`);
                    await prisma.servers.update({
                        where: {
                            id: server.id,
                        },
                        data: {
                            pulling: false,
                        },
                    }).catch(async (err: Error) => {
                        console.error(`[${server.name}] [PULLING] 5 ${err}`);
                    });
                  
                    resolve();
                }, MAX_PULL_TIME);
                  
                await pullPromise;
                  
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

                if (delay > 2000) delay -= 1000;
                else if (delay < 300) delay = 500;

                console.log(`[${server.name}] [${member.username}] Success: ${succPulled}/${(pullCount !== Number.MAX_SAFE_INTEGER) ? pullCount : "∞"} (${trysPulled}/${membersNew.length}) | Errors: ${erroPulled} | Delay: ${delay}ms`);

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
            return;
        }).then(async () => {
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
            console.error(`[PULLING] 3 ${err}`);
        });

        let esimatedTime: any = members.length * (1000 + delay); 
        esimatedTime = formatEstimatedTime(esimatedTime);
            
        return res.status(200).json({ success: true, message: `Started Pull Process, this will take around ${esimatedTime}` });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);