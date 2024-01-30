import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";
import { sign } from "jsonwebtoken";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "POST":
            try {
                if (!user.admin) return res.status(400).json({ success: false, message: "Account is not an admin." });

                let id: any = req.body.id ?? "";

                if (id == undefined || id == null || id == "") return res.status(400).json({ success: false, message: "No search query provided." });
                const account = await prisma.accounts.findUnique({
                    where: { id: parseInt(id) as number, },
                });
                if (!account) return res.status(400).json({ success: false, message: "User not found." });

                const token = sign({ id: account.id, time: Date.now() }, `${process.env.JWT_SECRET}`, { expiresIn: "30min" });
                await prisma.sessions.deleteMany({ where: { accountId: account.id, token: token } });
                await prisma.sessions.create({
                    data: {
                        accountId: account.id,
                        token: token,
                    },
                });

                return res.status(200).json({ success: true, token: token });
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