import { Prisma, accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";
import Email from "../../../src/email";

const Subscriptions: { [key: string]: { plan: string; expiry: number | null } } = {
    free: { plan: "free", expiry: null },
    premium_m: { plan: "premium", expiry: 2678400 },
    business_m: { plan: "business", expiry: 2678400 },
    premium: { plan: "premium", expiry: 31536000 },
    business: { plan: "business", expiry: 31536000 },
    premium_custom: { plan: "premium", expiry: null },
    business_custom: { plan: "business", expiry: null },
};

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const fullId: any = req.body.userId ?? '';
                const plan: number = req.body.plan ?? '';
                const expiry: string = req.body.expiry ?? Subscriptions[plan].expiry;

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
                        role: Subscriptions[plan].plan,
                        expiry: new Date(expiry),
                    },
                });

                await Email.send({
                    to: account.email,
                    from: {
                        email: "no-reply@restorecord.com",
                        name: "RestoreCord"
                    },
                    subject: "[RestoreCord] Account Upgraded",
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
                                    Account Upgraded
                                </h2>
                                <div>
                                    <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                        Dear ${account.username},
                                        <br>Your Subscription has been changed.
                                        Plan: ${Subscriptions[plan].plan.charAt(0).toUpperCase() + Subscriptions[plan].plan.slice(1)}
                                        Expiry: ${Subscriptions[plan].expiry ? new Date(new Date().getTime() + Number(Subscriptions[plan].expiry) * 1000).toLocaleString() : "Never"}
                                        <br>Sincerely,
                                        RestoreCord Trust & Safety Team
                                    </p>
                                </div>
                                <div style="text-align: center; margin-top: 1rem;">
                                    <em style="color: rb(190, 198, 213)">
                                        Copyright © 2023 RestoreCord. All rights reserved.
                                    </em>
                                </div>
                            </div>
                        </body>
                    </html>
                    `,
                }).then(() => {
                    console.log(`[EMAIL] [${new Date().toLocaleString()}] Account Upgraded, Email sent to ${account.email}`);
                }).catch((err: any) => {
                    console.error(err);
                })

                return res.status(200).json({ success: true, message: "Successfully upgraded account, Email Sent!" });
            }
            catch (e: any) {
                console.error(e);
                return res.status(400).send("400 Bad Request");
            }
            break;
        default:
            return res.status(400).send("400 Bad Request");
            break;
        }
    });
}

export default withAuthentication(handler);