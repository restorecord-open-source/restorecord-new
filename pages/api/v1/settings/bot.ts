import { NextApiRequest, NextApiResponse } from "next";
import { verify, sign } from "jsonwebtoken";
import dotenv from "dotenv";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";
dotenv.config({ path: "../../" });

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) { 
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                await limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });

                const data = { ...req.body };

                if (!data.botName || !data.botToken || !data.botSecret || !data.clientId) return res.status(400).json({ success: false, message: "Missing required fields." });
                if (isNaN(Number(data.clientId))) return res.status(400).json({ success: false, message: "Invalid clientId." });


                const bot = await prisma.customBots.findFirst({
                    where: {
                        OR: [
                            { name: data.botName },
                            { clientId: BigInt(data.clientId) as bigint },
                            { botSecret: data.botSecret },
                            { botToken: data.botToken },
                        ],
                    },
                });

                if (bot?.clientId === BigInt(data.clientId)) return res.status(400).json({ success: false, message: "Client Id is already in use" });
                if (bot?.botSecret.toLowerCase() === data.botSecret.toLowerCase()) return res.status(400).json({ success: false, message: "Client Secret is already in use" });
                if (bot?.botToken.toLowerCase() === data.botToken.toLowerCase()) return res.status(400).json({ success: false, message: "Bot Token is already in use" });

                const botData = await axios.get(`https://discord.com/api/users/@me`, {
                    headers: {
                        Authorization: `Bot ${data.botToken}`,
                    },
                    validateStatus: () => true,
                    proxy: false, 
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
                });

                if (botData.status != 200) return res.status(400).json({ success: false, message: "Invalid Bot Token" });

                if (botData.data.id != data.clientId) return res.status(400).json({ success: false, message: "Client Id does not match the Bots Client Id" });

                const accountBot = await prisma.customBots.findMany({
                    where: {
                        ownerId: user.id,
                    }
                });

                if (user.role === "free") if (accountBot.length >= 1) return res.status(400).json({ success: false, message: "You can't have more than 1 bot." });
                if (user.role === "premium") if (accountBot.length >= 5) return res.status(400).json({ success: false, message: "You can't have more than 5 bots." });
                if (data.publicKey && user.role !== "business") return res.status(400).json({ success: false, message: "This feature is only available to Business subscribers." });
                

                const newBot = await prisma.customBots.create({
                    data: {
                        name: data.botName,
                        clientId: BigInt(data.clientId),
                        botSecret: data.botSecret,
                        botToken: data.botToken,
                        ownerId: user.id,
                        publicKey: data.publicKey,
                    }
                });

                return res.status(200).json({ success: true, message: "Bot created successfully", bot: {
                    id: newBot.id,
                    name: newBot.name,
                    clientId: newBot.clientId.toString(),
                    botSecret: newBot.botSecret,
                    botToken: newBot.botSecret,
                } });
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "PATCH": 
            try {
                await limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });

                const data = { ...req.body };

                if (!data.botName || !data.botSecret || !data.botToken || !data.newBotName || !data.newBotSecret || !data.newBotToken) {
                    let errors = [];

                    if (!data.botName) errors.push("Bot Name");
                    if (!data.botSecret) errors.push("Client Secret");
                    if (!data.botToken) errors.push("Bot Token");

                    if (!data.newBotName) errors.push("New Bot Name");
                    if (!data.newBotSecret) errors.push("New Client Secret");
                    if (!data.newBotToken) errors.push("New Bot Token");

                    return res.status(400).json({ success: false, message: `Missing ${errors}` });
                }

                const multipleCheck = await prisma.customBots.findFirst({
                    where: {
                        OR: [
                            { name: data.newBotName },
                            { botSecret: data.newBotSecret },
                            { botToken: data.newBotToken },
                        ],
                    },
                });

                if (multipleCheck) {
                    if (data.newBotName !== data.botName) { 
                        if (multipleCheck.name.toLowerCase() === data.newBotName.toLowerCase()) return res.status(400).json({ success: false, message: "Bot name is already in use" }); 
                    }
                    if (data.newBotSecret !== data.botSecret) {
                        if (multipleCheck.botSecret === data.newBotSecret) return res.status(400).json({ success: false, message: "Bot Secret is already in use" });
                    }
                    if (data.newBotToken !== data.botToken) {
                        if (multipleCheck.botToken === data.newBotToken) return res.status(400).json({ success: false, message: "Bot Token is already in use" });
                    }
                }

                const oldBot = await prisma.customBots.findFirst({
                    where: {
                        AND: [
                            { name: data.botName },
                            { botSecret: data.botSecret },
                            { botToken: data.botToken },
                            { ownerId: user.id },
                        ],
                    },
                });

                if (!oldBot) return res.status(400).json({ success: false, message: "Bot not found" });


                const botData = await axios.get(`https://discord.com/api/users/@me`, {
                    headers: {
                        Authorization: `Bot ${data.newBotToken}`,
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
                            { name: data.botName },
                            { botSecret: data.botSecret },
                            { botToken: data.botToken },
                        ],
                    },
                });

                if (!bot) return res.status(400).json({ success: false, message: "Server not found" });

                const newBot = await prisma.customBots.update({
                    where: {
                        id: bot.id,
                    },
                    data: {
                        name: data.newBotName,
                        botSecret: data.newBotSecret,
                        botToken: data.newBotToken,
                        publicKey: data.newPublicKey,
                        customDomain: data.newCustomDomain,
                    }
                });
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
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
        case "DELETE":
            try {
                await limiter.check(res, 15, "CACHE_TOKEN"); 
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });

                const data = { ...req.query };

                if (!data.id) return res.status(400).json({ success: false, message: "Missing Bot ID" });

                const bot = await prisma.customBots.findFirst({
                    where: {
                        id: Number(data.id) as number,
                        ownerId: user.id,
                    },
                });
                
                if (!bot) return res.status(400).json({ success: false, message: "Bot not found" });


                const servers = await prisma.servers.findMany({
                    where: {
                        customBotId: bot.id,
                    },
                });

                if (servers.length > 0) {
                    return res.status(400).json({ success: false, message: "Please Delete the following servers on RestoreCord dashboard, then try again", servers: servers.map((s) => s.id) });
                }

                await prisma.customBots.delete({
                    where: {
                        id: bot.id,
                    },
                }).then(() => {
                    return res.status(200).json({ success: true, message: "Bot successfully deleted" });
                }).catch((err) => {
                    console.error(err);
                    return res.status(400).json({ success: false, message: "Something went wrong" });
                });
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
        }
    });
}

export default withAuthentication(handler);