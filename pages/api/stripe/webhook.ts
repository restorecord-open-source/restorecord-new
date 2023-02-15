import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { prisma } from "../../../src/db";
import Stripe from "stripe";
import axios from "axios";

export const config = {
    api: {
        bodyParser: false,
    },
};

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
// const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

async function buffer(readable: Readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async (resolve, reject) => {
        let event;
        let subscription: any;
        let status: string;

        const buf = await buffer(req);
        // const endpointSecret = "whsec_V36i82Fn70v9edAJHKeKwykhUI8bFLBt";
        const endpointSecret = "whsec_J2ZCMxWPvKeaStSWl4r1RdSnvTu39Gix";
        if (endpointSecret) {
            const signature: any = req.headers["stripe-signature"];
            try {
                event = stripe.webhooks.constructEvent(buf, signature, endpointSecret);
            } catch (err: any) {
                console.log(`[STRIPE] ⚠️ Webhook signature verification failed.`, err.message);
                return res.status(400).end();
            }
        }
        if (!event) return res.status(400).json({ success: false, message: "Event not found." });



        // console.log(JSON.stringify(event.data.object));
        // console.log(`[${event.type}] ${JSON.stringify(event.data.object)}`);

        switch (event.type) {
        case "customer.subscription.created":
            subscription = event.data.object;
            status = subscription.status;

            if (await prisma.payments.findUnique({ where: { subscriptionId: subscription.id } })) return;

            await prisma.payments.create({
                data: {
                    subscriptionId: subscription.id,
                    accountId: Number(subscription.metadata.account_id) as number,
                    type: subscription.metadata.plan,
                    amount: subscription.plan.amount,
                    payment_status: status,
                }
            });
        case "customer.subscription.updated":
            subscription = event.data.object;
            status = subscription.status;

            if (status !== "incomplete" && status !== "incomplete_expired") {
                let account;
                if (subscription.metadata.account_id) account = await prisma.accounts.findUnique({ where: { id: Number(subscription.metadata.account_id) as number } });

                await axios.post(`https://discord.com/api/webhooks/1053705505899548692/9LRHelRG4dmnSNR2Ili3Ab2SiyS96zHSz0Gy4o9g0GDsmdA6ZLli2CLlid7b0hQNd7rL`, {
                    embeds: [
                        {
                            title: "Subscription Updated",
                            description: `Subscription status is ${status}. ${subscription.cancel_at_period_end ? `(Plan ends: __${new Date(subscription.cancel_at * 1000).toLocaleString()})__` : ""}`,
                            color: subscription.cancel_at_period_end ? 0xFFFF00 : status === "active" ? 0x00ff12 : 0xff0000,
                            fields: [
                                {
                                    name: "Subscription ID",
                                    value: `||${subscription.id}||`,
                                    inline: true
                                },
                                {
                                    name: "Current Period End",
                                    value: `<t:${Math.floor(subscription.current_period_end)}:F>`,
                                    inline: true
                                },
                                {
                                    name: "Status",
                                    value: status === "active" ? `:white_check_mark: ${status}` : `:x: ${status}`,
                                    inline: true
                                },
                                {
                                    name: "Account ID",
                                    value: `**${subscription.metadata.account_id} ${account ? `(${account.username})` : ""}**`,
                                    inline: true
                                },
                                {
                                    name: "Plan",
                                    value: subscription.metadata.plan.slice(0, 1).toUpperCase() + subscription.metadata.plan.slice(1),
                                    inline: true
                                },
                                {
                                    name: "Amount",
                                    value: `$${subscription.plan.amount / 100}`,
                                    inline: true
                                },
                            ]
                        },
                    ]
                }).catch(err => console.error(err));
            }

            if (status === "active") {
                console.log(`[STRIPE] Subscription status is ${status}.`);

                const payment = await prisma.payments.findUnique({
                    where: {
                        subscriptionId: subscription.id
                    }
                });

                if (payment) {
                    // if payment.amount !== subscription.plan.amount then update payment.amount

                    await prisma.payments.update({
                        where: {
                            id: payment.id
                        },
                        data: {
                            payment_status: status,
                            amount: subscription.plan.amount
                        }
                    });

                    await prisma.accounts.update({
                        where: {
                            id: Number(payment.accountId) as number
                        },
                        data: {
                            role: payment.type.includes("_") ? payment.type.split("_")[0] : payment.type,
                            expiry: new Date(subscription.current_period_end * 1000)
                        }
                    });
                } else {
                    console.error(`[STRIPE] Payment not found for subscription ${subscription.id}`);

                    await prisma.payments.create({
                        data: {
                            subscriptionId: subscription.id,
                            accountId: Number(subscription.metadata.account_id) as number,
                            type: subscription.metadata.plan,
                            amount: subscription.plan.amount,
                            payment_status: status,
                        }
                    });

                    await prisma.accounts.update({
                        where: {
                            id: Number(subscription.metadata.account_id) as number
                        },
                        data: {
                            role: subscription.metadata.plan.includes("_") ? subscription.metadata.plan.split("_")[0] : subscription.metadata.plan,
                            expiry: new Date(subscription.current_period_end * 1000)
                        }
                    });
                }
            }
        }

        // switch (event.type) {
        // case "customer.subscription.updated":
        //     subscription = event.data.object;
        //     status = subscription.status;
        //     if (status === "active") {
        //         console.log(`Subscription status is ${status}.`);
        //         // console.log(JSON.stringify(event));
        //         const sub = await stripe.checkout.sessions.retrieve(subscription.latest_invoice.payment_intent);

        //         const payment = await prisma.payments.findUnique({
        //             where: {
        //                 sessionId: sub.latest_invoice.payment_intent
        //             }
        //         })

        //         console.log(payment)
                
        //         if (payment) {
        //             await prisma.payments.update({
        //                 where: {
        //                     id: payment.id
        //                 },
        //                 data: {
        //                     payment_status: sub.status
        //                 }
        //             });

        //             await prisma.accounts.update({
        //                 where: {
        //                     id: payment.accountId
        //                 },
        //                 data: {
        //                     expiry: new Date(sub.current_period_end * 1000),
        //                     role: payment.type
        //                 }
        //             });
        //         }
        //     }
        //     break;
        // }

        return res.status(200).json({ success: true });
    });
}