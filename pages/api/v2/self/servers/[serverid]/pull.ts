import { NextApiRequest, NextApiResponse } from "next";
import { HttpsProxyAgent } from "https-proxy-agent";
import { accounts, members, migrations } from "@prisma/client";

import { prisma } from "../../../../../../src/db";
import { addMember, addRole, refreshToken, shuffle, sleep } from "../../../../../../src/Migrate";
import { getBrowser, getIPAddress, getPlatform, getXTrack } from "../../../../../../src/getIPAddress";
import { formatEstimatedTime } from "../../../../../../src/functions";

import axios from "axios";
import withAuthentication from "../../../../../../src/withAuthentication";
import { countries } from "../../../../../dashboard/blacklist";

type Status = "PENDING" | "PULLING" | "SUCCESS" | "FAILED" | "STOPPED";

async function updateMigration(id: number, status: Status, success: number, banned: number, maxGuild: number, invalid: number, failed: number, blacklisted: number) {
    await prisma.migrations.update({
        where: {
            id: id
        },
        data: {
            status: status,
            successCount: success,
            bannedCount: banned,
            maxGuildsCount: maxGuild,
            invalidCount: invalid,
            failedCount: failed,
            blacklistedCount: blacklisted,
            updatedAt: new Date()
        }
    });
}

