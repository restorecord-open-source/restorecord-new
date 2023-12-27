import { NextApiRequest, NextApiResponse } from "next";
import { InteractionResponseFlags, } from "discord-interactions";
import { APIEmbed, APIInteractionResponse, ApplicationCommandType } from "discord-api-types/v10"
import withDiscordInteraction from "../../src/withDiscordInteraction";
import withErrorHandler from "../../src/withErrorHandler";
import axios from "axios";
import { prisma } from "../../src/db";
import { HttpsProxyAgent } from "https-proxy-agent";
import { addMember, addRole, refreshToken, shuffle } from "../../src/Migrate";
import { formatEstimatedTime } from "../../src/functions";
import { members } from "@prisma/client";

export const config = {
    api: {
        bodyParser: false,
    },
}

const BASE_RESPONSE = { type: 4 }
const INVALID_COMMAND_OPTIONS = { ...BASE_RESPONSE, data: { content: "Invalid command options.", flags: InteractionResponseFlags.EPHEMERAL } }
const INVALID_COMMAND_RESPONSE = { ...BASE_RESPONSE, data: { content: "Sorry, this command does not exist.", flags: InteractionResponseFlags.EPHEMERAL  } }

const VERIFY_EMBED_COMMAND = { ...BASE_RESPONSE, data: { 
    embeds: [{
        title: "🔄 Verify Embed",
        description: "Verify embed is being sent...",
        color: 0x0078d7
    }] as APIEmbed[],
    flags: InteractionResponseFlags.EPHEMERAL
} }

const verify_description = [
    "To get **access** to the rest of the server, click on the **verify** button.",
    "Click on the **verify** button to **chat** in this server.",
    "Please **verify** yourself to get access to the rest of the server.",
    "This server requires you to **verify** to prevent spam.",
    "Welcome to our server! To gain **access** to all chats, click on the **verify** button.",
    "Ready to dive into the conversation? Tap the **verify** button and start chatting with others!",
    "Join the fun by verifying yourself with the **verify** button and get access to chat!",
]

