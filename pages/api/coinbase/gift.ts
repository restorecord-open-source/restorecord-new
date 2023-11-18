import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";

import withAuthentication from "../../../src/withAuthentication";
import * as coinbase from "coinbase-commerce-node";
import { prisma } from "../../../src/db";

var Client = coinbase.Client;
Client.init(process.env.COINBASE_API_KEY!);

async function handler(req: NextApiRequest, res: NextApiResponse, account: accounts) {
    switch (req.method) {
    case "POST":
        try {
            const { plan, months, user } = req.body;
            if (!plan || !months || !user) return res.status(400).json({ success: false, message: "Missing parameters" });
        
            let amount = "15.00"
            switch (plan) {
            case "premium":
                amount = "2.00";
                break;
            case "business":
                amount = "5.00";
                break;
            }

            amount = ((Number(amount) * Number(months)) * 1.1).toFixed(2);
            amount = (Number(months) >= 12 ? (Number(amount) / 2).toFixed(2) : amount);

            const userAccount = await prisma.accounts.findFirst({
                where: {
                    OR: [
                        { username: user },
                        { email: user },
                    ],
                },
            });
            
            if (!userAccount) return res.status(400).json({ success: false, message: "User could not be found" });
            if (userAccount.id === account.id) return res.status(400).json({ success: false, message: "You cannot gift yourself a subscription" });
            if (userAccount.role !== "free" || userAccount.expiry !== null) return res.status(400).json({ success: false, message: "User already has a subscription" });
            if (userAccount.banned) return res.status(400).json({ success: false, message: "User is banned" });

            var Charge = coinbase.resources.Charge;

            const charge = await Charge.create({
                name: "RestoreCord Subscription",
                description: `RestoreCord ${plan} Subscription Gift to ${userAccount.username}`,
                local_price: {
                    amount: amount,
                    currency: "USD"
                },
                pricing_type: "fixed_price",
                metadata: {
                    account_id: userAccount.id,
                    plan: plan,
                    gift: true,
                    gifterId: account.id,
                },
                redirect_url: `https://restorecord.com/dashboard/upgrade?s=2`,
                cancel_url: `https://restorecord.com/dashboard/upgrade?c=1`,
            });

            return res.status(200).json({
                redirect: charge.hosted_url,
            });
        } catch (e: any) {
            console.error(e);
            return res.status(400).json({ success: false, message: "An error occurred" });
        }
        break;
    }
}

export default withAuthentication(handler);