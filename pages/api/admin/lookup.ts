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


                if (search === undefined || search === null || search === "") return res.status(400).json({ success: false, message: "No search query provided." });

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
                    // return all results as users array
                    users: accSearchResult.map((acc: accounts) => {
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
                    })
                });
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