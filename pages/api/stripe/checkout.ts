import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";

import Stripe from "stripe";
import withAuthentication from "../../../src/withAuthentication";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async (resolve, reject) => {
        const { plan, id } = req.body;
        if (!id || !plan) return res.status(400).json({ success: false, message: "Missing parameters" });

        let paymentid;
        switch (plan) {
        case "premium":
            paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi"); // PREMIUM 1 YEAR (15 EUR)
            break;
        case "premium_monthly":
            paymentid = await stripe.prices.retrieve("price_1MakYlIDsTail4YBvmoAoG37"); // PREMIUM 30 DAYS (2 EUR)
            break;
        case "business":
            paymentid = await stripe.prices.retrieve("price_1MVilQIDsTail4YBuxkF8JRc"); // BUSINESS 1 YEAR (30 EUR)
            break;
        case "business_monthly":
            paymentid = await stripe.prices.retrieve("price_1MakYkIDsTail4YBS7RWBqQL"); // BUSINESS 30 DAYS (5 EUR)
            break;
        default:
            paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi"); // PREMIUM 1 YEAR (15 EUR)
        }

        const planFormatted = (plan.charAt(0).toUpperCase() + plan.slice(1)).replace("_", " ");

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: paymentid?.id,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            customer_email: user.email,
            success_url: `https://restorecord.com/api/stripe/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://restorecord.com/api/stripe/payment?canceled=true`,
            client_reference_id: String(user.id) as string,
            metadata: {
                account_id: user.id,
                plan: plan,
            },
            subscription_data: {
                description: `RestoreCord ${planFormatted} Subscription`,
                metadata: {
                    account_id: user.id,
                    plan: plan,
                },
            },
        });
    
        return res.status(200).json({
            redirect: session.url
        });
    });
}

export default withAuthentication(handler);