import { NextApiRequest } from "next";

export default function getIPAddress(req: NextApiRequest): string {
    let ip: any;
    const headers = req.headers;

    if (headers["cf-connecting-ip"]) {
        ip = headers["cf-connecting-ip"];
    }
    else if (headers["x-forwarded-for"]) {
        ip = headers["x-forwarded-for"];
    }
    else if (headers["x-real-ip"]) {
        ip = headers["x-real-ip"];
    }
    else {
        ip = req.connection.remoteAddress;
        if (ip.substr(0, 7) === "::ffff:") {
            ip = ip.substr(7);
        }
    }

    return ip;
}