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

        const [accountsCount, accountsBusinessCount, accountsPremiumCount, serversCount, serversPullingCount, membersCount, customBotsCount, migrations, activeMigrations, payments] = await Promise.all([
            prisma.accounts.count(),
            prisma.accounts.count({ where: { role: "business" } }),
            prisma.accounts.count({ where: { role: "premium" } }),
            prisma.servers.count(),
            prisma.servers.count({ where: { pulling: true } }),
            prisma.$queryRaw`SHOW TABLE STATUS WHERE Name = 'members'`.then((res: any) => Number(res[0].Rows)),
            prisma.customBots.count(),
            prisma.migrations.count(),
            prisma.migrations.count({
                where: {
                    status: "PULLING",
                    updatedAt: { gte: new Date(new Date().getTime() - 15 * 60000), }
                }
            }),
            prisma.payments.findMany({
                where: { OR: [{ payment_status: "CONFIRMED" }, { payment_status: "active" }], },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        const paymentsCompleted = payments.filter(payment => payment.payment_status === "CONFIRMED" || payment.payment_status === "active");

        const formattedLastPurchases = paymentsCompleted.slice(0, 5).map(payment => ({
            id: payment.id,
            plan: getFormattedPlan(payment.type),
            date: new Date(payment.createdAt),
        }));

        const totalRevenue = paymentsCompleted.reduce((total, payment) => total + payment.amount, 0) / 100;
        const totalRevenueToday = calcRevenue(paymentsCompleted, new Date());
        const totalRevenue7d = calcRevenue(paymentsCompleted, new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
        const totalRevenue30d = calcRevenue(paymentsCompleted, new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000));

        const response = {
            accounts: accountsCount,
            accountsBusiness: accountsBusinessCount,
            accountsPremium: accountsPremiumCount,
            servers: serversCount,
            serversPulling: serversPullingCount,
            migrations: migrations,
            activeMigrations: activeMigrations,
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

        await redis.set("adminStats", JSON.stringify(response), "EX", 300);
        return res.status(200).json(response);
    }
    catch (e: any) { console.error(e); return res.status(400).send("400 Bad Request"); }
}

function getFormattedPlan(type: string): string {
    if (type.includes("_")) {
        const [category, duration] = type.split("_");
        const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1);
        const durationFormatted = duration.charAt(0).toUpperCase();
        return `${categoryFormatted} ${durationFormatted}`;
    }
    else return type.charAt(0).toUpperCase() + type.slice(1);
}

function calcRevenue(payments: any[], startDate: Date): number {
    return payments.filter(payment => new Date(payment.createdAt) >= startDate).reduce((total, payment) => total + payment.amount, 0) / 100;
}

export default withAuthentication(handler);