async function getMigration(id: number): Promise<migrations | null> {
    return await prisma.migrations.findUnique({
        where: {
            id: id
        }
    });
}

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "PUT") return res.status(405).json({ code: 0, message: "Method not allowed", });

    try {
        const xTrack = getXTrack(req);
        if (!xTrack) return res.status(400).json({ success: false, message: "Invalid Request" });
    
        const serverId: any = String(req.query.serverid) as any;
        const guildId = req.query.server as string;
        const roleId = req.query.role as string;
        const countryCode = req.query.country as string;
        let discordServer: any = null;
        let pullCount = Number(req.query.pullCount) || Number.MAX_SAFE_INTEGER;

        if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });
        if (!guildId) return res.status(400).json({ success: false, message: "Server not provided" });
        if (pullCount === undefined || pullCount === null) pullCount = Number.MAX_SAFE_INTEGER;

        const server = await prisma.servers.findFirst({ where: { AND: [ { guildId: BigInt(serverId) as bigint }, { ownerId: user.id } ] } });
        if (!server) return res.status(400).json({ success: false, message: "Server not found", code: 50041 });

        const bot = await prisma.customBots.findFirst({
            select: {
                id: true,
                botToken: true,
                clientId: true,
                botSecret: true,
            },
            where: {
                AND: [ 
                    { ownerId: user.id },
                    { id: server.customBotId } 
                ] 
            } 
        });
        if (!bot) return res.status(400).json({ success: false, message: "Bot not found", code: 50042 });

        const members = await prisma.members.findMany({
            select: {
                id: true,
                userId: true,
                username: true,
                accessToken: true,
                refreshToken: true,
            },
            where: { 
                AND: [
                    { guildId: BigInt(server.guildId) }, 
                    { accessToken: { not: "unauthorized" }, }, 
                    ((countryCode && (user.role === "business" || user.role === "enterprise")) ? { country: countries.find((c) => c.code === countryCode)?.name } : {}) 
                ] 
            }, 
            take: 100000 
        });
        if (members.length === 0) return res.status(400).json({ success: false, message: "No members found", code: 50043 });

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
            if (response.status !== 200) return res.status(400).json({ success: false, message: "Invalid bot token", code: 50401 });
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
            if (resp?.status !== 200 || resp?.status != 200) return res.status(400).json({ success: false, message: "Discord server not found, invite bot or try again.", code: 500404 });
            console.log(`[${server.name}] Pulling members into server: ${resp?.data?.name} (${resp?.data?.id})`);
            discordServer = resp.data;
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
                if (resp?.status === 403 || resp?.status == 403) return res.status(400).json({ success: false, message: "Bot doesn't have permissions to give verified role", code: 500403 });
                if (resp?.status === 404 || resp?.status == 404) return res.status(400).json({ success: false, message: "Verified role not found", code: 500403 });
            }).catch((err) => {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            });
        }

        if (server.pulling === true && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You are already pulling", code: 50055 });
        if (server.pullTimeout !== null) if (server.pullTimeout > new Date()) return res.status(400).json({ success: false, message: "You're on cooldown, you can pull again in", pullTimeout: server.pullTimeout, code: 50056 });

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

        if (members.length === 0) return res.status(400).json({ success: false, message: "No pullable members found", code: 50044 });


        switch (user.role) {
        case "free":
            delay = 1250;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 60 * 18);
            if (members.length <= 15) pullTimeout = new Date(Date.now() + 1000 * 60 * 30);
            break;
        case "premium":
            delay = 850;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 60 * 2);
            if (members.length <= 15) pullTimeout = new Date(Date.now() + 1000 * 60 * 30);
            break;
        case "business":
            delay = 600;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 30);
            break;
        case "enterprise":
            delay = 400;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 0);
            break;
        default:
            delay = 500;
            pullTimeout = new Date(Date.now() + 1000 * 60 * 60 * 18);
            if (members.length <= 15) pullTimeout = new Date(Date.now() + 1000 * 60 * 30);
            break;
        }

        await prisma.servers.updateMany({ 
            where: {
                owner: {
                    lastIp: user.lastIp,
                    role: "free"
                },
                NOT: {
                    ownerId: user.id
                }, 
            },
            data: {
                pullTimeout: pullTimeout
            } 
        });

        await prisma.servers.update({ where: { id: server.id }, data: { pullTimeout: pullTimeout, pulling: true } });

        const migration = await prisma.migrations.create({
            data: {
                guildId: server.guildId,
                migrationGuildId: BigInt(guildId) as bigint,
                totalCount: (pullCount < members.length) ? pullCount : members.length
            }
        });

        let trysPulled: number = 0;
        let successCount: number = 0;
        let bannedCount: number = 0;
        let maxGuildsCount: number = 0;
        let invalidCount: number = 0;
        let blacklistedCount: number = 0;
        let errorCount: number = 0;

        const blacklisted = await prisma.blacklist.findMany({
            where: {
                type: 0,
                guildId: server.guildId
            },
        });

        blacklisted.forEach((blacklistedMember) => {
            const member = members.find((m) => m.userId === BigInt(blacklistedMember.value) as bigint);
            if (member) {
                members.splice(members.indexOf(member), 1);
                blacklistedCount++;
            }
        });

        await prisma.migrations.update({ where: { id: migration.id }, data: { startedAt: new Date(), totalCount: (pullCount < members.length) ? pullCount : members.length } });

        if (user.role !== "enterprise") {
            await prisma.migrations.updateMany({
                where: {
                    guildId: server.guildId,
                    status: "PULLING"
                },
                data: {
                    status: "STOPPED"
                }
            });
        }

        new Promise<void>(async (resolve, reject) => {
            let membersNew: members[] = await shuffle(members);
            console.log(`[${migration.id}] [${server.name}] Total members: ${members.length}, pulling: ${(pullCount < members.length) ? pullCount : members.length}`);

            await prisma.logs.create({
                data: {
                    type: 10,
                    username: `${user.username} (${user.id})`,
                    ipAddr: getIPAddress(req),
                    device: JSON.stringify(xTrack),
                }
            });

            if (server.webhook !== null && user.role !== "free") {
                await axios.post(server.webhook, {
                    embeds: [
                        {
                            title: `New Migration Started`,
                            timestamp: new Date().toISOString(),
                            color: 0x00ff00,
                            author: {
                                name: discordServer.name,
                                url: `https://discord.com/channels/${discordServer.id}`,
                                ...discordServer.icon ? { icon_url: `https://cdn.discordapp.com/icons/${discordServer.id}/${discordServer.icon}.png` } : { },
                            },
                            fields: [
                                {
                                    name: ":busts_in_silhouette: Pulling Members:",
                                    value: `${(pullCount < members.length) ? pullCount : members.length} members`,
                                    inline: true,
                                },
                                {
                                    name: ":globe_with_meridians: Discord Server:",
                                    value: `[${discordServer.name}](https://discord.com/channels/${discordServer.id})`,
                                    inline: true,
                                },
                                {
                                    name: ":clock1: Estimated Time:",
                                    value: "<t:" + Math.floor((Date.now() + ((pullCount < members.length) ? pullCount : members.length) * (1500 + delay))/1000) + ":R>",
                                    inline: true,
                                },
                                ...(countryCode ? [
                                    {
                                        name: ":globe_with_meridians: Country:",
                                        value: `:flag_${countryCode.toLowerCase()}: ${countries.find((c) => c.code === countryCode)?.name || "Unknown"}`,
                                        inline: true,
                                    },
                                ] : []),
                            ],
                        },
                    ],
                },
                {
                    proxy: false, 
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
                }).catch(async (err) => {
                    if (err?.response?.status === 404 && server.webhook !== null) {
                        console.error(`${server.webhook.split("/")[5]} Webhook not found (webhook removed from config)`);
                        const servers = await prisma.servers.findMany({
                            where: {
                                webhook: server.webhook,
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
                        console.error(`${server?.webhook?.split("/")[5]} Webhook ratelimited`);
                    } else {
                        console.error(err);
                    }
                });
            }

            console.log(`[${migration.id}] [${server.name}] Started Pulling`);

            const MAX_PULL_TIME = 1000 * 60 * 10;

            for (const member of membersNew) {
                console.log(`[${migration.id}] [${server.name}] [${member.username}] Pulling...`);

                if (!(await getMigration(migration.id).then((m) => m?.status === "PENDING" || m?.status === "PULLING"))) {
                    console.log(`[${migration.id}] [${server.name}] Migration is not pending or pulling, stopped pulling...`);
                    await prisma.servers.update({
                        where: {
                            id: server.id
                        },
                        data: {
                            pulling: false,
                            pullTimeout: new Date(Date.now()),
                        },
                    }).then(() => {
                        console.log(`[${migration.id}] [${server.name}] [PULLING] Set pulling to false`);
                    }).catch((err: Error) => {
                        console.error(`[${migration.id}] [${server.name}] [PULLING] 4 ${err}`);
                    });
                    return reject("Migration is not pending or pulling, stopped pulling...");
                }
                
                let isDone = false;
                await updateMigration(migration.id, "PULLING", successCount, bannedCount, maxGuildsCount, invalidCount, errorCount, blacklistedCount);

                const pullPromise = addMember(guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, roleId ? [BigInt(roleId).toString()] : []).then(async (resp: any) => {
                    trysPulled++;
                    let status = resp?.response?.status || resp?.status;
                    let response = ((resp?.response?.data?.message || resp?.response?.data?.code) || (resp?.data?.message || resp?.data?.code)) ? (resp?.response?.data || resp?.data) : "";

                    console.log(`[${migration.id}] [${server.name}] [${member.username}] ${status} ${JSON.stringify(response).toString() ?? null}`);
                    
                    switch (status) {
                    case 429:   
                        const retryAfter = resp.response.headers["retry-after"];
                        console.log(`[${migration.id}] [${server.name}] [${member.username}] 429 | retry-after: ${retryAfter} | delay: ${delay}ms`);
                        if (retryAfter) {
                            const retry = parseInt(retryAfter);
                            setTimeout(async () => {
                                await addMember(guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, roleId ? [BigInt(roleId).toString()] : [])
                            }, retry * 100);
                            delay += retry * 100;
                        }
                        break;
                    case 403:
                        if (response?.code === 50025) { // "Invalid OAuth2 access token"
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

                                console.log(`[${migration.id}] [${server.name}] [${member.username}] Refreshed`);
                                await addMember(guildId.toString(), member.userId.toString(), bot?.botToken, refreshed.data.access_token, roleId ? [BigInt(roleId).toString()] : []).then(async (respon: any) => {
                                    if ((respon?.status === 204 || respon?.status === 201) || (respon?.response?.status === 204 || respon?.response?.status === 201)) {
                                        successCount++;
                                        console.log(`[${migration.id}] [${server.name}] [${member.username}] ${respon?.status || respon?.response?.status} Refresh PULLED`); 
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
                                console.log(`[${migration.id}] [${server.name}] [${member.username}] 403 | Refresh Failed`);
                                invalidCount++
                            }
                        } else if (response?.code === 40007) { // "The user is banned from this guild."
                            console.error(`[${migration.id}] [${server.name}] [${member.username}] 403 | Banned`);
                            bannedCount++;
                        }
                        break;
                    case 407:
                        console.log(`407 Exponential Membership Growth/Proxy Authentication Required`);
                        break;
                    case 204:
                        await addRole(guildId.toString(), member.userId.toString(), bot?.botToken, roleId ? BigInt(roleId).toString() : "");
                        successCount++;
                        break;
                    case 201:
                        successCount++;
                        break;
                    case 400:
                        if (response.code === 30001) { // "You are at the 100 server limit."
                            console.error(`[${migration.id}] [${server.name}] [${member.username}] 400 | ${JSON.stringify(response)}`);
                            maxGuildsCount++;
                        } else {
                            console.error(`[FATAL ERROR] [${migration.id}] [${server.name}] [${member.id}]-[${member.username}] 400 | ${JSON.stringify(response)}`);
                            errorCount++;
                        }
                        break;
                    case 404:
                        console.error(`[FATAL ERROR] [${migration.id}] [${server.name}] [${member.id}]-[${member.username}] 404 | ${JSON.stringify(response)}`);
                        errorCount++;
                        break;
                    case 401:
                        console.error(`[${migration.id}] [${server.name}] [${member.id}]-[${member.username}] Bot token invalid stopped pulling...`);
                        reject(`[${server.name}] Bot token invalid stopped pulling...`);
                        break;
                    default:
                        console.error(`[FATAL ERROR] [UNDEFINED STATUS] [${migration.id}] [${server.name}] [${member.id}]-[${member.username}] ${status} | ${JSON.stringify(response.message)} | ${JSON.stringify(resp.message)}`);
                        errorCount++;
                        break;
                    }
                }).catch(async (err: Error) => {
                    clearTimeout(pullTimeout);
                    console.error(`[${migration.id}] [${server.name}] [addMember.catch] [${member.username}] ${err}`);
                    errorCount++;
                }).finally(() => {
                    console.log(`[${migration.id}] [${server.name}] [${member.username}] Pulled`);
                    clearTimeout(pullTimeout);
                    isDone = true;
                });

                const pullTimeout = setTimeout(async () => {
                    if (isDone) {
                        return;
                    } else {
                        console.error(`[${migration.id}] [${server.name}] [${member.username}] Pulling timed out after ${MAX_PULL_TIME / 1000} seconds | started: ${Math.round(Number(new Date(await getMigration(migration.id).then((m) => m?.startedAt) || 0)) / 1000)}s | last updated: ${Math.round(Number(new Date(await getMigration(migration.id).then((m) => m?.updatedAt) || 0)) / 1000)}s | difference: ${Math.round(Number(new Date(await getMigration(migration.id).then((m) => m?.updatedAt) || 0)) / 1000) - Math.round(Number(new Date(await getMigration(migration.id).then((m) => m?.startedAt) || 0)) / 1000)}s | [serverId:${serverId} guildId:${guildId} roleId:${roleId} countryCode:${countryCode} server.id:${server.id} migration.id:${migration.id}]`);
                        await prisma.servers.update({
                            where: {
                                id: server.id,
                            },
                            data: {
                                pulling: false,
                                pullTimeout: new Date(Date.now()),
                            },
                        }).catch(async (err: Error) => {
                            console.error(`[${migration.id}] [${server.name}] [PULLING] 5 ${err}`);
                        });

                        await updateMigration(migration.id, "FAILED", successCount, bannedCount, maxGuildsCount, invalidCount, errorCount, blacklistedCount);

                        resolve();
                    }
                }, MAX_PULL_TIME);
                
                await pullPromise;

                if (Number(successCount) >= Number(pullCount)) {
                    console.log(`[${migration.id}] [${server.name}] ${pullCount} members have been pulled`);
                    console.log(`[${migration.id}] [${server.name}] Finished pulling`);
                    await prisma.servers.update({
                        where: {
                            id: server.id
                        },
                        data: {
                            pulling: false,
                        }
                    }).then(() => {
                        console.log(`[${migration.id}] [${server.name}] [PULLING] Set pulling to false`);
                    }).catch((err: Error) => {
                        console.error(`[${migration.id}] [${server.name}] [PULLING] 5 ${err}`);
                    });

                    if (await getMigration(migration.id).then((m) => m?.status === "PULLING")) await updateMigration(migration.id, "SUCCESS", successCount, bannedCount, maxGuildsCount, invalidCount, errorCount, blacklistedCount);

                    resolve();
                }

                if (delay > 2000) delay -= 1000;
                if (delay < 300) delay += 500;

                console.log(`[${migration.id}] [${server.name}] [${member.username}] Success: ${successCount}/${(pullCount !== Number.MAX_SAFE_INTEGER) ? pullCount : "∞"} (${trysPulled}/${membersNew.length}) | Errors: ${errorCount} | Delay: ${delay}ms`);
                
                await new Promise((resolvePromise) => { setTimeout(resolvePromise, delay); });
            }

            console.log(`[${server.name}] Finished pulling`);
            await prisma.servers.update({
                where: {
                    id: server.id
                },
                data: {
                    pulling: false,
                }
            }).then(() => {
                console.log(`[${migration.id}] [${server.name}] [PULLING] Set pulling to false`);
            }).catch((err: Error) => {
                console.error(`[${migration.id}] [${server.name}] [PULLING] 5 ${err}`);
            });

            console.log(`[${migration.id}] [${server.name}] [PULLING] Done with ${successCount} members pulled`);
            
            if (await getMigration(migration.id).then((m) => m?.status === "PULLING")) await updateMigration(migration.id, "SUCCESS", successCount, bannedCount, maxGuildsCount, invalidCount, errorCount, blacklistedCount);

            resolve();
        }).then(async () => {
            console.log(`[${migration.id}] [${server.name}] Pulling done with ${successCount} members pulled`);

            if (await getMigration(migration.id).then((m) => m?.status === "PULLING")) await updateMigration(migration.id, "SUCCESS", successCount, bannedCount, maxGuildsCount, invalidCount, errorCount, blacklistedCount);

            await prisma.servers.update({
                where: {
                    id: server.id
                },
                data: {
                    pulling: false,
                }
            }).then(() => {
                console.log(`[${migration.id}] [${server.name}] [PULLING] Set pulling to false`);
            }).catch((err: Error) => {
                console.error(`[${migration.id}] [${server.name}] [PULLING] 6 ${err}`);
            });
        }).catch((err: Error) => {
            console.error(`[${migration.id}] [PULLING] 3 ${err}`);
        });

        let esimatedTime: any = ((pullCount < members.length) ? pullCount : members.length) * (1500 + delay); 
        esimatedTime = formatEstimatedTime(esimatedTime);
            
        return res.status(200).json({ success: true, message: `Started Pull Process, this will take around ${esimatedTime}`, time: esimatedTime, code: 200 });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);