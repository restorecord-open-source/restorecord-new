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
        const { serverName, guildId, roleId, newServerName, newGuildId, newRoleId } = data;
    
        if (!serverName || !guildId || !roleId || !newServerName || !newGuildId || !newRoleId) return res.status(400).json({ success: false, message: "Missing required fields" });

        const trimmedServerName = newServerName.trim();
        

        const serverCheck = await prisma.servers.findFirst({
            where: {
                OR: [
                    { name: trimmedServerName },
                    { guildId: isBigInt(newGuildId) ? BigInt(newGuildId) : 0 },
                    { roleId: isBigInt(newRoleId) ? BigInt(newRoleId) : 0 },
                ],
                NOT: {
                    AND: [
                        { name: serverName },
                        { guildId: isBigInt(guildId) ? BigInt(guildId) : 0 },
                        { roleId: isBigInt(roleId) ? BigInt(roleId) : 0 },
                    ],
                },
            },
        });
          
        if (serverCheck) {
            const errorMessages = [
                { condition: serverCheck.name === newServerName, message: "Server name is already in use" },
                { condition: serverCheck.guildId === BigInt(newGuildId), message: "Guild ID is already in use" },
                { condition: serverCheck.roleId === BigInt(newRoleId), message: "Role ID is already in use" },
            ];
          
            for (const { condition, message } of errorMessages) {
                if (condition) return res.status(400).json({ success: false, message });
            }
        }

        const server = await prisma.servers.findFirst({
            where: {
                AND: [
                    { 
                        name: serverName, 
                        ownerId: user.id, 
                        guildId: BigInt(guildId), 
                        roleId: BigInt(roleId)
                    }
                ],
            },
        });
          
        if (!server) return res.status(400).json({ success: false, message: "Server not found" });
        if (data?.newWebhook && !/^.*(discord|discordapp)\.com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$/.test(data.newWebhook)) return res.status(400).json({ success: false, message: "Invalid Webhook" });
        if (data?.newThemeColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.newThemeColor)) return res.status(400).json({ success: false, message: "Invalid Theme Color" });
        
        const newServer = await prisma.servers.update({
            where: {
                id: server.id,
            },
            data: {
                name: trimmedServerName,
                guildId: BigInt(newGuildId as any),
                roleId: BigInt(newRoleId as any),
                webhook: data.newWebhookCheck ? (user.role !== "free" ? data.newWebhook : null) : null,
                picture: data.newPicture,
                bgImage: data.newBackground ? (user.role === "business" ? data.newBackground : null) : null,
                description: data.newDescription,
                theme: data.newTheme ? (user.role === "business" ? data.newTheme : "DEFAULT") : "DEFAULT",
                ipLogging: data.newIpLogging,
                discoverable: data.newDiscoverable ? ((user.role === "business" || user.role === "enterprise") ? 1 : 0) : 0,
                blockAlts: data.newBlockAlts ? (user.role !== "free" ? data.newBlockAlts : false) : false,
                captcha: data.newCaptcha,
                vpncheck: data.newWebhookCheck ? (data.newVpnCheck ? (user.role !== "free" ? true : false) : false) : false,
                themeColor: data.newThemeColor ? ((user.role === "business" || user.role === "enterprise") ? data.newThemeColor.replace("#", "") : "4e46ef") : "4e46ef",
            }
        });

        let memberCount = await prisma.members.count({ where: { guildId: BigInt(guildId as any) } });

        while (memberCount >= 100000) {
            const members = await prisma.members.findMany({
                where: {
                    guildId: BigInt(guildId as any),
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
                        guildId: BigInt(newGuildId as any),
                    },
                });
            }

            memberCount = await prisma.members.count({ where: { guildId: BigInt(guildId as any) } });
        }

        await prisma.members.updateMany({
            where: {
                guildId: BigInt(guildId as any),
            },
            data: {
                guildId: BigInt(newGuildId as any),
            },
        });

        await prisma.blacklist.updateMany({
            where: {
                guildId: BigInt(guildId as any),
            },
            data: {
                guildId: BigInt(newGuildId as any),
            },
        });

        await prisma.backups.updateMany({
            where: {
                guildId: BigInt(guildId as any),
            },
            data: {
                guildId: BigInt(newGuildId as any),
            },
        });

        await prisma.migrations.updateMany({
            where: {
                guildId: BigInt(guildId as any),
            },
            data: {
                guildId: BigInt(newGuildId as any),
            },
        });

        await prisma.guildMembers.updateMany({
            where: {
                guildId: BigInt(guildId as any),
            },
            data: {
                guildId: BigInt(newGuildId as any),
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