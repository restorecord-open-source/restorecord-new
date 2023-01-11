import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";
import { getIPAddress } from "../../src/getIPAddress";
import { addMember, addRole, exchange, resolveUser, sendWebhookMessage } from "../../src/Migrate";
import { ProxyCheck } from "../../src/proxycheck";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        const { code, state } = req.query;

        if (!code || !state) {
            const missing = [];
            if (!code) missing.push("Discord OAuth2 Code (&code=)");
            if (!state) missing.push("Guild Id (&state=)");
            return res.status(400).json({ success: false, message: `Missing ${missing.join(", ")} in url` });
        }

        if (!Number.isInteger(Number(state))) return res.status(400).json({ success: false, message: "Invalid Guild Id" });
       
        const IPAddr: any = getIPAddress(req);
        const rGuildId: any = BigInt(req.query.state as any);

        const serverInfo = await prisma.servers.findUnique({where: { guildId: rGuildId } });
        if (!serverInfo) return res.status(400).json({ success: false, message: "No server info" });

        const customBotInfo = await prisma.customBots.findUnique({where: { id: serverInfo.customBotId } });
        if (!customBotInfo)return res.status(400).json({ success: false, message: "No custom bot info" });

        // console.log(`Verify Attempt: ${serverInfo.name}, ${code}, ${req.headers.host}, ${customBotInfo.clientId}, ${customBotInfo.botSecret}`);

        exchange(code as string, `https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/api/callback`, customBotInfo.clientId, customBotInfo.botSecret)
            .then(async (respon) => {
                if (respon.status === 200) {
                    let account = respon.data.access_token ? await resolveUser(respon.data.access_token) : null;


                    if (!account || account === null) return res.status(400).json({ success: false, message: "Took too long to verify. (No account info)" });
                    if (account) {
                        const userId: any = BigInt(account.id as any);

                        const user = await prisma.members.findFirst({ where: { AND: [ { guildId: rGuildId }, { userId: userId } ] } });

                        const serverOwner = await prisma.accounts.findFirst({ where: { id: serverInfo.ownerId } });
                        if (!serverOwner) return res.status(400).json({ success: false, message: "No server owner found" });

                        const blacklist = await prisma.blacklist.findMany({ where: { guildId: rGuildId } });
                        if (blacklist) {
                            if (blacklist.find((b) => b.type === 0 && b.value === String(userId) as string)) {
                                let reason = blacklist.find((b) => b.type === 0 && b.value === String(userId) as string)?.reason;
                                res.setHeader("Set-Cookie", `RC_err=307 RC_errStack=User: ${String(userId) as string} ${reason ? `Reason: ${reason}` : ""}; Path=/; Max-Age=5;`);
                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                            } else if (blacklist.find((b) => b.type === 1 && b.value === String(IPAddr) as string)) {
                                let reason = blacklist.find((b) => b.type === 1 && b.value === String(IPAddr) as string)?.reason;
                                res.setHeader("Set-Cookie", `RC_err=307 RC_errStack=IP: ${String(IPAddr) as string} ${reason ? `Reason: ${reason}` : ""}; Path=/; Max-Age=5;`);
                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                            } else if (serverOwner.role !== "free") {
                                const proxCheck = await ProxyCheck.check(IPAddr, { vpn: true, asn: true });
                                if (blacklist.find((b) => b.type === 2 && b.value === proxCheck[IPAddr].asn.replace("AS", "") as string)) {
                                    let reason = blacklist.find((b) => b.type === 2 && b.value === proxCheck[IPAddr].asn.replace("AS", "") as string)?.reason;

                                    await sendWebhookMessage(serverInfo?.webhook, "Failed Blacklist Check", serverOwner, proxCheck, IPAddr, account, 0);
                                    
                                    res.setHeader("Set-Cookie", `RC_err=307 RC_errStack=ASN: ${String(proxCheck[IPAddr].asn.replace("AS", "")) as string} ${reason ? `Reason: ${reason}` : ""}; Path=/; Max-Age=5;`);
                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                }
                            }
                        }

                        if (serverInfo.webhook) {
                            const pCheck = await ProxyCheck.check(IPAddr, { vpn: true, asn: true });

                            if (serverInfo.vpncheck && pCheck[IPAddr].proxy === "yes") {
                                await sendWebhookMessage(serverInfo.webhook, "Failed VPN Check", serverOwner, pCheck, IPAddr, account, 0);

                                res.setHeader("Set-Cookie", `RC_err=306; Path=/; Max-Age=5;`);
                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                            } else {
                                if (user) { 
                                    if (Date.now() - new Date(user.createdAt).getTime() > 5000) {
                                        await sendWebhookMessage(serverInfo.webhook, "Successfully Verified (again)", serverOwner, pCheck, IPAddr, account);
                                    } else {}
                                }
                                else { 
                                    await sendWebhookMessage(serverInfo.webhook, "Successfully Verified", serverOwner, pCheck, IPAddr, account);
                                }
                            }
                        }

                        addMember(rGuildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, [BigInt(serverInfo.roleId).toString()])
                            .then(async (resp) => {
                                try {
                                    console.log(`${account?.username} adding member ${resp.status ? resp.status : resp.response.status} (${rGuildId.toString()}, ${userId.toString()}, ${respon.data.access_token}, ${[BigInt(serverInfo.roleId).toString()]})`);

                                    if (resp?.status === 201 || resp?.response?.status === 201 || resp?.status === 204 || resp?.response?.status === 204)
                                    {
                                        if (resp?.status === 204 || resp?.response?.status === 204) 
                                        {
                                            await addRole(rGuildId.toString(), userId.toString(), customBotInfo.botToken, serverInfo.roleId.toString()).then(async (response) => {
                                                console.log(`${account?.username} adding role: ${response?.status || response?.response?.status} (${rGuildId.toString()}, ${userId.toString()}, ${serverInfo.roleId.toString()})`);

                                                switch (response?.status || response?.response?.status) {
                                                case 204:
                                                    res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                case 403:
                                                    res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                case 404:
                                                    res.setHeader("Set-Cookie", `RC_err=404; Path=/; Max-Age=5;`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                default:
                                                    res.setHeader("Set-Cookie", `RC_err=${response?.status || response?.response?.status} RC_errStack=${JSON.stringify(response)}; Path=/; Max-Age=5;`);
                                                    console.error(`addRole 0/1: ${response?.status}|${response?.response?.status}|${JSON.stringify(response?.data)}|${JSON.stringify(response?.response?.data)}`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                }
                                            }).catch((err) => {
                                                console.error(`addRole 1: ${err}`);
                                            });
                                        }
                                        else
                                        {
                                            res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                                            return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                        }
                                    } 
                                    else if (resp?.status === 403 || resp?.response?.status === 403 || resp?.response?.data?.code === "50013") 
                                    {
                                        res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`);
                                        return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                    }
                                    else if (resp?.status === 401 || resp?.response?.status === 401 || resp?.response?.data?.code === "40001") 
                                    {
                                        res.setHeader("Set-Cookie", `RC_err=401; Path=/; Max-Age=5;`);
                                        return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                    } 
                                    else if (resp?.status === 429 || resp?.response?.status === 429 || resp?.response?.data?.retry_after)
                                    {
                                        // try again to add member
                                        setTimeout(async () => {
                                            addMember(rGuildId.toString(), userId.toString(), customBotInfo.botToken, respon.data.access_token, [BigInt(serverInfo.roleId).toString()]).then(async (resp) => {

                                                console.log(`${account?.username} adding member ${resp.status ? resp.status : resp.response.status} (${rGuildId.toString()}, ${userId.toString()}, ${respon.data.access_token}, ${[BigInt(serverInfo.roleId).toString()]})`);
                                        
                                                if (resp?.status === 204 || resp?.response?.status === 204)
                                                {
                                                    await addRole(rGuildId.toString(), userId.toString(), customBotInfo.botToken, serverInfo.roleId.toString())
                                                        .then(async (response) => {
                                                            console.log(`${account?.username} adding role: ${response?.status || response?.response?.status} (${rGuildId.toString()}, ${userId.toString()}, ${serverInfo.roleId.toString()})`);

                                                            switch (response.status) {
                                                            case 204:
                                                                res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                                                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                            case 403:
                                                                res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`);
                                                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                            default:
                                                                res.setHeader("Set-Cookie", `RC_err=${response?.status || response?.response?.status} RC_errStack=${JSON.stringify(response?.data) || JSON.stringify(response?.response?.data)}; Path=/; Max-Age=5;`);
                                                                console.error(`addRole 2/1: ${response?.status}|${response?.response?.status}|${JSON.stringify(response?.data)}|${JSON.stringify(response?.response?.data)}`);
                                                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                            }

                                                        }).catch((err) => {
                                                            console.error(`addRole 2: ${err}`);
                                                        });
                                                }
                                                else 
                                                {
                                                    res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                }
                                            }).catch((err) => {
                                                res.setHeader("Set-Cookie", `RC_err=${err?.status || err?.response?.status} RC_errStack=${JSON.stringify(err?.data) || JSON.stringify(err?.response?.data)}; Path=/; Max-Age=5;`);
                                                console.error(`addMember 1: ${err}`);
                                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                            });
                                        }, resp?.response?.data?.retry_after ? resp?.response?.data?.retry_after : 1000);
                                    }
                                    else if (resp?.status === 400 || resp?.response?.status === 400) {
                                        res.setHeader("Set-Cookie", `RC_err=${resp?.status || resp?.response?.status} RC_errStack=${JSON.stringify(resp?.data) || JSON.stringify(resp?.response?.data)}; Path=/; Max-Age=5;`);
                                        console.error(`addMember 2: ${resp?.status}|${resp?.response?.status}|${JSON.stringify(resp?.data)}|${JSON.stringify(resp?.response?.data)}`);
                                        if (resp?.response?.data?.code === "30001") {
                                            res.setHeader("Set-Cookie", `RC_err=30001; Path=/; Max-Age=5;`);
                                            return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                        } else { return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`); }
                                    }
                                    else
                                    {
                                        if (resp?.response?.data?.code === 30001) {
                                            await addRole(rGuildId.toString(), userId.toString(), customBotInfo.botToken, serverInfo.roleId.toString()).then(async (response) => {
                                                console.log(`${account?.username} adding role: ${response?.status || response?.response?.status} (${rGuildId.toString()}, ${userId.toString()}, ${serverInfo.roleId.toString()})`);

                                                switch (response?.status || response?.response?.status) {
                                                case 204:
                                                    res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                case 403:
                                                    res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                case 404:
                                                    res.setHeader("Set-Cookie", `RC_err=404; Path=/; Max-Age=5;`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                default:
                                                    res.setHeader("Set-Cookie", `RC_err=${response?.status || response?.response?.status} RC_errStack=${JSON.stringify(response)}; Path=/; Max-Age=5;`);
                                                    console.error(`addRole 0/1: ${response?.status}|${response?.response?.status}|${JSON.stringify(response?.data)}|${JSON.stringify(response?.response?.data)}`);
                                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                                }
                                            }).catch((err) => {
                                                console.error(`addRole 1: ${err}`);
                                            });
                                        } else {
                                            res.setHeader("Set-Cookie", `RC_err=${resp?.status || resp?.response?.status} RC_errStack=${JSON.stringify(resp?.data) || JSON.stringify(resp?.response?.data)}; Path=/; Max-Age=5;`);
                                            console.error(`addMember 2: ${resp?.status}|${resp?.response?.status}|${JSON.stringify(resp?.data)}|${JSON.stringify(resp?.response?.data)}`);
                                            if (resp?.response?.data?.code === "30001") {
                                                res.setHeader("Set-Cookie", `RC_err=30001; Path=/; Max-Age=5;`);
                                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                            } else { return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`); }
                                        }
                                    }
                                } catch (err: any) {
                                    res.setHeader("Set-Cookie", `RC_err=${err?.status || err?.response?.status} RC_errStack=${JSON.stringify(err?.data) || JSON.stringify(err?.response?.data)}; Path=/; Max-Age=5;`);
                                    console.error(`addMember 3: ${err}`);
                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                }
                            }).catch((err) => {
                                res.setHeader("Set-Cookie", `RC_err=${err?.status || err?.response?.status} RC_errStack=${JSON.stringify(err?.data) || JSON.stringify(err?.response?.data)}; Path=/; Max-Age=5;`);
                                console.error(`addMember 4: ${err}`);
                                return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                            });

                        if (!user) {
                            await prisma.members.create({
                                data: {
                                    userId: userId,
                                    guildId: rGuildId,
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
                        } else {
                            await prisma.members.update({
                                where: {
                                    userId_guildId: {
                                        userId: userId,
                                        guildId: rGuildId,
                                    },
                                },
                                data: {
                                    accessToken: respon.data.access_token,
                                    refreshToken: respon.data.refresh_token,
                                    ip: IPAddr ?? "127.0.0.1",
                                    username: account.username + "#" + account.discriminator,
                                    avatar: account.avatar ? account.avatar : ((account.discriminator as any) % 5).toString(),
                                    createdAt: new Date(),
                                },
                            });
                        }
                    }
                } else {
                    let error_detail;
                    const err = respon?.response?.data?.error;
                    const err_des = respon?.response?.data?.error_description;

                    console.error(`Verify Error: ${respon?.status}|${respon?.response?.status}|${JSON.stringify(respon?.data)}|${JSON.stringify(respon?.response?.data)}`);

                    if (err?.includes("redirect_uri") || err_des?.includes("redirect_uri")) {
                        error_detail =
						"Redirect is missing, follow this: https://docs.restorecord.com/guides/create-a-custom-bot/#setup-oauth2-redirect";
                    } else if (err?.includes("invalid_client")) {
                        error_detail =
						"Client secret is missing and/or invalid, please reset it on Discord and update the bot on Restorecord.";
                    } else if (err?.includes("invalid_request")) {
                        error_detail = "Verification took too long, please try again.";
                    } else {
                        error_detail = "Took too long to verify, please try again.";
                    }

                    return res.status(400).json({
                        status: "error",
                        message: error_detail,
                    });
                }
            });
    });
}
