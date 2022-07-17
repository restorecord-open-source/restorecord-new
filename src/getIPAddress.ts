import { NextApiRequest } from "next";

export default function getIPAddress(req: NextApiRequest): string {
    const { headers } = req;
    let ip: string;

    if (headers["CF-Connecting-IP"]) {
        ip = headers["CF-Connecting-IP"][0];
    } else if (headers["X-Forwarded-For"]) {
        ip = headers["X-Forwarded-For"][0];
    } else if (headers["X-Real-IP"]) {
        ip = headers["X-Real-IP"][0];
    } else {
        ip = req.connection.remoteAddress as string;
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7)
        }
    }

    return ip;
}