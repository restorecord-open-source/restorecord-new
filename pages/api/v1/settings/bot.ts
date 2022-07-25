import { NextApiRequest, NextApiResponse } from "next";
import { verify, sign } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";
import axios from "axios";
dotenv.config({ path: "../../" });

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                await limiter.check(res, 5, "CACHE_TOKEN");

                const data = { ...req.body };

                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, } }); 
                const account = await prisma.accounts.findFirst({ where: { id: valid.id, } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });
                if (!data.botName || !data.botToken || !data.botSecret || !data.clientId) return res.status(400).json({ success: false, message: "Missing required fields." });
                if (isNaN(Number(data.clientId))) return res.status(400).json({ success: false, message: "Invalid clientId." });


                const bot = await prisma.customBots.findFirst({
                    where: {
                        OR: [
                            { name: data.botName },
                            { clientId: Number(data.clientId) },
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
                });

                if (botData.status != 200) return res.status(400).json({ success: false, message: "Invalid Bot Token" });

                if (botData.data.id != data.clientId) return res.status(400).json({ success: false, message: "Client Id does not match the Bots Client Id" });

                const accountBot = await prisma.customBots.findMany({
                    where: {
                        ownerId: valid.id,
                    }
                });

                if (account?.role === "free")
                    if (accountBot.length >= 1) return res.status(400).json({ success: false, message: "You can't have more than 1 bot." });
                if (account?.role === "premium")
                    if (accountBot.length >= 5) return res.status(400).json({ success: false, message: "You can't have more than 5 bots." });
                

                const newBot = await prisma.customBots.create({
                    data: {
                        name: data.botName,
                        clientId: BigInt(data.clientId),
                        botSecret: data.botSecret,
                        botToken: data.botToken,
                        ownerId: valid.id,
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
                console.log(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "PATCH": 
            try {
                await limiter.check(res, 5, "CACHE_TOKEN");

                const data = { ...req.body };

                if (!data.botName || !data.botSecret || !data.botToken || !data.newBotName || !data.newBotSecret || !data.newBotToken) {
                    let errors = [];

                    if (!data.botName) errors.push("Bot Name");
                    if (!data.botSecret) errors.push("Bot Secret");
                    if (!data.botToken) errors.push("Bot Token");

                    if (!data.newBotName) errors.push("New Bot Name");
                    if (!data.newBotSecret) errors.push("New Bot Secret");
                    if (!data.newBotToken) errors.push("New Bot Token");

                    return res.status(400).json({ success: false, message: `Missing ${errors}` });
                }

                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, } }); 

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

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


                const botData = await axios.get(`https://discord.com/api/users/@me`, {
                    headers: {
                        Authorization: `Bot ${data.newBotToken}`,
                    },
                    validateStatus: () => true,
                });

                if (botData.status != 200) return res.status(400).json({ success: false, message: "Invalid Bot Token" });

                const bot = await prisma.customBots.findFirst({
                    where: {
                        AND: [
                            { ownerId: valid.id },
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
                console.log(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
        }
    });
}
