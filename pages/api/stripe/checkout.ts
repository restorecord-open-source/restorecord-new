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
        case "premium":
            paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi"); // PREMIUM 1 YEAR (15 EUR)
            //paymentid = await stripe.prices.retrieve("price_1MSks7IDsTail4YBgM8FFLTg"); // TEST
            break;
        case "premium_monthly":
            paymentid = await stripe.prices.retrieve("price_1MakYlIDsTail4YBvmoAoG37"); // PREMIUM 30 DAYS (2 EUR)
            break;
        case "business":
            paymentid = await stripe.prices.retrieve("price_1MVilQIDsTail4YBuxkF8JRc"); // BUSINESS 1 YEAR (30 EUR)
            //paymentid = await stripe.prices.retrieve("price_1MSt40IDsTail4YBGWYS6YvP"); // TEST
            break;
        case "business_monthly":
            paymentid = await stripe.prices.retrieve("price_1MakYkIDsTail4YBS7RWBqQL"); // BUSINESS 30 DAYS (5 EUR)
            break;
        default:
            paymentid = await stripe.prices.retrieve("price_1MVilKIDsTail4YBdF2GvIUi"); // PREMIUM 1 YEAR (15 EUR)
            break;
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
            // if previous customer exists add customer parameter if not use customer_email parameter
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
                        coupon: user.referrer === (25555 || 38) ? "gOXxUjqM" : "yQDbm1vi"
                    },
                ],
            }),
            ...(new Date().getMonth() + 1 === 10 && new Date().getDate() >= 30) || (new Date().getMonth() + 1 === 11 && new Date().getDate() <= 5) ? {
                discounts: [
                    {
                        coupon: "k0emdyzR",
                    },
                ],
            } : {},
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