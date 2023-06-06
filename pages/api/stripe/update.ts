import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";

import Stripe from "stripe";
import withAuthentication from "../../../src/withAuthentication";
import { prisma } from "../../../src/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        const { plan } = req.body;
        if (!plan) return res.status(400).json({ success: false, message: "Missing parameters" });

        let paymentid;
        switch (plan) {
        case "premium":
            paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi"); // PREMIUM 1 YEAR (15 EUR)
            // paymentid = await stripe.prices.retrieve("price_1MSks7IDsTail4YBgM8FFLTg"); // TEST
            break;
        case "premium_monthly":
            paymentid = await stripe.prices.retrieve("price_1MakYlIDsTail4YBvmoAoG37"); // PREMIUM 30 DAYS (2 EUR)
            break;
        case "business":
            paymentid = await stripe.prices.retrieve("price_1MVilQIDsTail4YBuxkF8JRc"); // BUSINESS 1 YEAR (30 EUR)
            // paymentid = await stripe.prices.retrieve("price_1MSt40IDsTail4YBGWYS6YvP"); // TEST
            break;
        case "business_monthly":
            paymentid = await stripe.prices.retrieve("price_1MakYkIDsTail4YBS7RWBqQL"); // BUSINESS 30 DAYS (5 EUR)
            break;
        default:
            paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi"); // PREMIUM 1 YEAR (15 EUR)
            break;
        }

        const payments = await prisma.payments.findMany({ where: { accountId: user.id, payment_status: "active" }, orderBy: { id: "desc" } });
        if (!payments) return res.status(400).json({ success: false, message: "No payments found." });
        if (payments[0].subscriptionId === null || payments[0].subscriptionId === undefined) return res.status(400).json({ success: false, message: "Subscription not found." });

        const subscription = await stripe.subscriptions.retrieve(payments[0].subscriptionId);

        const session = await stripe.billingPortal.sessions.create({
            return_url: `https://restorecord.com/dashboard/upgrade`,
            customer: subscription.customer as string,
            flow_data: {
                type: "subscription_update" as any,
                subscription_update: {
                    subscription: subscription.id,
                }
            } as any
        });

        return res.status(200).json({ success: true, redirect: session.url });
    }
    catch (err: any) {
        // if StripeInvalidRequestError respond with sub not found
        if (err.type === "StripeInvalidRequestError") return res.status(400).json({ success: false, message: "Subscription not found." });

        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export default withAuthentication(handler);