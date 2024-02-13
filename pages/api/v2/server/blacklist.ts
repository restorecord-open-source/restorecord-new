import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import { accounts } from "@prisma/client";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });
                let guildIds: any = servers.map((server: any) => server.guildId);

                const limit: any = req.query.max ? req.query.max : 50;
                const page = req.query.page ?? "";


                let search: any = req.query.search ?? "";
                const count = await prisma.blacklist.count({ 
                    where: { 
                        guildId: { in: guildIds },
                        OR: [
                            { value: { contains: search } },
                            { reason: { contains: search } }
                        ] 
                    } 
                });

                const blList = await prisma.blacklist.findMany({
                    where: {
                        AND: [
                            { guildId: { in: guildIds } },
                            { OR: [
                                { value: { contains: search } },
                                { reason: { contains: search } }
                            ]}
                        ]
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                });

                const lowestId = blList.find((blist: any) => blist.id === Math.min(...blList.map((blist: any) => blist.id)))?.id ?? 1;

                await prisma.blacklist.findMany({
                    where: {
                        AND: [
                            { guildId: { in: guildIds } },
                            { id: { gt: search ? 0 : (lowestId - 1) } },
                            { OR: [
                                { value: { contains: search } },
                                { reason: { contains: search } }
                            ] }
                        ],
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                }).then((blacklist: any) => {
                    return res.status(200).json({
                        success: true,
                        max: count,
                        maxPages: Math.ceil(count / limit) === 0 ? 1 : Math.ceil(count / limit),
                        list: blacklist.map((blist: any) => {
                            return {
                                id: blist.id,
                                type: blist.type,
                                value: blist.value,
                                reason: blist.reason,
                                guildId: blist.guildId.toString(),
                                createdAt: blist.createdAt,
                            };
                        })
                    })
                })
            }
            catch (err: any) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "PUT":
            try {
                const { reason, type, value, guildId }: any = req.body;

                if (!type || (!value && type != "server") || !guildId) return res.status(400).json({ success: false, message: `Missing ${!type ? "Blacklist Type" : !value ? "Blacklist Value" : "Server"}` });

                const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });
                if (!servers.find((server: any) => server.guildId === BigInt(guildId) as bigint)) return res.status(400).json({ success: false, message: "No server found." });

                if (user.role === "free") return res.status(400).json({ success: false, message: "You are not allowed to use this feature." });

                const blacklist = await prisma.blacklist.findMany({ where: { guildId: { in: servers.map((server: any) => server.guildId) } } });
                
                // add a new blacklist item 
                // type 0 = user, type 1 = ip, type 2 = asn
                switch (type) {
                case "ip":
                    // check if valid ipv4 format
                    if (!value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) return res.status(400).json({ success: false, message: "Invalid IP Address" });
                    // check if ipv4 is a pirvate ip address
                    if (value.match(/^(?:10|127|172\.(?:1[6-9]|2[0-9]|3[0-1])|192\.168)\./)) return res.status(400).json({ success: false, message: "Invalid IP Address" });
                    if (blacklist.find((item: any) => (item.value === value && item.guildId === BigInt(guildId) as bigint))) return res.status(400).json({ success: false, message: "This IP is already blacklisted in this server." });

                    await prisma.blacklist.create({ 
                        data: { 
                            type: 1,
                            value: value,
                            reason: reason, 
                            guildId: BigInt(guildId)
                        }
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "IP has been blacklisted." });
                    }).catch((err: any) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Could not blacklist IP." });
                    });
                    break;
                case "user":
                    // match discord id snowflake
                    if (!value.match(/^[0-9]{17,19}$/)) return res.status(400).json({ success: false, message: "Invalid Discord ID." });
                    if (blacklist.find((item: any) => (item.value === BigInt(value) as bigint && item.guildId === BigInt(guildId) as bigint))) return res.status(400).json({ success: false, message: "This User is already blacklisted in this server." });

                    await prisma.blacklist.create({
                        data: {
                            type: 0,
                            value: String(value) as string,
                            reason: reason,
                            guildId: BigInt(guildId)
                        }
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "User has been blacklisted." });
                    }).catch((err: any) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Could not blacklist User." });
                    });
                    break;
                case "asn":
                    if (user.role === "premium") return res.status(400).json({ success: false, message: "You need to have a Business subscription to blacklist ASN's." });
                    if (!value.replace("AS", "").match(/^[0-9]{1,10}$/)) return res.status(400).json({ success: false, message: "Invalid ASN." });
                    if (blacklist.find((item: any) => (item.value === value && item.guildId === BigInt(guildId) as bigint))) return res.status(400).json({ success: false, message: "This ASN is already blacklisted in this server." });

                    await prisma.blacklist.create({
                        data: {
                            type: 2,
                            value: String(value.replace("AS", "")) as string,
                            reason: reason,
                            guildId: BigInt(guildId)
                        }
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "ASN has been blacklisted." });
                    }).catch((err: any) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Could not blacklist ASN." });
                    });
                    break;
                case "iso":
                    // check if valid country code
                    if (!value.match(/^[A-Z]{2}$/)) return res.status(400).json({ success: false, message: "Invalid Country Code." });
                    if (blacklist.find((item: any) => (item.value === value && item.guildId === BigInt(guildId) as bigint))) return res.status(400).json({ success: false, message: "This Country is already blacklisted in this server." });

                    await prisma.blacklist.create({
                        data: {
                            type: 3,
                            value: String(value) as string,
                            reason: reason,
                            guildId: BigInt(guildId)
                        }
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "Country has been blacklisted." });
                    }).catch((err: any) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Could not blacklist Country." });
                    });
                    break;
                case "server":
                    // get all bans from the discord server then add all user Id's with the reason "Imported from Discord" to the blacklist

                    var server = await prisma.servers.findFirst({ where: { guildId: BigInt(guildId) as bigint } });
                    if (!server) return res.status(400).json({ success: false, message: "Server not found." });

                    var bot = await prisma.customBots.findFirst({ where: { id: server.customBotId } });
                    if (!bot) return res.status(400).json({ success: false, message: "Bot not found." });

                    await axios.get(`https://discord.com/api/guilds/${guildId}/bans`, { 
                        headers: { 
                            Authorization: `Bot ${bot.botToken}`
                        },
                        proxy: false,
                        httpsAgent: new HttpsProxyAgent(`https://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@zproxy.lum-superproxy.io:22225`) 
                    }).then(async (response: any) => {
                        if (response.data) {
                            var bans = response.data;
                            await prisma.blacklist.createMany({
                                data: bans.map((ban: any) => {
                                    return {
                                        type: 0,
                                        value: ban.user.id,
                                        reason: "Imported from Discord",
                                        guildId: BigInt(guildId)
                                    }
                                })
                            }).then(() => {
                                return res.status(200).json({ success: true, message: `${bans.length} Users have been blacklisted.` });
                            }).catch((err: any) => {
                                console.error(err);
                                return res.status(400).json({ success: false, message: "Could not blacklist Users." });
                            });
                        }
                        else {
                            return res.status(400).json({ success: false, message: "No bans found." });
                        }
                    }).catch((err: any) => {
                        return res.status(400).json({ success: false, message: "Could not get bans." });
                    });
                    break;
                default:
                    return res.status(400).json({ success: false, message: "Invalid type." });
                }
            }
            catch (err: any) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "DELETE":
            try {
                const { id }: any = req.query;

                const servers = await prisma.servers.findMany({ where: { ownerId: user.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

                const blacklist = await prisma.blacklist.findMany({ where: { guildId: { in: servers.map((server: any) => server.guildId) } } });
                if (!blacklist) return res.status(400).json({ success: false, message: "No blacklisted items found." });

                const item = blacklist.find((item: any) => item.id === Number(id) as number);
                if (!item) return res.status(400).json({ success: false, message: "Blacklist item not found." });

                await prisma.blacklist.delete({ where: { id: Number(id) as number } }).then(() => {
                    return res.status(200).json({ success: true, message: "Blacklist item has been deleted." });
                }).catch((err: any) => {
                    console.error(err);
                    return res.status(400).json({ success: false, message: "Could not delete blacklist item." });
                });
            }
            catch (err: any) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}

export default withAuthentication(handler);