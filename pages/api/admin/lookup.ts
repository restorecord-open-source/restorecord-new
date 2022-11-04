import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                if (!valid) return res.status(400).json({ success: false, message: "invalid token" });

                const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, token: token } });

                if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

                const account = await prisma.accounts.findFirst({ where: { id: valid.id } });

                if (!account) return res.status(400).json({ success: false, message: "No account found." });

                if (!account.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                let search: any = req.body.query ?? '';
                let idSearch: any = search ? (isNaN(search) ? undefined : parseInt(search)) : undefined;
                let emailSearch: any = search ? (search.includes("@") ? search : undefined) : undefined;

                if (search === undefined || search === null || search === "") return res.status(400).json({ success: false, message: "No search query provided." });

                const user = await prisma.accounts.findFirst({
                    where: {
                        AND: [
                            { id: { equals: idSearch ? parseInt(idSearch) as number : undefined } },
                            { username: { contains: search ? (idSearch ? '' : (emailSearch ? '' : search)) : undefined } },
                            { email: { contains: emailSearch ? emailSearch : undefined } }
                        ]
                    }
                });

                if (!user) return res.status(400).json({ success: false, message: "No user found." });

                return res.status(200).json({ success: true, user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    twoFactor: user.twoFactor,
                    expiry: user.expiry,
                    admin: user.admin,
                    lastIp: user.lastIp,
                    createdAt: user.createdAt,
                } });
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