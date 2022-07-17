import { verify } from "jsonwebtoken";
import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "../../../../../src/db";
import { addMember, addRole, refreshToken, refreshTokenAddDB, shuffle, sleep } from "../../../../../src/Migrate";
import rateLimit from "../../../../../src/rate-limit";

const limiter = rateLimit({
    interval: 10 * 1000, 
    uniqueTokenPerInterval: 500,
    limit: 5,
})


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise(async resolve => {
        switch (req.method) {
        case "GET":
            try {
                // limiter.check(res, "CACHE_TOKEN");
                
                const token = req.headers.authorization as string;
                const valid = verify(token, process.env.JWT_SECRET!) as { id: number; }

                const guildId: any = req.query.guild;
                
                if (!valid) return res.status(400).json({ success: false });

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
                    let delay: number = 500;

                    for (const member of membersNew) {
                        await sleep(delay);
                        console.log(`Adding ${member.username} to ${server.name}`);
                        await addMember(server.guildId.toString(), member.userId.toString(), bot?.botToken, member.accessToken, [BigInt(server.roleId).toString()]).then(async (resp: any) => {
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
                                        delay += retry / 2;
                                    }
                                    break;
                                case 403:
                                    // return res.status(400).json({ success: false, message: "Missing permissions" });
                                    throw new Error("Missing permissions");
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
                                resolve();
                                succPulled++;
                                await addRole(server.guildId.toString(), member.userId.toString(), bot?.botToken, BigInt(server.roleId).toString())
                                break;
                            case 201:
                                resolve();
                                succPulled++;
                                if (delay >= 1000) delay -= delay / 2;
                                break;
                            default:
                                reject();
                                break;
                            }
                        }).catch(async (err: Error) => {
                            console.log(`1 ${err}`);
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

                        return res.status(400).json({ success: false, message: err?.message ? err.message : "Something went wrong" });
                    })
                    

                await pullingProcess;
                return res.status(200).json({ success: true, message: `Successfully pulled ${succPulled}/${members.length} members` });


                // if pullingProcess didnt throw error, return success message
                
            }
            catch (err: any) {
                console.log(`4 ${err}`);
                if (res.getHeader("x-ratelimit-remaining") === "0") return res.status(429).json({ success: false, message: "You are being Rate Limited" });
                if (err?.name === "" || err?.name === "JsonWebTokenError") return res.status(400).json({ success: false, message: "User not logged in" }); 
                return res.status(400).json({ success: false, message: "Something went wrong" });
            }
            break;
        default:
            res.setHeader("Allow", "GET");
            return res.status(405).end(`Method ${req.method} Not Allowed`);
            break;
        }
    });
}
