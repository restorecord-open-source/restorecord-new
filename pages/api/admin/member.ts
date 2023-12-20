import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";
import { verify } from "jsonwebtoken";

type members = { 
    isp: string | null; 
    id: number; 
    userId: bigint; 
    guildId: bigint; 
    ip: string | null; 
    username: string; 
    avatar: string; 
    state: string | null; 
    city: string | null; 
    country: string | null; 
    vpn: boolean; 
    createdAt: Date;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("access-control-allow-origin", "*");

    try {
        return new Promise(async resolve => {
            switch (req.method) {
            case "GET":
                try {
                    const { platform, ids, token } = req.query;

                    if (!token || typeof token !== "string") throw new Error(50014 as any);

                    let JWTInfo = verify(token, process.env.JWT_SECRET!) as { id: number; };
                    if (!JWTInfo) throw new Error(50014 as any);

                    const sessions = await prisma.sessions.findMany({ where: { accountId: JWTInfo.id, token: token } });
                    if (sessions.length === 0) throw new Error(50014 as any);

                    const user = await prisma.accounts.findFirst({ where: { id: JWTInfo.id } });
                    if (!user) throw new Error(10001 as any);

                    if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                    if (!platform || !ids) return res.status(400).json({ success: false, message: "Missing parameters", members: [] });
                    if (platform !== "discord") return res.status(400).json({ success: false, message: "Invalid platform", members: [] });

                    const idsArray = (ids as string).split(",");
                    const uniqueIds = Array.from(new Set(idsArray));
                    const validIds = uniqueIds.filter(id => id.match(/^\d{17}$|^\d{18}$|^\d{19}$/));
                    if (validIds.length === 0) return res.status(400).json({ success: false, message: "No valid ids provided", members: [] });

                    let membersList = await prisma.members.findMany({
                        select: {
                            userId: true,
                            ip: true,
                            vpn: true,
                        },
                        where: {
                            userId: {
                                in: validIds.map(id => BigInt(id)),
                            },
                            NOT: [
                                { ip: null },
                                { ip: "null" },
                                { ip: "127.0.0.1" },
                                { ip: "1.1.1.1" },
                            ]
                        },
                        orderBy: {
                            id: "desc",
                        },
                    });

                    let uniqueMembers: members[] = [];

                    const uniqueUserIds = Array.from(new Set(membersList.map(member => member.userId)));
                    uniqueMembers = uniqueUserIds.map(userId => membersList.find(member => member.userId === userId) as members);

                    if (!uniqueMembers || uniqueMembers.length === 0) {
                        return res.status(200).json(validIds.reduce((obj, id) => {
                            obj[id] = "null";
                            return obj;
                        }, {} as any));
                    }

                    return res.status(200).json(uniqueMembers.reduce((obj, member) => {
                        obj[String(member.userId)] = String(member.ip) as string;
                        return obj;
                    }, {} as any));
                    break;
                } catch (err: any) {
                    if (err?.name === "" || err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError" || err?.name === "NotBeforeError") err.message = 50014;
        
                    err.message = parseInt(err.message);

                    switch (err.message) {
                    case 10001: return res.status(404).json({ code: err.message, message: "Unknown account" })
                    case 50014: return res.status(401).json({ code: err.message, message: "Invalid authentication token provided" })
                    default: return res.status(500).end("internal server error")
                    }
                }
            default:
                return res.status(400).send("400 Bad Request");
                break;
            }
        });
    } catch (err: any) {
        if (err?.name === "" || err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError" || err?.name === "NotBeforeError") err.message = 50014;
    
        err.message = parseInt(err.message);

        switch (err.message) {
        case 10001: return res.status(404).json({ code: err.message, message: "Unknown account" })
        case 50014: return res.status(401).json({ code: err.message, message: "Invalid authentication token provided" })
        default: return res.status(500).end("internal server error")
        }
    }
}

export default handler;