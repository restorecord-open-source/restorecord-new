import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";
import Email from "../../../src/email";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

export const banReasons = [
    { 
        id: 1,
        reason: "spam",
        message: "Your account has been banned for spam and/or platform abuse."
    },
    { 
        id: 2,
        reason: "ddos or account cracking",
        message: "Your account was involved in fraud, account or credit card cracking, and/or attempting to damage a computer network or machine." 
    },
    { 
        id: 3,
        reason: "fraudulent payment or dispute",
        message: "Your account was found to have issued fraudulent charges."
    },
    { 
        id: 4,
        reason: "child abuse",
        message: "Your account has been banned due to suspected involvement in child abuse." 
    },
    { 
        id: 5,
        reason: "other",
        message: "Your account has been banned for unspecified reasons. Our team has determined that your behavior is a risk to our community's safety and well-being."
    },
    {
        id: 6,
        reason: "nsfw, gore or violence",
        message: "Your account has been banned for posting extreme NSFW, gore or violence."
    },
    {
        id: 7,
        reason: "multiple accounts",
        message: "Your account has been banned for having multiple accounts."
    },
    {
        id: 8,
        reason: "hate speech or harassment",
        message: "Your account has been banned for hate speech or harassment."
    },
    {
        id: 9,
        reason: "illegal activity",
        message: "Your account has been banned for illegal activity."
    },
    {
        id: 10,
        reason: "impersonation",
        message: "Your account has been banned for impersonation."
    },
];

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const fullId: any = req.body.userId ?? "";
                const reason: number = req.body.reason ?? "";

                const account = await prisma.accounts.findUnique({
                    where: {
                        id: parseInt(fullId) as number,
                    },
                });

                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                await prisma.accounts.update({
                    where: {
                        id: parseInt(fullId) as number,
                    },
                    data: {
                        banned: reason,
                    },
                });

                await prisma.sessions.deleteMany({
                    where: {
                        accountId: parseInt(fullId) as number,
                    },
                });

                const stripeCustomer = await stripe.customers.list({ email: account.email });
                if (stripeCustomer.data.length > 0) {
                    const customer = stripeCustomer.data[0];

                    const subscriptions = await stripe.subscriptions.list({ customer: customer.id });
                    for (const subscription of subscriptions.data) {
                        await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true });
                    }
                }

                await Email.send({
                    to: account.email,
                    from: {
                        email: "no-reply@restorecord.com",
                        name: "RestoreCord"
                    },
                    subject: "Account Banned - Violation of Terms of Service",
                    html:
                    `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>RestoreCord</title>
                        </head>
                        <body>
                            <h1 style="text-align: center; margin-top: 1.5rem; line-height: 2rem; font-size: 2.25rem; font-weight: 600; margin-bottom: 1rem; color: rgb(79, 70, 229);">
                                RestoreCord
                            </h1>
                            <div style="padding: 1rem; max-width: 50rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                    Account Banned - Violation of Terms of Service
                                </h2>
                                <div>
                                    <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                        Dear ${account.username},
                                        <br>Your account on RestoreCord has been suspended for violating our Terms of Service or Community Guidelines.
                                        <br>Reason for suspension: ${banReasons.find(r => r.id === reason)?.message}
                                        <br>If you believe your account was suspended in error, or have any questions or concerns, please contact us at <a href="mailto:support@restorecord.com">support@restorecord.com</a>.
                                        <br>Sincerely,
                                        RestoreCord Trust & Safety Team
                                    </p>
                                </div>
                                <div style="text-align: center; margin-top: 1rem;">
                                    <em style="color: rb(190, 198, 213)">
                                        Copyright &#169; 2024 RestoreCord. All rights reserved.
                                    </em>
                                </div>
                            </div>
                        </body>
                    </html>
                    `,
                }).then(() => {
                    console.log(`[EMAIL] [${new Date().toLocaleString()}] Account banned, Email sent to ${account.email}`);
                }).catch((err: any) => {
                    console.error(err);
                })

                return res.status(200).json({ success: true, message: "Account banned, Email sent." });
            }
            catch (e: any) {
                console.error(e);
                return res.status(400).send("400 Bad Request");
            }
            break;
        case "GET":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const help: any = req.query.h ?? "";
                if (help === "1") {
                    return res.status(200).json({ status: 200, reasons: banReasons });
                }
            }
            catch (e: any) {
                console.error(e);
                return res.status(400).send("400 Bad Request");
            }
        default:
            return res.status(400).send("400 Bad Request");
            break;
        }
    });
}

export default withAuthentication(handler);