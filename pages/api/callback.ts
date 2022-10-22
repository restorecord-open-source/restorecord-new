import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../src/db";
import { getIPAddress } from "../../src/getIPAddress";
import { addMember, addRole, exchange, resolveUser } from "../../src/Migrate";
import { ProxyCheck } from "../../src/proxycheck";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        const { code, state } = req.query;
        const IPAddr: any = getIPAddress(req);

        if (!code || !state) {
            const missing = [];
            if (!code) missing.push("Discord OAuth2 Code");
            if (!state) missing.push("Guild Id");
            return res.status(400).json({ success: false, message: `Missing ${missing.join(", ")}`, });
        }

        if (!Number.isInteger(Number(state))) {
            return res.status(400).json({ success: false, message: "Invalid Guild Id", });
        }

        const rGuildId: any = BigInt(req.query.state as any);


        const serverInfo = await prisma.servers.findUnique({
            where: {
                guildId: rGuildId,
            },
        });

        if (!serverInfo) return res.status(400).json({ success: false, message: "No server info" });

        const customBotInfo = await prisma.customBots.findUnique({
            where: {
                id: serverInfo?.customBotId,
            },
        });

        if (!customBotInfo) return res.status(400).json({ success: false, message: "No custom bot info" });
        

        console.log(`Verify Attempt: ${serverInfo.name}, ${code}, ${req.headers.host}, ${customBotInfo?.clientId}, ${customBotInfo?.botSecret}`);

        exchange(code as string, `https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/api/callback`, customBotInfo?.clientId, customBotInfo?.botSecret).then(async (respon) => {
            if (respon.status === 200) {
                let account = respon.data.access_token ? await resolveUser(respon.data.access_token) : null;

                const userId: any = BigInt(account?.id as any);

                if (!account) return res.status(400).json({ success: false, message: "Took too long to verify. (No account info)" });

                if (account) {
                    const user = await prisma.members.findFirst({
                        where: {
                            AND: [
                                { guildId: rGuildId },
                                { userId: userId },
                            ]
                        },
                    });

                    const serverOwner = await prisma.accounts.findFirst({
                        where: {
                            id: serverInfo.ownerId,
                        },
                    });

                    if (!serverOwner) return res.status(400).json({ success: false, message: "No server owner found" });


                    // if (!user) {
                    if (serverInfo.webhook) {
                        const createdAt: number = account.id / 4194304 + 1420070400000;
                        const pCheck = await ProxyCheck.check(IPAddr, { vpn: true, asn: true });

                        if (serverInfo.vpncheck && pCheck[IPAddr].proxy === "yes") {
                            let operator = pCheck[IPAddr].operator.url ? `[\`${pCheck[IPAddr].operator.name}\`](${pCheck[IPAddr].operator.url})` : pCheck[IPAddr].operator.name;

                            await axios.post(serverInfo.webhook, {
                                content: `<@${userId}> (${account.username}#${account.discriminator})`,
                                embeds: [
                                    {
                                        title: "Failed VPN Check",
                                        timestamp: new Date().toISOString(),
                                        color: 0xff0000,
                                        author: {
                                            name: `${account.username}#${account.discriminator}`,
                                            url: `https://discord.id/?prefill=${account.id}`,
                                            icon_url: account.avatar ? `https://cdn.discordapp.com/avatars/${account.id}/${account.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${account.discriminator % 5}.png`,
                                        },
                                        fields: [
                                            {
                                                name: ":bust_in_silhouette: User:",
                                                value: `${userId}`,
                                                inline: true,   
                                            },
                                            {
                                                name: ":earth_americas: Client IP:",
                                                value: `||${IPAddr}||`,
                                                inline: true,
                                            }, 
                                            {
                                                name: ":clock1: Account Age:",
                                                value: `<t:${Math.floor(createdAt / 1000)}:R>`,
                                                inline: true,
                                            },
                                            {
                                                name: `:flag_${pCheck[IPAddr].isocode.toLowerCase()}: IP Info:`,
                                                value: `**Country:** \`${pCheck[IPAddr].country}\`\n**Provider:** \`${pCheck[IPAddr].provider}\``,
                                                inline: true,
                                            },
                                            {
                                                name: serverOwner.role === "business" ? ":globe_with_meridians: Connection Info:" : "",
                                                value: serverOwner.role === "business" ? `**Type**: \`${pCheck[IPAddr].type}\`\n**VPN**: \`${pCheck[IPAddr].proxy}\`\n**Operator**: ${operator}` : "",
                                                inline: serverOwner.role === "business" ? true : false,
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                proxy: false,
                                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
                            }).catch(err => {
                                if (err.response.status === 404) {
                                    console.log(`${serverInfo?.webhook?.split("/")[5]} Webhook not found`);
                                }
                            });

                            res.setHeader("Set-Cookie", `RC_err=306; Path=/; Max-Age=5;`);
                            return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                        }
                        else {
                            if (!user) {
                                await axios.post(serverInfo.webhook, {
                                    content: `<@${userId}> (${account.username}#${account.discriminator})`,
                                    embeds: [
                                        {
                                            title: "Successfully Verified",
                                            timestamp: new Date().toISOString(),
                                            color: 0x52ef52,
                                            author: {
                                                name: `${account.username}#${account.discriminator}`,
                                                url: `https://discord.id/?prefill=${account.id}`,
                                                icon_url: account.avatar ? `https://cdn.discordapp.com/avatars/${account.id}/${account.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${account.discriminator % 5}.png`,
                                            },
                                            fields: [
                                                {
                                                    name: ":bust_in_silhouette: User:",
                                                    value: `${userId}`,
                                                    inline: true,   
                                                },
                                                {
                                                    name: ":earth_americas: Client IP:",
                                                    value: `||${IPAddr}||`,
                                                    inline: true,
                                                }, 
                                                {
                                                    name: ":clock1: Account Age:",
                                                    value: `<t:${Math.floor(createdAt / 1000)}:R>`,
                                                    inline: true,
                                                },
                                                {
                                                    name: `:flag_${pCheck[IPAddr].isocode.toLowerCase()}: IP Info:`,
                                                    value: `**Country:** \`${pCheck[IPAddr].country}\`\n**Provider:** \`${pCheck[IPAddr].provider}\``,
                                                    inline: true,
                                                },
                                                {
                                                    name: ":globe_with_meridians: Connection Info:",
                                                    value: `**Type**: \`${pCheck[IPAddr].type}\`\n**VPN**: \`${pCheck[IPAddr].proxy}\``,
                                                    inline: true,
                                                }
                                            ]
                                        }
                                    ],
                                }, {
                                    proxy: false,
                                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
                                }).catch(err => {
                                    if (err.response.status === 404) {
                                        console.log(`${serverInfo?.webhook?.split("/")[5]} Webhook not found`);
                                    }
                                });
                            }
                        }
                    }
                    // }

                    addMember(rGuildId.toString(), userId.toString(), customBotInfo?.botToken, respon.data.access_token, [BigInt(serverInfo?.roleId).toString()]).then(async (resp) => {
                        console.log(`${account?.username} adding member ${resp?.status} (${rGuildId.toString()}, ${userId.toString()}, ${respon.data.access_token}, ${[BigInt(serverInfo?.roleId).toString()]})`);
                        if (resp?.status === 403 || resp?.response?.status === 403 || resp?.response?.data?.code === "50013") {
                            res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`);
                            return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                        }
                        else if (resp?.status === 204 || resp?.response?.status === 204) {
                            await addRole(rGuildId.toString(), userId.toString(), customBotInfo?.botToken, serverInfo?.roleId.toString()).then(async (response) => {
                                console.log(`${account?.username} adding role: ${response?.status} (${rGuildId.toString()}, ${userId.toString()}, ${serverInfo?.roleId.toString()})`);
                                if (response.status !== 204) {
                                    res.setHeader("Set-Cookie", `RC_err=403; Path=/; Max-Age=5;`);
                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                } else if (response.status === 204) {
                                    res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                } else {
                                    return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                                }
                            }).catch((err) => {
                                console.error(`addRole: ${err}`);
                            })
                        } else {
                            res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                            return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
                        }
                    }).catch((err) => {
                        console.error(`addMember ${err}`);
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
                                avatar: account.avatar ? account.avatar : (account.discriminator as any % 5).toString(),
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
                                avatar: account.avatar ? account.avatar : (account.discriminator as any % 5).toString(),
                                createdAt: new Date(),
                            },
                        });
                    }

                    // res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                    // return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);


                    // res.setHeader("Set-Cookie", `verified=true; Path=/; Max-Age=3;`);
                    // return res.redirect(`https://restorecord.com/verify/${state}`);
                }

                // res.setHeader("Set-Cookie", `RC_err=000; Path=/; Max-Age=3;`);
                // return res.redirect(`https://${customBotInfo.customDomain ? customBotInfo.customDomain : req.headers.host}/verify/${state}`);
            }
            else {
                let error_detail;
                const err = respon?.response?.data?.error;
                const err_des = respon?.response?.data?.error_description;

                console.log(respon?.response?.data);
                

                if (err?.includes("redirect_uri") || err_des?.includes("redirect_uri")) {
                    error_detail = "Redirect is missing, follow this: https://docs.restorecord.com/guides/create-a-custom-bot/#setup-oauth2-redirect"
                } else if (err?.includes("invalid_client")) {
                    error_detail = "Bot secret is missing and/or invalid, please reset it on Discord and update the bot on Restorecord."
                } else if (err?.includes("invalid_request")) {
                    error_detail = "Verification took too long, please try again."
                } else {
                    error_detail = "Took too long to verify, please try again."
                }

                return res.status(400).json({
                    status: "error",
                    message: error_detail,
                });
            }
        });
    });
}
