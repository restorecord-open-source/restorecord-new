import { accounts, backups, customBots, payments, servers } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import * as speakeasy from "speakeasy";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";


async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        if (req.method !== "GET") return res.status(400).json({ success: false, message: "Invalid method" });

        const payments = await prisma.payments.findMany({ where: { accountId: user.id }, orderBy: { createdAt: "desc" } });

        const response = payments.map(async(payment: payments) => {
            return {
                id: payment.id,
                amount: payment.amount,
                plan: payment.type,
                status: payment.payment_status,
                createdAt: new Date(payment.createdAt),
            }
        });

        return res.status(200).json({ success: true, payments: await Promise.all(response) });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}


export default withAuthentication(handler);