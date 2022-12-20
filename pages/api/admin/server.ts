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

                if (search === undefined || search === null || search === "") return res.status(400).json({ success: false, message: "No search query provided." });

                const server = await prisma.servers.findFirst({
                    where: {
                        AND: [
                            { id: { equals: idSearch ? parseInt(idSearch) as number : undefined } },
                            { name: { contains: search ? (idSearch ? undefined : (guildIdSearch ? undefined : search)) : undefined } },
                            { guildId: { equals: guildIdSearch ? BigInt(guildIdSearch) as bigint : undefined } }
                        ]
                    }
                });

                if (!server) return res.status(400).json({ success: false, message: "Server not found." });

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