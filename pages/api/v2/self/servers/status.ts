import { NextApiRequest, NextApiResponse } from "next";
import { accounts } from "@prisma/client";

import { prisma } from "../../../../../src/db";

import withAuthentication from "../../../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const server = await prisma.servers.findMany({ where: { ownerId: user.id } });
        if (!server) return res.status(400).json({ success: false, message: "Server not found." });

        let migrations = await prisma.migrations.findMany({ 
            select: {
                id: true,
                guildId: true,
                status: true,
                successCount: true,
                bannedCount: true,
                blacklistedCount: true,
                failedCount: true,
                invalidCount: true,
                maxGuildsCount: true,
                totalCount: true,
                createdAt: true,
                updatedAt: true,
                startedAt: true,
            },
            where: { guildId: { in: server.map(server => server.guildId) } },
            orderBy: { createdAt: "desc" },
        });
        if (!migrations) return res.status(400).json({ success: false, message: "No migrations found." });

        migrations = migrations.filter((migration: any, index: number, self: any) => {
            return index === self.findIndex((m: any) => (
                m.guildId === migration.guildId
            ));
        });

        return res.status(200).json({ 
            success: true,
            migrations: migrations.map((migration: any) => {
                return {
                    id: migration.id,
                    guildId: String(migration.guildId),
                    status: migration.status,
                    success: migration.successCount,
                    attempted: migration.successCount + migration.failedCount + migration.invalidCount + migration.blacklistedCount + migration.bannedCount,
                    total: migration.totalCount === 0 ? (migration.successCount + migration.failedCount + migration.invalidCount + migration.blacklistedCount + migration.bannedCount) : migration.totalCount,
                    createdAt: migration.createdAt,
                    updatedAt: migration.updatedAt,
                    startedAt: migration.startedAt,
                }
            })
        });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);