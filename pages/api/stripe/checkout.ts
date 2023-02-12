import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next/types";
import { prisma } from "../../../src/db";
import Stripe from "stripe";
import { ProxyCheck } from "../../../src/proxycheck";
import { getIPAddress } from "../../../src/getIPAddress";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

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

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: paymentid?.id,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            customer_email: account.email,
            success_url: `https://restorecord.com/api/stripe/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://restorecord.com/api/stripe/payment?canceled=true`,
            client_reference_id: String(valid.id) as string,
            metadata: {
                account_id: valid.id,
                plan: plan,
            },
            subscription_data: {
                metadata: {
                    account_id: valid.id,
                    plan: plan,
                },
            },
        });
    
        return res.status(200).json({
            redirect: session.url
        });
    });
}