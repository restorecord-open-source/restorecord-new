import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";
import { getIPAddress } from "../../src/getIPAddress";
import { User, addMember, addRole, exchange, resolveUser, sendWebhookMessage, sleep, snowflakeToDate } from "../../src/Migrate";
import { ProxyCheck } from "../../src/proxycheck";
import { createRedisInstance } from "../../src/Redis";
import { IntlRelativeTime } from "../../src/functions";

const redis = createRedisInstance();

const whitelist: any = [
    "853405459616497664", // @bl4ckbl1zz__
    "830866889885745233", // @xenos1337_
    "1194146833723838525", // zebratic_
];

function isSnowflake(value: string): boolean {
    return /^\d{16,19}$/.test(value);
}

function handler(req: NextApiRequest, res: NextApiResponse) {
    let domain: any = null;
    let code: any = null;
    let state: any = null;
    let userId: any = null;

    let serverInfo: any = null;
    let customBotInfo: any = null;
    let serverOwner: any = null;

    let pCheck: any = null;

    return new Promise(async (resolve, reject) => {
        code = req.query.code;
        state = req.query.state;

        if (!code || !state) return reject(10401 as any);
        if (!Number.isInteger(Number(state)) || !isSnowflake(state)) return reject(10401 as any);

        const IPAddr: any = getIPAddress(req);
        const guildId: any = BigInt(req.query.state as any);

        serverInfo = await redis.get(`server:${guildId}`);
        if (serverInfo) { serverInfo = JSON.parse(serverInfo); }
        else { 
            serverInfo = await prisma.servers.findUnique({
                select: {
                    name: true,
                    guildId: true,
                    customBotId: true,
                    roleId: true,
                    webhook: true,
                    ipLogging: true,
                    captcha: true,
                    blockAlts: true,
                    locked: true,
                    vpncheck: true,
                    ownerId: true,
                    blockWireless: true,
                    minAccountAge: true,
                    authorizeOnly: true,
                },
                where: { guildId: guildId  } 
            });
            if (!serverInfo) return reject(10004 as any);

            serverInfo.guildId = serverInfo.guildId.toString();
            serverInfo.roleId = serverInfo.roleId.toString();

            await redis.set(`server:${guildId}`, JSON.stringify(serverInfo), "EX", 60 * 30);
        }
        if (!serverInfo) return reject(10004 as any);


        customBotInfo = await redis.get(`customBot:${serverInfo.customBotId}`);
        if (customBotInfo) { customBotInfo = JSON.parse(customBotInfo); }
        else {
            customBotInfo = await prisma.customBots.findUnique({
                select: {
                    clientId: true,
                    botSecret: true,
                    botToken: true,
                    customDomain: true,
                },
                where: { id: serverInfo.customBotId  } 
            });
            if (!customBotInfo) return reject(10002 as any);
            
            customBotInfo.clientId = customBotInfo.clientId.toString();

            await redis.set(`customBot:${serverInfo.customBotId}`, JSON.stringify(customBotInfo), "EX", 60 * 60);
        }
        if (!customBotInfo) return reject(10002 as any);

        domain = customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host;

        if (serverInfo.locked) return res.redirect(`https://${domain}/verify/${state}`);

        exchange(code as string, `https://${domain}/api/callback`, customBotInfo.clientId, customBotInfo.botSecret).then(async (respon) => {
            let data = respon.data ? respon.data : respon.response.data;
            if (data.error === "invalid_grant") return res.redirect(`https://${domain}/verify/${state}`);

            if (respon.status !== 200) return res.status(400).json({ code: "10001", message: "Unknown user", help: `please contact server owner: https://docs.restorecord.com/troubleshooting/invalid-bot-secret` });
            if (!respon.data.access_token) return reject(990001 as any);

            serverOwner = await redis.get(`serverOwner:${serverInfo.ownerId}`);
            if (serverOwner) { serverOwner = JSON.parse(serverOwner); }
            else {
                serverOwner = await prisma.accounts.findUnique({
                    select: {
                        userId: true,
                        role: true,
                    },
                    where: { id: serverInfo.ownerId } 
                });
                serverOwner.userId = serverOwner.userId ? serverOwner.userId.toString() : "0";
                
                await redis.set(`serverOwner:${serverInfo.ownerId}`, JSON.stringify(serverOwner), "EX", 60 * 60);
            }
            if (!serverOwner) return res.status(400).json({ success: false, message: "No server owner found" });

            const account: User = await resolveUser(respon.data.access_token);
            if (!account || account === null) return reject(10001 as any);

            userId = BigInt(account.id as any);
            if (whitelist.includes(String(account.id) as string)) {
                console.log(`[WHITELIST] [${guildId}] [${account.username}#${account.discriminator}] ${userId}`);
                serverInfo.ipLogging = false;
            }
            
            if (!serverInfo.authorizeOnly) {
                pCheck = await ProxyCheck.check(IPAddr, { vpn: true, asn: true });
                // if (!pCheck[IPAddr]) return reject(990002 as any);

                const blacklistEntries = await prisma.blacklist.findMany({
                    where: {
                        guildId: guildId,
                        OR: [
                            { type: 0, value: String(userId) },
                            { type: 1, value: String(IPAddr) },
                            { type: 2, value: serverOwner.role === "business" ? String(pCheck[IPAddr].asn).replace("AS", "") : undefined },
                            { type: 3, value: String(pCheck[IPAddr].isocode) },
                        ].filter(entry => entry.value !== undefined),
                    },
                });

                const errorMessages: any = {
                    0: "This user attempted to verify, but is blacklisted in this server.",
                    1: "This user attempted to verify, but their IP is blacklisted in this server.",
                    2: "This user attempted to verify, but their ISP is blacklisted in this server.",
                    3: "This user attempted to verify, but their Country is blacklisted in this server.",
                    4: "This server doesn't allow Wireless Connections, try use WiFi instead.",
                };
              
                for (const entry of blacklistEntries) {
                    const { type } = entry;
                    const errorMessage = errorMessages[type];
              
                    await sendWebhookMessage(serverInfo.webhook, "Attempted Blacklist", errorMessage, serverOwner, pCheck, serverInfo.ipLogging ? IPAddr : null, account, 0);
                    return reject(990031 + type as any);
                }

                if (serverInfo.captcha) {
                    const captcha = await redis.get(`captcha:${userId}`);
                    const alreadyVerified = await prisma.members.findUnique({ select: { id: true }, where: { userId_guildId: { userId: userId, guildId: guildId } } });
                    if (!captcha && !alreadyVerified) {
                        res.setHeader("Set-Cookie", `RC_err=777 RC_errStack=${userId}; Path=/; Max-Age=120;`);
                        return res.redirect(`https://${domain}/verify/${state}`);
                    }
                }
                
                const isProxy = serverInfo.vpncheck && pCheck[IPAddr].proxy === "yes";
                const altCheck = await prisma.members.findMany({ select: { username: true, userId: true }, where: { guildId: guildId, ip: IPAddr, NOT: { userId: userId } }, take: 10 });

                // what the fuck xenos
                // :( there was no other way
                if (isProxy) {
                    serverInfo.webhook ? await sendWebhookMessage(serverInfo.webhook, "Failed VPN Check", null, serverOwner, pCheck, serverInfo.ipLogging ? IPAddr : null, account, 0) : null;
                    return reject(990044 as any);
                } else if (altCheck.length > 0 && (serverOwner.role === "premium" || serverOwner.role === "business" || serverOwner.role === "enterprise")) {
                    serverInfo.webhook ? await sendWebhookMessage(serverInfo.webhook, serverInfo.blockAlts ? "Alt Blocked" : "WARNING: Alt Found", `A user with this IP has already verified with another account(s):\n${altCheck.map((a: any) => `${a.username.replace(/#0+$/, "")} (${a.userId})`).join("\n")}${altCheck.length === 10 ?  "\n_More not displayed_" : null}${serverInfo.blockAlts ? "\n\nThis user has been denied to verify!" : ",\n\nThis user has been allowed to verify, but may be an alt."}`, serverOwner, pCheck, serverInfo.ipLogging ? IPAddr : null, account, serverInfo.blockAlts ? 0 : 2) : null;
                    if (serverInfo.blockAlts) return reject(990045 as any);
                } else if (serverInfo.blockWireless && pCheck[IPAddr].type.toLowerCase() === "wireless") {
                    serverInfo.webhook ? await sendWebhookMessage(serverInfo.webhook, "Blocked Wireless Connection", null, serverOwner, pCheck, serverInfo.ipLogging ? IPAddr : null, account, 0) : null;
                    return reject(990043 as any);
                } else if (serverInfo.minAccountAge && (Date.now() - (await snowflakeToDate(String(account.id))).getTime()) < (serverInfo.minAccountAge * 86400000)) {
                    serverInfo.webhook ? await sendWebhookMessage(serverInfo.webhook, "Blocked Account Age", null, serverOwner, pCheck, serverInfo.ipLogging ? IPAddr : null, account, 0) : null;
                    return reject({ message: "990035", retry_after: IntlRelativeTime(((await snowflakeToDate(String(account.id))).getTime()) + (serverInfo.minAccountAge * 86400000)) });
                } else {
                    serverInfo.webhook ? await sendWebhookMessage(serverInfo.webhook, "Successfully Verified", null, serverOwner, pCheck, serverInfo.ipLogging ? IPAddr : null, account, 1) : null;
                }


                await addMember(guildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, serverInfo.guildId === serverInfo.roleId ? [] : [BigInt(serverInfo.roleId).toString()]).then(async (resp) => {
                    let status = resp?.response?.status || resp?.status;

                    console.log(`[${guildId}] [${account.username}#${account.discriminator}] ${status} ${status.toString().startsWith("4") ? JSON.stringify(resp?.data ? resp?.data : resp?.response?.data) ?? "" : ""}`);

                    switch (status) {
                    case 201:
                        res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                        return res.redirect(`https://${domain}/verify/${state}`);
                    case 204:
                        if (serverInfo.guildId === serverInfo.roleId) {
                            res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                            return res.redirect(`https://${domain}/verify/${state}`);
                        }

                        await addRole(guildId.toString(), userId.toString(), customBotInfo.botToken, serverInfo.roleId.toString()).then(async (response) => {
                            console.log(`[${guildId}] [${account.username}#${account.discriminator}] Adding Role... ${response?.response?.status || response?.status} ${JSON.stringify(response?.data ? response?.data : response?.response?.data) ?? ""}`);

                            switch (response?.response?.status || response?.status) {
                            case 204:
                                res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                                return res.redirect(`https://${domain}/verify/${state}`);
                            case 403:
                                return reject(990403 as any);
                            case 404:
                                return reject(990404 as any);
                            default:
                                res.setHeader("Set-Cookie", `RC_err=${response?.status || response?.response?.status} RC_errStack=${JSON.stringify(response?.data?.message || response?.response?.data?.message)}; Path=/; Max-Age=5;`);
                                console.error(`addRole 0/1: ${response?.status}|${response?.response?.status}|${JSON.stringify(response?.data)}|${JSON.stringify(response?.response?.data)}`);
                                return res.redirect(`https://${domain}/verify/${state}`);
                            }
                        }).catch((err: any) => {
                            err.message = parseInt(err.message);
                            return reject(err.message);
                        });
                        break;

                    case 403: return reject(990403 as any);
                    case 401: return reject(990401 as any);
                    case 429:
                        await sleep(resp?.response?.data?.retry_after ? resp?.response?.data?.retry_after : 1000);
                        await addMember(guildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, serverInfo.guildId === serverInfo.roleId ? [] : [BigInt(serverInfo.roleId).toString()]).then(async (resp) => {
                            switch (resp?.status || resp?.response?.status) {
                            case 204:
                                await addRole(guildId.toString(), userId.toString(), customBotInfo.botToken, serverInfo.roleId.toString()).then(async (response) => {
                                    switch (response?.response?.status || response?.status) {
                                    case 403:
                                        return reject(990403 as any);
                                    case 404:
                                        return reject(990404 as any);
                                    default:
                                        res.setHeader("Set-Cookie", `RC_err=${response?.status || response?.response?.status} RC_errStack=${JSON.stringify(response?.data?.message || response?.response?.data?.message)}; Path=/; Max-Age=5;`);
                                        console.error(`addRole 0/1: ${response?.status}|${response?.response?.status}|${JSON.stringify(response?.data)}|${JSON.stringify(response?.response?.data)}`);
                                        return res.redirect(`https://${domain}/verify/${state}`);
                                    }
                                });
                            }
                        }).catch((err: any) => {
                            err.message = parseInt(err.message);
                            return reject(err);
                        });
                        break;

                    case 400:
                        res.setHeader("Set-Cookie", `RC_err=${resp?.status || resp?.response?.status} RC_errStack=${JSON.stringify(resp?.data?.message || resp?.response?.data?.message)}; Path=/; Max-Age=5;`);
                        return res.redirect(`https://${domain}/verify/${state}`);
                
                    default:
                        res.setHeader("Set-Cookie", `RC_err=${resp?.status || resp?.response?.status} RC_errStack=${JSON.stringify(resp?.data?.message || resp?.response?.data?.message)}; Path=/; Max-Age=5;`);
                        console.error(`addRole 0/1: ${resp?.status}|${resp?.response?.status}|${JSON.stringify(resp?.data)}|${JSON.stringify(resp?.response?.data)}`);
                        return res.redirect(`https://${domain}/verify/${state}`);
                    }
                })
            }

            try {
                await prisma.members.upsert({
                    where: {
                        userId_guildId: {
                            userId: userId,
                            guildId: guildId,
                        },
                    },
                    create: {
                        userId: userId,
                        guildId: guildId,
                        accessToken: respon.data.access_token,
                        refreshToken: respon.data.refresh_token,
                        ip: serverInfo.ipLogging ? (IPAddr ? IPAddr : "127.0.0.1") : null,
                        username: account.username + "#" + account.discriminator,
                        avatar: account.avatar ? account.avatar : ((account.discriminator as any) % 5).toString(),
                        isp: serverInfo.ipLogging ? (pCheck[IPAddr].organisation ? pCheck[IPAddr].organisation : null) : null,
                        state: serverInfo.ipLogging ? (pCheck[IPAddr].region ? pCheck[IPAddr].region : null) : null,
                        city: serverInfo.ipLogging ? (pCheck[IPAddr].city ? pCheck[IPAddr].city : null) : null,
                        country: serverInfo.ipLogging ? (pCheck[IPAddr].country ? pCheck[IPAddr].country : null) : null,
                        vpn: serverInfo.ipLogging ? (pCheck[IPAddr].proxy === "yes" ? true : false) : false,
                        createdAt: new Date(),
                    },
                    update: {
                        accessToken: respon.data.access_token,
                        refreshToken: respon.data.refresh_token,
                        ip: serverInfo.ipLogging ? (IPAddr ? IPAddr : "127.0.0.1") : null,
                        username: account.username + "#" + account.discriminator,
                        avatar: account.avatar ? account.avatar : ((account.discriminator as any) % 5).toString(),
                        isp: serverInfo.ipLogging ? (pCheck[IPAddr].organisation ? pCheck[IPAddr].organisation : null) : null,
                        state: serverInfo.ipLogging ? (pCheck[IPAddr].region ? pCheck[IPAddr].region : null) : null,
                        city: serverInfo.ipLogging ? (pCheck[IPAddr].city ? pCheck[IPAddr].city : null) : null,
                        country: serverInfo.ipLogging ? (pCheck[IPAddr].country ? pCheck[IPAddr].country : null) : null,
                        vpn: serverInfo.ipLogging ? (pCheck[IPAddr].proxy === "yes" ? true : false) : false,
                        createdAt: new Date(),
                    },
                }).then(async (resp) => {
                    if (resp && serverInfo.authorizeOnly) {
                        // return res.json({ success: true, message: `${account.id} has been authorized in ${serverInfo.name}`, code: 200 });
                        res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                        return res.redirect(`https://${domain}/verify/${state}`);
                    }
                });
            } catch (error) {}


        });
    }).catch((err: any) => {
        let errorCode: number = 0;
        let error: string = String(err?.message || err) as string;

        if (error.match(/^\d+$/)) errorCode = parseInt(error);

        // THIS WAY IS SO DUMB BUT IT WORKS SO FUCK YOU
        switch (errorCode) {
        case 10001: return res.status(400).json({ code: err.message, message: "Unknown user" });
        case 10002: return res.status(400).json({ code: err.message, message: "Unknown application" });
        case 10004: return res.status(400).json({ code: err.message, message: "Unknown guild" });
        case 10401: return res.status(400).json({ code: err.message, message: "Wrongly formatted request" });
        case 990001: return res.status(400).json({ code: err.message, message: "Server not setup correctly", help: "https://docs.restorecord.com" });
        case 990002: return res.status(400).json({ code: err.message, message: "Unknown error please try again" });
        case 990031: res.setHeader("Set-Cookie", `RC_err=307 RC_errStack=Your Discord Account is blacklisted in this server.; Path=/; Max-Age=5;`); break;
        case 990032: res.setHeader("Set-Cookie", `RC_err=307 RC_errStack=Your IP-Address is blacklisted in this server.; Path=/; Max-Age=5;`); break;
        case 990033: res.setHeader("Set-Cookie", `RC_err=307 RC_errStack=Your ISP is blacklisted in this server.; Path=/; Max-Age=5;`); break;
        case 990034: res.setHeader("Set-Cookie", `RC_err=307 RC_errStack=Your Country is blacklisted in this server.; Path=/; Max-Age=5;`); break;
        case 990035: res.setHeader("Set-Cookie", `RC_err=400 RC_errStack=Your account is too new to verify in this server try again ${err.retry_after}.; Path=/; Max-Age=5;`); break;
        case 990043: res.setHeader("Set-Cookie", `RC_err=304; Path=/; Max-Age=5;`); break; // WHY????
        case 990045: res.setHeader("Set-Cookie", `RC_err=305; Path=/; Max-Age=5;`); break; // WHY????
        case 990044: res.setHeader("Set-Cookie", `RC_err=306; Path=/; Max-Age=5;`); break; // WHY????
        case 990401: res.setHeader("Set-Cookie", `RC_err=401; Path=/; Max-Age=5;`); break; // WHY????
        case 990403: res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`); break; // WHY????
        case 990404: res.setHeader("Set-Cookie", `RC_err=404; Path=/; Max-Age=5;`); break; // WHY????

        default: return res.status(500).json({ code: err.message, message: "Internal Server Error" }); 
        }

        return res.redirect(`https://${domain}/verify/${state}`);
    });
}

export default handler;