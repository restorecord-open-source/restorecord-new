import { NextApiRequest, NextApiResponse } from "next";
import { accounts, customBots, servers } from "@prisma/client";
import { prisma } from "../../../../../src/db";
import withAuthentication from "../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "POST") return res.status(405).json({ code: 0, message: "Method not allowed" });

    const data = req.body;

    if (!data.guildId || !data.roleId || !data.serverName || !data.customBot) {
        const errors = [];
        if (!data.guildId) errors.push("Guild Id");
        if (!data.roleId) errors.push("Role Id");
        if (!data.serverName) errors.push("Server Name");
        if (!data.customBot) errors.push("Custom Bot");

        return res.status(400).json({ success: false, message: `Missing ${errors.join(", ")}` });
    }

    if (isNaN(Number(data.guildId)) || isNaN(Number(data.roleId))) return res.status(400).json({ success: false, message: "Server ID or Role ID is not a number" });
    if (BigInt(data.guildId) > 18446744073709551615 || BigInt(data.roleId) > 18446744073709551615) return res.status(400).json({ success: false, message: "Server ID or Role ID is not a discord ID" });
    if (data.serverName.length < 3 || data.serverName.length > 99) return res.status(400).json({ success: false, message: "Server name must be between 3 and 99 characters" });

    data.serverName = data.serverName.trim();

    const customBot = await prisma.customBots.findUnique({ where: { clientId: BigInt(data.customBot), ownerId: user.id } });
    if (!customBot) {
        return res.status(400).json({ success: false, message: "Custom Bot not found" });
    }

    const server = await prisma.servers.findFirst({
        where: {
            OR: [
                { name: data.serverName.toLowerCase() },
                { guildId: BigInt(data.guildId) },
                { roleId: BigInt(data.roleId) },
            ],
        },
    });

    if (server) {
        if (server.name.toLowerCase() === data.serverName.toLowerCase()) return res.status(400).json({ success: false, message: "Server name is already in use" });
        if (server.guildId === BigInt(data.guildId)) return res.status(400).json({ success: false, message: "Guild ID is already in use, contact support" });
        if (server.roleId === BigInt(data.roleId)) return res.status(400).json({ success: false, message: "Role ID is already in use" });
    }

    const accountServers = await prisma.servers.count({ where: { ownerId: user.id } });

    if (user.role === "free" && accountServers >= 1) return res.status(400).json({ success: false, message: "You can't have more than 1 server." });
    if (user.role === "premium" && accountServers >= 5) return res.status(400).json({ success: false, message: "You can't have more than 5 servers." });

    const newServer = await prisma.servers.create({
        data: {
            name: data.serverName,
            guildId: BigInt(data.guildId),
            roleId: BigInt(data.roleId),
            ownerId: user.id,
            customBotId: customBot.id,
        },
    });

    return res.status(200).json({ success: true, message: "Server created", server: {
        id: newServer.id,
        name: newServer.name,
        guildId: Number(newServer.guildId),
        roleId: Number(newServer.roleId),
        customBotId: Number(newServer.customBotId),
    } });
}

export default withAuthentication(handler);