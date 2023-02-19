import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { createBackup } from "../../../../../src/Backup";
import { prisma } from "../../../../../src/db";
import rateLimit from "../../../../../src/rate-limit";
import withAuthentication from "../../../../../src/withAuthentication";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async (resolve, reject) => {
        switch (req.method) {
        case "POST":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                if (user.role !== "business") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });

                const server = await prisma.servers.findFirst({ where: { guildId: BigInt(`${req.query.serverId}`) as bigint, ownerId: user.id } });
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

export default withAuthentication(handler);