import { accounts, backups, customBots, payments, servers } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../src/db";
import withAuthentication from "../../../../src/withAuthentication";
import Stripe from "stripe";


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
// const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    try {
        if (req.method !== "GET") return res.status(400).json({ success: false, message: "Invalid method" });

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
                return {
                    id: payment.id,
                    amount: payment.amount,
                    plan: payment.type,
                    status: payment.payment_status,
                    createdAt: new Date(payment.createdAt),
                };
            }
        }));
        
        const mergedResponse = response.flat().sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        
        return res.status(200).json({ success: true, payments: mergedResponse });
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}


export default withAuthentication(handler);