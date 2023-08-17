import { NextApiRequest, NextApiResponse } from "next";
import { createRedisInstance } from "../../src/Redis";
import dotenv from "dotenv";
dotenv.config({ path: "../../" });

const redis = createRedisInstance();

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

    try {
        const data = {...req.body};

        if (!data.id || !data.captcha) {
            let errors = [];
            if (!data.id) errors.push("id");
            if (!data.captcha) errors.push("Captcha");

            return res.status(400).json({ success: false, message: `Missing ${errors}` });
        }
        
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

        // add member to captcha db so he can verify without captcha for the next 3 days
        await redis.set(`captcha:${data.id}`, "true", "EX", 60 * 60 * 24 * 3);

        return res.status(200).json({ 
            code: 200,
            success: true,
        });
    } catch (err: any) {
        console.error(err);
        if (err.name === "ValidationError") return res.status(400).json({ success: false, message: "Please provide all fields" });
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}