const handler = async(_: NextApiRequest, res: NextApiResponse, interaction: any) => {
    const { application_id, type, data: { name, options, custom_id, values, component_type } } = interaction;

    const customBot = await prisma.customBots.findUnique({ where: { clientId: BigInt(application_id) } })
    if (!customBot) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "Bot has not been found on dashboard", flags: InteractionResponseFlags.EPHEMERAL } });

    if (type === 2) {
        switch (name) {
        case "usercount": 
            var serverInfo = await prisma.servers.findUnique({ where: { guildId: BigInt(interaction.guild_id) } });
            if (!serverInfo || serverInfo === null) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "Server has not been found on dashboard", flags: InteractionResponseFlags.EPHEMERAL } });

            if (serverInfo.ownerId !== customBot.ownerId) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "Bot and server owners do not match", flags: InteractionResponseFlags.EPHEMERAL } });

            const memberCount = await prisma.members.count({ where: { guildId: BigInt(interaction.guild_id) } });
            const memberCountUnauthorized = await prisma.members.count({ where: { guildId: BigInt(interaction.guild_id), accessToken: "unauthorized" } });

            return res.status(200).json({ ...BASE_RESPONSE, data: { 
                embeds: [
                    {
                        title: "User Count",
                        description: `> **Total**: __${memberCount}__\n> **Pullable**: __${memberCount - memberCountUnauthorized}__\n> **Unauthorized**: __${memberCountUnauthorized}__`,
                        color: 3092790
                    }
                ],
                flags: InteractionResponseFlags.EPHEMERAL
            } });
            break;
        case "pull":
            var serverInfo = await prisma.servers.findUnique({ where: { guildId: BigInt(interaction.guild_id) } });
            if (!serverInfo || serverInfo === null) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "Server has not been found on dashboard", flags: InteractionResponseFlags.EPHEMERAL } });

            var serverOwner = await prisma.accounts.findUnique({ where: { id: serverInfo.ownerId, userId: interaction.member.user.id } });
            if (!serverOwner) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "Server owner does not exist", flags: InteractionResponseFlags.EPHEMERAL } });

            var servers = await prisma.servers.findMany({ where: { AND: [ { ownerId: serverOwner.id }, { customBotId: customBot.id } ] } });
            if (servers.length === 0) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "No servers found", flags: InteractionResponseFlags.EPHEMERAL } });

            if (serverInfo.ownerId !== customBot.ownerId) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "Bot and server owners do not match", flags: InteractionResponseFlags.EPHEMERAL } });
            if (BigInt(serverOwner.userId as any) !== BigInt(interaction.member.user.id)) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "You are unable to run this command, contact an Administrator or add your Discord ID to [the dashboard](https://restr.co/account)", flags: InteractionResponseFlags.EPHEMERAL } });

            var roles = await axios.get(`https://discord.com/api/v10/guilds/${interaction.guild_id}/roles`, { headers: { Authorization: `Bot ${customBot.botToken}` }, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) })

            // show a message with select server and then a select box with all server names
            return res.status(200).json({ ...BASE_RESPONSE, data: {
                content: null,
                embeds: [{
                    title: "Pull Server",
                    description: "Choose the Server you want to pull your members **from**.",
                    color: 0x0078d7
                }],
                components: [{
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "pull_server",
                        placeholder: "Select a server",
                        options: servers.map(server => ({ label: `${server.name} (${server.guildId})`, value: server.guildId.toString() })),
                        min_values: 1,
                        max_values: 1
                    }],
                }],
                flags: InteractionResponseFlags.EPHEMERAL
            } });
            break;
        case "verify-embed":
            res.status(200).json(VERIFY_EMBED_COMMAND);

            let webhook;
            if (!options) {
                return res.status(200).json(INVALID_COMMAND_OPTIONS)
            }

            let server = await axios.get(`https://discord.com/api/v10/guilds/${interaction.guild_id}`, { headers: { Authorization: `Bot ${customBot.botToken}` }, validateStatus: () => true, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) });
            let nWebhook = await axios.post(`https://discord.com/api/v10/channels/${options[0].value}/webhooks`, { name: "Verification" }, { headers: { Authorization: `Bot ${customBot.botToken}` }, validateStatus: () => true, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) });

            if (nWebhook.status !== 200) {
                await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                    content: null,
                    embeds: [{
                        title: "❌ Error",
                        description: nWebhook.data.message ?? "An error occured while trying to create the webhook, please try again later. and [contact support](https://t.me/restorecord) if the issue persists.",
                        color: 0xff0000
                    }],
                    flags: InteractionResponseFlags.EPHEMERAL
                }, {
                    validateStatus: () => true,
                    headers: { "Content-Type": "application/json" },
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) 
                });

                return;
            }

            webhook = nWebhook.data;

            const title =        options.find((o: any) => o.name == "title")?.value;
            const description =  options.find((o: any) => o.name == "description")?.value;
            const image =        options.find((o: any) => o.name == "image")?.value;
            const avatar =       options.find((o: any) => o.name == "avatar")?.value;
            const username =     options.find((o: any) => o.name == "username")?.value;
            const button_text =  options.find((o: any) => o.name == "button_text")?.value;

            var blacklistedWords = [
                "restorecord",
                "restore cord",
                "restore-cord",
                "banned",
                "tapped",
                "termed",
                "terminated",
                "disabled",
                "ban",
            ];

            if (title || description || username || button_text) {
                for (const word of blacklistedWords) {
                    if (title?.toLowerCase().includes(word) || description?.toLowerCase().includes(word) || username?.toLowerCase().includes(word) || button_text?.toLowerCase().includes(word)) {
                        await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                            content: null,
                            embeds: [{
                                title: "❌ Error",
                                description: `You are not allowed to use the word \`${word}\`\n\nThis is to protect your bot from being disabled by Discord.`,
                                color: 0xff0000
                            }],
                            flags: InteractionResponseFlags.EPHEMERAL
                        }, {
                            validateStatus: () => true,
                            headers: { "Content-Type": "application/json" },
                            proxy: false,
                            httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) 
                        });
                        return;
                    }
                }
            }


            await axios.post(`https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`, {
                content: null,
                embeds: [
                    {
                        title: title ?? `**Verify in ${server.data.name}**`,
                        // description: description ?? verify_description[Math.floor(Math.random() * verify_description.length)],
                        // replace all \n with an actual new line \n
                        description: description ? description.replace(/\\n/g, "\n") : verify_description[Math.floor(Math.random() * verify_description.length)],
                        color: 3092790,
                        image: {
                            url: `${image ?? ""}`
                        }
                    }
                ],
                username: username ?? server.data.name,
                avatar_url: `${avatar ?? (server.data.icon ? `https://cdn.discordapp.com/icons/${server.data.id}/${server.data.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png")}`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: button_text ?? "Verify",
                        style: 5,
                        url: `https://discord.com/oauth2/authorize?client_id=${application_id}&redirect_uri=https://${customBot.customDomain ? customBot.customDomain : "restorecord.com"}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.data.id}`
                    }]
                }]
            }, {
                validateStatus: () => true,
                headers: { "Content-Type": "application/json" },
                proxy: false, 
                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) 
            }).then(async (resp) => {
                await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                    content: null,
                    embeds: [{
                        title: "✅ Success",
                        description: "The embed has been sent successfully.",
                        color: 0x00ff00
                    }],
                    flags: InteractionResponseFlags.EPHEMERAL
                }, {
                    validateStatus: () => true,
                    headers: { "Content-Type": "application/json" },
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) 
                });
            }).catch(async (err) => {
                await axios.patch(`https://discord.com/api/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
                    content: null,
                    embeds: [{
                        title: "❌ Error",
                        description: "The embed has not been sent successfully. Contact RestoreCord staff: https://t.me/restorecord",
                        color: 0xff0000
                    }],
                    flags: InteractionResponseFlags.EPHEMERAL
                }, {
                    validateStatus: () => true,
                    headers: { "Content-Type": "application/json" },
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) 
                });
            });
            return res.status(200).json({ type: 5 });
            break;        
        default:
            return res.status(200).json(INVALID_COMMAND_RESPONSE); 
            break;
        }
    } else if (type === 3) {
        switch (custom_id) {
        case "pull_server":
            if (!values) return res.status(200).json(INVALID_COMMAND_OPTIONS);

            // get all roles in current server and ask the user to select a role
            var roles = await axios.get(`https://discord.com/api/v10/guilds/${interaction.guild_id}/roles`, { headers: { Authorization: `Bot ${customBot.botToken}` }, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) })

            return res.status(200).json({ type: 7, data: {
                content: "Select a role to be given to the user when they get pulled.\n\nDon't see a role? Make sure the bot has the `Manage Roles` permission and that the bot's role is above the role you want to give.",
                embeds: [],
                components: [{
                    type: 1,
                    // map all roles as select box and then show an extra one at the bottom "No Role"
                    components: [{
                        type: 3,
                        custom_id: `pull_server_2`,
                        // map all roles and and the end show no role
                        options: roles.data.map((role: any) => {
                            const botRole = roles.data.filter((i: any) => i.tags && i.tags.bot_id === customBot?.clientId);
                            if (role.position < botRole[0]?.position && !role.tags) {
                                return {
                                    label: role.name,
                                    value: `${values[0]}:${role.id}`,
                                    description: "Missing Permissions"
                                };
                            }
                            return null;
                        }).filter((i: any) => i !== null).concat([{ label: "No Role", value: `${values[0]}:null`, description: null }]), 
                        placeholder: "Select a role",
                        min_values: 1,
                        max_values: 1
                    }],
                }],
                flags: InteractionResponseFlags.EPHEMERAL
            }});
            break;
        case "pull_server_2":
            if (!values) return res.status(200).json(INVALID_COMMAND_OPTIONS);

            var guildId = values[0].split(":")[0];
            var roleId = values[0].split(":")[1];

            if (guildId === "null" || guildId === "undefined") return res.status(200).json(INVALID_COMMAND_OPTIONS);


            var serverInfo = await prisma.servers.findUnique({ where: { guildId: guildId } });
            if (!serverInfo) return res.status(200).json({ success: false, message: "Server not found" });

            var bot = await prisma.customBots.findUnique({ where: { id: serverInfo.customBotId } });
            if (!bot) return res.status(200).json({ success: false, message: "Bot not found" });

            var memberCount = await prisma.members.count({ where: { guildId: serverInfo.guildId } });

            var dscServer = await axios.get(`https://discord.com/api/v10/guilds/${interaction.guild_id.toString()}`, { headers: { Authorization: `Bot ${bot.botToken}` }, proxy: false, httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) })

            // show confirmation popup with a button to confirm and a button to cancel
            return res.status(200).json({ type: 7, data: {
                content: `### Are you sure you want to pull **__${memberCount}__** members from "**${serverInfo.name}**" into "**${dscServer.data.name}**" (${interaction.guild_id})?`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        style: 3,
                        custom_id: `pull_server_3:${serverInfo.guildId}:${roleId}`,
                        label: "Confirm",
                        emoji: { name: "✔" }
                    }, {
                        type: 2,
                        style: 4,
                        custom_id: `pull_server_4`,
                        label: "Cancel",
                        emoji: { name: "✖" }
                    }]
                }],
                flags: InteractionResponseFlags.EPHEMERAL
            }});

            break;
        case custom_id.startsWith("pull_server_3") && custom_id:
            var guildId = custom_id.split(":")[1];
            var roleId = custom_id.split(":")[2];

            if (guildId === "null" || guildId === "undefined") return res.status(200).json(INVALID_COMMAND_OPTIONS);
            
            var serverInfo = await prisma.servers.findUnique({ where: { guildId: BigInt(guildId) as bigint } });
            if (!serverInfo || serverInfo === null) return res.status(200).json({ type: 4, data: { content: "Server not found", flags: InteractionResponseFlags.EPHEMERAL } });

            var serverOwner = await prisma.accounts.findUnique({ where: { id: serverInfo.ownerId, userId: interaction.member.user.id } });
            if (!serverOwner) return res.status(200).json({ type: 4, data: { content: "You are not the owner of this server", flags: InteractionResponseFlags.EPHEMERAL } });
            if (BigInt(serverOwner.userId as any) !== BigInt(interaction.member.user.id)) return res.status(200).json({ ...BASE_RESPONSE, data: { content: "You are unable to run this command, contact an Administrator or add your Discord ID to [the dashboard](https://restr.co/account)", flags: InteractionResponseFlags.EPHEMERAL } });

            var bot = await prisma.customBots.findUnique({ where: { id: serverInfo.customBotId } });
            if (!bot) return res.status(200).json({ type: 4, data: { content: "Bot not found", flags: InteractionResponseFlags.EPHEMERAL } });

            var members = await prisma.members.findMany({ where: { AND: [ { guildId: BigInt(serverInfo.guildId) }, { accessToken: { not: "unauthorized" } } ] } });
            if (members.length === 0) return res.status(200).json({ type: 4, data: { content: "No pullable members found", flags: InteractionResponseFlags.EPHEMERAL } });

            await axios.get(`https://discord.com/api/v10/users/@me`, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                    "X-RateLimit-Precision": "millisecond",
                    "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                },
                proxy: false,
                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                validateStatus: () => true,
            }).then((response) => {
                if (response.status !== 200) return res.status(200).json({ type: 4, data: { content: "Bot token is invalid", flags: InteractionResponseFlags.EPHEMERAL } });
            });

            // check if the server exists on discord (guildId)
            await axios.get(`https://discord.com/api/v10/guilds/${interaction.guild_id}`, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                    "X-RateLimit-Precision": "millisecond",
                    "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                },
                proxy: false,
                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                validateStatus: () => true,
            }).then((resp) => {
                if (resp?.status !== 200 || resp?.status != 200) return res.status(200).json({ type: 4, data: { content: "Discord server not found", flags: InteractionResponseFlags.EPHEMERAL } });
                console.log(`[${serverInfo?.name}] Pulling members into server: ${resp?.data?.name} (${resp?.data?.id})`);
            }).catch((err) => {
                console.error(err);
                return res.status(200).json({ type: 4, data: { content: "An error occured while trying to pull members from the server, please try again later. and [contact support](https://t.me/restorecord) if the issue persists.", flags: InteractionResponseFlags.EPHEMERAL } });
            });

            if (roleId !== "null" && roleId !== "undefined") {
                await axios.put(`https://discord.com/api/v10/guilds/${interaction.guild_id}/members/${bot.clientId}/roles/${roleId}`, {}, {
                    headers: {
                        "Authorization": `Bot ${bot.botToken}`,
                        "Content-Type": "application/json",
                        "X-RateLimit-Precision": "millisecond",
                        "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                    },
                    proxy: false,
                    httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                    validateStatus: () => true,
                }).then((resp) => {
                    if (resp?.status === 403 || resp?.status == 403) return res.status(200).json({ type: 4, data: { content: "Bot doesn't have permissions to give verified role", flags: InteractionResponseFlags.EPHEMERAL } });
                    if (resp?.status === 404 || resp?.status == 404) return res.status(200).json({ type: 4, data: { content: "Verified role not found", flags: InteractionResponseFlags.EPHEMERAL } });
                }).catch((err) => {
                    console.error(err);
                    return res.status(200).json({ type: 4, data: { content: "An error occured while trying to give the verified role, please try again later. and [contact support](https://t.me/restorecord) if the issue persists.", flags: InteractionResponseFlags.EPHEMERAL } });
                });
            }

            if (serverInfo.pulling === true) return res.status(200).json({ type: 4, data: { content: "Already pulling members, please click \"Stop\" using the dashboard or wait until finished", flags: InteractionResponseFlags.EPHEMERAL } });
            if (serverInfo.pullTimeout !== null) if (serverInfo.pullTimeout > new Date()) return res.status(200).json({ type: 4, data: { content: `You're on cooldown, you can pull again in <t:${Math.floor(serverInfo.pullTimeout.getTime() / 1000)}:R>`, flags: InteractionResponseFlags.EPHEMERAL } });


            // let done;
            const serverMemberList = await axios.get(`https://discord.com/api/v10/guilds/${interaction.guild_id}/members?limit=1000`, {
                headers: {
                    "Authorization": `Bot ${bot.botToken}`,
                    "Content-Type": "application/json",
                    "X-RateLimit-Precision": "millisecond",
                    "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                },
                proxy: false,
                httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`),
                validateStatus: () => true,
            });
                
            if (!serverMemberList.status.toString().startsWith("2")) {
                serverMemberList.data = [];
            }

            for (const serverMemberData of serverMemberList.data) {
                if (serverMemberList.data.length === 0) return;

                const member = members.find((m) => m.userId == serverMemberData.user.id);
                if (member) {
                    members.splice(members.indexOf(member), 1)
                }
            }

            let delay: number = 500;
            let pullTimeout: Date = new Date(Date.now() + 1000 * 60 * 60 * 18);

            if (members.length === 0) return res.status(200).json({ success: false, message: "No pullable members found" });


            switch (serverOwner.role) {
            case "free":
                delay = 1250;
                pullTimeout = new Date(Date.now() + 1000 * 60 * 60 * 18);
                if (members.length <= 5) pullTimeout = new Date(Date.now() + 1000 * 60 * 60);
                break;
            case "premium":
                delay = 850;
                pullTimeout = new Date(Date.now() + 1000 * 60 * 60 * 2);
                if (members.length <= 5) pullTimeout = new Date(Date.now() + 1000 * 60 * 60);
                break;
            case "business":
                delay = 600;
                pullTimeout = new Date(Date.now() + 1000 * 60 * 30);
                break;
            case "enterprise":
                delay = 400;
                pullTimeout = new Date(Date.now() + 1000 * 60 * 5);
                break;
            }

            await prisma.servers.update({ where: { id: serverInfo.id }, data: { pulling: true, pullTimeout: pullTimeout } });

            let trysPulled: number = 0;
            let succPulled: number = 0;
            let erroPulled: number = 0;
            new Promise<void>(async (resolve, reject) => {
                let membersNew: members[] = await shuffle(members);
                console.log(`[${serverInfo?.name}] Total members: ${members.length}, pulling: ${membersNew.length}`);

                await prisma.logs.create({
                    data: {
                        type: 10,
                        username: `${serverOwner?.username} (${serverOwner?.id})`,
                        ipAddr: `discord user: ${interaction.member.user.username} (${interaction.member.user.id})`,
                        device: "via Discord Bot"
                    }
                });
                    
                console.log(`[${serverInfo?.name}] Started Pulling`);

                const MAX_PULL_TIME = 1000 * 60 * 2;
                // const MAX_PULL_TIME = 1000 * 15;

                for (const member of membersNew) {
                    const newServer = await prisma.servers.findFirst({ where: { id: serverInfo?.id } });

                    if (!newServer) return reject(`[${serverInfo?.name}] Server not found`);
                    if (!newServer.pulling) return reject(`[${serverInfo?.name}] Pulling stopped`);

                    console.log(`[${serverInfo?.name}] [${member.username}] Pulling...`);

                    let isDone = false;
                    const pullPromise = addMember(interaction.guild_id.toString(), member.userId.toString(), bot?.botToken, member.accessToken, roleId !== "null" ? [BigInt(roleId).toString()] : []).then(async (resp: any) => {
                        trysPulled++;
                        let status = resp?.response?.status || resp?.status;
                        let response = ((resp?.response?.data?.message || resp?.response?.data?.code) || (resp?.data?.message || resp?.data?.code)) ? (resp?.response?.data || resp?.data) : "";

                        console.log(`[${serverInfo?.name}] [${member.username}] ${status} ${JSON.stringify(response).toString() ?? null}`);
                    
                        switch (status) {
                        case 429:   
                            const retryAfter = resp.response.headers["retry-after"];
                            console.log(`[${serverInfo?.name}] [${member.username}] 429 | retry-after: ${retryAfter} | delay: ${delay}ms`);
                            if (retryAfter) {
                                const retry = parseInt(retryAfter);
                                setTimeout(async () => {
                                    await addMember(interaction.guild_id.toString(), member.userId.toString(), bot?.botToken, member.accessToken, roleId !== "null" ? [BigInt(roleId).toString()] : [])
                                }, retry * 100);
                                delay += retry * 100;
                            }
                            break;
                        case 403:
                            const refreshed = await refreshToken(member.refreshToken, String(bot?.clientId) as string, String(bot?.botSecret) as string);
                            if (refreshed?.data?.access_token && refreshed?.data?.refresh_token) {
                                await prisma.members.update({
                                    where: {
                                        id: Number(member.id as number),
                                    },
                                    data: {
                                        accessToken: refreshed.data.access_token,
                                        refreshToken: refreshed.data.refresh_token
                                    }
                                });

                                console.log(`[${serverInfo?.name}] [${member.username}] Refreshed`);
                                await addMember(interaction.guild_id.toString(), member.userId.toString(), bot?.botToken, refreshed.data.access_token, roleId !== "null" ? [BigInt(roleId).toString()] : []).then(async (respon: any) => {
                                    if ((respon?.status === 204 || respon?.status === 201) || (respon?.response?.status === 204 || respon?.response?.status === 201)) {
                                        succPulled++;
                                        console.log(`[${serverInfo?.name}] [${member.username}] ${respon?.status || respon?.response?.status} Refresh PULLED`); 
                                    } else {
                                        erroPulled++;
                                        console.log(`[${serverInfo?.name}] [${member.username}] ${respon?.status || respon?.response?.status} Refresh FAILED`);
                                    }
                                });
                            } else {
                                await prisma.members.update({
                                    where: {
                                        id: Number(member.id as number),
                                    },
                                    data: {
                                        accessToken: "unauthorized"
                                    }
                                });
                                console.log(`[${serverInfo?.name}] [${member.username}] 403 | Refresh Failed`);
                                erroPulled++;
                            }
                            break;
                        case 407:
                            console.log(`407 Exponential Membership Growth/Proxy Authentication Required`);
                            break;
                        case 204:
                            await addRole(interaction.guild_id.toString(), member.userId.toString(), bot?.botToken, roleId !== "null" ? BigInt(roleId).toString() : "");
                            succPulled++;
                            break;
                        case 201:
                            succPulled++;                                
                            break;
                        case 400:
                            if (response?.code !== 30001) {
                                console.error(`[FATAL ERROR] [${serverInfo?.name}] [${member.id}]-[${member.username}] 400 | ${JSON.stringify(response)}`);
                            }
                            erroPulled++;
                            break;
                        case 404:
                            console.error(`[FATAL ERROR] [${serverInfo?.name}] [${member.id}]-[${member.username}] 404 | ${JSON.stringify(response)}`);
                            erroPulled++;
                            break;
                        case 401:
                            console.error(`[${serverInfo?.name}] [${member.id}]-[${member.username}] Bot token invalid stopped pulling...`);
                            reject(`[${serverInfo?.name}] Bot token invalid stopped pulling...`);
                            break;
                        default:
                            console.error(`[FATAL ERROR] [UNDEFINED STATUS] [${serverInfo?.name}] [${member.id}]-[${member.username}] ${status} | ${JSON.stringify(response.message)} | ${JSON.stringify(resp.message)}`);
                            erroPulled++;
                            break;
                        }
                    }).catch(async (err: Error) => {
                        clearTimeout(pullTimeout);
                        console.error(`[${serverInfo?.name}] [addMember.catch] [${member.username}] ${err}`);
                        erroPulled++;
                    }).finally(() => {
                        console.log(`[${serverInfo?.name}] [${member.username}] Pulled`);
                        clearTimeout(pullTimeout);
                        isDone = true;
                    });

                    const pullTimeout = setTimeout(async () => {
                        if (isDone) {
                            return;
                        }
                  
                        console.error(`[${serverInfo?.name}] [${member.username}] Pulling timed out`);
                        await prisma.servers.update({
                            where: {
                                id: serverInfo?.id,
                            },
                            data: {
                                pulling: false,
                            },
                        }).catch(async (err: Error) => {
                            console.error(`[${serverInfo?.name}] [PULLING] 5 ${err}`);
                        });
                  
                        resolve();
                    }, MAX_PULL_TIME);
                  
                    await pullPromise;
                  
                    // if (Number(succPulled) >= Number(pullCount)) {
                    //     console.log(`[${server.name}] [${member.username}] ${pullCount} members have been pulled`);
                    //     console.log(`[${server.name}] Finished pulling`);
                    //     await prisma.servers.update({
                    //         where: {
                    //             id: server.id
                    //         },
                    //         data: {
                    //             pulling: false,
                    //         }
                    //     }).then(() => {
                    //         console.log(`[${server.name}] [PULLING] Set pulling to false`);
                    //     }).catch((err: Error) => {
                    //         console.error(`[${server.name}] [PULLING] 5 ${err}`);
                    //     });

                    //     resolve();
                    // }

                    if (delay > 2000) delay -= 1000;
                    if (delay < 300) delay += 500;

                    console.log(`[${serverInfo?.name}] [${member.username}] Success: ${succPulled} | (${trysPulled}/${membersNew.length}) | Errors: ${erroPulled} | Delay: ${delay}ms`);
                
                    await new Promise((resolve) => { setTimeout(resolve, delay); });
                }

                console.log(`[${serverInfo?.name}] Finished pulling`);
                await prisma.servers.update({
                    where: {
                        id: serverInfo?.id
                    },
                    data: {
                        pulling: false,
                    }
                }).then(() => {
                    console.log(`[${serverInfo?.name}] [PULLING] Set pulling to false`);
                }).catch((err: Error) => {
                    console.error(`[${serverInfo?.name}] [PULLING] 5 ${err}`);
                });

                console.log(`[${serverInfo?.name}] [PULLING] Done with ${succPulled} members pulled`);
                resolve();
            }).then(async () => {
                console.log(`[${serverInfo?.name}] Pulling done with ${succPulled} members pulled`);
                await prisma.servers.update({
                    where: {
                        id: serverInfo?.id
                    },
                    data: {
                        pulling: false,
                    }
                }).then(() => {
                    console.log(`[${serverInfo?.name}] [PULLING] Set pulling to false`);
                }).catch((err: Error) => {
                    console.error(`[${serverInfo?.name}] [PULLING] 6 ${err}`);
                });
            }).catch((err: Error) => {
                console.error(`[PULLING] 3 ${err}`);
            });

            let esimatedTime: any = members.length * (1200 + delay); 
            esimatedTime += Date.now();
            
            return res.status(200).json({ type: 7, data: {
                content: null,
                embeds: [{
                    title: "✅ Success",
                    description: `Pull request has been started!\nPulling: ${members.length} members\nEstimated finish time: <t:${Math.floor(esimatedTime / 1000)}:R>`,
                    color: 0x00ff00
                }],
                components: [],
                flags: InteractionResponseFlags.EPHEMERAL
            }});
            break;
        case "pull_server_4":
            // edit the message before and say that the pull has been cancelled
            return res.status(200).json({ type: 7, data: {
                content: null,
                embeds: [{
                    title: "❌ Cancelled",
                    description: "The pull request has been cancelled.",
                    color: 0xff0000
                }],
                components: [],
                flags: InteractionResponseFlags.EPHEMERAL
            }});
            break;
        default:
            return res.status(200).json(INVALID_COMMAND_RESPONSE);
            break;
        }
    }
}

export default withErrorHandler(withDiscordInteraction(handler))

