import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import LockIcon from "@mui/icons-material/Lock";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { CircularProgress, Stack } from "@mui/material";
import theme from "../src/theme";
import { prisma } from "../src/db";
import { useRouter } from "next/router";

interface UserInfo {
    username: string;
}

interface Server {
    name: string;
    guildId: string;
    clientId: string;
    domain: string;
    description?: string;
    picture?: string;
}

export default function Verify({ info, servers, err }: { info: UserInfo, servers: Server[], err: string }) {
    function ErrorAlert(err: string) {
        return (
            <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                <AlertTitle>An error has occurred</AlertTitle>
                {err}
            </Alert>
        );
    }
      

    return (
        <>
            <Head>
                <meta name="description" content={info.username ? `View ${info.username}'s Profile` : "Profile"} />
                <meta property="og:description" content={info.username ? `View ${info.username}'s Profile` : "Profile"} />
                <meta property="og:title" content={info.username ? `${info.username}'s Profile` : "Profile"} />
                <meta property="og:url" content={`https://${servers[0]?.domain ?? "restorecord.com"}`} />
                {/* <meta property="og:image" content={info.avatar} /> */}
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="" />
                <meta name="msapplication-navbutton-color" content="" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <title>{info.username ? `${info.username}'s Profile` : "Profile"}</title>
            </Head>

            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
                    <Paper sx={{ borderRadius: "1rem", padding: "2rem", marginTop: "1rem", width: { xs: "100%", md: "50%" }, marginBottom: "2rem", boxShadow: "0px 10px 10px 5px rgba(0, 0, 0, 0.25)", backgroundColor: "#00000026", backdropFilter: "blur(1.5rem)" }}>
                        {err ? ErrorAlert(err) : null}
                      
                        {(info.username && servers.length > 0 ) ? (
                            <>
                                <Typography variant="h3" component="h3" sx={{ textAlign: "center", fontWeight: "700" }}>
                                    {info.username}&apos;s Profile
                                </Typography>

                                <Typography variant="body1" component="p" color="text.secondary" sx={{ textAlign: "center" }}>
                                    {info.username} has {servers.length} {servers.length === 1 ? "server" : "servers"}.
                                </Typography>

                                {servers.map((server) => (
                                    <Paper key={server.name} sx={{ borderRadius: "1rem", padding: "2rem", display: "flex", backgroundColor: "#00000052", my: "1rem", boxShadow: "0px 5px 5px 2.5px rgba(0, 0, 0, 0.125)" }}>
                                        <Stack spacing={2} direction={{ xs: "row", md: "column" }} sx={{ width: "100%" }}>
                                            <Stack spacing={2} direction={{ xs: "row", md: "column" }}>
                                                <Stack spacing={2} direction="row" sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <Avatar src={server.picture} sx={{ width: { xs: "3rem", md: "4rem" }, height: { xs: "3rem", md: "4rem" } }} />
                                                    </Box>

                                                    <Typography variant="h4" component="h4" sx={{ textAlign: "center", fontWeight: "700" }}>
                                                        {server.name}
                                                    </Typography>
                                                </Stack>

                                                {server.description && <Typography variant="body2" component="p" color="text.secondary" sx={{ textAlign: "center", whiteSpace: "pre-line", overflowWrap: "break-word" }}>{server.description}</Typography>}
                                            </Stack>

                                            {/* https://discord.com/oauth2/authorize?client_id=1115758330808381530&redirect_uri=https://restorecord.com/api/callback&response_type=code&scope=identify+guilds.join&state=1115758852395253790 */}
                                            <Button variant="contained" color="primary" href={`https://discord.com/api/oauth2/authorize?client_id=${server.clientId}&redirect_uri=https://${server.domain}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.guildId}&prompt=none`} rel="noopener noreferrer" sx={{
                                                width: "100%", 
                                                marginTop: "2rem",
                                                backgroundColor: theme.palette.primary.main,
                                                outline: `1px solid ${theme.palette.primary.main}`,
                                                color: `${theme.palette.getContrastText(theme.palette.primary.main)}`,
                                                "@media not all and (-webkit-min-device-pixel-ratio: 1.5), not all and (-o-min-device-pixel-ratio: 3/2), not all and (min--moz-device-pixel-ratio: 1.5), not all and (min-device-pixel-ratio: 1.5)": {
                                                    "&:hover": {
                                                        outline: `1px solid ${theme.palette.primary.main}`,
                                                        color: theme.palette.primary.main,
                                                    },
                                                },
                                            }}>
                                                Join
                                            </Button>
                                        </Stack>
                                    </Paper>
                                ))}
                            </>
                        ) : (
                            <>
                                <Typography variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" } }}>
                                    Profile Not Found
                                </Typography>

                                <Typography variant="body1" component="p" sx={{ textAlign: "center", fontSize: { xs: "1rem", md: "1.75rem" } }}>
                                    Sorry, we couldn&apos;t find the profile you were looking for.
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Box>
            </Container>
        </>
    )
}


export async function getServerSideProps({ req }: any) {
    if (req) {
        const domain = req.headers.host ?? "restorecord.com";
        let info: UserInfo = { username: "" };
        let servers: Server[] = [];
        let err = "";

        const customBot = await prisma.customBots.findMany({
            select: {
                id: true,
                clientId: true,
                customDomain: true
            },
            where: {
                customDomain: domain
            } 
        });
        if (customBot.length === 0) return { props: { info: {}, servers: [], err: "" } }
        if (customBot.length > 10) return { props: { info: {}, servers: [], err: "Too many bots found" } }

        const userServers = await prisma.servers.findMany({
            select: {
                name: true,
                guildId: true,
                description: true,
                picture: true,
                locked: true,
                ownerId: true,
                customBotId: true,
                owner: {
                    select: {
                        username: true
                    }
                }
            },
            where: { 
                customBotId: { 
                    in: customBot.map((bot) => bot.id) 
                } 
            } 
        });
        if (userServers.length === 0) return { props: { info: {}, servers: [], err: "No servers found" } }

        userServers.every((server) => server.ownerId === userServers[0].ownerId) ? info = { username: userServers[0].owner.username } : info = { username: "Multiple Users" };

        servers = userServers.filter((server) => server.locked === false).map((server) => {
            return {
                name: server.name,
                guildId: server.guildId.toString(),
                clientId: customBot.find((bot) => bot.id === server.customBotId)?.clientId.toString() ?? "",
                domain: customBot.find((bot) => bot.id === server.customBotId)?.customDomain ? customBot.find((bot) => bot.id === server.customBotId)?.customDomain : domain,
                description: server.description,
                picture: server.picture ?? "https://cdn.restorecord.com/logo512.png",
            }
        });

        return { props: { info, servers, err } }


        // await prisma.servers.findUnique({
        //     where: {
        //         name: type === 0 ? decodeURIComponent(serverName) : undefined,
        //         guildId: type === 1 ? BigInt(serverName) as bigint : undefined
        //     }
        // }).then(async (res: any) => {
        //     if (res) {
        //         const customBot = await prisma.customBots.findUnique({ where: { id: res.customBotId }});
        //         const ownerAccount = await prisma.accounts.findUnique({ where: { id: res.ownerId } });
        //         if (!ownerAccount) return { props: { server: serverInfo, status: "error", err: "Owner account not found. Contact Owner", errStack: "" } }
        //         if (!customBot) return { props: { server: serverInfo, status: "error", err: "Custom bot not found. Contact Owner", errStack: "" } }

        //         serverInfo = {
        //             success: true,
        //             name: res.name,
        //             guildId: res.guildId.toString(),
        //             icon: res.picture ?? "https://cdn.restorecord.com/logo512.png",
        //             bg: res.bgImage ? res.bgImage : "",
        //             description: res.description,
        //             theme: res.theme,
        //             color: `#${res.themeColor}`,
        //             ipLogging: res.ipLogging,
        //             clientId: customBot?.clientId.toString(),
        //             domain: customBot?.customDomain ? `https://${customBot.customDomain}` : host,
        //             locked: res.locked
        //         }
        //     }
        // })

        // return { 
        //     props: {
        //         server: JSON.parse(JSON.stringify(serverInfo)),
        //         status: cookies.includes("verified=true") ? "finished" : "verifying",
        //         err: cookies.includes("RC_err") ? cookies.split("RC_err=")[1].split("RC_errStack")[0].trim() : "", 
        //         // find RC_errStack="..." from the RC_err cookie and then split it to get the value of RC_errStack
        //         errStack: cookies.includes("RC_errStack=\"") ? (cookies.split("RC_errStack=\"")[1].split("\"")[0] ?? "") : (cookies.includes("RC_errStack") ? cookies.split("RC_errStack=")[1].split(";")[0] : ""),
        //         captcha: cookies.includes("captcha=true") ? true : false,
        //     }
        // }
    }
}
