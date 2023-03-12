import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                let search: any = req.body.query ?? '';
                let fullId: any = req.body.userId ?? '';
                let idSearch: any = search ? (isNaN(search) ? undefined : parseInt(search)) : undefined;
                let emailSearch: any = search ? (search.includes("@") ? search : undefined) : undefined;


                if ((search === undefined || search === null || search === "") && (fullId == undefined || fullId == null || fullId == "")) return res.status(400).json({ success: false, message: "No search query provided." });

                const accSearchResult = await prisma.accounts.findMany({
                    where: {
                        AND: [
                            ...(!fullId ? [] : [{ id: { equals: parseInt(fullId) as number } }]),
                            { id: { equals: idSearch ? parseInt(idSearch) as number : undefined } },
                            { username: { contains: search ? (idSearch ? '' : (emailSearch ? '' : search)) : undefined } },
                            { email: { contains: emailSearch ? emailSearch : undefined } }
                        ]
                    },
                    take: 10,
                });

                if (!accSearchResult) return res.status(400).json({ success: false, message: "User not found." });

                return res.status(200).json({ success: true,
                    users: accSearchResult.map((acc: accounts) => {
                        // if acc.id === fullId, return all data
                        if (acc.id === fullId) {
                            return {
                                id: acc.id,
                                username: acc.username,
                                email: acc.email,
                                role: acc.role,
                                banned: acc.banned,
                                twoFactor: acc.twoFactor,
                                expiry: acc.expiry,
                                admin: acc.admin,
                                lastIp: acc.lastIp,
                                createdAt: acc.createdAt,
                                userId: acc.userId,
                                referralCode: acc.referralCode,
                                referrer: acc.referrer,
                            }
                        } else {
                            return {
                                id: acc.id,
                                username: acc.username,
                                email: acc.email,
                                role: acc.role,
                                expiry: acc.expiry,
                                twoFactor: acc.twoFactor,
                                admin: acc.admin,
                                lastIp: acc.lastIp,
                                createdAt: acc.createdAt,
                            }
                        }
                    })
                });
            }
            catch (e: any) {
                console.error(e);
                return res.status(400).send("400 Bad Request");
            }
            break;
        case "GET":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                const help: any = req.query.h ?? '';
                if (help === "1") {
                    return res.status(200).json({ status: 200, reasons: 
                        [
                            { 
                                id: 1,
                                reason: "spam",
                                message: "Your account has been banned for spam and/or platform abuse."
                            },
                            { 
                                id: 2,
                                reason: "ddos or account cracking",
                                message: "Your account was involved in fraud, account or creditcard cracking, and/or attempting to damage a computer network or machine." 
                            },
                            { 
                                id: 3,
                                reason: "fraudulent payment (dispute)",
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
                        ]
                    });
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