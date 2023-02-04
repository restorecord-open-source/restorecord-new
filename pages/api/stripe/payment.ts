import { NextApiRequest, NextApiResponse } from "next/types";
import Stripe from "stripe";
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        const { session_id, success, canceled } = req.query;

        console.log(session_id, success, canceled);

        if (session_id) {
            const checkout = await stripe.checkout.sessions.retrieve(session_id as string);
            if (!checkout) return res.status(400).json({ success: false, message: "Checkout session not found." });
        }

        res.redirect(301, `/dashboard/upgrade${success ? "?s=1" : canceled ? "?c=1" : ""}`);
    });
}