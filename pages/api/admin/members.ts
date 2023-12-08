import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";

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

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const { query, dcId } = req.body;

                let search: any = query ?? "";
                let fullId: any = dcId ?? "";
                let discordIdSearch: any = search ? (isNaN(search) ? undefined : (search.length >= 17 && search.length <= 19 ? BigInt(search) : undefined)) : undefined;
                
                if (!query && !dcId) return res.status(400).json({ success: false, message: "No search query provided." });

                const startTime = performance.now();
                let membersList = await prisma.members.findMany({
                    select: {
                        id: true,
                        username: true,
                        userId: true,
                        guildId: true,
                        avatar: true,
                        ip: true,
                        isp: true,
                        state: true,
                        city: true,
                        country: true,
                        vpn: true,
                        createdAt: true
                    },
                    where: {
                        ...(fullId ? { id: parseInt(fullId) } : undefined),
                        ...(discordIdSearch ? { userId: discordIdSearch } : undefined),
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });

                let uniqueMembers: members[] = [];

                if (discordIdSearch) {
                    uniqueMembers = membersList.filter(member => member.userId === discordIdSearch);
                } else {
                    const uniqueUserIds = Array.from(new Set(membersList.map(member => member.userId)));
                    uniqueMembers = uniqueUserIds.map(userId => membersList.find(member => member.userId === userId) as members);
                }

                const endTime = performance.now();

                if (!uniqueMembers || uniqueMembers.length === 0) {
                    return res.status(400).json({ success: false, message: "Member not found, enter valid discord id (784104859665432629)" });
                }

                return res.status(200).json({ success: true,
                    rows: uniqueMembers.length,
                    time: ((endTime - startTime) / 1000).toFixed(3),
                    members: uniqueMembers.map((member: any) => {
                        if (member.userId === discordIdSearch) {
                            return {
                                id: member.id,
                                username: member.username,
                                userId: String(member.userId) as string,
                                guildId: String(member.guildId) as string,
                                avatar: member.avatar,
                                ip: member.ip,
                                vpn: member.vpn,
                                createdAt: member.createdAt,
                            }
                        } else if (member.id === fullId) {
                            return {
                                id: member.id,
                                username: member.username,
                                userId: String(member.userId) as string,
                                guildId: String(member.guildId) as string,
                                avatar: member.avatar,
                                ip: member.ip,
                                isp: member.isp,
                                state: member.state,
                                city: member.city,
                                country: member.country,
                                vpn: member.vpn,
                                createdAt: member.createdAt,
                            }
                        } else {
                            return {
                                id: member.id,
                                username: member.username,
                                userId: String(member.userId) as string,
                                guildId: String(member.guildId) as string,
                                avatar: member.avatar,
                                ip: member.ip,
                                vpn: member.vpn,
                                createdAt: member.createdAt,
                            }
                        }
                    })
                });
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