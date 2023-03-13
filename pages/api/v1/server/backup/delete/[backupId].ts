import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { deleteBackup } from "../../../../../../src/Backup";
import { prisma } from "../../../../../../src/db";
import rateLimit from "../../../../../../src/rate-limit";
import { startRestore } from "../../../../../../src/Restore";
import withAuthentication from "../../../../../../src/withAuthentication";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async (resolve, reject) => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                if (user.role !== "business" && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You need to be a Business subscriber to use this feature." });

                const backup = await prisma.backups.findFirst({ where: { backupId: `${req.query.backupId}` } });
                if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

                const server = await prisma.servers.findFirst({ where: { guildId: BigInt(backup.guildId) as bigint, ownerId: user.id } });
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

export default withAuthentication(handler);