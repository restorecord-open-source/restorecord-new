import { NextApiRequest, NextApiResponse } from "next";
import * as bcrypt from "bcrypt";
import { SignupSchema } from "../../../../src/schemas";
import dotenv from "dotenv";
import { prisma } from "../../../../src/db";
import { accounts } from "@prisma/client";
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

        // length check
        if (data.username.length < 3 || data.username.length > 20) return res.status(400).json({ success: false, message: "Username must be between 3 and 20 characters" });
        if (data.password.length < 6 || data.password.length > 20) return res.status(400).json({ success: false, message: "Password must be between 6 and 20 characters" });
        if (data.email.length < 6 || data.email.length > 50) return res.status(400).json({ success: false, message: "Email must be between 6 and 50 characters" });
        

        await fetch(`https://hcaptcha.com/siteverify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `response=${data.captcha}&secret=${process.env.HCAPTCHA_SECRET}`
            })
            .then(res => res.json())
            .then(res => {
                if (!res.success) { console.log(res); throw new Error("Invalid captcha"); }
            }
            );

        const accounts: accounts[] = await prisma.accounts.findMany({
            where: {
                username: data.username
            }
        });

        if (accounts.length > 0) return res.status(400).json({ message: "Username is already in use" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const account = await prisma.accounts.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
            },
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
            },
        });
    } catch (err: any) {
        if (err.name === "ValidationError") return res.status(400).json({ success: false, message: "Please provide all fields" });

        return res.status(400).json({ success: false, message: "Something went wrong" });
    }

}