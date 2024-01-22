import { NextApiRequest, NextApiResponse } from "next";
import { accounts } from "@prisma/client";

import { createObjectCsvStringifier } from "csv-writer";
import { Readable } from "stream";

import { prisma } from "../../../../../../src/db";

import withAuthentication from "../../../../../../src/withAuthentication";

const respVarity: { [key: string]: string[] } = {
    id: ["id"],
    userId: ["userId"],
    accessToken: ["accessToken", "access_token"],
    refreshToken: ["refreshToken", "refresh_token"],
    username: ["username", "user_name", "name"],
    createdAt: ["createdAt", "created_at"],
};

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "POST") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const serverId: any = BigInt(req.query.serverid as any);
        const options = (req.query.options as string).split(",");
        const format = (req.query.format as string) || "csv";
        if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });
        if (options === null || options === undefined || options[0] === "") return res.status(400).json({ success: false, message: "No options selected" });

        if (user.role !== "business" && user.role !== "enterprise") return res.status(400).json({ success: false, message: "You must be a Business subscriber to use this feature." });

        const server = await prisma.servers.findFirst({
            where: {
                AND: [
                    { ownerId: user.id },
                    { guildId: serverId }
                ]
            },
            select: {
                guildId: true,
            }
        });

        if (!server) return res.status(400).json({ success: false, message: "Server not found" });

        const members = await prisma.members.findMany({
            where: {
                guildId: server.guildId
            },
            select: {
                userId: true,
                accessToken: true,
                refreshToken: true,
                username: true,
                createdAt: true
            }
        });


        if (format === "csv") {
            const randomKeys: { [key: string]: string } = {};
            options.forEach((option) => {
                randomKeys[option] = respVarity[option][Math.floor(Math.random() * respVarity[option].length)];
            });

            const csvStringifier = createObjectCsvStringifier({
                header: options.filter((option) => option in members[0]).map((option) => ({ id: randomKeys[option], title: randomKeys[option] })),
            });

            const csvData = members.map((member) => {
                const memberData: { [key: string]: any } = {};
                options.forEach((option) => {
                    const randomKey = randomKeys[option];
                    memberData[randomKey] = member[option as keyof typeof member];
                });
                memberData.createdAt = member.createdAt.getTime();


                return memberData;
            });

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=members-${server.guildId}-${new Date().toISOString().split("T")[0]}.csv`);

            return res.status(200).send(csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData));
        } else if (format === "json") {
            const randomKeys: { [key: string]: string } = {};
            options.forEach((option) => {
                randomKeys[option] = respVarity[option][Math.floor(Math.random() * respVarity[option].length)];
            });
            
            const jsonData = members.map((member) => {
                const memberData: { [key: string]: any } = {};
                options.forEach((option) => {
                    const randomKey = randomKeys[option];
                    memberData[randomKey] = typeof member[option as keyof typeof member] === "bigint" ? member[option as keyof typeof member].toString() : member[option as keyof typeof member];
                });
                memberData.createdAt = member.createdAt.getTime();
            
                return memberData;
            });
                    
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Content-Disposition", `attachment; filename=members-${server.guildId}-${new Date().toISOString().split("T")[0]}.json`);
            return res.status(200).json(JSON.parse(JSON.stringify(jsonData, null, 4)));
        } else {
            return res.status(400).json({ success: false, message: "Invalid format specified" });
        }
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);