import { NextApiRequest, NextApiResponse } from "next";
import withAuthentication from "../../../../../../src/withAuthentication";
import { accounts } from "@prisma/client";
import { prisma } from "../../../../../../src/db";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "DELETE") return res.status(405).json({ code: 0, message: "Method not allowed", });

    try {
        let serverId: any = String(req.query.serverid) as any;
        const migrationId = Number(req.query.migrationId) as any;

        if (!migrationId && !serverId) return res.status(400).json({ success: false, message: "Server ID or migration ID not provided" });
    
        if (migrationId) {
            const migration = await prisma.migrations.findFirst({
                select: { id: true, guildId: true },
                where: { 
                    id: migrationId
                } 
            });
            if (!migration) return res.status(400).json({ success: false, message: "Migration not found" });

            serverId = migration.guildId;
        }
        
        const server = await prisma.servers.findFirst({ where: { AND: [ { guildId: BigInt(serverId) as bigint }, { ownerId: user.id } ] } });
        if (!server) return res.status(400).json({ success: false, message: "Server not found" });

        await prisma.servers.update({ where: { id: server.id }, data: { pulling: false } });
        try {
            await prisma.migrations.updateMany({ 
                where: { 
                    guildId: server.guildId,
                    status: {
                        notIn: ["SUCCESS", "FAILED", "STOPPED"]
                    }
                },
                data: {
                    status: "STOPPED" 
                }
            });
        } catch (err) {
            console.error(err);
        }

        return res.status(200).json({ success: true, message: "Migration stopped" });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);