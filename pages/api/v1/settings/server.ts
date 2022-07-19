import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";

const limiter = rateLimit({
    interval: 300 * 1000,
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");

                const data = { ...req.body };

                if (!data.guildId || !data.roleId || !data.serverName || !data.customBot) {
                    let errors = [];
                    if (!data.guildId) errors.push("Guild Id ");
                    if (!data.roleId) errors.push("Role Id ");
                    if (!data.serverName) errors.push("Server Name ");
                    if (!data.customBot) errors.push("Custom Bot ");

                    return res.status(400).json({ success: false, message: `Missing ${errors}` });
                }

                if (isNaN(Number(data.guildId)) || isNaN(Number(data.roleId))) return res.status(400).json({ success: false, message: "Invalid Server Id or Role Id" });


                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

                const sess = await prisma.sessions.findMany({
                    where: {
                        accountId: valid.id,
                    }
                }); 

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });


                const server = await prisma.servers.findFirst({
                    where: {
                        OR: [
                            { name: data.newServerName },
                            { guildId: BigInt(data.guildId) },
                            { roleId: BigInt(data.roleId) },
                        ],
                    },
                });

                if (server?.name.toLowerCase() === data.serverName.toLowerCase()) return res.status(400).json({ success: false, message: "Server name is already in use" });
                if (server?.guildId === BigInt(data.guildId)) return res.status(400).json({ success: false, message: "Guild ID is already in use" });
                if (server?.roleId === BigInt(data.roleId)) return res.status(400).json({ success: false, message: "Role ID is already in use" });

                const newServer = await prisma.servers.create({
                    data: {
                        name: data.serverName,
                        guildId: BigInt(data.guildId),
                        roleId: BigInt(data.roleId),
                        customBotId: Number(data.customBot),
                        ownerId: valid.id,
                    }
                });

                return res.status(200).json({ success: true, message: "Server created successfully", server: {
                    id: newServer.id,
                    name: newServer.name,
                    guildId: Number(newServer.guildId),
                    roleId: Number(newServer.roleId),
                    customBotId: Number(newServer.customBotId),
                } });
            }
            catch (err: any) {
                console.log(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "PATCH":
            try {
                limiter.check(res, 15, "CACHE_TOKEN");

                const data = { ...req.body };

                if (!data.guildId || !data.roleId || !data.serverName || !data.newGuildId || !data.newRoleId) {
                    let errors = [];
                    if (!data.guildId) errors.push("Guild Id ");
                    if (!data.roleId) errors.push("Role Id ");
                    if (!data.serverName) errors.push("Server Name ");
                    if (!data.newGuildId) errors.push("New Guild Id ");
                    if (!data.newRoleId) errors.push("New Role Id ");

                    return res.status(400).json({ success: false, message: `Missing ${errors}` });
                }


                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

                const sess = await prisma.sessions.findMany({
                    where: {
                        accountId: valid.id,
                    }
                }); 

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const multipleCheck = await prisma.servers.findFirst({
                    where: {
                        OR: [
                            { name: data.newServerName },
                            { guildId: BigInt(data.newGuildId) },
                            { roleId: BigInt(data.newRoleId) },
                        ],
                    }
                });

                if (data.newServerName !== data.serverName) { 
                    if (multipleCheck?.name.toLowerCase() === data.newServerName.toLowerCase()) 
                        return res.status(400).json({ success: false, message: "Server name is already in use" }); 
                }
                if (data.newGuildId !== data.guildId) {
                    if (multipleCheck?.guildId === BigInt(data.newGuildId)) 
                        return res.status(400).json({ success: false, message: "Guild ID is already in use" });
                }
                if (data.newRoleId !== data.roleId) {
                    if (multipleCheck?.roleId === BigInt(data.newRoleId)) 
                        return res.status(400).json({ success: false, message: "Role ID is already in use" });
                }


                const server = await prisma.servers.findFirst({
                    where: {
                        AND: [
                            { name: data.serverName },
                            { ownerId: valid.id },
                            { guildId: BigInt(data.guildId as any) },
                            { roleId: BigInt(data.roleId as any) },
                        ],
                    },
                });

                if (!server) return res.status(400).json({ success: false, message: "Server not found" });

                const newServer = await prisma.servers.update({
                    where: {
                        id: server.id,
                    },
                    data: {
                        name: data.newServerName,
                        guildId: BigInt(data.newGuildId as any),
                        roleId: BigInt(data.newRoleId as any),
                    }
                });

                return res.status(200).json({ success: true, message: "Successfully Updated your server!", server: {
                    id: newServer.id,
                    name: newServer.name,
                    guildId: newServer.guildId.toString(),
                    roleId: newServer.roleId.toString(),
                    customBotId: newServer.customBotId.toString(),
                } });
            }
            catch (err: any) {
                console.log(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "POST");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}
