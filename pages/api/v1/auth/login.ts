import { NextApiRequest, NextApiResponse } from "next";
import { sign } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";
import { getIPAddress, getBrowser, getPlatform } from "../../../../src/getIPAddress";
import { ProxyCheck } from "../../../../src/proxycheck";
import { Email } from "../../../../src/email";
import * as speakeasy from "speakeasy";
dotenv.config({ path: "../../" });


const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") 
        return res.status(405).json({ message: "Method not allowed" });

    try {
        limiter.check(res, 30, "CACHE_TOKEN");
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });

        const data = { ...req.body };
        let tokenExpiry: string = "30d";

        if (!data.username || !data.password) {
            return res.status(400).json({ message: "Missing username or password" });
        }
        
        if (data.username.length < 3 || data.username.length > 30) {
            return res.status(400).json({ message: "Username must be between 3 and 30 characters" });
        }

        if (!data) return res.status(400).json({ message: "Please provide all fields" });

        const account = await prisma.accounts.findFirst({ where: { username: data.username.toLowerCase() } });

        if (!account) return res.status(400).json({ message: "Account not found" });

        const isValid = await bcrypt.compare(data.password, account.password);
        if (!isValid) return res.status(400).json({ message: "Some Credentials are incorrect" });

        if ((account.twoFactor && account.googleAuthCode) && !data.totp) return res.status(400).json({ message: "2FA Code Required" });

        if (account.twoFactor && account.googleAuthCode) {
            const totpVerify = speakeasy.totp.verify({
                secret: account.googleAuthCode,
                encoding: "base32",
                token: data.totp
            });

            if (!totpVerify) return res.status(400).json({ message: "Invalid 2FA Code" });

            tokenExpiry = "7d";
        }

        if (account.banned) return res.status(400).json({ message: "Account is Banned. Contact: admin@restorecord.com" });

        const token = sign({ id: account.id }, `${process.env.JWT_SECRET}`, { expiresIn: tokenExpiry });

        await prisma.sessions.create({
            data: {
                accountId: account.id,
                token: token,
            }
        });

        await prisma.accounts.update({
            where: {
                id: account.id
            },
            data: {
                lastIp: getIPAddress(req),
            }
        });

        await prisma.logs.create({
            data: {
                title: "New Login",
                body: `${account.username} logged in from ${getIPAddress(req)}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
            }
        });

        if ((account.lastIp ?? "") !== getIPAddress(req)) {
            fetch(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(res => res.json()).then(async (data) => {
                await Email.post("send", {'version': 'v3.1' }).request({
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
                            "Subject": "New Login Detected",
                            "TextPart": `Hello ${account.username},\n\nA new login was detected from ${data.city ?? "Unknown City"}, ${data.region ?? "Unknown Region"}, ${data.country ?? "Unknown Country"}.\n\nIf this was not you, please change your password immediately.\n\nRegards,\nRestoreCord`,
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
                                        <div style="padding: 1rem; border-radius: 0.75rem; background: rgb(250, 250, 250);">
                                            <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                                Login Detected
                                            </h2>
                                            <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                                Hello ${account.username},
                                                <br />
                                                We have noticed that you have logged in from a new location.
                                                <b style="font-weight: 600">Location:</b> Near ${data.city}, ${data.region}, ${data.country}
                                                <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                                <b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                                If this was not you, please change your password immediately.
                                            </p>
                                            <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                                Regards,
                                                RestoreCord
                                            </p>
                                            <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                                <small style="color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 0.75rem;">
                                                    This email was sent to ${account.email} because you have an account on RestoreCord. If you did not create an account, please ignore this email or <a href="mailto:contact@restorecord.com">contact us</a>.
                                                </small>
                                            </p>
                                        </div>
                                    </body>
                                </html>
                            `,
                        }
                    ]
                }).catch((err: any) => {
                    console.error(err);
                })
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
        });
    }
    catch (err: any) {
        console.error(err);
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
        if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.errors[0] });
        return res.status(500);
    } 
}