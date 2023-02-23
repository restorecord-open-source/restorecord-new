import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";
import { getIPAddress } from "../../src/getIPAddress";
import { addMember, addRole, exchange, resolveUser, sendWebhookMessage, sleep } from "../../src/Migrate";
import { ProxyCheck } from "../../src/proxycheck";

 

function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        try {

            let domain: any = null;
            let code: any = null;
            let state: any = null;
            let userId: any = null;
            let verifiedMember: any = null;

            code = req.query.code;
            state = req.query.state;

            if (!code || !state) throw new Error(10401 as any);
            if (!Number.isInteger(Number(state))) throw new Error(10401 as any);

            const IPAddr: any = getIPAddress(req);
            const guildId: any = BigInt(req.query.state as any);

            const serverInfo = await prisma.servers.findUnique({ where: { guildId: guildId } });
            if (!serverInfo) throw new Error(10004 as any);

            const customBotInfo = await prisma.customBots.findUnique({ where: { id: serverInfo.customBotId } });
            if (!customBotInfo) throw new Error(10002 as any);

            domain = customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host;

            exchange(code as string, `https://${domain}/api/callback`, customBotInfo.clientId, customBotInfo.botSecret).then(async (respon) => {
                if (respon.status !== 200) throw new Error(10001 as any);
                if (!respon.data.access_token) throw new Error(990001 as any);

                const account = await resolveUser(respon.data.access_token);
                if (!account || account === null) throw new Error(10001 as any);


                const serverOwner = await prisma.accounts.findUnique({ where: { id: serverInfo.ownerId } });
                if (!serverOwner) return res.status(400).json({ success: false, message: "No server owner found" });

                userId = BigInt(account.id as any);
                verifiedMember = await prisma.members.findUnique({ where: { userId_guildId: { userId: userId, guildId: guildId } } });

                const blacklistEntries = await prisma.blacklist.findMany({ where: { guildId: guildId } });

                for (const entry of blacklistEntries) {
                    if (entry.type === 0 && entry.value === String(userId) as string) {
                        throw new Error(990031 as any);
                    } else if (entry.type === 1 && entry.value === String(IPAddr) as string) {
                        throw new Error(990032 as any);
                    } else if (serverOwner.role !== "free" && entry.type === 2) {
                        const proxCheck = await ProxyCheck.check(IPAddr, { vpn: true, asn: true });
                        if (entry.value === proxCheck[IPAddr].asn.replace("AS", "") as string) {
                            throw new Error(990033 as any);
                        }
                    }
                }
                
                if (serverInfo.webhook) {
                    const pCheck = await ProxyCheck.check(IPAddr, { vpn: true, asn: true });
                    const isProxy = serverInfo.vpncheck && pCheck[IPAddr].proxy === "yes";
                
                    if (isProxy) {
                        await sendWebhookMessage(serverInfo.webhook, "Failed VPN Check", serverOwner, pCheck, IPAddr, account, 0);
                        throw new Error(990044 as any);
                    }
                
                    const verifiedMsg = verifiedMember ? "Successfully Verified (again)" : "Successfully Verified";
                    await sendWebhookMessage(serverInfo.webhook, verifiedMsg, serverOwner, pCheck, IPAddr, account);
                }

                addMember(guildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, [BigInt(serverInfo.roleId).toString()]).then(async (resp) => {
                    let status = resp?.response?.status || resp?.status;
                    
                    console.log(`[${guildId}] [${account.username}] ${status} ${JSON.stringify(resp?.data ? resp?.data : resp?.response?.data) ?? null}`);

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
                                throw new Error(990403 as any);
                            case 404:
                                throw new Error(990404 as any);
                            default:
                                res.setHeader("Set-Cookie", `RC_err=${response?.status || response?.response?.status} RC_errStack=${JSON.stringify(response?.data?.message)}; Path=/; Max-Age=5;`);
                                console.error(`addRole 0/1: ${response?.status}|${response?.response?.status}|${JSON.stringify(response?.data)}|${JSON.stringify(response?.response?.data)}`);
                                return res.redirect(`https://${domain}/verify/${state}`);
                            }
                        }).catch((err: any) => {
                            err.message = parseInt(err.message);
                            throw new Error(err.message);
                        });
                        break;
                    case 403:
                        throw new Error(990403 as any);
                    case 401:
                        throw new Error(990401 as any);
                    case 429:
                        await sleep(resp?.response?.data?.retry_after ? resp?.response?.data?.retry_after : 1000);
                        await addMember(guildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, [BigInt(serverInfo.roleId).toString()]).then(async (resp) => {
                            switch (resp?.status || resp?.response?.status) {
                            case 204:
                                await addRole(guildId.toString(), userId.toString(), customBotInfo.botToken, serverInfo.roleId.toString()).then(async (response) => {
                                    switch (response?.response?.status || response?.status) {
                                    case 403:
                                        throw new Error(990403 as any);
                                    case 404:
                                        throw new Error(990404 as any);
                                    default:
                                        res.setHeader("Set-Cookie", `RC_err=${response?.status || response?.response?.status} RC_errStack=${JSON.stringify(response?.data?.message)}; Path=/; Max-Age=5;`);
                                        console.error(`addRole 0/1: ${response?.status}|${response?.response?.status}|${JSON.stringify(response?.data)}|${JSON.stringify(response?.response?.data)}`);
                                        return res.redirect(`https://${domain}/verify/${state}`);
                                    }
                                });
                            }
                        }).catch((err: any) => {
                            err.message = parseInt(err.message);
                            throw new Error(err.message);
                        });
                        break;
                    case 400:
                        res.setHeader("Set-Cookie", `RC_err=${resp?.status || resp?.response?.status} RC_errStack=${JSON.stringify(resp?.data?.message)}; Path=/; Max-Age=5;`);
                        console.error(`addMember 0: ${resp?.status}|${resp?.response?.status}|${JSON.stringify(resp?.data)}|${JSON.stringify(resp?.response?.data)}`);
                        return res.redirect(`https://${domain}/verify/${state}`);
                    default:
                        res.setHeader("Set-Cookie", `RC_err=${resp?.status || resp?.response?.status} RC_errStack=${JSON.stringify(resp?.data?.message)}; Path=/; Max-Age=5;`);
                        console.error(`addRole 0/1: ${resp?.status}|${resp?.response?.status}|${JSON.stringify(resp?.data)}|${JSON.stringify(resp?.response?.data)}`);
                        return res.redirect(`https://${domain}/verify/${state}`);
                    }
                }).catch((err: any) => {
                    err.message = parseInt(err.message);

                    switch (err.message) {
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
            }).catch((err: any) => {
                err.message = parseInt(err.message);

                switch (err.message) {
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
        } catch (err: any) {
            err.message = parseInt(err.message);

            switch (err.message) {
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
        }
    }).catch((err: any) => {
        err.message = parseInt(err.message);

        switch (err.message) {
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