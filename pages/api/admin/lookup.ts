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

                let search: any = req.body.query ?? "";
                let fullId: any = req.body.userId ?? "";
                let idSearch: any = search ? (isNaN(search) ? undefined : parseInt(search)) : undefined;
                let emailSearch: any = search ? (search.includes("@") ? search : undefined) : undefined;

                if ((search === undefined || search === null || search === "") && (fullId == undefined || fullId == null || fullId == "")) return res.status(400).json({ success: false, message: "No search query provided." });

                const startTime = performance.now();
                const accSearchResult = await prisma.accounts.findMany({
                    where: {
                        AND: [
                            ...(!fullId ? [] : [{ id: { equals: parseInt(fullId) } }]),
                            { id: { equals: idSearch } },
                            { username: { contains: idSearch ? "" : (emailSearch ? "" : search) } },
                            { email: { contains: emailSearch } }
                        ]
                    },
                    orderBy: { createdAt: "desc" },
                    take: 100
                });
                const endTime = performance.now();

                if (!accSearchResult) return res.status(400).json({ success: false, message: "User not found." });

                const sortedResults = accSearchResult.sort((a, b) => {
                    const isA = a.id === parseInt(fullId) || a.username.toLowerCase() === search.toLowerCase() || a.email.toLowerCase() === search.toLowerCase();
                    const isB = b.id === parseInt(fullId) || b.username.toLowerCase() === search.toLowerCase() || b.email.toLowerCase() === search.toLowerCase();

                    if (isA && !isB) return -1;
                    else if (!isA && isB) return 1;
                    else return 0;
                });

                return res.status(200).json({ success: true,
                    rows: sortedResults.length,
                    time: ((endTime - startTime) / 1000).toFixed(3),
                    users: sortedResults.map((acc: accounts) => {
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
                                userId: String(acc.userId) as string,
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
                                twoFactor: Boolean(acc.twoFactor) as boolean,
                                admin: acc.admin,
                                lastIp: acc.lastIp,
                                createdAt: acc.createdAt,
                            }
                        }
                    })
                });
            }
            catch (e: any) { console.error(e); return res.status(400).send("400 Bad Request"); }

        default: return res.status(400).send("400 Bad Request"); }
    });
}

export default withAuthentication(handler);