import { NextApiRequest, NextApiResponse } from "next";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import { prisma } from "../../../../src/db";
import { accounts } from "@prisma/client";
import { getIPAddress, getXTrack } from "../../../../src/getIPAddress";
import { sign } from "jsonwebtoken";
dotenv.config({ path: "../../" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

    try {
        const data = {...req.body};
        const xTrack = getXTrack(req);
        if (!xTrack) return res.status(400).json({ success: false, message: "Invalid Request" });

        if (!data.username || !data.password || !data.email || !data.captcha) {
            let errors = [];
            if (!data.username) errors.push("Username");
            if (!data.password) errors.push("Password");
            if (!data.email) errors.push("Email");
            if (!data.captcha) errors.push("Captcha");

            return res.status(400).json({ success: false, message: `Missing ${errors}` });
        }
        if (data.username.length < 3 || data.username.length > 20) return res.status(400).json({ success: false, message: "Username must be between 3 and 20 characters" });
        if (data.password.length < 6 || data.password.length > 45) return res.status(400).json({ success: false, message: "Password must be between 6 and 45 characters" });
        if (data.email.length < 6 || data.email.length > 50) return res.status(400).json({ success: false, message: "Email must be between 6 and 50 characters" });
        
        await fetch(`https://hcaptcha.com/siteverify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `response=${data.captcha}&secret=${process.env.HCAPTCHA_SECRET}`
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) { console.error(res); throw new Error("Invalid captcha"); }
            });

        const accounts: accounts[] = await prisma.accounts.findMany({
            where: {
                OR: [
                    { username: data.username.toLowerCase() },
                    { email: data.email.toLowerCase() },
                ]
            }
        });

        if (accounts.length > 0) {
            let errors = [];
            if (accounts.find(account => account.username.toLowerCase() === data.username.toLowerCase())) errors.push("Username");
            if (accounts.find(account => account.email.toLowerCase() === data.email.toLowerCase())) errors.push("Email");

            return res.status(400).json({ success: false, message: `${errors.join(" and ")} already exists` });
        }

        let refUser = null;
        if (data.ref) refUser = await prisma.accounts.findFirst({ where: { referralCode: { contains: data.ref.toLowerCase() } } });

        const hashedPassword = await bcrypt.hash(data.password, await bcrypt.genSalt(10));

        const account = await prisma.accounts.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                referrer: refUser?.id,
                lastIp: getIPAddress(req),
            },
        });

        await prisma.logs.create({
            data: {
                type: 0,
                username: `${account.username} (${account.id}, ${account.email})`,
                ipAddr: getIPAddress(req),
                device: JSON.stringify(xTrack)
            }
        });

        const token = sign({ id: account.id }, `${process.env.JWT_SECRET}`, { expiresIn: "30d" });

        await prisma.sessions.deleteMany({ where: { accountId: account.id, token: token } });
        await prisma.sessions.create({
            data: {
                accountId: account.id,
                token: token,
            }
        });

        await prisma.logs.create({
            data: {
                type: 1,
                username: `${account.username} (${account.id})`,
                ipAddr: getIPAddress(req),
                device: JSON.stringify(xTrack)
            }
        });

        return res.status(200).json({ 
            success: true,
            message: "Account created successfully",
			token: token
        });
    } catch (err: any) {
        console.error(err);
        if (err.name === "ValidationError") return res.status(400).json({ success: false, message: "Please provide all fields" });
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}