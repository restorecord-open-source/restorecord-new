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
                    { guildId: BigInt(newGuildId as any) },
                    { roleId: BigInt(newRoleId as any) },
                ],
            },
        });

        if (serverCheck) {
            if (serverCheck.name === newServerName && serverCheck.name !== serverName) return res.status(400).json({ success: false, message: "Server name is already in use" });
            if (serverCheck.guildId === BigInt(newGuildId as any) && serverCheck.guildId !== BigInt(guildId as any)) return res.status(400).json({ success: false, message: "Guild ID is already in use" });
            if (serverCheck.roleId === BigInt(newRoleId as any) && serverCheck.roleId !== BigInt(roleId as any)) return res.status(400).json({ success: false, message: "Role ID is already in use" });
        }

        const server = await prisma.servers.findFirst({
            where: {
                AND: [
                    { name: serverName },
                    { ownerId: user.id },
                    { guildId: BigInt(guildId as any) },
                    { roleId: BigInt(roleId as any) },
                ],
            },
        });

        if (!server) return res.status(400).json({ success: false, message: "Server not found" });
        if (data?.newWebhook && !/^.*(discord|discordapp)\.com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$/.test(data.newWebhook)) return res.status(400).json({ success: false, message: "Invalid Webhook" });
        if (data?.newThemeColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data?.newThemeColor)) return res.status(400).json({ success: false, message: "Invalid Theme Color" });

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
                ipLogging: data.newIpLogging,
                vpncheck: data.newWebhookCheck ? (data.newVpnCheck ? (user.role !== "free" ? true : false) : false) : false,
                themeColor: data.newThemeColor ? ((user.role === "business" || user.role === "enterprise") ? data.newThemeColor.replace("#", "") : "4e46ef") : "4e46ef",
            }
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

export default withAuthentication(handler);