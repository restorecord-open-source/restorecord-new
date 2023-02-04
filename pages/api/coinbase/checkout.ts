import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next/types";
import { prisma } from "../../../src/db";
import { ProxyCheck } from "../../../src/proxycheck";
import { getIPAddress } from "../../../src/getIPAddress";
import * as coinbase from "coinbase-commerce-node";
var Client = coinbase.Client;
var Checkout = coinbase.resources.Checkout;

Client.init(process.env.COINBASE_API_KEY!);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        const { plan, id } = req.body;
        if (!id || !plan) return res.status(400).json({ success: false, message: "Missing parameters" });
        
        const token = req.headers.authorization as string;
        if (!token) return res.status(400).json({ success: false, message: "Missing token" });

        const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
        if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });

        const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

        if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

        const account = await prisma.accounts.findFirst({ where: { id: valid.id } });
        if (!account) return res.status(400).json({ success: false, message: "No account found." });

        // let paymentid;
        // switch (plan) {
        // case "premium":
        //     paymentid = await stripe.prices.retrieve("price_1MSks7IDsTail4YBgM8FFLTg");
        //     break;
        // case "business":
        //     paymentid = await stripe.prices.retrieve("price_1MSt40IDsTail4YBGWYS6YvP");
        //     break;
        // }

        // const session = await stripe.checkout.sessions.create({
        //     line_items: [
        //         {
        //             price: paymentid?.id,
        //             quantity: 1,
        //         },
        //     ],
        //     mode: "subscription",
        //     customer_email: account.email,
        //     success_url: `https://beta.restorecord.com/api/stripe/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
        //     cancel_url: `https://beta.restorecord.com/api/stripe/payment?canceled=true`,
        //     client_reference_id: String(valid.id) as string,
        //     metadata: {
        //         account_id: valid.id,
        //         plan: plan,
        //     },
        //     subscription_data: {
        //         metadata: {
        //             account_id: valid.id,
        //             plan: plan,
        //         },
        //     },
        // });
    
        // return res.status(200).json({
        //     redirect: session.url
        // });

        let amount = "15.00"
        switch (plan) {
        case "premium":
            amount = "15.00";
            break;
        case "business":
            amount = "30.00";
            break;
        }

        var Charge = coinbase.resources.Charge;

        const charge = await Charge.create({
            name: "Restorecord Subscription",
            description: "Restorecord Subscription",
            local_price: {
                amount: "0.01",
                currency: "USD"
            },
            pricing_type: "fixed_price",
            metadata: {
                account_id: valid.id,
                plan: plan,
            },
            redirect_url: `https://beta.restorecord.com/dashboard/upgrade?s=2`,
            cancel_url: `https://beta.restorecord.com/dashboard/upgrade?c=1`,
        });

        return res.status(200).json({
            redirect: charge.hosted_url,
        });
    });
}