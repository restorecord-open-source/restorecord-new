import { NextApiRequest, NextApiResponse } from "next";
import { sign } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";
import { getIPAddress, getBrowser, getPlatform } from "../../../../src/getIPAddress";
import { ProxyCheck } from "../../../../src/proxycheck";
import Email from "../../../../src/email";
import * as speakeasy from "speakeasy";
import axios from "axios";
dotenv.config({ path: "../../" });


const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") 
        return res.status(405).json({ success: false, message: "Method not allowed" });

    try {
        limiter.check(res, 60, "CACHE_TOKEN");
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });

        const data = { ...req.body };

        if (!req.query.token) {
            if (!data) return res.status(400).json({ message: "Please provide all fields" });
            if (!data.email || !data.captcha) return res.status(400).json({ message: "Missing email or captcha" });

            await fetch(`https://hcaptcha.com/siteverify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `response=${data.captcha}&secret=${process.env.HCAPTCHA_SECRET}`
            })
                .then(res => res.json())
                .then(res => {
                    if (!res.success) { console.log(res); throw new Error("Invalid captcha"); }
                });
                
            const account = await prisma.accounts.findFirst({ where: { email: data.email } });
            if (!account) return res.status(400).json({ message: "Account not found" });

            const resetToken = sign({
                id: account.id, 
                email: account.email,
            }, process.env.JWT_SECRET!, { expiresIn: "1h" });

            await prisma.logs.create({
                data: {
                    title: "Requested Password Reset",
                    body: `${account.username} requested password reset from ${getIPAddress(req)}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
                }
            });

            await prisma.emails.create({
                data: {
                    title: "Password Reset",
                    code: resetToken,
                    expires: new Date(new Date().getTime() + 60 * 60 * 1000),
                    accountId: account.id,
                }
            });


            await axios.get(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(async (res) => {
                await Email.send({
                    to: account.email,
                    from: {
                        email: "no-reply@restorecord.com",
                        name: "RestoreCord"
                    },
                    subject: "Password Reset",
                    text: `Hello ${account.username},\n\nA Password reset has been requested, from ${res.data.city ?? "Unknown City"}, ${res.data.region ?? "Unknown Region"}, ${res.data.country ?? "Unknown Country"}.\n\nIf this was not you, you can safely ignore this email.\n\nRegards,\nRestoreCord`,
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
                                    <div style="padding: 1rem; border-radius: 0.75rem; background: rgb(250, 250, 250);">
                                        <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                            Password Reset
                                        </h2>
                                        <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                            Hello ${account.username},
                                            <br />
                                            You have requested a password reset, click the link below to reset your password.
                                            <a href="https://restorecord.com/forgot?token=${resetToken}" style="color: rgb(79, 70, 229); text-decoration: none; font-weight: 600; font-size: 1rem;">
                                                Reset Password
                                            </a>
                                            Please note that this link will expire in 1 hour.
                                            <br />
                                            <b style="font-weight: 600">Location:</b> Near ${res.data.city ?? "Unknown City"}, ${res.data.region ?? "Unknown Region"}, ${res.data.country ?? "Unknown Country"}
                                            <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                            <b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                            If you did not request this, you can safely ignore this email.
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
                }).then((res: any) => {
                    console.log(`[EMAIL] [${new Date().toLocaleString()}] Password Reset Email Sent to ${account.email}`);
                }).catch((err: any) => {
                    console.error(err);
                })
            });

            return res.status(200).json({
                success: true,
                message: "Reset link sent to your email",
            });
        } else {
            if (!data.newPassword) return res.status(400).json({ success: false, message: "New password is required" });

            const email = await prisma.emails.findFirst({ where: { code: `${req.query.token}` } });
            if (!email) return res.status(400).json({ message: "Invalid Reset Link" });
            if (email.expires < new Date()) return res.status(400).json({ message: "Reset Link Expired" });
            if (email.used === true) return res.status(400).json({ message: "Reset Link Already Used" });

            const account = await prisma.accounts.findFirst({ where: { id: email.accountId } });
            if (!account) return res.status(400).json({ message: "Account not found" });

            const password = await bcrypt.hash(data.newPassword, await bcrypt.genSalt(10));

            await prisma.sessions.deleteMany({ where: { accountId: account.id } });
            await prisma.accounts.update({ where: { id: account.id }, data: { password } });
            await prisma.emails.update({ where: { id: email.id }, data: { used: true } });

            await prisma.logs.create({
                data: {
                    title: "Reset Password",
                    body: `${account.username} reset their password from ${getIPAddress(req)}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
                }
            });

            await axios.get(`https://ipinfo.io/${getIPAddress(req)}/json?token=${process.env.IPINFO_TOKEN}`).then(async (res) => {
                await Email.send({
                    to: account.email,
                    from: {
                        email: "no-reply@restorecord.com",
                        name: "RestoreCord"
                    },
                    subject: "Password Changed",
                    text: `Hello ${account.username},\n\nYour Password has been Changed, from ${res.data.city ?? "Unknown City"}, ${res.data.region ?? "Unknown Region"}, ${res.data.country ?? "Unknown Country"}.\n\nIf this was not you, please contact us at support@restorecord.com\n\nRegards,\nRestoreCord`,
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
                                <div style="padding: 1rem; border-radius: 0.75rem; background: rgb(250, 250, 250);">
                                    <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                        Password Changed
                                    </h2>
                                    <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                        Hello ${account.username},
                                        Your Password has been Changed
                                        <br />
                                        <b style="font-weight: 600">Location:</b> Near ${res.data.city ?? "Unknown City"}, ${res.data.region ?? "Unknown Region"}, ${res.data.country ?? "Unknown Country"}
                                        <b style="font-weight: 600">Device:</b> ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})
                                        <b style="font-weight: 600">IP:</b> ${getIPAddress(req)} <br />
                                        If this was not you, please contact us at <a href="mailto:support@restorecord.com">support@restorecord.com</a>.
                                        <br />
                                        Having a hard time remembering your password? We recommend using a the password manager like <a href="https://www.bitwarden.com/">Bitwarden</a> (Open Source, Free, and Cross Platform)
                                        Just a reminder:
                                        <ul style="margin-top: 0.5rem; margin-bottom: 0.5rem; padding-left: 1.25rem; list-style: disc;">
                                            <li style="margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">Do not share your password with anyone.</li>
                                            <li style="margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">Do not use the same password for multiple accounts.</li>
                                            <li style="margin-bottom: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">Do not use a password that is easy to guess, or that contains personal information.</li>
                                        </ul>
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
                }).then((res: any) => {
                    console.log(`[EMAIL] [${new Date().toLocaleString()}] Password Changed Email Sent to ${account.email}`);
                }).catch((err: any) => {
                    console.error(err);
                })
            });

            return res.status(200).json({
                success: true,
                message: "Password has been changed successfully",
            });
        }
    }
    catch (err: any) {
        console.error(err);
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
        if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.errors[0] });
        return res.status(500);
    } 
}