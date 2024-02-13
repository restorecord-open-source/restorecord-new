import { NextApiRequest, NextApiResponse } from "next";
import { accounts } from "@prisma/client";
import { prisma } from "../../../../../../src/db";
import withAuthentication from "../../../../../../src/withAuthentication";
import { createRedisInstance } from "../../../../../../src/Redis";

const redis = createRedisInstance();


async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "PATCH") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const data = { ...req.body };
        const { name, guildId, roleId } = data;
    
        if (!name || !guildId || !roleId || !req.query.serverid) return res.status(400).json({ success: false, message: "Missing required fields" });

        const trimmedServerName = name.trim();

        const serverCheck = await prisma.servers.findFirst({
            where: {
                OR: [
                    { name: trimmedServerName },
                    { guildId: isBigInt(guildId) ? BigInt(guildId) : 0 },
                    { roleId: isBigInt(roleId) ? BigInt(roleId) : 0 },
                ],
                NOT: {
                    guildId: BigInt(req.query.serverid as string),
                },
            },
        });
          
        if (serverCheck) {
            const errorMessages = [
                { condition: serverCheck.name === name, message: "Server name is already in use" },
                { condition: serverCheck.guildId === BigInt(guildId), message: "Guild ID is already in use, contact support" },
                { condition: serverCheck.roleId === BigInt(roleId), message: "Role ID is already in use" },
            ];
          
            for (const { condition, message } of errorMessages) {
                if (condition) return res.status(400).json({ success: false, message });
            }
        }

        const server = await prisma.servers.findFirst({
            where: {
                AND: [
                    { ownerId: user.id },
                    { guildId: BigInt(req.query.serverid as string) },
                ],
            },
        });
          
        if (!server) return res.status(400).json({ success: false, message: "Server not found" });
        if (data?.webhook && data.webhook.startsWith("https://ptb.discord")) data.webhook = data.webhook.replace("https://ptb.discord", "https://discord");
        if (data?.webhook && data.webhook.startsWith("https://canary.discord")) data.webhook = data.webhook.replace("https://canary.discord", "https://discord");
        if (data?.webhook && !/^(https:\/\/(discord|discordapp)\.com\/api\/webhooks\/[\d]+\/[a-zA-Z0-9_-]+)$/.test(data.webhook)) return res.status(400).json({ success: false, message: "Invalid Webhook" });
        if (data?.themeColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.themeColor)) return res.status(400).json({ success: false, message: "Invalid Theme Color" });
        
        const newServer = await prisma.servers.update({
            where: {
                id: server.id,
            },
            data: {
                name: trimmedServerName,
                guildId: BigInt(guildId as any),
                roleId: BigInt(roleId as any),
                webhook: (data.webhook && data.webhookCheck) ? (user.role !== "free" ? data.webhook : null) : null,
                picture: data.picture ? data.picture : null,
                bgImage: data.background ? ((user.role === "business" || user.role === "enterprise") ? data.background : null) : null,
                description: data.description ? data.description : null,
                theme: data.theme ? ((user.role === "business" || user.role === "enterprise") ? data.theme : "DEFAULT") : "DEFAULT",
                ipLogging: data.ipLogging ? data.ipLogging : false,
                discoverable: data.discoverable ? ((user.role === "business" || user.role === "enterprise") ? 1 : 0) : 0,
                blockAlts: data.blockAlts ? (user.role !== "free" ? data.blockAlts : false) : false,
                blockWireless: data.blockWireless ? (user.role === "enterprise" ? data.blockWireless : false) : false,
                minAccountAge: data.minAccountAge ? (user.role === "enterprise" ? Number(data.minAccountAge) : 0) : 0,
                unlisted: data.unlisted ? data.unlisted : false,
                private: data.private ? (user.role !== "free" ? data.private : false) : false,
                captcha: data.captcha ? data.captcha : false,
                authorizeOnly: data.authorizeOnly ? (user.role === "enterprise" ? data.authorizeOnly : false) : false,
                vpncheck: data.vpnCheck ? (user.role !== "free" ? true : false) : false,
                themeColor: data.themeColor ? ((user.role === "business" || user.role === "enterprise") ? data.themeColor.replace("#", "") : "4e46ef") : "4e46ef",
            }
        });

        let memberCount = await prisma.members.count({ where: { guildId: BigInt(req.query.serverid as string) } });

        while (memberCount >= 100000) {
            const members = await prisma.members.findMany({
                where: {
                    guildId: BigInt(req.query.serverid as string),
                },
                take: 100000,
            });

            const memberChunks = chunk(members, 50000);

            for (const chunk of memberChunks) {
                await prisma.members.updateMany({
                    where: {
                        id: {
                            in: chunk.map(m => m.id),
                        },
                    },
                    data: {
                        guildId: BigInt(guildId as any),
                    },
                });
            }

            memberCount = await prisma.members.count({ where: { guildId: BigInt(req.query.serverid as string) } });
        }

        if (memberCount <= 100000) {
            await prisma.members.updateMany({
                where: {
                    guildId: BigInt(req.query.serverid as string),
                },
                data: {
                    guildId: BigInt(guildId as any),
                },
            });
        }

        await prisma.members.updateMany({
            where: {
                guildId: BigInt(req.query.serverid as string),
            },
            data: {
                guildId: BigInt(guildId as any),
            },
        });

        await prisma.blacklist.updateMany({
            where: {
                guildId: BigInt(req.query.serverid as string),
            },
            data: {
                guildId: BigInt(guildId as any),
            },
        });

        await prisma.backups.updateMany({
            where: {
                guildId: BigInt(req.query.serverid as string),
            },
            data: {
                guildId: BigInt(guildId as any),
            },
        });

        await prisma.migrations.updateMany({
            where: {
                guildId: BigInt(req.query.serverid as string),
            },
            data: {
                guildId: BigInt(guildId as any),
            },
        });

        await prisma.guildMembers.updateMany({
            where: {
                guildId: BigInt(req.query.serverid as string),
            },
            data: {
                guildId: BigInt(guildId as any),
            },
        });

        await redis.del(`server:${server.guildId}`);

        return res.status(200).json({ success: true, message: "Successfully Updated your server!", server: {
            id: newServer.id,
            name: newServer.name,
            guildId: newServer.guildId.toString(),
            roleId: newServer.roleId.toString(),
            customBotId: newServer.customBotId.toString(),
        } });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export function isBigInt(value: any) {
    try { BigInt(value); return true; }
    catch (error) { return false; }
}


export function chunk<T>(arr: T[], size: number): T[][] {
    return arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [] as T[][]);
}

export default withAuthentication(handler);