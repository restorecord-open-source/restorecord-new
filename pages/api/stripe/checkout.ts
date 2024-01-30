import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";

import Stripe from "stripe";
import withAuthentication from "../../../src/withAuthentication";
import { prisma } from "../../../src/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        const { plan, id } = req.body;
        if (!id || !plan) return res.status(400).json({ success: false, message: "Missing parameters" });

        let paymentid;
        switch (plan) {
        case "premium": paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi");             break; // PREMIUM 1 YEAR (15 EUR) TEST: price_1MSks7IDsTail4YBgM8FFLTg
        case "premium_monthly": paymentid = await stripe.prices.retrieve("price_1MakYlIDsTail4YBvmoAoG37");     break; // PREMIUM 30 DAYS (2 EUR)
        case "business": paymentid = await stripe.prices.retrieve("price_1MVilQIDsTail4YBuxkF8JRc");            break; // BUSINESS 1 YEAR (30 EUR) TEST: price_1MSt40IDsTail4YBGWYS6YvP
        case "business_monthly": paymentid = await stripe.prices.retrieve("price_1MakYkIDsTail4YBS7RWBqQL");    break; // BUSINESS 30 DAYS (5 EUR)
        default: paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi");                    break; // PREMIUM 1 YEAR (15 EUR)
        }

        const payments = await prisma.payments.findMany({ where: { accountId: user.id }, orderBy: { createdAt: "desc" } });
        let previousCustomer: string | undefined = undefined;

        const activePayment = payments.find(payment => payment.payment_status === "active" || payment.payment_status === "trialing");
        if (activePayment) {
            if (activePayment.payment_status !== "cancelled" && activePayment.payment_status !== "CONFIRMED") {
                previousCustomer = (await stripe.subscriptions.retrieve(activePayment.subscriptionId)).customer as string;
            }
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: paymentid?.id,
                quantity: 1,
            }],
            mode: "subscription",
            success_url: `https://restorecord.com/api/stripe/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://restorecord.com/api/stripe/payment?canceled=true`,
            client_reference_id: String(user.id) as string,
            metadata: {
                account_id: user.id,
                plan: plan,
            },
            
            ...(previousCustomer ? { customer: previousCustomer } : { customer_email: user.email }),
            ...(previousCustomer ? { customer_update: {
                name: "auto",
            }, } : {}),
            subscription_data: {
                description: `RestoreCord Subscription`,
                metadata: {
                    account_id: user.id,
                    plan: plan,
                },
                ...(payments.length === 0 && {
                    trial_period_days: 7,
                }),  
            },
            tax_id_collection: {
                enabled: true,
            },
            ...(user.referrer && {
                discounts: [
                    {
                        coupon: user.referrer === (25555 || 38 || 24 || 0) ? "gOXxUjqM" : "yQDbm1vi"
                    },
                ],
            }),
        });
    
        return res.status(200).json({
            redirect: session.url
        });
    } catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Error" });
    }
}

export default withAuthentication(handler);