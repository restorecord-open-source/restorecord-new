import functions from "../../src/functions";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const uptime = await functions.toUptime(process.uptime());
    res.status(200).json({ uptime: uptime });
}