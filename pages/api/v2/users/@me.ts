import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { NextApiRequest, NextApiResponse } from "next";
import { createRedisInstance } from "../../../../src/Redis";

const redis = createRedisInstance();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = req.headers.authorization as string;
            
            const cached = await redis.get(`bot:${token}`);
            if (cached) return res.status(200).json(JSON.parse(cached));

            await axios.get("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `${token}`,
                },
                validateStatus: () => true,
                proxy: false,
                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
            }).then(async (response) => {
                if (response.status === 200) await redis.set(`bot:${token}`, JSON.stringify(response.data), "EX", 60 * 30);

                return res.status(200).json(response.data);
            }).catch((error) => {
                return res.status(400).json({ success: false, message: error.message });
            });
        } catch (e) {
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
}