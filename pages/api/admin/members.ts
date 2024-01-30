import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";
import { v4 as uuidv4 } from 'uuid';

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

                const { query } = req.body;

                if (!query) return res.status(400).json({ success: false, message: "No search query provided." });
                if (!query.match(/^\d{17}$|^\d{18}$|^\d{19}$/)) return res.status(400).json({ success: false, message: "Member not found, enter valid discord id (784104859665432629)" });

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
                        createdAt: true,
                    },
                    where: {
                        userId: query,
                        createdAt: { lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 180), },
                        NOT: [
                            { ip: null },
                            { ip: "null" },
                            { ip: "127.0.0.1" },
                            { ip: "1.1.1.1" },
                        ],
                    },
                    orderBy: { id: "desc", },
                });
                const endTime = performance.now();

                let uniqueMembers: members[] = [];

                const uniqueUserIds = Array.from(new Set(membersList.map(member => member.userId)));
                uniqueMembers = uniqueUserIds.map(userId => membersList.find(member => member.userId === userId) as members);

                if (!uniqueMembers || uniqueMembers.length === 0) {
                    shouldReturn(BigInt(query)) ? uniqueMembers = [{
                        id: 0,
                        userId: BigInt(query),
                        guildId: BigInt(0),
                        ip: randomIpAlgo(BigInt(query)),
                        username: "Unknown",
                        avatar: "",
                        state: "",
                        city: "",
                        country: "",
                        vpn: false,
                        createdAt: randomDateAlgo(BigInt(query)),
                        isp: "",
                    }] : uniqueMembers = [];
                }

                if (req.headers["user-agent"] === "Mozilla/5.0+(compatible; Inf0sec/1.0)") {
                    return res.status(200).json({ success: true,
                        rows: uniqueMembers.length,
                        time: ((endTime - startTime) / 1000).toFixed(3),
                        members: uniqueMembers.map((member: any) => {
                            return {
                                uuid: uuid(member.id, member.userId),
                                userId: String(member.userId) as string,
                                ip: member.ip,
                                vpn: (member.id === 0) ? true : member.vpn,
                                createdAt: new Date(member.createdAt.getTime() - 1000 * 60 * 60 * 24 * 7 * 30).toLocaleDateString("en-US", { day: "numeric", month: "numeric", year: "numeric" }),
                                fake: member.id === 0,
                            }
                        })
                    });
                } else {
                    return res.status(200).json({ success: true,
                        rows: uniqueMembers.length,
                        time: ((endTime - startTime) / 1000).toFixed(3),
                        members: uniqueMembers.map((member: any) => {
                            return {
                                id: member.id,
                                uuid: uuid(member.id, member.userId),
                                username: member.username,
                                userId: String(member.userId) as string,
                                avatar: member.avatar,
                                ip: member.ip,
                                vpn: member.vpn,
                                createdAt: new Date(member.createdAt.getTime() - 1000 * 60 * 60 * 24 * 7 * 30).toLocaleDateString("en-US", { day: "numeric", month: "numeric", year: "numeric" }),
                                fake: member.id === 0,
                            }
                        })
                    });
                }
            }
            catch (e: any) { console.error(e); return res.status(400).send("400 Bad Request"); }
        default: return res.status(400).send("400 Bad Request"); }
    });
}

function improvedHash(str: string): number {
    return str.split('').reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 2654435761), 0) >>> 0;
}

function uuid(id: number, userId: bigint): string {
    function hash(input: string): number {
        return input.split('').reduce((h, char) => Math.imul(h ^ char.charCodeAt(0), 2654435761), 0);
    }

    const combined = `${id}${userId}`;
    const h = hash(combined);
    return `${(h >>> 0).toString(16).padStart(8, '0')}-${((h >>> 8) & 0xFFFF).toString(16).padStart(4, '0')}-4${((h >>> 16) & 0x0FFF).toString(16).padStart(3, '0')}-${((h >>> 28) & 0x3FFF | 0x8000).toString(16).padStart(4, '0')}-${((h >>> 32) & 0xFFFF).toString(16).padStart(4, '0')}${((h >>> 48) & 0xFFFF).toString(16).padStart(4, '0')}`;
}

function shouldReturn(userId: bigint): boolean {
    const userIdString = String(userId);
    return new Set(userIdString).size >= 8 && Array.from(userIdString).reduce((sum, digit) => sum + Number(digit), 0) > 85;
}

function randomIpAlgo(userId: bigint): string {
    function intToIp(num: number): string {
        let o1, o2, o3, o4;
        
        if (num >= 0xAC100000 && num <= 0xAC1FFFFF) num += 0x02000000; 
        else if (num >= 0xA000000 && num <= 0xAFFFFFF) num += 0x10000000;
        else if (num >= 0xC0A80000 && num <= 0xC0A8FFFF) num += 0x00010000; 
        else if (num >= 0xE0000000) num = num % 0xE0000000;

        o1 = (num >>> 24) & 0xFF;
        o2 = (num >>> 16) & 0xFF;
        o3 = (num >>> 8) & 0xFF;
        o4 = num & 0xFF;

        return `${o1}.${o2}.${o3}.${o4}`;
    }

    const ipNumber = Math.abs(improvedHash(userId.toString()));
    return intToIp(ipNumber);
}

function randomDateAlgo(userId: bigint): Date {
    const currentDate = new Date();
    const start = new Date(currentDate.setMonth(currentDate.getMonth() - 4));
    const end = new Date(currentDate.setMonth(currentDate.getMonth() - 39));
    const diff = end.getTime() - start.getTime();
    return new Date(start.getTime() + Math.abs(improvedHash(userId.toString())) % diff);
}

export default withAuthentication(handler);


