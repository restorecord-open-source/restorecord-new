import { NextApiRequest, NextApiResponse } from "next";
import { InteractionResponseFlags, } from 'discord-interactions';
import { APIApplicationCommand, APIApplicationCommandGuildInteraction, APIApplicationCommandInteraction, APIChatInputApplicationCommandInteraction, APIChatInputApplicationCommandInteractionData, APIEmbed, APIInteractionResponse, ApplicationCommandType } from "discord-api-types/v10"
import withDiscordInteraction from "../../src/withDiscordInteraction";
import withErrorHandler from "../../src/withErrorHandler";
import axios from "axios";
import { prisma } from "../../src/db";
import { HttpsProxyAgent } from "https-proxy-agent";

export const config = {
    api: {
        bodyParser: false,
    },
}

const BASE_RESPONSE = { type: 4 }
const INVALID_COMMAND_OPTIONS = { ...BASE_RESPONSE, data: { content: "Invalid command options.", flags: InteractionResponseFlags.EPHEMERAL } }
const INVALID_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: "Sorry, this command does not exist.", flags: InteractionResponseFlags.EPHEMERAL  } }
const PULL_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { 
    embeds: [{
        title: "Pull Members",
        description: "This command is currently not available, please use the dashboard to pull/migrate members.",
        color: 0x00ff00
    }] as APIEmbed[],
    flags: InteractionResponseFlags.EPHEMERAL
} }

const VERIFY_EMBED_COMMAND = { ...BASE_RESPONSE, data: { content: "Verify embed has been sent to the channel.", flags: InteractionResponseFlags.EPHEMERAL } }

const handler = async(_: NextApiRequest, res: NextApiResponse<APIInteractionResponse>, interaction: any) => {
    const { application_id, data: { name, options } } = interaction;

    switch (name) {
    case "verify-embed":
        let webhook;
        if (!options) {
            return res.status(200).json(INVALID_COMMAND_OPTIONS)
        }

        const cBot = await prisma.customBots.findFirst({
            where: {
                clientId: BigInt(application_id)
            }
        })

        if (!cBot) return res.status(400).end("invalid application id");

        const server = await axios.get(`https://discord.com/api/guilds/${interaction.guild_id}`, { headers: { Authorization: `Bot ${cBot.botToken}` }, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) })
        const webhooks = await axios.get(`https://discord.com/api/channels/${options[0].value}/webhooks`, { headers: { Authorization: `Bot ${cBot.botToken}` }, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) })

        // if (webhooks.data.find((w: any) => w.user.id == cBot.clientId).length == 0) {
        const nWebhook = await axios.post(`https://discord.com/api/channels/${options[0].value}/webhooks`, { name: "Verification" }, { headers: { Authorization: `Bot ${cBot.botToken}` }, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) })

        webhook = nWebhook.data;
        // } else {
        // webhook = webhooks.data.find((w: any) => w.user.id == cBot.clientId);
        // }


        // send a message on the webhook and add a link button to it
        const message = await axios.post(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`, {
            content: null,
            embeds: [
                {
                    title: `**Verify in ${server.data.name}**`,
                    description: "To get **access** to the rest of the server, click on the **verify** button.",
                    color: 3092790,
                    image: {
                        url: `${options[1]?.value ? options[1]?.value : ""}`
                    }
                }
            ],
            username: "Verification",
            avatar_url: `${server.data.icon ? `https://cdn.discordapp.com/icons/${server.data.id}/${server.data.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"}`,
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: "Verify",
                    style: 5,
                    url: `https://discord.com/oauth2/authorize?client_id=${application_id}&redirect_uri=https://restorecord.com/api/callback&response_type=code&scope=identify+guilds.join&state=${server.data.id}`
                }]
            }]
        })

        return res.status(200).json(VERIFY_EMBED_COMMAND);
        break;
    case "pull":
        return res.status(200).json(PULL_COMMAND_RESPONSE);
        break;
    default:
        return res.status(200).json(INVALID_COMMAND_RESPONSE);
        break;
    }
}

export default withErrorHandler(withDiscordInteraction(handler))
