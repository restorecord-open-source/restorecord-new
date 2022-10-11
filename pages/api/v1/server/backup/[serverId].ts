import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { createBackup } from "../../../../../src/Backup";
import { prisma } from "../../../../../src/db";
import rateLimit from "../../../../../src/rate-limit";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        switch (req.method) {
        case "POST":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });
                
                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findFirst({where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found" });
                if (account.role !== "business") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });

                const server = await prisma.servers.findFirst({ where: { guildId: BigInt(`${req.query.serverId}`) as bigint, ownerId: account.id } });
                if (!server) return res.status(404).json({ success: false, message: "Server not found" });

                const backup: any = await createBackup(BigInt(`${req.query.serverId}`) as bigint);

                if (backup.success) {
                    return res.status(200).json(backup);
                } else {
                    return res.status(400).json(backup);
                }
            }
            catch (err: any) {
                console.error(err);
                if (err.message) return res.status(400).json({ success: false, message: err.message });
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "GET, PUT, DELETE");
            res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
            break;
        }
    });
}