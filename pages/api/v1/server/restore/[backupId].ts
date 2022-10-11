import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../src/db";
import rateLimit from "../../../../../src/rate-limit";
import { startRestore } from "../../../../../src/Restore";

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

                const data = { ...req.body };

                if (data.clearGuild === undefined || data.settings === undefined || data.channels === undefined || data.roles === undefined) {
                    let errors = [];
                    if (!data.clearGuild) errors.push("clearGuild");
                    if (!data.settings) errors.push("settings");
                    if (!data.channels) errors.push("channels");
                    if (!data.roles) errors.push("roles");

                    return res.status(400).json({ success: false, message: `Missing arguments ${errors}` });
                }

                if (!data.settings && !data.channels && !data.roles) return res.status(400).json({ success: false, message: "Nothing to restore" });

                const account = await prisma.accounts.findFirst({where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found" });
                if (account.role !== "business") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });

                const backup = await prisma.backups.findFirst({ where: { backupId: `${req.query.backupId}` } });
                if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

                const server = await prisma.servers.findFirst({ where: { guildId: BigInt(backup.guildId) as bigint, ownerId: account.id } });
                if (!server) return res.status(404).json({ success: false, message: "Server not found" });

                const bot = await prisma.customBots.findFirst({ where: { id: server.customBotId, ownerId: account.id } });
                if (!bot) return res.status(404).json({ success: false, message: "Bot not found" });

                const restore = await startRestore(server, bot, backup, data.clearGuild, data.settings, data.channels, data.roles);

                return res.status(200).json({ success: true, message: restore });
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