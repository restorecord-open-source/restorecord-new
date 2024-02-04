import { NextApiRequest, NextApiResponse } from "next";
import { accounts } from "@prisma/client";

import { prisma } from "../../../../../../src/db";

import withAuthentication from "../../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        if (user.role !== "business" && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });

        const serverId: any = String(req.query.serverid) as any;

        const server = await prisma.servers.findFirst({ where: { guildId: BigInt(serverId), ownerId: user.id } });
        if (!server) return res.status(400).json({ success: false, message: "Server not found." });

        const migration = await prisma.migrations.findFirst({ where: { guildId: BigInt(serverId) }, orderBy: { createdAt: "desc" } });
        if (!migration) return res.status(400).json({ success: false, message: "Could not find migration" });

        return res.status(200).json({ 
            success: true,
            migration: {
                id: migration.id,
                guildId: String(migration.guildId) as string,
                migrationGuildId: String(migration.migrationGuildId) as string,
                status: migration.status,
                total: migration.totalCount,
                attempted: migration.successCount + migration.failedCount + migration.invalidCount + migration.blacklistedCount + migration.bannedCount,
                success: migration.successCount,
                banned: migration.bannedCount,
                maxGuilds: migration.maxGuildsCount,
                invalid: migration.invalidCount,
                failed: migration.failedCount,
                blacklisted: migration.blacklistedCount,
                createdAt: migration.createdAt,
            }
        });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);