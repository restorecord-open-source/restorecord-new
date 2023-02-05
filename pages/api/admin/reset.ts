import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                if (!valid) return res.status(400).json({ success: false, message: "Invalid token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });
                if (sess.length === 0) return res.status(400).json({ success: false, message: "Session Not found." });

                const account = await prisma.accounts.findFirst({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });
                if (!account.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

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