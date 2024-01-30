import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

        let serverId: any = req.body.serverId ?? "";
        if (serverId === undefined || serverId === null || serverId === "") return res.status(400).send("No server provided.");

        const server = await prisma.servers.findUnique({ where: { id: parseInt(serverId) as number } });

        if (!server) return res.status(400).send("Server not found.");
        // generate random 18 digit number
        let newGuildId = (Math.floor(Math.random() * 90000000000000000) + 10000000000000000).toString();
        let newRoleId = (Math.floor(Math.random() * 90000000000000000) + 10000000000000000).toString();

        while (await prisma.servers.findFirst({ where: { OR: [{ guildId: BigInt(newGuildId as any) }, { roleId: BigInt(newRoleId as any) }] } })) {
            newGuildId = (Math.floor(Math.random() * 90000000000000000) + 10000000000000000).toString();
            newRoleId = (Math.floor(Math.random() * 90000000000000000) + 10000000000000000).toString();
        }

        await prisma.servers.update({
            where: {  id: server.id, },
            data: {
                guildId: BigInt(newGuildId as any),
                roleId: BigInt(newRoleId as any),
            }
        });

        await prisma.members.updateMany({
            where: { guildId: server.guildId },
            data: { guildId: BigInt(newGuildId as any), }
        });

        await prisma.blacklist.updateMany({
            where: { guildId: server.guildId },
            data: { guildId: BigInt(newGuildId as any), }
        });

        await prisma.backups.updateMany({
            where: { guildId: server.guildId },
            data: { guildId: BigInt(newGuildId as any), }
        });

        await prisma.migrations.updateMany({
            where: { guildId: server.guildId },
            data: { guildId: BigInt(newGuildId as any), }
        });

        await prisma.guildMembers.updateMany({
            where: { guildId: server.guildId },
            data: { guildId: BigInt(newGuildId as any), }
        });

        return res.status(200).send(`Server ${server.name} has been unclaimed.`);
    }
    catch (e: any) { console.error(e); return res.status(400).send("400 Bad Request"); }
}

export default withAuthentication(handler);