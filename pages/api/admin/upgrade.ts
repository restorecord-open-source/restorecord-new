import { Prisma, accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";
import Email from "../../../src/email";


async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const fullId: any = req.body.userId ?? "";
                const plan: string = req.body.plan ?? "";
                const expiry: string = req.body.expiry ?? null;

                const account = await prisma.accounts.findUnique({
                    where: { id: parseInt(fullId) as number, },
                });

                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                await prisma.accounts.update({
                    where: { id: parseInt(fullId) as number, },
                    data: {
                        role: plan,
                        expiry: plan === "free" ? null : new Date(expiry),
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
                                        Plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}
                                        Expiry: ${expiry ? new Date(new Date(expiry).getTime() + 1000 * 60 * 60 * 24 * 30).toLocaleDateString() : "Never"}
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
                    console.log(`[EMAIL] [${new Date().toLocaleString()}] Account Upgraded, Email sent to ${account.email}`);
                }).catch((err: any) => {
                    console.error(err);
                })

                return res.status(200).json({ success: true, message: `${account.username} Subscription changed to ${plan.charAt(0).toUpperCase() + plan.slice(1)} until ${expiry ? new Date(new Date(expiry).getTime() + 1000 * 60 * 60 * 24 * 30).toLocaleDateString() : "Never"}` });
            }
            catch (e: any) { console.error(e); return res.status(400).send("400 Bad Request"); }
            
        default: return res.status(400).send("400 Bad Request");
        }
    });
}

export default withAuthentication(handler);