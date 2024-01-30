import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { Webhook } from "coinbase-commerce-node";
import CBEvent from "./CBEvent";
import { prisma } from "../../../src/db";
import axios from "axios";

export const config = {
    api: {
        bodyParser: false,
    },
};

async function buffer(readable: Readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let CBEvent: CBEvent;

        const rawBody = await buffer(req).then((buf) => buf.toString());
        const signature: any = req.headers["x-cc-webhook-signature"] as any;
        const sharedSecret = "6c2c9cc1-c804-4932-a16c-a5be44258d1d";

        try {
            Webhook.verifySigHeader(rawBody, signature, sharedSecret);
        } catch (err: any) {
            console.log(`[COINBASE] ⚠️ Webhook signature verification failed.`, err);
            return res.status(400).end();
        }

        CBEvent = JSON.parse(rawBody.toString()) as CBEvent;
        const event = CBEvent.event;

        // console.log(`[COINBASE] [${JSON.stringify(event)}`);

        let amount: number = 1500;
        let expiry: Date = new Date(Date.now() + 31536000000);

        switch (event.data.metadata.plan ?? "premium") {
        case "premium":             amount = 1500;  expiry = new Date(Date.now() + 31536000000); break; // 1 year
        case "premium_monthly":     amount = 200;   expiry = new Date(Date.now() + 2592000000); break;  // 1 month
        case "business":            amount = 3000;  expiry = new Date(Date.now() + 31536000000); break;
        case "business_monthly":    amount = 500;   expiry = new Date(Date.now() + 2592000000); break;
        case "enterprise":          amount = 10000; expiry = new Date(Date.now() + 31536000000); break;
        case "enterprise_monthly":  amount = 1000;  expiry = new Date(Date.now() + 2592000000); break;
        }

        switch (event.type) {
        // case "charge:created":
        //     if (await prisma.payments.findUnique({ where: { subscriptionId: event.data.id } })) return;
        //     await prisma.payments.create({
        //         data: {
        //             subscriptionId: event.data.id,
        //             accountId: Number(event.data.metadata.account_id) as number ? Number(event.data.metadata.account_id) as number : 1,
        //             type: event.data.metadata.plan ?? "unknown",
        //             amount: event.data.payments[0] ? Number(event.data.payments[0].net.local?.amount) : 0,
        //             payment_status: event.data.payments[0] ? event.data.payments[0].status : event.type.split(":")[1],
        //         }
        //     });
        //     break;
        case "charge:confirmed":
            console.log(`[✅] CONFIRMED [${event.type}] ${JSON.stringify(event.data)}`);
            if (event.data.payments[0]) {
                const account = await prisma.accounts.findUnique({ where: { id: Number(event.data.metadata.account_id) as number ?? 1 } });

                await axios.post(`https://discord.com/api/webhooks/1053705505899548692/9LRHelRG4dmnSNR2Ili3Ab2SiyS96zHSz0Gy4o9g0GDsmdA6ZLli2CLlid7b0hQNd7rL`, {
                    username: "Coinbase Purchases",
                    avatar_url: "https://avatars.githubusercontent.com/u/1885080?s=512",
                    embeds: [
                        {
                            title: "Payment Confirmed",
                            description: `Payment status is ${event.data.payments[0].status}.`,
                            color: 0x00ff12,
                            fields: [
                                {
                                    name: "Payment ID",
                                    value: `||${event.id}||`,
                                    inline: true
                                },
                                {
                                    name: "Account ID",
                                    value: `**${event.data.metadata.account_id} ${account ? `(${account.username})` : ""}**`,
                                    inline: true
                                },
                                {
                                    name: "Plan",
                                    value: (event.data.metadata.plan.slice(0, 1).toUpperCase() + event.data.metadata.plan.slice(1)) ?? "Unknown",
                                    inline: true
                                },
                                {
                                    name: "Amount",
                                    value: `$${(event.data.payments[0].net.local?.amount ?? 0) as number}`,
                                    inline: true
                                },
                            ]
                        },
                    ]
                }).catch(err => console.error(err));


                if (event.data.payments[0].status === "CONFIRMED") {
                    const payment = await prisma.payments.findUnique({
                        where: { subscriptionId: event.data.id }
                    });

                    if (payment) {
                        await prisma.payments.update({
                            where: { id: payment.id },
                            data: {
                                payment_status: event.data.payments[0].status,
                                amount: amount
                            }
                        });

                        await prisma.accounts.update({
                            where: { id: Number(payment.accountId) as number ?? 1 },
                            data: {
                                role: payment.type.includes("_") ? payment.type.split("_")[0] : payment.type,
                                expiry: new Date(expiry)
                            }
                        });

                        
                        await prisma.servers.updateMany({
                            where: {
                                ownerId: Number(payment.accountId) as number ?? 1,
                                pullTimeout: { gt: new Date() }
                            },
                            data: { pullTimeout: new Date() }
                        });
                    } else {
                        console.error(`[COINBASE] Payment not found for subscription ${event.data.id}`);

                        await prisma.payments.create({
                            data: {
                                subscriptionId: event.data.id,
                                accountId: Number(event.data.metadata.account_id) as number ?? 1,
                                type: event.data.metadata.plan,
                                amount: amount,
                                payment_status: event.data.payments[0].status,
                            }
                        });

                        await prisma.accounts.update({
                            where: { id: Number(event.data.metadata.account_id) as number ?? 1 },
                            data: {
                                role: event.data.metadata.plan.includes("_") ? event.data.metadata.plan.split("_")[0] : event.data.metadata.plan,
                                expiry: new Date(expiry)
                            }
                        });

                        
                        await prisma.servers.updateMany({
                            where: {
                                ownerId: Number(event.data.metadata.account_id) as number ?? 1,
                                pullTimeout: { gt: new Date() }
                            },
                            data: { pullTimeout: new Date() }
                        });
                    }
                }
            }
            break;
        case "charge:pending":
            console.log(`[⏳] PENDING [${event.type}] ${JSON.stringify(event.data)}`);
            if (event.data.payments[0]) {
                const payment = await prisma.payments.findUnique({
                    where: { subscriptionId: event.data.id }
                });

                if (payment) {
                    await prisma.payments.update({
                        where:  { id: payment.id },
                        data:   { payment_status: event.data.payments[0].status }
                    });
                } else {
                    await prisma.payments.create({
                        data: {
                            subscriptionId: event.data.id,
                            accountId: Number(event.data.metadata.account_id) as number ?? 1,
                            type: event.data.metadata.plan,
                            amount: amount,
                            payment_status: event.data.payments[0].status,
                        }
                    });
                }
            }
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(`[COINBASE] ⚠️ ${err}`);
        return res.status(500).json({ success: false });
    }
}

