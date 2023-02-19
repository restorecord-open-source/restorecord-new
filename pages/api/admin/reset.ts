import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                let search: any = req.body.query ?? '';
                let idSearch: any = search ? (isNaN(search) ? undefined : (search.length > 16 ? undefined : parseInt(search))) : undefined;
                let guildIdSearch: any = search ? (isNaN(search) ? undefined : (search.length >= 17 && search.length <= 19 ? BigInt(search) : undefined)) : undefined;

                if (search === undefined || search === null || search === "") return res.status(400).send("No server provided.");

                const server = await prisma.servers.findFirst({
                    where: {
                        AND: [
                            { id: { equals: idSearch ? parseInt(idSearch) as number : undefined } },
                            { name: { contains: search ? (idSearch ? undefined : (guildIdSearch ? undefined : search)) : undefined } },
                            { guildId: { equals: guildIdSearch ? BigInt(guildIdSearch) as bigint : undefined } }
                        ]
                    }
                });

                if (!server) return res.status(400).send("Server not found.");

                switch (req.query.option) {
                case "member":
                    await prisma.servers.update({
                        where: { id: server.id },
                        data: {
                            pulling: false,
                        }
                    });

                    const update = await prisma.members.updateMany({
                        where: { 
                            AND: [
                                { guildId: { equals: server.guildId } },
                                { accessToken: { equals: "unauthorized" } }
                            ]
                        },
                        data: {
                            accessToken: "unauth"
                        }
                    });

                    return res.status(200).send(`Reset ${update.count} members.`);
                    break;
                case "cooldown":
                    await prisma.servers.update({
                        where: { id: server.id },
                        data: {
                            pullTimeout: new Date(2020, 1, 1),
                        }
                    });

                    return res.status(200).send(`Reset Cooldown of ${server.name}`);
                    break;
                case "serverid":
                    await prisma.servers.update({
                        where: { id: server.id },
                        data: {
                            // set guildId
                        }
                    });
                    break;
                }
            }
            catch (e: any) {
                console.error(e);
                return res.status(400).send("400 Bad Request");
            }
            break;
        default:
            return res.status(400).send("400 Bad Request");
            break;
        }
    });
}

export default withAuthentication(handler);