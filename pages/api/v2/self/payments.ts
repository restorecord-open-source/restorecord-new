import { accounts, backups, customBots, payments, servers } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import Stripe from "stripe";
import { IntlRelativeTime } from "../../../../src/functions";


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
// const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

const plans: { name: string, price: number, expiry: number }[] = [
    { name: "premium", price: 1500, expiry: 365 },
    { name: "business", price: 3000, expiry: 365 },
    { name: "enterprise", price: 20000, expiry: 365 },
    { name: "premium_monthly", price: 200, expiry: 30 },
    { name: "business_monthly", price: 500, expiry: 30 },
    { name: "enterprise_monthly", price: 2000, expiry: 30 },
]
async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    switch (req.method) {
    case "POST":
        try {
            const { code, plan } = req.body;
            if (!code) return res.status(400).json({ success: false, message: "Missing Gift Code" });

            let giftCode = await prisma.giftCodes.findUnique({
                select: {
                    code: true,
                    amount: true,
                    used: true,
                    usedBy: true,
                    usedAt: true,
                },
                where: { code: code } 
            });

            if (!giftCode) return res.status(400).json({ success: false, message: "Invalid Gift Code" });
            if (giftCode.used && giftCode.usedBy !== user.id && giftCode.usedAt !== null) return res.status(400).json({ success: false, message: `Gift Code has already been redeemed, ${IntlRelativeTime(new Date(giftCode.usedAt).getTime())}` });

            if (giftCode.amount === 0) return res.status(400).json({ success: false, message: "Gift Code has no balance" });
            if (!plan) return res.status(200).json({ success: true, gift: giftCode, plans: plans, message: "Gift Code is valid, available balance: $" + (giftCode.amount / 100).toFixed(2) });

            const amount = plans.find(p => p.name === plan)?.price;
            if (!amount) return res.status(400).json({ success: false, message: "Invalid plan" });

            if (giftCode.amount < amount) return res.status(400).json({ success: false, message: "Gift Code doesn't have enough balance" });

            const payment = await prisma.payments.create({
                data: {
                    accountId: user.id,
                    amount: amount,
                    payment_status: "SUCCESS",
                    type: plan,
                    subscriptionId: `GIFT-${code}-${new Date().getTime()}`,
                    gift: true,
                }
            });

            giftCode = await prisma.giftCodes.update({
                where: { code: code },
                select: {
                    code: true,
                    amount: true,
                    used: true,
                    usedBy: true,
                    usedAt: true,
                },
                data: {
                    used: (giftCode.amount - amount) == 0,
                    usedAt: new Date(),
                    usedBy: user.id,
                    amount: (giftCode.amount - amount),
                    paymentId: payment.id,
                }
            });

            await prisma.accounts.update({
                where: { id: user.id },
                data: {
                    role: (plan === "premium" || plan === "premium_monthly") ? "premium" : (plan === "business" || plan === "business_monthly") ? "business" : "enterprise",
                    expiry: (user.expiry && user.expiry > new Date(Date.now()) && (user.role === "premium" && (plan === "premium" || plan === "premium_monthly")) || (user.role === "business" && (plan === "business" || plan === "business_monthly")) || (user.role === "enterprise" && (plan === "enterprise" || plan === "enterprise_monthly"))) ? new Date(new Date(user.expiry || Date.now()).getTime() + (plans.find(p => p.name === plan)?.expiry! * 24 * 60 * 60 * 1000)) : new Date(Date.now() + (plans.find(p => p.name === plan)?.expiry! * 24 * 60 * 60 * 1000)),
                }
            });

            await prisma.servers.updateMany({
                where: { ownerId: user.id },
                data: { pullTimeout: new Date() }
            });

            return res.status(200).json({ success: true, gift: giftCode, message: "Gift Code redeemed successfully, your plan has been updated" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
        break; // pointless but ok

    case "GET":
        try {
            let payments = await prisma.payments.findMany({ where: { accountId: user.id }, orderBy: { createdAt: "desc" } });

            const response = await Promise.all(payments.map(async (payment) => {
                if (payment.subscriptionId && payment.subscriptionId.startsWith("sub_")) {
                    try {
                        const invoices = await stripe.invoices.list({ subscription: payment.subscriptionId, limit: 100 });
        
                        const invoicesArray = await Promise.all(invoices.data.map(async (invoice: any) => {
                            return {
                                id: invoice.id,
                                amount: invoice.total,
                                plan: invoice.subscription_details.metadata.plan,
                                status: invoice.status,
                                createdAt: new Date(invoice.created * 1000),
                            };
                        }));
        
                        return invoicesArray;
                    } catch (err) {
                        return {
                            id: payment.id,
                            amount: payment.amount,
                            plan: payment.type,
                            status: payment.payment_status,
                            createdAt: new Date(payment.createdAt),
                        };
                    }
                } else {
                    // nice chatgpt code xenos 👏👏👏
                    return {
                        // if subscription id starts with GIFT- then replace split by - and get the 2nd last element then respond with GIFT-*****-*****-*****-ABC123
                        id: (payment.subscriptionId && payment.subscriptionId.startsWith("GIFT-")) ? `GIFT-${payment.subscriptionId.split("-")[1]}` : payment.id,
                        amount: payment.amount,
                        plan: payment.type,
                        status: payment.payment_status,
                        createdAt: new Date(payment.createdAt),
                    };
                }
            }));
        
            const mergedResponse = response.flat().sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
            return res.status(200).json({ success: true, payments: mergedResponse });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}


export default withAuthentication(handler);