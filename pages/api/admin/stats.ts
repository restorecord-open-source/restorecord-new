import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import { accounts } from "@prisma/client";
import { createRedisInstance } from "../../../src/Redis";
import withAuthentication from "../../../src/withAuthentication";

const redis = createRedisInstance();

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

    try {
        const cached = await redis.get("adminStats");
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }

        const [ accountsCount, accountsBusinessCount, accountsPremiumCount, serversCount, serversPullingCount, membersCount, customBotsCount, payments ] = await Promise.all([
            prisma.accounts.count(),
            prisma.accounts.count({ where: { role: "business" } }),
            prisma.accounts.count({ where: { role: "premium" } }),
            prisma.servers.count(),
            prisma.servers.count({ where: { pulling: true } }),
            // prisma.members.count(),
            prisma.$queryRaw`SHOW TABLE STATUS WHERE Name = 'members'`.then((res: any) => Number(res[0].Rows)),
            prisma.customBots.count(),
            prisma.payments.findMany({
                where: {
                    OR: [{ payment_status: "CONFIRMED" }, { payment_status: "active" }],
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const formattedLastPurchases = payments.slice(0, 5).map(payment => ({
            id: payment.id,
            plan: getFormattedPlan(payment.type),
            date: new Date(payment.createdAt),
        }));

        const paymentsCompleted = payments.filter(payment => payment.payment_status === "CONFIRMED" || payment.payment_status === "active");
        const totalRevenue = calculateTotalRevenue(paymentsCompleted);
        const totalRevenueToday = calculateTotalRevenueToday(paymentsCompleted);
        const totalRevenue7d = calculateTotalRevenue7d(paymentsCompleted);
        const totalRevenue30d = calculateTotalRevenue30d(paymentsCompleted);

        const response = {
            accounts: accountsCount,
            accountsBusiness: accountsBusinessCount,
            accountsPremium: accountsPremiumCount,
            servers: serversCount,
            serversPulling: serversPullingCount,
            members: membersCount,
            customBots: customBotsCount,
            payments: payments.length,
            paymentsCompleted: paymentsCompleted.length,
            totalRevenue: totalRevenue,
            totalRevenueToday: totalRevenueToday,
            totalRevenue7d: totalRevenue7d,
            totalRevenue30d: totalRevenue30d,
            lastPurchases: formattedLastPurchases,
        };

        await redis.set("adminStats", JSON.stringify(response), "EX", 60);
        return res.status(200).json(response);
    } catch (e: any) {
        console.error(e);
        return res.status(400).send("400 Bad Request");
    }
}

function getFormattedPlan(type: string): string {
    if (type.includes("_")) {
        const [category, duration] = type.split("_");
        const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1);
        const durationFormatted = duration.charAt(0).toUpperCase();
        return `${categoryFormatted} ${durationFormatted}`;
    } else {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
}
function calculateTotalRevenue(payments: any[]): number {
    return payments.reduce((total, payment) => total + payment.amount, 0) / 100;
}
  
function calculateTotalRevenueToday(payments: any[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return payments.filter(payment => new Date(payment.createdAt) >= today).reduce((total, payment) => total + payment.amount, 0) / 100;
}
  
function calculateTotalRevenue7d(payments: any[]): number {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return payments.filter(payment => new Date(payment.createdAt) >= sevenDaysAgo).reduce((total, payment) => total + payment.amount, 0) / 100;
}
  
function calculateTotalRevenue30d(payments: any[]): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return payments.filter(payment => new Date(payment.createdAt) >= thirtyDaysAgo).reduce((total, payment) => total + payment.amount, 0) / 100;
}
  
export default withAuthentication(handler);