import type { NextApiRequest, NextApiResponse } from "next";
import type { Readable } from "node:stream";
import { createHmac } from "crypto";
import { prisma } from "../../../../src/db";
import { Email } from "../../../../src/email";

export const config = {
    api: {
        bodyParser: false,
    },
};
  
async function buffer(readable: Readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                const buf = await buffer(req);
                const rawBody = buf.toString('utf8');
                const signature = req.headers['signature'];
                const computedSignature = createHmac('sha256', process.env.SELLAPP_SECRET ?? "").update(rawBody).digest('hex');

                if (computedSignature === signature) { 
                    const body: any = JSON.parse(rawBody) as any;

                    if (body.status === "COMPLETED") {
                        const expiry: Date = body.variant.product.slug.includes('monthly') ? new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30)) : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365));

                        await Email.post("send", {'version': 'v3.1'}).request({
                            "Messages": [
                                {
                                    "From": {
                                        "Email": "noreply@restorecord.com",
                                        "Name": "RestoreCord",
                                    },
                                    "To": [
                                        {
                                            "Email": body.invoice.customer_information.email,
                                            "Name": body.additional_information[0].value,
                                        },
                                    ],
                                    "Bcc": [
                                        {
                                            "Email": "restorecord.com+90b3e0c33f@invite.trustpilot.com",
                                            "Name": "TrustPilot",
                                        },
                                    ],
                                    "Subject": `Thank you for upgrading to ${body.variant.product.title}!`,
                                    "HTMLPart": 
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
                                                <div style="padding: 1rem; max-width: 30rem; margin-left: auto;margin-right: auto; width: 100%; border-radius: 0.75rem; border-width: 1px; background: rgb(250, 250, 250);">
                                                    <h2 style="color: rgb(0, 0, 0); font-size: 1.75rem; line-height: 2rem; font-weight: 600; line-height: 1.25; margin-bottom: 1rem">
                                                        Thanks for purchasing ${body.variant.product.title}!
                                                    </h2>
                                                    <div>
                                                        <p style="white-space: pre-line; color: rgb(0, 0, 0); font-weight: 400; margin-bottom: 0.75rem; overflow-wrap: break-word; font-size: 1rem;">
                                                            Hello ${body.additional_information[0].value},
                                                            <br />
                                                            Thank you for your purchase of RestoreCord ${body.variant.product.title}.
                                                            If you have any questions, please contact us at <a style="color: rgb(56,189, 248);" href="mailto:contact@restorecord.com">contact@restorecord.com</a>.
                                                            <br />
                                                            Sincerely,
                                                            RestoreCord
                                                        </p>
                                                    </div>
                                                    <div style="text-align: center; margin-top: 1rem;">
                                                        <em style="color: rb(190, 198, 213)">
                                                            Copyright © 2022 RestoreCord. All rights reserved.
                                                        </em>
                                                    </div>
                                                </div>
                                            </body>
                                        </html>
                                    `,
                                }
                            ]
                        }).then(() => {
                            console.log(`[Email] Successfully upgraded ${body.additional_information[0].value} (${body.invoice.customer_information.email}) to ${body.variant.product.title}!`);
                        }).catch((err: any) => {
                            console.error(err);
                        })


                        await prisma.accounts.update({
                            where: {
                                username: body.additional_information[0].value,
                            },
                            data: {
                                role: body.variant.product.slug.split("-")[0],
                                expiry: expiry,
                            },
                        }).then(() => {
                            return res.status(200).end(`Successfully upgraded ${body.additional_information[0].value} to ${body.variant.product.title}!`);
                        });
                    }
                }
                else {
                    res.status(400).json({ message: "Invalid Signature" });
                }
            }
            catch (err: any) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "POST");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}
