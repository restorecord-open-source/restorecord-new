import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import { createRedisInstance } from "../../../src/Redis";
import withAuthentication from "../../../src/withAuthentication";
const redis = createRedisInstance();

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const cached = await redis.get("adminStats");
                if (cached) return res.status(200).json(JSON.parse(cached));

                const accounts = await prisma.accounts.count();
                const accountsBusiness = await prisma.accounts.count({ where: { role: "business" } });
                const accountsPremium = await prisma.accounts.count({ where: { role: "premium" } });
                const servers = await prisma.servers.count();
                const serversPulling = await prisma.servers.count({ where: { pulling: true } });
                const members = await prisma.members.count();
                const customBots = await prisma.customBots.count();
                const payments = await prisma.payments.count();
                const paymentsCompleted = await prisma.payments.findMany({ where: { OR: [{ payment_status: "CONFIRMED" }, { payment_status: "active" }] } });

                const lastPurchases = await prisma.payments.findMany({ where: { OR: [{ payment_status: "CONFIRMED" }, { payment_status: "active" }] }, orderBy: { createdAt: "desc" }, take: 4 }).then(payments => {
                    return Promise.all(payments.map(async payment => {
                        const account = await prisma.accounts.findUnique({ where: { id: payment.accountId } });
                        return { 
                            id: payment.id,
                            // plan: payment.type.slice(0, 1).toUpperCase() + payment.type.slice(1).split("_").join(" "),
                            // plan if contains _ then split and only get first word + first letter of last word  so if "business_monthly" do "Business M"
                            plan: payment.type.includes("_") ? payment.type.split("_")[0].slice(0, 1).toUpperCase() + payment.type.split("_")[0].slice(1) + " " + payment.type.split("_")[1].slice(0, 1).toUpperCase() : payment.type.slice(0, 1).toUpperCase() + payment.type.slice(1),
                            username: account?.username,
                            date: new Date(payment.createdAt),
                        };
                    }));
                });

                const response = {
                    accounts: accounts,
                    accountsBusiness: accountsBusiness,
                    accountsPremium: accountsPremium,
                    servers: servers,
                    serversPulling: serversPulling,
                    members: members,
                    customBots: customBots,
                    payments: payments,
                    paymentsCompleted: paymentsCompleted.length,
                    totalRevenue: paymentsCompleted.reduce((a, b) => a + b.amount, 0) / 100,
                    totalRevenueToday: paymentsCompleted.filter(p => new Date(p.createdAt).getDate() === new Date().getDate()).reduce((a, b) => a + b.amount, 0) / 100,
                    totalRevenue7d: paymentsCompleted.filter(p => new Date(p.createdAt).getTime() > new Date().getTime() - 604800000).reduce((a, b) => a + b.amount, 0) / 100,
                    totalRevenue30d: paymentsCompleted.filter(p => new Date(p.createdAt).getTime() > new Date().getTime() - 2592000000).reduce((a, b) => a + b.amount, 0) / 100,
                    lastPurchases: lastPurchases
                };

                await redis.set("adminStats", JSON.stringify(response), "EX", 15);
                return res.status(200).json(response);
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