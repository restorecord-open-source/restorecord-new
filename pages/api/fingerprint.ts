import { NextApiRequest, NextApiResponse } from "next";
import { verify, sign } from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import { generateFingerprint } from "../../src/functions";
dotenv.config({ path: "../../" });


export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                const fingerprint = generateFingerprint();
                res.setHeader("Set-Cookie", `x-fp=${fingerprint}; Max-Age=300; Path=/`);
                return res.status(200).json({ status: 200, success: true, fingerprint: fingerprint });
            }
            catch (err: any) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }

        default: return res.status(400).json({ success: false, message: "Method not allowed" });
        }
    });
}
