import { NextApiRequest, NextApiResponse } from "next/types";
import { getIPAddress } from "../../../src/getIPAddress";

// hidden page
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log(`Received deploy request from ${getIPAddress(req)}`);
    const token = req.query.token;
    
    if (req.method !== "GET") return res.status(405).end();
    if (token !== process.env.DEPLOY_TOKEN) return res.status(401).end();

    const { exec } = require("child_process");

    console.log("Rebuilding and Deploying...");

    exec("cd /home/restorecord-new && git pull && npm i && npm run build && pm2 restart all", (err: any, stdout: any, stderr: any) => {
        if (err) { console.error(err); return res.status(500).end(); }

        console.error(stdout);
        console.error(stderr);
        return res.status(200).end();
    });

    return res.status(200).end("OK");
}