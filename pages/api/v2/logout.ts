import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../src/db";
import withAuthentication from "../../../src/withAuthentication";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

    // Delete all sessions for the user
    await prisma.sessions.deleteMany({ where: { accountId: user.id, } });
    return res.status(200).json({ success: true, message: "Logged out" });
}

export default withAuthentication(handler);