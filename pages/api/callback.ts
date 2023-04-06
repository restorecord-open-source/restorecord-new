import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";
import { getIPAddress } from "../../src/getIPAddress";
import { addMember, addRole, exchange, resolveUser, sendWebhookMessage, sleep } from "../../src/Migrate";
import { ProxyCheck } from "../../src/proxycheck";
import { createRedisInstance } from "../../src/Redis";

const redis = createRedisInstance();

function handler(req: NextApiRequest, res: NextApiResponse) {
    let domain: any = null;
    let code: any = null;
    let state: any = null;
    let userId: any = null;

    let serverInfo: any = null;
    let customBotInfo: any = null;

    return new Promise(async (resolve, reject) => {
        code = req.query.code;
        state = req.query.state;

        if (!code || !state) return reject(10401 as any);
        if (!Number.isInteger(Number(state))) return reject(10401 as any);

        const IPAddr: any = getIPAddress(req);
        const guildId: any = BigInt(req.query.state as any);

        serverInfo = await redis.get(`server:${guildId}`);
        if (serverInfo) { serverInfo = JSON.parse(serverInfo); }
        else { 
            serverInfo = await prisma.servers.findUnique({ where: { guildId: guildId } });
            serverInfo.guildId = serverInfo.guildId.toString();
            serverInfo.roleId = serverInfo.roleId.toString();

            await redis.set(`server:${guildId}`, JSON.stringify(serverInfo), "EX", 60 * 30);
        }
        if (!serverInfo) return reject(10004 as any);

        customBotInfo = await redis.get(`customBot:${serverInfo.customBotId}`);
        if (customBotInfo) { customBotInfo = JSON.parse(customBotInfo); }
        else {
            customBotInfo = await prisma.customBots.findUnique({ where: { id: serverInfo.customBotId } });
            customBotInfo.clientId = customBotInfo.clientId.toString();

            await redis.set(`customBot:${serverInfo.customBotId}`, JSON.stringify(customBotInfo), "EX", 60 * 60 * 3);
        }
        if (!customBotInfo) return reject(10002 as any);

        domain = customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host;

        if (serverInfo.locked) {
            return res.redirect(`https://${domain}/verify/${state}`);
        }

        exchange(code as string, `https://${domain}/api/callback`, customBotInfo.clientId, customBotInfo.botSecret).then(async (respon) => {
            if (respon.status !== 200) return reject(10001 as any);
            if (!respon.data.access_token) return reject(990001 as any);

            const account = await resolveUser(respon.data.access_token);
            if (!account || account === null) return reject(10001 as any);

            const serverOwner = await prisma.accounts.findUnique({ where: { id: serverInfo.ownerId } });
            if (!serverOwner) return res.status(400).json({ success: false, message: "No server owner found" });

            userId = BigInt(account.id as any);

            const blacklistEntries = await prisma.blacklist.findMany({ where: { guildId: guildId } });
            const pCheck = await ProxyCheck.check(IPAddr, { vpn: true, asn: true });

            for (const entry of blacklistEntries) {
                if (entry.type === 0 && entry.value === String(userId) as string) {
                    return reject(990031 as any);
                } else if (entry.type === 1 && entry.value === String(IPAddr) as string) {
                    return reject(990032 as any);
                } else if (entry.type === 2 && entry.value === String(pCheck[IPAddr].asn).replace("AS", "") as string && serverOwner.role === "business") {
                    return reject(990033 as any);
                } else if (entry.type === 3 && entry.value === String(pCheck[IPAddr].isocode)) {
                    return reject(990034 as any);
                }
            }

            // res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
            // res.redirect(`https://${domain}/verify/${state}`);
                
            if (serverInfo.webhook) {
                const isProxy = serverInfo.vpncheck && pCheck[IPAddr].proxy === "yes";
                
                if (isProxy) {
                    await sendWebhookMessage(serverInfo.webhook, "Failed VPN Check", serverOwner, pCheck, IPAddr, account, 0);
                    return reject(990044 as any);
                }
                
                await sendWebhookMessage(serverInfo.webhook, "Successfully Verified", serverOwner, pCheck, IPAddr, account);
            }

            await addMember(guildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, [BigInt(serverInfo.roleId).toString()]).then(async (resp) => {
                let status = resp?.response?.status || resp?.status;
                    
                console.log(`[${guildId}] [${account.username}#${account.discriminator}] ${status} ${JSON.stringify(resp?.data ? resp?.data : resp?.response?.data) ?? null}`);

                switch (status) {
                case 201:
                    res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                    return res.redirect(`https://${domain}/verify/${state}`);
                case 204:
                    await addRole(guildId.toString(), userId.toString(), customBotInfo.botToken, serverInfo.roleId.toString()).then(async (response) => {
                        console.log(`[${guildId}] [${account.username}] Adding Role... ${response?.response?.status || response?.status} ${JSON.stringify(response?.data ? response?.data : response?.response?.data) ?? null}`);
                            
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
                case 403:
                    return reject(990403 as any);
                case 401:
                    return reject(990401 as any);
                case 429:
                    await sleep(resp?.response?.data?.retry_after ? resp?.response?.data?.retry_after : 1000);
                    await addMember(guildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, [BigInt(serverInfo.roleId).toString()]).then(async (resp) => {
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
                    ip: IPAddr ?? "127.0.0.1",
                    username: account.username + "#" + account.discriminator,
                    avatar: account.avatar ? account.avatar : ((account.discriminator as any) % 5).toString(),
                    isp: pCheck[IPAddr].organisation ? pCheck[IPAddr].organisation : null,
                    state: pCheck[IPAddr].region ? pCheck[IPAddr].region : null,
                    city: pCheck[IPAddr].city ? pCheck[IPAddr].city : null,
                    country: pCheck[IPAddr].country ? pCheck[IPAddr].country : null,
                    vpn: pCheck[IPAddr].proxy === "yes" ? true : false,
                    createdAt: new Date(),
                },
                update: {
                    accessToken: respon.data.access_token,
                    refreshToken: respon.data.refresh_token,
                    ip: IPAddr ?? "127.0.0.1",
                    username: account.username + "#" + account.discriminator,
                    avatar: account.avatar ? account.avatar : ((account.discriminator as any) % 5).toString(),
                    isp: pCheck[IPAddr].organisation ? pCheck[IPAddr].organisation : null,
                    state: pCheck[IPAddr].region ? pCheck[IPAddr].region : null,
                    city: pCheck[IPAddr].city ? pCheck[IPAddr].city : null,
                    country: pCheck[IPAddr].country ? pCheck[IPAddr].country : null,
                    vpn: pCheck[IPAddr].proxy === "yes" ? true : false,
                    createdAt: new Date(),
                },
            });


        });
    }).catch((err: any) => {
        let errorCode: number = 0;
        let error: string = String(err?.message || err) as string;

        if (error.match(/^\d+$/)) errorCode = parseInt(error);

        console.error(`[ERROR] [VERIFY1] ${error} | ${errorCode}`)

        switch (errorCode) {
        case 10001:
            return res.status(400).json({ code: err.message, message: "Unknown user" });
        case 10002:
            return res.status(400).json({ code: err.message, message: "Unknown application" });
        case 10004:
            return res.status(400).json({ code: err.message, message: "Unknown guild" });
        case 10401:
            return res.status(400).json({ code: err.message, message: "Wrongly formatted request" });
        case 990001:
            return res.status(400).json({ code: err.message, message: "Server not setup correctly", help: "https://docs.restorecord.com" });
        case 990031:
            res.setHeader("Set-Cookie",`RC_err=307 RC_errStack=Your Discord Account is blacklisted in this server.; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        case 990032:
            res.setHeader("Set-Cookie",`RC_err=307 RC_errStack=Your IP-Address is blacklisted in this server.; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        case 990033:
            res.setHeader("Set-Cookie",`RC_err=307 RC_errStack=Your ISP is blacklisted in this server.; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        case 990034:
            res.setHeader("Set-Cookie",`RC_err=307 RC_errStack=Your Country is blacklisted in this server.; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        case 990044:
            res.setHeader("Set-Cookie", `RC_err=306; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        case 990401:
            res.setHeader("Set-Cookie", `RC_err=401; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        case 990403:
            res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        case 990404:
            res.setHeader("Set-Cookie", `RC_err=404; Path=/; Max-Age=5;`);
            return res.redirect(`https://${domain}/verify/${state}`);
        default:
            return res.status(500).json({ code: err.message, message: "Internal Server Error" });
        }
    });
}

export default handler;