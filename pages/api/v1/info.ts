import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    let members: any = await prisma.members.findMany({
        where: {
            accessToken: {
                not: "unauthorized"
            }
        }
    });

    let last24h = members.filter((member: any) => {return Date.now() - member.createdAt.getTime() < 86400000; });
    let last7d = members.filter((member: any) => { return Date.now() - member.createdAt.getTime() < 604800000; });
    let last30d = members.filter((member: any) => { return Date.now() - member.createdAt.getTime() < 2592000000; });

    let last24hCount = Array.from({ length: 24 }, (_, i) => i).map((i: any) => {
        const date = new Date();
        date.setHours(date.getHours() - (24 - i));
        return last24h.filter((member: any) => { return member.createdAt.getHours() === date.getHours(); }).length
    });

    let last7dCount = Array.from({ length: 7 }, (_, i) => i).map((i: any) => {
        const date = new Date();
        date.setDate(date.getDate() - (7 - i));
        return last7d.filter((member: any) => { return member.createdAt.getDate() === date.getDate(); }).length
    });

    let last30dCount = Array.from({ length: 30 }, (_, i) => i).map((i: any) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        return last30d.filter((member: any) => { return member.createdAt.getDate() === date.getDate(); }).length
    });

    return res.status(200).json({
        last24h: [
            last24hCount,
        ],
        last7d: [
            last7dCount,
        ],
        last30d: [
            last30dCount,
        ],
    });
}
