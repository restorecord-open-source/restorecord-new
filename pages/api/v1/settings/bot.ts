import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";
import { CreateBotSchema } from "../../../../src/schemas";

const limiter = rateLimit({
    interval: 10 * 60, 
    uniqueTokenPerInterval: 500,
    limit: 60,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                limiter.check(res, "CACHE_TOKEN");
                
                const data = { ...req.body };

                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }
                
                if (!valid) return res.status(400).json({ success: false, message: "Invalid Token" });


                const bot = await prisma.customBots.findFirst({
                    where: {
                        OR: [
                            { name: data.botName },
                            { clientId: Number(data.clientId) },
                            { botSecret: data.botSecret },
                            { botToken: data.botToken },
                        ],
                    },
                });

                if (bot?.clientId === BigInt(data.clientId)) return res.status(400).json({ success: false, message: "Client Id is already in use" });
                if (bot?.botSecret.toLowerCase() === data.botSecret.toLowerCase()) return res.status(400).json({ success: false, message: "Bot Secret is already in use" });
                if (bot?.botToken.toLowerCase() === data.botToken.toLowerCase()) return res.status(400).json({ success: false, message: "Bot Token is already in use" });
                

                const newBot = await prisma.customBots.create({
                    data: {
                        name: data.botName,
                        clientId: BigInt(data.clientId),
                        botSecret: data.botSecret,
                        botToken: data.botToken,
                        ownerId: valid.id,
                    }
                });

                return res.status(200).json({ success: true, message: "Bot created successfully", bot: {
                    id: newBot.id,
                    name: newBot.name,
                    clientId: newBot.clientId.toString(),
                    botSecret: newBot.botSecret,
                    botToken: newBot.botSecret,
                } });
            }
            catch (err: any) {
                console.log(err);
                if (res.getHeader("x-ratelimit-remaining") === "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                if (err?.name === "ValidationError") return res.status(400).json({ success: false, message: err.message, });
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
