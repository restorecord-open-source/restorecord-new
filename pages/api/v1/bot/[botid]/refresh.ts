import { NextApiRequest, NextApiResponse } from "next";
import { ApplicationCommandOptionType, ApplicationCommandType } from "discord-api-types/v10"
import { createGlobalCommand } from "../../../../../src/withDiscordInteraction";
import rateLimit from "../../../../../src/rate-limit";
import { prisma } from "../../../../../src/db";
import { accounts } from "@prisma/client";
import withAuthentication from "../../../../../src/withAuthentication";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async (resolve) => {
        switch (req.method) {
        case "GET":
            limiter.check(res, 60, "CACHE_TOKEN");
            if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
            
            if (!req.query.botid) return res.status(400).json({ success: false, message: "No bot id provided." });

            const cBot = await prisma.customBots.findFirst({ where: { clientId: BigInt(`${req.query.botid}`) as bigint, ownerId: user.id } });
            if (!cBot) return res.status(400).json({ success: false, message: "No bot found." });

            createGlobalCommand(cBot.botToken, cBot.clientId, {
                name: "usercount",
                description: "Get the verified user count of the server",
                options: [],
                type: ApplicationCommandType.ChatInput,
                dm_permission: false,
                default_member_permissions: "8192",
                version: ""
            })
    
            createGlobalCommand(cBot.botToken, cBot.clientId, {
                name: "verify-embed",
                description: "Creates a verification embed.",
                options: [ 
                    {
                        name: "channel",
                        description: "The channel to send the embed to.",
                        type: ApplicationCommandOptionType.Channel,
                        required: true
                    },
                    {
                        name: "title",
                        description: "Embed title",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: "description",
                        description: "Embed Description",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: "image",
                        description: "The image to use for the embed. (Please use direct link ending in .png, .jpg, .jpeg, .gif)",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                ],
                type: ApplicationCommandType.ChatInput,
                dm_permission: false,
                default_member_permissions: "8224",
                version: ""
            }).then(() => {
                return res.status(200).json({ success: true, message: "Commands have been refreshed." });
            }).catch((err) => {
                console.error(err);
                return res.status(500).json({ success: false, message: "An error occurred." });
            })
        }
    });
}

export default withAuthentication(handler);