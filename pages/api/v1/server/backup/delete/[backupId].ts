import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { deleteBackup } from "../../../../../../src/Backup";
import { prisma } from "../../../../../../src/db";
import rateLimit from "../../../../../../src/rate-limit";
import { startRestore } from "../../../../../../src/Restore";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        switch (req.method) {
        case "GET":
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
                if (account.role !== "business") return res.status(400).json({ success: false, message: "You need to be a Business subscriber to use this feature." });

                const backup = await prisma.backups.findFirst({ where: { backupId: `${req.query.backupId}` } });
                if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

                const server = await prisma.servers.findFirst({ where: { guildId: BigInt(backup.guildId) as bigint, ownerId: account.id } });
                if (!server) return res.status(404).json({ success: false, message: "Server not found" });

                await deleteBackup(backup.backupId).then(async () => {
                    return res.status(200).json({ success: true, message: "Backup Deleted" });
                }).catch((err) => {
                    console.error(`[ERROR] Backup Delete: ${err}`);
                    return res.status(500).json({ success: false, message: "An error occured while deleting the backup" });
                });
            }
            catch (err: any) {
                console.error(err);
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