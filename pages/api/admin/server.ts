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

                const { query, serverId } = req.body;

                let search: any = query ?? "";
                let fullId: any = serverId ?? "";
                let idSearch: any = search ? (isNaN(search) ? undefined : (search.length > 16 ? undefined : parseInt(search))) : undefined;
                let guildIdSearch: any = search ? (isNaN(search) ? undefined : (search.length >= 17 && search.length <= 19 ? BigInt(search) : undefined)) : undefined;
                
                if ((query === undefined || query === null || query === "") && (fullId == undefined || fullId == null || fullId == "")) return res.status(400).json({ success: false, message: "No search query provided." });

                const startTime = performance.now();
                const servers = await prisma.servers.findMany({
                    where: {
                        OR: [
                            ...(fullId ? [{ id: parseInt(fullId) }] : []),
                            ...(fullId ? [] : [
                                { id: idSearch ? parseInt(idSearch) : undefined },
                                { name: query ? { contains: query } : undefined },
                                { ownerId: idSearch ? parseInt(idSearch) : undefined },
                                { guildId: guildIdSearch ? guildIdSearch : undefined },
                                { description: query ? { contains: query } : undefined },
                            ]),
                        ],
                    },
                    orderBy: { createdAt: "desc" },
                    take: 100
                });                
                const endTime = performance.now();

                if (!servers.length) return res.status(400).send("Server not found.");

                // Sort servers to prioritize exact matches
                const sortedServers = servers.sort((a, b) => {
                    const isAExactMatch = a.id === parseInt(fullId) || a.guildId === guildIdSearch || a.name.toLowerCase() === query?.toLowerCase();
                    const isBExactMatch = b.id === parseInt(fullId) || b.guildId === guildIdSearch || b.name.toLowerCase() === query?.toLowerCase();
                    return isAExactMatch === isBExactMatch ? 0 : isAExactMatch ? -1 : 1;
                });

                return res.status(200).json({ success: true, 
                    rows: sortedServers.length,
                    time: ((endTime - startTime) / 1000).toFixed(3),
                    servers: sortedServers.map((server: any) => {
                        if (server.id === fullId) {
                            return {
                                id: server.id,
                                name: server.name,
                                ownerId: server.ownerId,
                                guildId: String(server.guildId) as string,
                                roleId: String(server.roleId) as string,
                                picture: server.picture,
                                vpn: server.vpncheck,
                                webhook: server.webhook,
                                bgImage: server.bgImage,
                                description: server.description,
                                pulling: server.pulling,
                                pullTimeout: server.pullTimeout,
                                themeColor: server.themeColor,
                                createdAt: server.createdAt,
                            }
                        } else {
                            return {
                                id: server.id,
                                name: server.name,
                                ownerId: server.ownerId,
                                guildId: String(server.guildId) as string,
                                roleId: String(server.roleId) as string,
                                pulling: server.pulling,
                                pullTimeout: server.pullTimeout,
                                createdAt: server.createdAt,
                            }
                        }
                    })
                });
            }
            catch (e: any) { console.error(e); return res.status(400).send("400 Bad Request"); }
            
        default: return res.status(400).send("400 Bad Request");
        }
    });
}

export default withAuthentication(handler);