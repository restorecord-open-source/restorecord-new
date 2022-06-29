import { NextApiRequest, NextApiResponse } from "next";


export  default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ status: "error", message: "Method not allowed" });

    const { token, guildId, userId, role } = req.body;

    if (!token || !guildId || !userId || !role) {
        return res.status(400).json({
            status: "error",
            message: "Missing required parameters"
        });
    }

    const success = await addMember(guildId as string, userId as string, token as string, role as string);
    
    return res.status(200).json({
        status: success ? "success" : "error",
        message: success ? "Member added" : "Failed to add member"
    });

}


async function addMember(guildId: string, userId: string, token: string, verifiedRole: string) {

    console.log(`Pulling ${userId} to ${guildId}: ${token}`);
    const request = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bot OTc5NjA1OTk5MzgyMDY1MTky.GlYANg.08SgqE47XHsrcJ3qlmLfTe7M_nVOklzIRm3kec`,
            "Content-Type": "application/json",
            "X-RateLimit-Precision": "millisecond", 
        },
        body: JSON.stringify({
            "access_token": token,
            "roles": [verifiedRole]
        })
    });
    
    console.log(`${request.status} - ${request.statusText}`);
    if (![201, 204, 403].includes(request.status)) return false;

    return true;
}