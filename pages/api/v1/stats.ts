import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let accounts: any = await prisma.accounts.count();
    let servers: any = await prisma.servers.count();
    let bots: any = await prisma.customBots.count();
    let members: any = await prisma.members.count({ where: { accessToken: { not: "unauthorized" } } });

    let totalMembers: any = req.query.details ? await prisma.members.count() : 0;
    let backups: any = req.query.details ? await prisma.backups.count() : 0;

    return res.status(200).json({
        accounts: accounts,
        servers: servers,
        members: members,
        bots: bots,
        totalMembers: req.query.details ? totalMembers : undefined,
        backups: req.query.details ? backups : undefined,
    });
}