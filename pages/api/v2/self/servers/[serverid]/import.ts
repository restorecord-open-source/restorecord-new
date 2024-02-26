import { accounts } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import withAuthentication from "../../../../../../src/withAuthentication";
import { prisma } from "../../../../../../src/db";
import { IncomingForm } from "formidable";
import { PassThrough } from "stream";
import { promises as fs } from "fs"
import { resolveOAuth2User, refreshToken as RFToken } from "../../../../../../src/Migrate";
import { formatEstimatedTime } from "../../../../../../src/functions";

export const config = {
    api: {
        bodyParser: false,
    }
};

async function handler(req: NextApiRequest, res: NextApiResponse, user: accounts) {
    if (req.method !== "POST") return res.status(405).json({ code: 0, message: "Method not allowed" });

    try {
        const serverId: any = BigInt(req.query.serverid as any);
        const format = (req.query.format as string) || "csv";
        if (!serverId) return res.status(400).json({ success: false, message: "Server ID not provided" });

        const server = await prisma.servers.findFirst({ where: { AND: [ { guildId: serverId }, { ownerId: user.id } ] } });
        if (!server) return res.status(400).json({ success: false, message: "Server not found" });
        if (server.importing) return res.status(400).json({ success: false, message: "Server is already importing, please wait or contact support" });

        const bot = await prisma.customBots.findFirst({ where: { AND: [ { id: server.customBotId }, { ownerId: user.id } ] } });
        if (!bot) return res.status(400).json({ success: false, message: "Bot not found" });

        const data: any = await new Promise((resolve, reject) => {
            const form = new IncomingForm({ keepExtensions: true, multiples: false, maxFileSize: 10 * 1024 * 1024, maxFields: 1 })
            
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err)
                resolve({ fields, files })
            })
        })
        
        // read file from the temporary path
        const file = await fs.readFile(data.files.file[0].filepath, { encoding: "utf-8" });

        if (!file) return res.status(400).json({ success: false, message: "No file provided" });
        if (format !== "csv" && format !== "json") return res.status(400).json({ success: false, message: "Invalid format" });

        switch (format) {
        case "json":
            try {
                const memberData = JSON.parse(file.toString());
                if (!Array.isArray(memberData)) return res.status(400).json({ success: false, message: "invalid JSON" });

                let id = false;
                let username = false;
                let accessToken = false;
                let refreshToken = false;

                for (let i = 0; i < memberData.length; i++) {
                    const element = memberData[i];
                    if (element.userId) id = true;
                    if (element.username || element.name) username = true;
                    if (element.accessToken || element.access_token || element.access || element.token) accessToken = true;
                    if (element.refreshToken || element.refresh_token || element.refresh) refreshToken = true;
                }

                if (!id || !username || !accessToken || !refreshToken) return res.status(400).json({ success: false, message: "Invalid JSON, make sure it contains \"userId\", \"username\", \"accessToken\" and \"refreshToken\"" });

                for (let i = 0; i < memberData.length; i++) {
                    const element = memberData[i];
                    for (const key in element) {
                        if (Object.prototype.hasOwnProperty.call(element, key)) {
                            const value = element[key];
                            if (typeof value !== "string" && typeof value !== "number") return res.status(400).json({ success: false, message: "Invalid JSON, make sure all values are strings or numbers" });
                        }
                    }
                }

                // check for invalid values, eg. accessToken is too short/long etc
                for (let i = 0; i < memberData.length; i++) {
                    const element = memberData[i];
                    if (String(element.userId).length < 16 || String(element.userId).length > 20) return res.status(400).json({ success: false, message: "Invalid JSON, make sure all IDs are valid" });
                    if (String((element.accessToken || element.access_token || element.access || element.token) || (element.refreshToken || element.refresh_token || element.refresh)).length > 33) return res.status(400).json({ success: false, message: "Invalid JSON, make sure all access tokens are correctly formatted" });
                    if (String((element.accessToken || element.access_token || element.access || element.token) || (element.refreshToken || element.refresh_token || element.refresh)).match(/[^a-zA-Z0-9]/g)) return res.status(400).json({ success: false, message: "Invalid JSON, make sure all access tokens are correctly formatted" });
                }

                const dupeCheck: any[] = [];
                for (let i = 0; i < memberData.length; i++) {
                    const element = memberData[i];
                    if (!element.userId) memberData.splice(i, 1);
                    if (!element.username && !element.name) memberData.splice(i, 1);
                    if (!element.accessToken && !element.access_token && !element.access && !element.token) memberData.splice(i, 1);
                    if (!element.refreshToken && !element.refresh_token && !element.refresh) memberData.splice(i, 1);

                    if (dupeCheck.includes(element.userId)) memberData.splice(i, 1);
                    if (dupeCheck.includes(element.accessToken || element.access_token || element.access || element.token)) memberData.splice(i, 1);
                    if (dupeCheck.includes(element.refreshToken || element.refresh_token || element.refresh)) memberData.splice(i, 1);
                    dupeCheck.push(element.userId);
                    dupeCheck.push(element.accessToken || element.access_token || element.access || element.token);
                    dupeCheck.push(element.refreshToken || element.refresh_token || element.refresh);
                }

                let trysImported: number = 0;
                let successImported: number = 0;

                await prisma.servers.update({ where: { id: server.id }, data: { importing: true } });

                new Promise<void>(async (resolve, reject) => {
                    for (const member of memberData) {
                        trysImported++;

                        const userId = member.userId;
                        const username = member.username || member.name;
                        const access_token = member.accessToken || member.access_token || member.access || member.token;
                        const refresh_token = member.refreshToken || member.refresh_token || member.refresh;

                        if (!userId || !username || !access_token || !refresh_token) continue;
                        if (userId === undefined || username === undefined || access_token === undefined || refresh_token === undefined) continue;

                        const user = await prisma.members.findUnique({ where: { userId_guildId: { userId: BigInt(userId), guildId: server.guildId } } });
                        if (user) continue;

                        const checkPromise = await resolveOAuth2User(access_token).then(async (resp: any) => {
                            let status = resp?.response?.status || resp?.status;
                            let response = resp?.response?.data || resp?.data || "";

                            console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} - ${username} ${status}`);

                            switch (status) {
                            case 200:
                                if (String(response.application.id) !== String(bot.clientId)) {
                                    console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} - ${username} (${userId}) - Access Token does not match Bot ID`);
                                    return;
                                }

                                await prisma.members.upsert({
                                    where: {
                                        userId_guildId: {
                                            userId: BigInt(userId),
                                            guildId: server.guildId,
                                        }
                                    },
                                    create: {
                                        userId: BigInt(userId),
                                        guildId: server.guildId,
                                        accessToken: access_token,
                                        refreshToken: refresh_token,
                                        username: response.user.username + "#" + response.user.discriminator || username,
                                        avatar: response.user.avatar ? response.user.avatar : "0",
                                    },
                                    update: {
                                        userId: BigInt(userId),
                                        guildId: server.guildId,
                                        accessToken: access_token,
                                        refreshToken: refresh_token,
                                        username: response.user.username + "#" + response.user.discriminator,
                                        avatar: response.user.avatar ? response.user.avatar : "0",
                                    }
                                }).then(() => {
                                    successImported++;
                                    console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} - ${username} (${userId}) - Imported`);
                                }).catch((err) => console.error(err));
                                break;
                            case 401:
                                const refreshed = await RFToken(member.refreshToken, bot.clientId.toString(), bot.botSecret.toString());
                                if (refreshed?.data?.access_token && refreshed?.data?.refresh_token) {
                                    await resolveOAuth2User(refreshed?.data?.access_token).then(async (resp: any) => {
                                        let status = resp?.response?.status || resp?.status;
                                        let response = resp?.response?.data || resp?.data || "";

                                        console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} - ${username} ${status}`);

                                        switch (status) {
                                        case 200:
                                            if (String(response.application.id) !== String(bot.clientId)) {
                                                console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} - ${username} (${userId}) - Access Token does not match Bot ID`);
                                                return;
                                            }

                                            await prisma.members.upsert({
                                                where: {
                                                    userId_guildId: {
                                                        userId: BigInt(userId),
                                                        guildId: server.guildId,
                                                    }
                                                },
                                                create: {
                                                    userId: BigInt(userId),
                                                    guildId: server.guildId,
                                                    accessToken: access_token,
                                                    refreshToken: refresh_token,
                                                    username: response.user.username + "#" + response.user.discriminator,
                                                    avatar: response.user.avatar ? response.user.avatar : "0",
                                                },
                                                update: {
                                                    userId: BigInt(userId),
                                                    guildId: server.guildId,
                                                    accessToken: access_token,
                                                    refreshToken: refresh_token,
                                                    username: response.user.username + "#" + response.user.discriminator,
                                                    avatar: response.user.avatar ? response.user.avatar : "0",
                                                }
                                            }).then(() => {
                                                successImported++;
                                                console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} - ${username} (${userId}) - Imported`);
                                            }).catch((err) => console.error(err));
                                            break;
                                        }
                                    }).catch((err) => console.error(err));
                                }
                                break;
                            }
                        }).catch((err) => console.error(err));

                        await checkPromise;
                    }

                    console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} members imported`);
                    await prisma.servers.update({ where: { id: server.id }, data: { importing: false } });
                    resolve();
                }).then(() => {
                    console.log(`[IMPORT] [${server.name}] ${successImported}/${trysImported}/${memberData.length} members imported`);
                }).catch((err) => console.error(err));

                const estimateTime = formatEstimatedTime((memberData.length * 1.25) * 1000);

                return res.status(200).json({ success: true, message: `Importing ${memberData.length} members, estimated time: ${estimateTime}` });
                break;
            }
            catch (err) {
                console.error(err);
                return res.status(400).json({ success: false, message: "Invalid JSON" });
            }
        case "csv":
            break;
        }
    }
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}

export default withAuthentication(handler);