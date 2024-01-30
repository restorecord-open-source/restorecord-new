import { NextApiRequest, NextApiResponse } from "next";
import { HttpsProxyAgent } from "https-proxy-agent";
import { accounts } from "@prisma/client";

import dotenv from "dotenv";
import axios from "axios";
dotenv.config({ path: "../../" });

import { prisma } from "../../../../../src/db";
import withAuthentication from "../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    switch (req.method) {
    case "POST":
        try {
            const data = { ...req.body };
            const { botName, botToken, botSecret, clientId, publicKey } = data;

            if (!botName || !botToken || !botSecret || !clientId) {
                return res.status(400).json({ success: false, message: "Missing required fields." });
            }

            if (isNaN(Number(clientId))) {
                return res.status(400).json({ success: false, message: "Invalid clientId." });
            }

            const bot = await prisma.customBots.findFirst({
                where: {
                    OR: [
                        { clientId: BigInt(clientId) as bigint },
                        { botSecret: botSecret },
                        { botToken: botToken },
                    ],
                },
            });

            if (bot) {
                if (bot.clientId === BigInt(clientId))                          return res.status(400).json({ success: false, message: "Client ID is already in use" });
                if (bot.botSecret.toLowerCase() === botSecret.toLowerCase())    return res.status(400).json({ success: false, message: "Client Secret is already in use" });
                if (bot.botToken.toLowerCase() === botToken.toLowerCase())      return res.status(400).json({ success: false, message: "Bot Token is already in use" });
            }

            const botData = await axios.get(`https://discord.com/api/users/@me`, {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
                validateStatus: () => true,
                proxy: false,
                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`)
            });

            if (botData.status !== 200 || botData.data.id !== clientId) {
                return res.status(400).json({ success: false, message: "Invalid Bot Token or Client Id" });
            }

            const accountBot = await prisma.customBots.findMany({ where: { ownerId: user.id, } });

            if ((user.role === "free" && accountBot.length >= 1) || (user.role === "premium" && accountBot.length >= 5))
                return res.status(400).json({ success: false, message: `Your Subscription is limited to ${user.role === "free" ? 1 : 5} bots.` });

            if (publicKey && (user.role !== "business" && user.role !== "enterprise"))
                return res.status(400).json({ success: false, message: "This feature is only available to Business users." });
            

            const newBot = await prisma.customBots.create({
                data: {
                    name: botName,
                    clientId: BigInt(clientId),
                    botSecret: botSecret,
                    botToken: botToken,
                    ownerId: user.id,
                    publicKey: publicKey,
                }
            });

            return res.status(200).json({ success: true, message: "Bot created successfully.", bot: {
                id: newBot.id,
                name: newBot.name,
                clientId: newBot.clientId.toString(),
                botSecret: newBot.botSecret,
                botToken: newBot.botToken,
            } });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "An error occurred while creating the bot." });
        }
    
    default: return res.status(405).json({ success: false, message: "Method not allowed." });
    }
}

export default withAuthentication(handler);