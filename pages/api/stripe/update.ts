import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";
import { prisma } from "../../../src/db";

import Stripe from "stripe";
import * as coinbase from "coinbase-commerce-node";
import withAuthentication from "../../../src/withAuthentication";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

var Client = coinbase.Client;
Client.init(process.env.COINBASE_API_KEY!);

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        const { plan } = req.body;
        if (!plan) return res.status(400).json({ success: false, message: "Missing parameters" });

        let amount = "15.00"
        switch (plan) {
            case "premium": amount = "15.00"; break;
            case "business": amount = "30.00"; break;
            case "enterprise": amount = "200.00"; break;
            case "premium_monthly": amount = "2.00"; break;
            case "business_monthly": amount = "5.00"; break;
            case "enterprise_monthly": amount = "20.00"; break;
            default: amount = "15.00"; break;
        }

        var payment = await prisma.payments.findFirst({ where: { accountId: user.id, OR: [{ payment_status: "trialing" }, { payment_status: "active" }] }, orderBy: { createdAt: "desc" } });
        if (payment) {
            const subscription = await stripe.subscriptions.retrieve(payment.subscriptionId);
            if (subscription) {
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
        } else {
            var payment = await prisma.payments.findFirst({ where: { accountId: user.id, payment_status: "CONFIRMED" }, orderBy: { createdAt: "desc" } });

            if (payment && (user.role !== "free" && user.expiry)) {
                var Charge = coinbase.resources.Charge;
                
                const charge = await Charge.create({
                    name: "RestoreCord Subscription",
                    description: `RestoreCord ${plan} Subscription Upgrade`,
                    local_price: {
                        amount: String(Number(amount) * 1.10),
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

                return res.status(200).json({ success: true, redirect: charge.hosted_url });
            }
        }

    }
    catch (err: any) {
        if (err.type === "StripeInvalidRequestError") return res.status(400).json({ success: false, message: "Subscription not found." });

        console.error(err);
        return res.status(400).json({ success: false, message: "Error" });
    }
}

export default withAuthentication(handler);