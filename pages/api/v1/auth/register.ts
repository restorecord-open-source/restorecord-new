import { NextApiRequest, NextApiResponse } from "next";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import { prisma } from "../../../../src/db";
import { accounts } from "@prisma/client";
import { getIPAddress, getBrowser, getPlatform } from "../../../../src/getIPAddress";
import { isBreached } from "../../../../src/functions";
dotenv.config({ path: "../../" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

    try {
        const data = {...req.body};

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
        
        if (await isBreached(data.password)) return res.status(400).json({ success: false, message: "Your password has been found in a data breach. For more info: https://haveibeenpwned.com/Passwords" });
        

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

        const accounts: accounts[] = await prisma.accounts.findMany({
            where: {
                OR: [
                    { username: data.username },
                    { email: data.email },
                ]
            }
        });

        if (accounts.length > 0) {
            let errors = [];
            if (accounts.find(account => account.username === data.username)) errors.push("Username");
            if (accounts.find(account => account.email === data.email)) errors.push("Email");

            return res.status(400).json({ success: false, message: `${errors.join(" and ")} already exists` });
        }

        let refUser = null;
        if (data.ref) {
            refUser = await prisma.accounts.findFirst({ where: { referralCode: data.ref } });
        }

        const hashedPassword = await bcrypt.hash(data.password, await bcrypt.genSalt(10));

        const account = await prisma.accounts.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                referrer: refUser?.id,
            },
        });

        await prisma.logs.create({
            data: {
                title: "New Account Created",
                body: `${account.username} created an account from ${getIPAddress(req)}, email: ${account.email}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
            }
        });

        return res.status(200).json({ 
            success: true,
            message: "Account created successfully",
            account: {
                username: account.username,
                email: account.email,
                role: account.role,
                pfp: account.pfp,
                createdAt: account.createdAt,
                lastIp: getIPAddress(req),
            },
        });
    } catch (err: any) {
        console.error(err);
        if (err.name === "ValidationError") return res.status(400).json({ success: false, message: "Please provide all fields" });
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}