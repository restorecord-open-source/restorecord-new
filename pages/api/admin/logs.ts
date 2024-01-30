import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import withAuthentication from "../../../src/withAuthentication";
import fs from "fs";
import path from "path";

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    return new Promise((resolve) => {
        switch (req.method) {
        case "GET":
            try {
                res.writeHead(200, {
                    Connection: "keep-alive",
                    "Content-Encoding": "none",
                    "Cache-Control": "no-cache",
                    "Content-Type": "text/event-stream",
                });
                res.flushHeaders();


                res.write(`data: hello\n`);
                res.end();
            } catch (e) {
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
