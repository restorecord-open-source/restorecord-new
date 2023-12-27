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
                        createdAt: {
                            lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 180),
                        },
                        NOT: [
                            { ip: null },
                            { ip: "null" },
                            { ip: "127.0.0.1" },
                            { ip: "1.1.1.1" },
                        ],
                    },
                    orderBy: {
                        id: "desc",
                    },
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
                        createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 4 - 1000 * 60 * 60 * 24 * 3),
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

function uuid(id: number, userId: bigint) {
    return uuidv4({
        random: [
            ...Array.from(Buffer.from(String(id))),
            ...Array.from(Buffer.from(String(userId))),
        ],
    });
}

function shouldReturn(userId: bigint): boolean {
    const userIdString = String(userId);
    const uniqueDigits = new Set(userIdString);
    const sum = Array.from(userIdString).reduce((sum, digit) => sum + Number(digit), 0);

    return uniqueDigits.size >= 8 && sum > 85;
}

function randomIpAlgo(userId: bigint) {
    function hashString(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash;
    }

    function intToIp(num: number) {
        const octet1 = (num >>> 24) & 0xFF;
        const octet2 = (num >>> 16) & 0xFF;
        const octet3 = (num >>> 8) & 0xFF;
        const octet4 = num & 0xFF;
        return `${octet1}.${octet2}.${octet3}.${octet4}`;
    }

    const hashValue = hashString(userId.toString());
    const ipNumber = Math.abs(hashValue);
    const ipAddress = intToIp(ipNumber);
    
    return ipAddress;
}

export default withAuthentication(handler);


