import { NextApiRequest, NextApiResponse } from "next/types";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { success, canceled } = req.query;
        return res.redirect(301, `/dashboard/upgrade${success ? "?s=1" : canceled ? "?c=1" : ""}`);
    }
    catch (err: any) { console.error(err); return res.redirect(301, `/dashboard/upgrade`); }
}