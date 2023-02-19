import { verify } from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "./db"

const withAuthentication = (next: any) => async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization;

    try {
        if (!token || typeof token !== "string") throw new Error(50014 as any);

        let JWTInfo = verify(token, process.env.JWT_SECRET!) as { id: number; };
        if (!JWTInfo) throw new Error(50014 as any);

        const sessions = await prisma.sessions.findMany({ where: { accountId: JWTInfo.id, token: token } });
        if (sessions.length === 0) throw new Error(50014 as any);

        const user = await prisma.accounts.findFirst({ where: { id: JWTInfo.id } });
        if (!user) throw new Error(10001 as any);
      
        return await next(req, res, user)
    } catch (err: any) {
        err.message = parseInt(err.message);

        switch (err.message) {
        case 10001:
            return res.status(404).json({ code: err.message, message: "Unknown account" })
        case 50014:
            return res.status(401).json({ code: err.message, message: "Invalid authentication token provided" })
        default:
            return res.status(500).end("internal server error")
        }
    }
}

export default withAuthentication;
