import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";

import withAuthentication from "../../../src/withAuthentication";
import * as coinbase from "coinbase-commerce-node";

var Client = coinbase.Client;
Client.init(process.env.COINBASE_API_KEY!);

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async (resolve, reject) => {
        const { plan, id } = req.body;
        if (!id || !plan) return res.status(400).json({ success: false, message: "Missing parameters" });
        
        let amount = "15.00"
        switch (plan) {
        case "premium":
            amount = "15.00";
            break;
        case "business":
            amount = "30.00";
            break;
        case "premium_monthly":
            amount = "2.00";
            break;
        case "business_monthly":
            amount = "5.00";
            break;
        default:
            amount = "15.00";
            break;
        }

        var Charge = coinbase.resources.Charge;

        const charge = await Charge.create({
            name: "Restorecord Subscription",
            description: "Restorecord Subscription",
            local_price: {
                amount: amount,
                currency: "USD"
            },
            pricing_type: "fixed_price",
            metadata: {
                account_id: user.id,
                plan: plan,
            },
            redirect_url: `https://restorecord.com/dashboard/upgrade?s=2`,
            cancel_url: `https://restorecord.com/dashboard/upgrade?c=1`,
        });

        return res.status(200).json({
            redirect: charge.hosted_url,
        });
    });
}

export default withAuthentication(handler);