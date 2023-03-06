import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const accounts = await prisma.accounts.count();
                const accountsBusiness = await prisma.accounts.count({ where: { role: "business" } });
                const accountsPremium = await prisma.accounts.count({ where: { role: "premium" } });
                const servers = await prisma.servers.count();
                const customBots = await prisma.customBots.count();
                const payments = await prisma.payments.count();
                const paymentsCompleted = await prisma.payments.findMany({ where: { OR: [{ payment_status: "CONFIRMED" }, { payment_status: "active" }] } });

                return res.status(200).json({
                    accounts: accounts,
                    accountsBusiness: accountsBusiness,
                    accountsPremium: accountsPremium,
                    servers: servers,
                    customBots: customBots,
                    payments: payments,
                    paymentsCompleted: paymentsCompleted.length,
                    totalRevenue: paymentsCompleted.reduce((a, b) => a + b.amount, 0) / 100,
                    totalRevenueToday: paymentsCompleted.filter(p => new Date(p.createdAt).getDate() === new Date().getDate()).reduce((a, b) => a + b.amount, 0) / 100,
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