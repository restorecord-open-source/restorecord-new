import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let accounts: any = await prisma.accounts.count();
    let servers: any = await prisma.servers.count();
    let bots: any = await prisma.customBots.count();
    let members: any = await prisma.members.count({ where: { accessToken: { not: "unauthorized" } } });

    let totalMembers: any = await prisma.members.count();
    let backups: any = await prisma.backups.count();
    let subscribers: any = await prisma.accounts.count({ where: { role: { not: "free" } } });

    res.status(200).json({
        accounts: accounts,
        servers: servers,
        members: members,
        bots: bots,
        totalMembers: req.query.details ? totalMembers : undefined,
        subscribers: req.query.details ? subscribers : undefined,
        backups: req.query.details ? backups : undefined,
    });
}
