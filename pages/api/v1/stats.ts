import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let accounts: any = await prisma.accounts.count();
    let servers: any = await prisma.servers.count();
    let bots: any = await prisma.customBots.count();
    let members: any = await prisma.members.count({ where: { accessToken: { not: "unauthorized" } } });

    res.status(200).json({
        accounts: accounts,
        servers: servers,
        members: members,
        bots: bots
    });
}
