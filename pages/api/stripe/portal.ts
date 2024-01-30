import { NextApiRequest, NextApiResponse } from "next/types";
import { accounts } from "@prisma/client";

import Stripe from "stripe";
import withAuthentication from "../../../src/withAuthentication";
import { prisma } from "../../../src/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        const payments = await prisma.payments.findMany({ where: { accountId: user.id, OR: [{ payment_status: "trialing" }, { payment_status: "active" }] }, orderBy: { createdAt: "desc" } });
        if (payments.length === 0 || (payments[0].subscriptionId === null || payments[0].subscriptionId === undefined)) return res.status(400).json({ success: false, message: "Subscription not found." });

        const subscription = await stripe.subscriptions.retrieve(payments[0].subscriptionId);
        if (!subscription) return res.status(400).json({ success: false, message: "Subscription not found." });

        const session = await stripe.billingPortal.sessions.create({
            return_url: `https://restorecord.com/dashboard/upgrade`,
            customer: subscription.customer as string,
        });

        return res.status(200).json({ success: true, redirect: session.url });
    }
    catch (err: any) {
        if (err.type === "StripeInvalidRequestError") return res.status(400).json({ success: false, message: "Subscription not found." });

        console.error(err);
        return res.status(400).json({ success: false, message: "Error" });
    }
}

export default withAuthentication(handler);