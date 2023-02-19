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

                if (search === undefined || search === null || search === "") return res.status(400).send("No search query provided.");

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

                return res.status(200).json({ success: true, server: {
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
                    createdAt: server.createdAt,
                } });
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