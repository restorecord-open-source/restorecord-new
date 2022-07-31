import { verify } from "jsonwebtoken";
import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../../../../../src/db";
import { getIPAddress, getBrowser, getPlatform } from "../../../../../src/getIPAddress";
import { addMember, addRole, refreshTokenAddDB, shuffle, sleep } from "../../../../../src/Migrate";
import rateLimit from "../../../../../src/rate-limit";

const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") return res.status(405).json({ success: false, message: "Method not allowed." }); 

    try {
        limiter.check(res, 2, "CACHE_TOKEN");
                
        const token = req.headers.authorization as string;
        const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

        const guildId: any = req.query.guild;
                
        if (!valid) return res.status(400).json({ success: false });

        const sess = await prisma.sessions.findMany({ where: { accountId: valid.id, } }); 

        if (sess.length === 0) return res.status(400).json({ success: false, message: "No sessions found." });

        const account = await prisma.accounts.findFirst({
            where: {
                id: valid.id
            }
        });

        if (!account) return res.status(400).json({ success: false, message: "Account not found" });

        const server = await prisma.servers.findFirst({
            where: {
                AND: [
                    { ownerId: account.id },
                    { guildId: BigInt(guildId) }
                ]
            }
        });

        if (!server) return res.status(400).json({ success: false, message: "Server not found" });

        const bot = await prisma.customBots.findFirst({
            where: {
                AND: [
                    { ownerId: account.id },
                    { id: server.customBotId }
                ]
            }
        });

        if (!bot) return res.status(400).json({ success: false, message: "Bot not found" });

        const members = await prisma.members.findMany({
            where: {
                guildId: BigInt(guildId)
            }
        });

        if (members.length === 0) return res.status(400).json({ success: false, message: "No members found" });

        if (server.pulling === true) return res.status(400).json({ success: false, message: "Bot is already pulling" });

        await prisma.servers.update({
            where: {
                id: server.id 
            },
            data: {
                pulling: true
            }
        });

        let succPulled: number = 0;
        const pullingProcess = new Promise<void>(async (resolve, reject) => {
            let membersNew = await shuffle(members);
            let delay: number = 300;

            await prisma.logs.create({
                data: {
                    title: "Started Pulling",
                    body: `${account.username} started pulling to ${server.name}, ip: ${getIPAddress(req)}, device: ${getPlatform(req.headers["user-agent"] ?? "")} (${getBrowser(req.headers["user-agent"] ?? "")})`,
                }
            });

            for (const member of membersNew) {                    
                await sleep(delay);
                console.log(`Adding ${member.username} to ${server.name}`);
                await addMember(server.guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, [BigInt(server.roleId).toString()]).then(async (resp: any) => {
                    console.log(resp?.response?.status);
                    console.log(resp?.status);
                    
                    if (resp?.response?.status) {
                        switch (resp.response.status) {
                        case 429:   
                            const retryAfter = resp.response.headers["retry-after"];
                            console.log(`Rate limited: ${retryAfter}`);
                            if (retryAfter) {
                                const retry = parseInt(retryAfter);
                                setTimeout(async () => {
                                    await addMember(server.guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, [BigInt(server.roleId).toString()])
                                }, retry);
                                delay += retry;
                            }
                            break;
                        case 403:
                            refreshTokenAddDB( 
                                member.userId.toString(), member.id, guildId.toString(), 
                                bot?.botToken, server.roleId, member.refreshToken,
                                bot?.clientId.toString(), bot?.botSecret.toString(), prisma);
                            break;
                        }
                    }
                    switch (resp.status) {
                    case 403:
                        refreshTokenAddDB( 
                            member.userId.toString(), member.id, guildId.toString(), 
                            bot?.botToken, server.roleId, member.refreshToken,
                            bot?.clientId.toString(), bot?.botSecret.toString(), prisma);

                        // refreshToken(member.refreshToken, bot?.clientId.toString(), bot?.botSecret).then(async (resp) => {
                        //     if (resp.data.access_token && resp.data.refresh_token) {
                        //         await prisma.members.update({
                        //             where: {
                        //                 id: member.id
                        //             },
                        //             data: {
                        //                 accessToken: resp.data.access_token,
                        //                 refreshToken: resp.data.refresh_token
                        //             }
                        //         });
                        //         await addMember(server.guildId.toString(), member.userId.toString(), bot?.botToken, resp.data.access_token, [BigInt(server.roleId).toString()])
                        //     }
                        // }).catch(async (err) => { console.log(err); })
                        break;
                    case 204:
                        succPulled++;
                        await addRole(server.guildId.toString(), member.userId.toString(), bot?.botToken, BigInt(server.roleId).toString());
                        resolve();
                        break;
                    case 201:
                        succPulled++;
                        if (delay > 500) delay -= delay / 2;
                        resolve();
                        break;
                    default:
                        reject();
                        break;
                    }
                }).catch(async (err: Error) => {
                    await prisma.servers.update({
                        where: {
                            id: server.id
                        },
                        data: {
                            pulling: false
                        }
                    });

                    return res.status(400).json({ success: false, message: err?.message ? err?.message : "Something went wrong" });
                });
            }
            await prisma.servers.update({
                where: {
                    id: server.id
                },
                data: {
                    pulling: false
                }
            });
        })
            .then(() => {
                // console.log(`Pulled ${succPulled} members`);
                // return res.status(200).json({ success: true, message: `Successfully pulled ${succPulled}/${members.length} members` });
            })
            .catch(async (err: Error) => {
                console.log(`3 ${err}`);
                await prisma.servers.update({
                    where: {
                        id: server.id
                    },
                    data: {
                        pulling: false
                    }
                });

                // return res.status(400).json({ success: false, message: err?.message ? err.message : "Something went wrong" });
            })
            // .finally(() => {
            //     return res.status(200).json({ success: true, message: `Successfully pulled ${succPulled}/${members.length} members` });
            // });

            
        return res.status(200).json({ success: true, message: `Started Pull Process` });
    }
    catch (err: any) {
        console.log(`4 ${err}`);
        if (res.getHeader("x-ratelimit-remaining") == "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
        if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
        return res.status(400).json({ success: false, message: "Something went wrong" });
    }
}
