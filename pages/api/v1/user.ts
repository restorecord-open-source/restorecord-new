import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../src/rate-limit";
import { prisma } from "../../../src/db";
import { compare, hash } from "bcrypt";
import { getBrowser, getIPAddress, getPlatform } from "../../../src/getIPAddress";
import Email from "../../../src/email";
import { backups, customBots, servers } from "@prisma/client";
import * as speakeasy from "speakeasy";
import { generateQRUrl } from "../../../src/functions";
import axios from "axios";

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 500, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findFirst({ where: { id: valid.id } });
                const servers = await prisma.servers.findMany({ where: { ownerId: valid.id } });
                const backups = await prisma.backups.findMany({ where: { guildId: { in: servers.map(s => s.guildId) } } });
                const customBots = await prisma.customBots.findMany({ where: { ownerId: valid.id } });

                if (!account) return res.status(400).json({ success: false, message: "No account found." });

                const allBackups = backups.map(async(backup) => {
                    const channelCount = await prisma.channels.count({ where: { backupId: backup.backupId } });
                    const roleCount = await prisma.roles.count({ where: { backupId: backup.backupId } });
                    const guildMemberCount = await prisma.guildMembers.count({ where: { backupId: backup.backupId } });

                    return {
                        id: backup.id,
                        name: backup.serverName,
                        backupId: backup.backupId,
                        guildId: backup.guildId.toString(),
                        channels: channelCount,
                        roles: roleCount,
                        guildMembers: guildMemberCount,
                        createdAt: backup.createdAt
                    }
                })

                return res.status(200).json({ 
                    success: true,
                    id: account.id,
                    username: account.username,
                    role: account.role,
                    ...(account.admin === true && { admin: true }),
                    createdAt: account.createdAt,
                    expiry: account.expiry,
                    tfa: account.twoFactor,
                    servers: servers.map(server => ({
                        id: server.id,
                        name: server.name,
                        guildId: server.guildId.toString(),
                        roleId: server.roleId.toString(),
                        picture: server.picture,
                        description: server.description,
                        webhook: server.webhook,
                        bgImage: server.bgImage,
                        themeColor: server.themeColor,
                        vpncheck: server.vpncheck,
                        createdAt: server.createdAt
                    })),
                    backups: await Promise.all(allBackups),
                    bots: customBots.map((bot: customBots) => ({
                        id: bot.id,
                        name: bot.name,
                        clientId: bot.clientId.toString(),
                        botToken: bot.botToken,
                        publicKey: bot.publicKey,
                        botSecret: bot.botSecret,
                        customDomain: bot.customDomain ? bot.customDomain : null,
                    })),
                });
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                else console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "POST":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findFirst({
                    where: {
                        id: valid.id
                    }
                });

                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const { password, newPassword, newPassword2, confirmCode } = req.body;

                if (!password || !newPassword || !newPassword2) return res.status(400).json({ success: false, message: "Missing fields." });

                if (newPassword !== newPassword2) return res.status(400).json({ success: false, message: "Passwords do not match." });

                if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
                if (newPassword.length > 32) return res.status(400).json({ success: false, message: "Password must be less than 32 characters." });

                if (!await compare(password, account.password)) return res.status(400).json({ success: false, message: "Incorrect password." });

                if (password === newPassword) return res.status(400).json({ success: false, message: "New password cannot be the same as the old password." });

                const lEmail = await prisma.emails.findFirst({
                    where: {
                        accountId: account.id,
                        title: "Password Change",
                        createdAt: {
                            gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
                        },
                        used: true,
                    }
                });

                if (lEmail) return res.status(400).json({ success: false, message: "You can change your password every 24 hours, contact support if you need it to be changed right now." });

                const newHash = await hash(newPassword, 10);

                if (!confirmCode) {
                    const code = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");

                    await prisma.emails.create({
                        data: {
                            accountId: account.id,
                            title: "Password Change",
                            code: code,
                            expires: new Date(Date.now() + 30 * 60 * 1000)
                        }
                    });

                    await Email.send({
                        // "Messages": [
                        //     {
                        //         "From": {
                        //             "Email": "noreply@restorecord.com",
                        //             "Name": "RestoreCord",
                        //         },
                        //         "To": [
                        //             {
                        //                 "Email": account.email,
                        //                 "Name": account.username,
                        //             },
                        //         ],
                        //         "Subject": "Password Change Confirmation",
                        //         "HTMLPart": 
                        to: account.email,
                        from: "no-reply@restorecord.com",
                        subject: "Password Change Confirmation",
                        html:
                        `
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <title>RestoreCord</title>
                            </head>
                            <body>
                            	<h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                            		RestoreCord
                            	</h1>
                            	<div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                    <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                        Password Change Confirmation
                            		</h2>
                            		<div>
                                           <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                            				Hello ${account.username},
                                            To confirm that you want to change your password, please enter the following code into the RestoreCord website (The code will expire in 30 minutes):
                                            <br />
                                            <b>${code}</b>
                                            <br />
                                            <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                            				<b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                            				If this was not you, you can safely ignore this email.
                                            If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                            <br />
                                            Sincerely,
                                            RestoreCord
                            			</p>
                            		</div>
                                    <div style="text-align: center; margin-top: 1rem;">
                                        <em style="color: rb(190, 198, 213)">
                                            Copyright © 2023 RestoreCord. All rights reserved.
                                        </em>
                                    </div>
                            	</div>
                            </body>
                        </html>
                        `,
                    }).then(() => {
                        console.log(`[EMAIL] [${new Date().toLocaleString()}] Confirmation code sent to ${account.email}.`);
                        return res.status(200).json({ success: true, message: "Confirmation code sent." });
                    }).catch((err: any) => {
                        console.error(err);
                    })
                } else {

                    const email = await prisma.emails.findFirst({
                        where: {
                            accountId: account.id,
                            code: confirmCode,
                        },
                    });

                    if (!email || email.expires < new Date()) return res.status(400).json({ success: false, message: "Invalid confirmation code." });

                    if (email.used) return res.status(400).json({ success: false, message: "Confirmation code already used." });

                    await prisma.emails.update({
                        where: {
                            id: email.id
                        },
                        data: {
                            expires: new Date(Date.now() - 1),
                            used: true
                        }
                    });
                    
                    await axios.get(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(async (res) => {
                        await Email.send({
                            // "Messages": [
                            //     {
                            //         "From": {
                            //             "Email": "noreply@restorecord.com",
                            //             "Name": "RestoreCord",
                            //         },
                            //         "To": [
                            //             {
                            //                 "Email": account.email,
                            //                 "Name": account.username,
                            //             },
                            //         ],
                            //         "Subject": "RestoreCord Password Changed",
                            //         "HTMLPart": 
                            to: account.email,
                            from: "no-reply@restorecord.com",
                            subject: "RestoreCord Password Changed",
                            html:
                            `
                                <!DOCTYPE html>
                                <html>
                                	<head>
                                		<title>RestoreCord</title>
                                	</head>
                                	<body>
                                		<h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                                			RestoreCord
                                		</h1>
                                		<div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                            <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                				Your password has been changed
                                			</h2>
                                			<div>
                                                <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                					Hello ${account.username},
                                					You password has been changed on ${new Date().toLocaleString()} (local time).
                                                    <br />
                                					<b style="font-weight: 600">Location:</b> Near ${res.data.city}, ${res.data.region}, ${res.data.country}
                                                    <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                					<b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                					If this was not you, contact us immediately at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a> or <a style="color: rgb(56,189, 248);" href="https://t.me/restorecord">RestoreCord Telegram</a>.
                                                    If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                                    <br />
                                                    Sincerely,
                                                    RestoreCord
                                				</p>
                                			</div>
                                            <div style="text-align: center; margin-top: 1rem;">
                                                <em style="color: rb(190, 198, 213)">
                                                    Copyright © 2023 RestoreCord. All rights reserved.
                                                </em>
                                            </div>
                                		</div>
                                	</body>
                                </html>
                            `,
                        }).then(() => {
                            console.log(`[EMAIL] [${new Date().toLocaleString()}] Password changed for ${account.username} (${account.email})`);
                        }).catch((err: any) => {
                            console.error(err);
                        })
                    });

                    await prisma.accounts.update({
                        where: {
                            id: account.id
                        },
                        data: {
                            password: newHash
                        }
                    });

                    await prisma.sessions.deleteMany({
                        where: {
                            accountId: account.id
                        }
                    });

                    return res.status(200).json({ success: true, message: "Password changed, you will be logged out." });
                }
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                else console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "PATCH":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findFirst({
                    where: {
                        id: valid.id
                    }
                });

                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const { password, code } = req.body;

                // check if password and code exist in req.body array
                if (typeof password !== "string" || typeof code !== "string") return res.status(400).json({ success: false, message: "Missing password or code." });


                if (!await compare(password, account.password)) return res.status(400).json({ success: false, message: "Incorrect password." });
                

                if (!code) {
                    if (account.googleAuthCode) {
                        const qrcodeUrl = generateQRUrl(account.googleAuthCode, account.username);
                        return res.status(200).json({ success: true, message: "2FA Requested", secret: account.googleAuthCode, url: qrcodeUrl });
                    } else {
                        const secret = speakeasy.generateSecret({
                            issuer: "RestoreCord",
                            name: account.username,
                            length: 64,
                        });
                    
                        const qrcodeUrl = generateQRUrl(secret.base32, account.username);

                        await prisma.accounts.update({
                            where: {
                                id: account.id
                            },
                            data: {
                                googleAuthCode: secret.base32
                            }
                        });

                        return res.status(200).json({ success: true, message: "2FA Requested", secret: secret.base32, url: qrcodeUrl });
                    }
                } else {
                    if (!account.googleAuthCode) return res.status(400).json({ success: false, message: "2FA not enabled." });

                    const verified = speakeasy.totp.verify({
                        secret: account.googleAuthCode,
                        encoding: "base32",
                        token: code,
                    });

                    if (!verified) return res.status(400).json({ success: false, message: "Invalid 2FA code." });

                    if (!account.twoFactor) {
                        await axios.get(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(async (res) => {
                            await Email.send({
                                to: account.email,
                                from: "no-reply@restorecord.com",
                                subject: "RestoreCord Two-Factor Authentication Enabled",
                                html:
                                `
                                    <!DOCTYPE html>
                                    <html>
                                    	<head>
                                    		<title>RestoreCord</title>
                                    	</head>
                                    	<body>
                                    		<h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                                    			RestoreCord
                                    		</h1>
                                    		<div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                                <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                    				Two-Factor Authentication enabled
                                    			</h2>
                                    			<div>
                                                    <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                    					Hello ${account.username},
                                                        Two-Factor Authentication has been enabled on your account on ${new Date().toLocaleString()} (local time).
                                                        <br />
                                    					<b style="font-weight: 600">Location:</b> Near ${res.data.city}, ${res.data.region}, ${res.data.country}
                                                        <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                    					<b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                    					If this was not you, contact us immediately at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a> or <a style="color: rgb(56,189, 248);" href="https://t.me/restorecord">RestoreCord Telegram</a>.
                                                        If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                                        <br />
                                                        Sincerely,
                                                        RestoreCord
                                    				</p>
                                    			</div>
                                                <div style="text-align: center; margin-top: 1rem;">
                                                    <em style="color: rb(190, 198, 213)">
                                                        Copyright © 2023 RestoreCord. All rights reserved.
                                                    </em>
                                                </div>
                                    		</div>
                                    	</body>
                                    </html>
                                `,
                            }).then(() => {
                                console.log(`[EMAIL] [${new Date().toLocaleString()}] Sent 2FA enabled email to ${account.email}`);
                            }).catch((err: any) => {
                                console.error(err);
                            })
                        });

                        await prisma.accounts.update({
                            where: {
                                id: account.id
                            },
                            data: {
                                twoFactor: true
                            }
                        });
                    }

                    
                    await prisma.logs.create({
                        data: {
                            title: "2FA Enabled",
                            body: `Enabled 2FA for ${account.username} (${account.email})`,
                        }
                    });
                    
                    await prisma.sessions.deleteMany({
                        where: {
                            accountId: account.id
                        }
                    });

                    return res.status(200).json({ success: true, message: "2FA Successfully Enabled" });
                }
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                else console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}
