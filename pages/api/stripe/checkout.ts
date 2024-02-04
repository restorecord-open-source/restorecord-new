import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";

import Stripe from "stripe";
import withAuthentication from "../../../src/withAuthentication";
import { prisma } from "../../../src/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

interface PricingTable {
    premium: {
        card: string;
        bank: string;
    };
    premium_monthly: {
        card: string;
        bank: string;
    };
    business: {
        card: string;
        bank: string;
    };
    business_monthly: {
        card: string;
        bank: string;
    };
}

const pricingTable: PricingTable = {
    premium: {
        card: "price_1MVilKIDsTail4YBdF2GvIUi",
        bank: "price_1OgFMTIDsTail4YBu0z1FrNa",
        // card: "price_1MSks7IDsTail4YBgM8FFLTg", // TESTING
        // bank: "price_1OgDpvIDsTail4YBD2f87p2q", // TESTING
    },
    premium_monthly: {
        card: "price_1MakYlIDsTail4YBvmoAoG37",
        bank: "price_1OgFMkIDsTail4YB7kPJCEaz",
    },
    business: {
        card: "price_1MVilQIDsTail4YBuxkF8JRc",
        bank: "price_1OgFLxIDsTail4YBHt8VBqE0",
        // card: "price_1MSt40IDsTail4YBGWYS6YvP", // TESTING
    },
    business_monthly: {
        card: "price_1MakYkIDsTail4YBS7RWBqQL",
        bank: "price_1OgFM9IDsTail4YB4b1EQ8zZ",
    },
};


async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        const { plan, id } = req.body;
        if (!id || !plan) return res.status(400).json({ success: false, message: "Missing parameters" });

        let paymentid;
        if (req.body.klarna || req.body.giropay)    paymentid = await stripe.prices.retrieve(pricingTable[plan as keyof PricingTable].bank);
        else                                        paymentid = await stripe.prices.retrieve(pricingTable[plan as keyof PricingTable].card || pricingTable["premium"].card);

        const payments = await prisma.payments.findMany({ where: { accountId: user.id }, orderBy: { createdAt: "desc" } });
        let previousCustomer: string | undefined = undefined;

        const activePayment = payments.find(payment => payment.payment_status === "active" || payment.payment_status === "trialing");
        if (activePayment) {
            if (activePayment.payment_status !== "cancelled" && activePayment.payment_status !== "CONFIRMED") {
                previousCustomer = (await stripe.subscriptions.retrieve(activePayment.subscriptionId)).customer as string;
            }
        }

        const session = await stripe.checkout.sessions.create({
            mode: req.body.klarna || req.body.giropay ? "payment" : "subscription",
            payment_method_types: ["card"],
            ...(req.body.klarna && { payment_method_types: ["klarna"] }),
            ...(req.body.giropay && { payment_method_types: ["giropay"] }),
            success_url: `https://dev.restorecord.com/api/stripe/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://dev.restorecord.com/api/stripe/payment?canceled=true`,
            client_reference_id: String(user.id) as string,
            metadata: {
                account_id: user.id,
                plan: plan,
            },
            ...(previousCustomer ? { customer: previousCustomer } : { customer_email: user.email }),
            ...(previousCustomer ? { customer_update: {
                name: "auto",
            }, } : {}),
            ...(req.body.klarna || req.body.giropay ? {
                line_items: [{
                    price: paymentid?.id,
                    quantity: 1,
                }],
            } : {
                subscription_data: {
                    description: `RestoreCord Subscription`,
                    metadata: {
                        account_id: user.id,
                        plan: plan,
                    },
                    ...(payments.length === 0 && {
                        trial_period_days: 7,
                    }),
                }
            }),
            ...(!req.body.klarna && !req.body.giropay && {
                line_items: [{
                    price: paymentid?.id,
                    quantity: 1,
                }],
            }),
            ...(req.body.klarna && req.body.giropay && { 
                payment_intent_data: {
                    capture_method: "automatic_async",
                    statement_descriptor: `RestoreCord ${plan === "premium" ? "Premium" : "Business"}`,
                },
            }),
            tax_id_collection: {
                enabled: true,
            },
            phone_number_collection: {
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