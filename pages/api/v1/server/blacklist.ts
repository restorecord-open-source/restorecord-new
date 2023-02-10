import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "../../../../src/rate-limit";
import { prisma } from "../../../../src/db";

const limiter = rateLimit({
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                limiter.check(res, 120, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findUnique({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const servers = await prisma.servers.findMany({ where: { ownerId: account.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });
                let guildIds: any = servers.map((server: any) => server.guildId);

                const limit: any = req.query.max ? req.query.max : 50;
                const page = req.query.page ?? '';


                let search: any = req.query.search ?? '';
                const count = await prisma.blacklist.count({ 
                    where: { 
                        guildId: { in: guildIds },
                        OR: [
                            { value: { contains: search } },
                            { reason: { contains: search } }
                        ] 
                    } 
                });

                const blList = await prisma.blacklist.findMany({
                    where: {
                        AND: [
                            { guildId: { in: guildIds } },
                            { OR: [
                                { value: { contains: search } },
                                { reason: { contains: search } }
                            ]}
                        ]
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                });

                const lowestId = blList.find((blist: any) => blist.id === Math.min(...blList.map((blist: any) => blist.id)))?.id ?? 1;

                await prisma.blacklist.findMany({
                    where: {
                        AND: [
                            { guildId: { in: guildIds } },
                            { id: { gt: search ? 0 : (lowestId - 1) } },
                            { OR: [
                                { value: { contains: search } },
                                { reason: { contains: search } }
                            ] }
                        ],
                    },
                    take: search ? undefined : (Number(page) * Number(limit)),
                }).then((blacklist: any) => {
                    return res.status(200).json({
                        success: true,
                        max: count,
                        maxPages: Math.ceil(count / limit) === 0 ? 1 : Math.ceil(count / limit),
                        list: blacklist.map((blist: any) => {
                            return {
                                id: blist.id,
                                type: blist.type,
                                value: blist.value,
                                reason: blist.reason,
                                guildId: blist.guildId.toString(),
                                createdAt: blist.createdAt,
                            };
                        })
                    })
                })
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "PUT":
            try {
                limiter.check(res, 120, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false });

                const { reason, type, value, guildId }: any = req.body;

                if (!type || !value || !guildId) return res.status(400).json({ success: false, message: `Missing ${!type ? "Blacklist Type" : !value ? "Blacklist Value" : "Server"}` });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findUnique({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const servers = await prisma.servers.findMany({ where: { ownerId: account.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

                if (account.role === "free") return res.status(400).json({ success: false, message: "You are not allowed to use this feature." });

                const blacklist = await prisma.blacklist.findMany({ where: { guildId: { in: servers.map((server: any) => server.guildId) } } });
                
                // add a new blacklist item 
                // type 0 = user, type 1 = ip, type 2 = asn
                switch (type) {
                case "ip":
                    // check if valid ipv4 format
                    if (!value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) return res.status(400).json({ success: false, message: "Invalid IP Address" });
                    // check if ipv4 is a pirvate ip address
                    if (value.match(/^(?:10|127|172\.(?:1[6-9]|2[0-9]|3[0-1])|192\.168)\./)) return res.status(400).json({ success: false, message: "Invalid IP Address" });
                    if (blacklist.find((item: any) => (item.ip === value && item.guildId === BigInt(guildId) as bigint))) return res.status(400).json({ success: false, message: "This IP is already blacklisted in this server." });

                    await prisma.blacklist.create({ 
                        data: { 
                            type: 1,
                            value: value,
                            reason: reason, 
                            guildId: BigInt(guildId)
                        }
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "IP has been blacklisted." });
                    }).catch((err: any) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Could not blacklist IP." });
                    });
                    break;
                case "user":
                    // match discord id snowflake
                    if (!value.match(/^[0-9]{17,19}$/)) return res.status(400).json({ success: false, message: "Invalid Discord ID." });
                    if (blacklist.find((item: any) => (item.userId === BigInt(value) as bigint && item.guildId === BigInt(guildId) as bigint))) return res.status(400).json({ success: false, message: "This User is already blacklisted in this server." });

                    await prisma.blacklist.create({
                        data: {
                            type: 0,
                            value: String(value) as string,
                            reason: reason,
                            guildId: BigInt(guildId)
                        }
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "User has been blacklisted." });
                    }).catch((err: any) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Could not blacklist User." });
                    });
                    break;
                case "asn":
                    // match asn
                    if (account.role === "premium") return res.status(400).json({ success: false, message: "You need to have a Business subscription to blacklist ASN's." });
                    if (!value.match(/^[0-9]{1,10}$/)) return res.status(400).json({ success: false, message: "Invalid ASN." });
                    if (blacklist.find((item: any) => (item.asn === value && item.guildId === BigInt(guildId) as bigint))) return res.status(400).json({ success: false, message: "This ASN is already blacklisted in this server." });

                    await prisma.blacklist.create({
                        data: {
                            type: 2,
                            value: String(value) as string,
                            reason: reason,
                            guildId: BigInt(guildId)
                        }
                    }).then(() => {
                        return res.status(200).json({ success: true, message: "ASN has been blacklisted." });
                    }).catch((err: any) => {
                        console.error(err);
                        return res.status(400).json({ success: false, message: "Could not blacklist ASN." });
                    });
                    break;
                }
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        case "DELETE":
            try {
                limiter.check(res, 120, "CACHE_TOKEN");
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                const { id }: any = req.query;

                if (!valid) return res.status(400).json({ success: false });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findUnique({ where: { id: valid.id } });
                if (!account) return res.status(400).json({ success: false, message: "Account not found." });

                const servers = await prisma.servers.findMany({ where: { ownerId: account.id } });
                if (!servers) return res.status(400).json({ success: false, message: "No servers found." });

                const blacklist = await prisma.blacklist.findMany({ where: { guildId: { in: servers.map((server: any) => server.guildId) } } });
                if (!blacklist) return res.status(400).json({ success: false, message: "No blacklisted items found." });

                const item = blacklist.find((item: any) => item.id === Number(id) as number);
                if (!item) return res.status(400).json({ success: false, message: "Blacklist item not found." });

                await prisma.blacklist.delete({ where: { id: Number(id) as number } }).then(() => {
                    return res.status(200).json({ success: true, message: "Blacklist item has been deleted." });
                }).catch((err: any) => {
                    console.error(err);
                    return res.status(400).json({ success: false, message: "Could not delete blacklist item." });
                });
            }
            catch (err: any) {
                console.error(err);
                if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "GET");
            res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}
