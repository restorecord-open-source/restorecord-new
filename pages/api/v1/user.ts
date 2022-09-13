import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../src/rate-limit";
import { prisma } from "../../../src/db";
import { compare, hash } from "bcrypt";
import { getBrowser, getIPAddress, getPlatform } from "../../../src/getIPAddress";
import { Email } from "../../../src/email";

const limiter = rateLimit({
    interval: 60 * 1000,
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

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, } }); 

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });
                
                prisma.accounts.findFirst({
                    where: {
                        id: valid.id
                    }
                }).then((account: any) => {
                    if (!account) return res.status(400).json({ success: false });

                    prisma.servers.findMany({
                        where: {
                            ownerId: account.id
                        }
                    }).then((servers: any) => {
                        prisma.customBots.findMany({
                            where: {
                                ownerId: account.id
                            }
                        }).then((bots: any) => {
                            return res.status(200).json({
                                success: true,
                                id: account.id,
                                username: account.username,
                                email: account.email,
                                role: account.role,
                                admin: account.admin,
                                pfp: account.pfp,
                                createdAt: account.createdAt,
                                expiry: account.expiry,
                                servers: servers.map((server: any) => {
                                    return {
                                        id: server.id,
                                        name: server.name,
                                        guildId: server.guildId.toString(),
                                        roleId: server.roleId.toString(),
                                        picture: server.picture,
                                        description: server.description,
                                        webhook: server.webhook,
                                        bgImage: server.bgImage,
                                        vpncheck: server.vpncheck,
                                        createdAt: server.createdAt
                                    }
                                }),
                                bots: bots.map((bot: any) => {
                                    return {
                                        id: bot.id,
                                        name: bot.name,
                                        clientId: bot.clientId.toString(),
                                        botToken: bot.botToken,
                                        publicKey: bot.publicKey,
                                        botSecret: bot.botSecret,
                                    }
                                })
                            });
                        });
                    });
                });   
            }
            catch (err: any) {
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "POST":
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
                        }
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

                    await Email.post("send", {'version': 'v3.1',}).request({
                        "Messages": [
                            {
                                "From": {
                                    "Email": "noreply@restorecord.com",
                                    "Name": "RestoreCord",
                                },
                                "To": [
                                    {
                                        "Email": account.email,
                                        "Name": account.username,
                                    },
                                ],
                                "Subject": "Password Change Confirmation",
                                "HTMLPart": 
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
                                                    Copyright © 2022 RestoreCord. All rights reserved.
                                                </em>
                                            </div>
                                    	</div>
                                    </body>
                                </html>
                                `,
                            }
                        ]
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "Confirmation code sent." });
                        // console.log("Email sent");
                    }).catch((err: any) => {
                        console.error(err);
                    })
                } else {

                    const email = await prisma.emails.findFirst({
                        where: {
                            accountId: account.id,
                            code: confirmCode,
                        }
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
                    
                    fetch(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`)
                        .then(res => res.json())
                        .then(async (data) => {
                            await Email.post("send", {'version': 'v3.1',}).request({
                                "Messages": [
                                    {
                                        "From": {
                                            "Email": "noreply@restorecord.com",
                                            "Name": "RestoreCord",
                                        },
                                        "To": [
                                            {
                                                "Email": account.email,
                                                "Name": account.username,
                                            },
                                        ],
                                        "Subject": "RestoreCord Password Changed",
                                        "HTMLPart": 
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
                                    					<b style="font-weight: 600">Location:</b> Near ${data.city}, ${data.region}, ${data.country}
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
                                                        Copyright © 2022 RestoreCord. All rights reserved.
                                                    </em>
                                                </div>
                                    		</div>
                                    	</body>
                                    </html>
                                `,
                                    }
                                ]
                            }).then(() => {
                                // console.log("Email sent");
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
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
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
