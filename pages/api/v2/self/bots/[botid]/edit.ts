import { NextApiRequest, NextApiResponse } from "next";
import { HttpsProxyAgent } from "https-proxy-agent";
import { accounts } from "@prisma/client";

import dotenv from "dotenv";
import axios from "axios";
dotenv.config({ path: "../../" });

import { prisma } from "../../../../../../src/db";
import withAuthentication from "../../../../../../src/withAuthentication";
import { createRedisInstance } from "../../../../../../src/Redis";

const redis = createRedisInstance();

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) { 
    return new Promise(async resolve => {
        switch (req.method) {
        case "PATCH": 
            try {
                const { botName, botSecret, botToken, newBotName, newBotSecret, newBotToken, newCustomDomain, newPublicKey } = req.body;

                const requiredFields = ["botName", "botSecret", "botToken", "newBotName", "newBotSecret", "newBotToken"];
                const missingFields = requiredFields.filter(field => !req.body[field]);
                
                if (missingFields.length > 0) {
                    const message = `Missing ${missingFields.join(", ")}`;
                    return res.status(400).json({ success: false, message });
                }
                
                const multipleCheck = await prisma.customBots.findFirst({
                    where: {
                        OR: [
                            { name: newBotName },
                            { botSecret: newBotSecret },
                            { botToken: newBotToken }
                        ]
                    }
                });
                
                if (multipleCheck) {
                    const errors = [];
                    if (newBotName !== botName && multipleCheck.name.toLowerCase() === newBotName.toLowerCase())    errors.push("Bot name is already in use");
                    if (newBotSecret !== botSecret && multipleCheck.botSecret === newBotSecret)                     errors.push("Bot Secret is already in use");
                    if (newBotToken !== botToken && multipleCheck.botToken === newBotToken)                         errors.push("Bot Token is already in use");
                    
                    if (errors.length > 0) return res.status(400).json({ success: false, message: errors.join(", ") });
                }
                
                const oldBot = await prisma.customBots.findFirst({
                    where: {
                        name: botName,
                        botSecret: botSecret,
                        botToken: botToken,
                        ownerId: user.id
                    }
                });
                
                if (!oldBot)
                    return res.status(400).json({ success: false, message: "Bot not found" });

                const botData = await axios.get(`https://discord.com/api/users/@me`, {
                    headers: {
                        Authorization: `Bot ${newBotToken}`,
                    },
                    validateStatus: () => true,
                    proxy: false, 
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
                });

                if (botData.status != 200) return res.status(400).json({ success: false, message: "Invalid Bot Token" });
                if (botData.data.id != oldBot.clientId.toString()) return res.status(400).json({ success: false, message: "Token does not match the Bots Client Id" });

                const bot = await prisma.customBots.findFirst({
                    where: {
                        AND: [
                            { ownerId: user.id },
                            { name: botName },
                            { botSecret: botSecret },
                            { botToken: botToken },
                        ],
                    },
                });

                if (!bot) return res.status(400).json({ success: false, message: "Server not found" });

                if (newCustomDomain && (newCustomDomain.startsWith("https://") || newCustomDomain.startsWith("http://") || newCustomDomain.endsWith("/") || newCustomDomain.includes(" ") || newCustomDomain.length > 191)) {
                    return res.status(400).json({ success: false, message: "Custom Domain does not meet requirements" });
                }

                const newBot = await prisma.customBots.update({
                    where: { id: bot.id, },
                    data: {
                        name: newBotName,
                        botSecret: newBotSecret,
                        botToken: newBotToken,
                        publicKey: newPublicKey,
                        customDomain: newCustomDomain,
                    }
                });

                await prisma.servers.updateMany({
                    where: { customBotId: bot.id, },
                    data: { customBotId: newBot.id, }
                });

                await redis.del(`customBot:${newBot.id}`);

                return res.status(200).json({ success: true, message: "Bot successfully Updated", bot: {
                    id: newBot.id,
                    name: newBot.name,
                    clientId: newBot.clientId.toString(),
                    botSecret: newBot.botSecret,
                    botToken: newBot.botSecret,
                } });
            }
            catch (err: any) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
        case "POST":
            try {
                const { domain } = req.body;
                if (!domain) return res.status(400).json({ success: false, message: "Domain not provided" });
                if (!domain.match(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,256}$/)) return res.status(400).json({ success: false, message: "Invalid domain" });

                const bot = await prisma.customBots.findFirst({ where: { clientId: BigInt(req.query.botid as any), ownerId: user.id } });
                if (!bot) return res.status(400).json({ success: false, message: "Bot not found" });

                const hn_check = await axios.get(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/custom_hostnames`, {
                    headers: {
                        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
                    },
                    validateStatus: () => true,
                });

                const matchingDomain = hn_check.data.result.find((d: any) => d.hostname === domain);

                if (matchingDomain) {
                    if (matchingDomain.status === "pending") {
                        const ownership_verification = matchingDomain.ownership_verification;
                        const ssl = matchingDomain.ssl;

                        return res.status(200).json({ success: true, warning: true, message: "Verification pending, add the following DNS records to your domain. It may take up to 24 hours for the records to update.", status: matchingDomain.status, verification: { type: ownership_verification.type, name: ownership_verification.name, value: ownership_verification.value, }, validation: { name: ssl.txt_name, value: ssl.txt_value }, });
                    } else if (matchingDomain.ssl.status === "pending_validation") {
                        const ssl = matchingDomain.ssl;

                        return res.status(200).json({ success: true, warning: true, message: "Verification pending, add the following DNS records to your domain. It may take up to 24 hours for the records to update.", status: matchingDomain.status, validation: { name: ssl.txt_name, value: ssl.txt_value }, });
                    } else if (matchingDomain.status === "active" && matchingDomain.ssl.status === "active") {
                        await prisma.customBots.update({
                            where: { id: bot.id, },
                            data: { customDomain: domain, },
                        });

                        return res.status(200).json({ success: true, message: "Successfully verified domain", status: matchingDomain.status, });
                    }
                }

                const response = await axios.post(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/custom_hostnames`, {
                    hostname: domain,
                    ssl: {
                        method: "txt",
                        type: "dv",
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
                    },
                    validateStatus: () => true,
                });

                if (!response.data.success)
                    return res.status(400).json({ success: false, message: "Something went wrong" });

                const ownership_verification = response.data.result.ownership_verification;
                const ssl = response.data.result.ssl;

                if (ssl.status === "initializing")
                    return res.status(200).json({ success: true, message: `Verification requested, add the following DNS records to your domain. It may take up to 24 hours for the records to update.`,status: ssl.status, verification: { type: ownership_verification.type, name: ownership_verification.name, value: ownership_verification.value, }, });

                return res.status(200).json({ success: true, message: "Verification required", verification: { type: ownership_verification.type, name: ownership_verification.name, value: ownership_verification.value, }, validation: { name: ssl.txt_name, value: ssl.txt_value }, });
            } catch (err: any) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            
        default: return res.status(405).json({ success: false, message: "Method not allowed" });
        }
    });
}

export default withAuthentication(handler);