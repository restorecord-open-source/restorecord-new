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
                let fullId: any = req.body.serverId ?? '';
                let idSearch: any = search ? (isNaN(search) ? undefined : (search.length > 16 ? undefined : parseInt(search))) : undefined;
                let guildIdSearch: any = search ? (isNaN(search) ? undefined : (search.length >= 17 && search.length <= 19 ? BigInt(search) : undefined)) : undefined;

                if ((search === undefined || search === null || search === "") && (fullId == undefined || fullId == null || fullId == "")) return res.status(400).json({ success: false, message: "No search query provided." });

                const server = await prisma.servers.findMany({
                    where: {
                        AND: [
                            ...(!fullId ? [] : [{ id: { equals: parseInt(fullId) as number } }]),
                            { id: { equals: idSearch ? parseInt(idSearch) as number : undefined } },
                            { name: { contains: search ? (idSearch ? undefined : (guildIdSearch ? undefined : search)) : undefined } },
                            { guildId: { equals: guildIdSearch ? BigInt(guildIdSearch) as bigint : undefined } }
                        ]
                    },
                    take: 10,
                });

                if (!server) return res.status(400).send("Server not found.");

                // return res.status(200).json({ success: true,
                //     users: accSearchResult.map((acc: accounts) => {
                //         if (acc.id === fullId) {
                //             return {
                //                 id: acc.id,
                //                 username: acc.username,
                //                 email: acc.email,
                //                 role: acc.role,
                //                 banned: acc.banned,
                //                 twoFactor: acc.twoFactor,
                //                 expiry: acc.expiry,
                //                 admin: acc.admin,
                //                 lastIp: acc.lastIp,
                //                 createdAt: acc.createdAt,
                //                 userId: acc.userId,
                //                 referralCode: acc.referralCode,
                //                 referrer: acc.referrer,
                //             }
                //         } else {
                //             return {
                //                 id: acc.id,
                //                 username: acc.username,
                //                 email: acc.email,
                //                 role: acc.role,
                //                 expiry: acc.expiry,
                //                 twoFactor: acc.twoFactor,
                //                 admin: acc.admin,
                //                 lastIp: acc.lastIp,
                //                 createdAt: acc.createdAt,
                //             }
                //         }
                //     })
                // });

                return res.status(200).json({ success: true, 
                    servers: server.map((server: any) => {
                        if (server.id === fullId) {
                            return {
                                id: server.id,
                                name: server.name,
                                guildId: server.guildId,
                                createdAt: server.createdAt,
                                updatedAt: server.updatedAt,
                                deletedAt: server.deletedAt,
                            }
                        } else {
                            return {
                                id: server.id,
                                name: server.name,
                                guildId: server.guildId,
                                createdAt: server.createdAt,
                                updatedAt: server.updatedAt,
                                deletedAt: server.deletedAt,
                            }
                        }
                    })
                });
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