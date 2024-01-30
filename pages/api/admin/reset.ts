import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            {
                try {
                    if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });
    
                    let serverId: any = req.body.serverId ?? "";
                    if (serverId === undefined || serverId === null || serverId === "") return res.status(400).send("No server provided.");
    
                    const server = await prisma.servers.findUnique({ where: { id: parseInt(serverId) as number } });
    
                    if (!server) return res.status(400).send("Server not found.");
    
                    switch (req.query.option) {
                    case "member":
                        const update = await prisma.members.updateMany({
                            where: { 
                                AND: [
                                    { guildId: { equals: server.guildId } },
                                    { accessToken: { equals: "unauthorized" } }
                                ]
                            },
                            data: { accessToken: "unauth" }
                        });
    
                        return res.status(200).send(`Reset ${update.count} members.`);
                    case "status":
                        await prisma.servers.update({
                            where: { id: server.id },
                            data: { pulling: false, }
                        });
    
                        return res.status(200).send(`Reset Status of ${server.name}`);
                    case "cooldown":
                        await prisma.servers.update({
                            where: { id: server.id },
                            data: { pullTimeout: new Date(2020, 1, 1), }
                        });
    
                        return res.status(200).send(`Reset Cooldown of ${server.name}`);
                    case "serverid":
                        await prisma.servers.update({
                            where: { id: server.id },
                            data: { /* set guildId */ }
                        });
                        break;
                    }
                }
                catch (e: any) { console.error(e); return res.status(400).send("400 Bad Request"); }
            } break;

            /*
            case "GET":
            {
                
            } break;
            */

        default: return res.status(400).send("400 Bad Request");
        }
    });
}

export default withAuthentication(handler);