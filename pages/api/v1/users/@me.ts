import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../../src/rate-limit";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        switch (req.method) {
        case "GET":
            try {
                if (!req.headers.authorization) return res.status(400).json({ success: false, message: "No authorization header provided" });
                const token = req.headers.authorization as string;

                // rate limits
                limiter.check(res, 60, "CACHE_TOKEN");

                // send a request to discord.com/api/users/@me
                await axios.get("https://discord.com/api/users/@me", {
                    headers: {
                        Authorization: `${token}`,
                    },
                    validateStatus: () => true,
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
                }).then(async (response) => {
                    // if the request was successful, return the user object
                    return res.status(200).json(response.data);
                }).catch((error) => {
                    // if the request failed, return the error
                    return res.status(400).json({ success: false, message: error.message });
                });
            } catch (e) {
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        default:
            return res.status(405).json({ success: false, message: "Method not allowed" });
        }
    });
}