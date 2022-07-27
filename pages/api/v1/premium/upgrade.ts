// const secret = "webhook-secret-here";
// const signature = req.headers['signature'];
// const computedSignature = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
// if (computedSignature === signature) {
//
// } else {
//
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Readable } from 'node:stream';
import { createHmac } from "crypto";
import { prisma } from '../../../../src/db';

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
                const secret = 'eACj1mWDMCQSMwKgo79b46xX2ZS7Tardj2IagyAnD4ouRVckMxmVrR42sgW47SsR';
                const computedSignature = createHmac('sha256', secret).update(rawBody).digest('hex');

                if (computedSignature === signature) { 
                    const body: any = JSON.parse(rawBody) as any;
                    
                    if (body.status === "COMPLETED") {
                        const expiry: Date = body.variant.product.slug.includes('monthly') ? new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30)) : new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365));

                        console.log(body.variant.product.slug);

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
                console.log(err);
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
