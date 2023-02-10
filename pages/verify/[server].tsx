import Head from "next/head";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import theme from "../../src/theme";
import Button from "@mui/material/Button";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { prisma } from "../../src/db";
import { useEffect, useState } from "react";

export default function Verify({ server, status, err, errStack }: any) {
    const [rediUrl, setRediUrl] = useState("");
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if (server.success) {
            document.title = `Verify in ${server.name}`;

            setRediUrl(`https://discord.com/oauth2/authorize?client_id=${server.clientId}&redirect_uri=${server.domain ? `https://${server.domain}` : window.location.origin}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.guildId}`);

            if (status === "finished") {
                setDisabled(true);
                setTimeout(() => { setDisabled(false); }, 10000);
            }

            fetch("/api/fingerprint");
        }
    }, [server, status]);

    function ErrorAlert(err: string) {
        switch (err) {
        case "404":
            return (
                <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                    <AlertTitle>Error</AlertTitle>
                    Seems like this server hasn&#39;t been setup correctly, please contact the owner and let him know: <b><code>Unknown Role</code></b>.
                </Alert>
            );
        case "403":
            return (
                <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                    <AlertTitle>Error</AlertTitle>
                    Seems like this server hasn&#39;t been setup correctly, please contact the owner and let him know: <b><code>Missing Permission</code></b>.
                </Alert>
            );
        case "401":
            return (
                <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                    <AlertTitle>Error</AlertTitle>
                    Seems like this bot hasn&#39;t been setup correctly, please contact the owner and let him know: <b><code>Invalid Token</code></b>.
                </Alert>
            );
        case "306":
            return (
                <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                    <AlertTitle>Error</AlertTitle>
                    VPN or Proxy detected, please disable it and try again.
                </Alert>
            );
        case "307":
            return (
                <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                    <AlertTitle>Error</AlertTitle>
                    You&#39;re blacklisted in this server, please contact the owner.<br/>{errStack}
                </Alert>
            );
        case "30001":
            return (
                <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                    <AlertTitle>Error</AlertTitle>
                    Seems like you have reached the 100 server limit, please leave a server and try again.
                </Alert>
            );
        default:
            return (
                <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                    <AlertTitle>Error</AlertTitle>
                    Discord API error: {errStack}
                </Alert>
            );
        }
    }

    return (
        <>
            <Head>
                <meta name="description" content={server.description} />
                <meta property="og:description" content={server.description} />
                <meta property="og:title" content={`Verify in ${server.name}`} />
                <meta property="og:url" content={`/verify/${encodeURIComponent(server.name)}`} />
                <meta property="og:image" content={server.icon} />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="" />
                <meta name="msapplication-navbutton-color" content="" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <title>{server.name ? server.name : "RestoreCord"}</title>
            </Head>

            {server.success ? (
                <Box sx={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${server.bg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", height: "100vh", width: "100vw", position: "absolute", top: "0", left: "0", zIndex: "-999", filter: "blur(0.5rem)" }} />
            ) : ( <></> )}

            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
                    <Paper sx={{ borderRadius: "1rem", padding: "2rem", marginTop: "1rem", width: { xs: "100%", md: "50%" }, marginBottom: "2rem", boxShadow: "0px 10px 10px 5px rgba(0, 0, 0, 0.25)", backgroundColor: "#00000026", backdropFilter: "blur(1.5rem)" }}>

                        {server.success ? (
                            <>
                                {status === "finished" ? (
                                    <Alert severity="success" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(28, 205, 30, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                                        <AlertTitle>Success</AlertTitle>
                                        You have successfully verified in <b>{server.name}</b>!
                                    </Alert>
                                ) : ( <></> )}
                            </>
                        ) : ( <></> )}

                        <>{server.success && err ? ErrorAlert(err) : null}</>

                        {server.success && (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={server.name}>
                                    <Typography variant="h1" component="h1" sx={{ fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" }, pl: "1rem", mr: "1rem", textShadow: "0px 0px 15px rgba(0, 0, 0, 0.25)", textAlign: "center" }}>
                                        {server.name}
                                    </Typography>
                                </Tooltip>
                                {server.verified && (
                                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={`Verified`}>
                                        <CheckCircle sx={{ color: theme.palette.grey[500], width: "2rem", height: "2rem" }} />
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                        {!server.success && (
                            <Typography variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" } }}>
                                Server not found
                            </Typography>
                        )}



                        {server.success ? (
                            <Typography variant="body1" component="p" sx={{ textAlign: "center", fontSize: { xs: "1rem", md: "1.75rem" }, whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                                {server.description}
                            </Typography>
                        ) : ( <></> )}

                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: "1rem" }}>
                            {server.success ? (
                                <Avatar src={server.icon} sx={{ width: { xs: "6rem", md: "8rem" }, height: { xs: "6rem", md: "8rem" } }} />
                            ) : ( <></> )}
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {server.success ? (
                                <Button variant="contained" color="primary" href={rediUrl} rel="noopener noreferrer"
                                    sx={{ 
                                        width: "100%",
                                        marginTop: "2rem",
                                        backgroundColor: server.color,
                                        outline: `1px solid ${server.color}`,
                                        color: theme.palette.getContrastText(server.color),
                                        "@media not all and (-webkit-min-device-pixel-ratio: 1.5), not all and (-o-min-device-pixel-ratio: 3/2), not all and (min--moz-device-pixel-ratio: 1.5), not all and (min-device-pixel-ratio: 1.5)": {
                                            "&:hover": {
                                                outline: `1px solid ${server.color}`,
                                                color: server.color,
                                            },
                                        },
                                        "@media only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (-o-min-device-pixel-ratio: 3/2), only screen and (min--moz-device-pixel-ratio: 1.5), only screen and (min-device-pixel-ratio: 1.5)": {
                                            "&:hover": {
                                                backgroundColor: `rgba(${parseInt(server.color.slice(1, 3), 16)}, ${parseInt(server.color.slice(3, 5), 16)}, ${parseInt(server.color.slice(5, 7), 16)}, 0.65)`,
                                                color: theme.palette.getContrastText(server.color),
                                            },
                                        },
                                    }}
                                    disabled={disabled}
                                >
                                    Verify
                                </Button>
                            ) : (
                                <Button variant="contained" color="primary" onClick={() => window.history.back()} sx={{
                                    width: "100%", 
                                    marginTop: "2rem",
                                    backgroundColor: server.color,
                                    outline: `1px solid ${server.color}`,
                                    color: `${theme.palette.getContrastText(server.color)}`,
                                    "@media not all and (-webkit-min-device-pixel-ratio: 1.5), not all and (-o-min-device-pixel-ratio: 3/2), not all and (min--moz-device-pixel-ratio: 1.5), not all and (min-device-pixel-ratio: 1.5)": {
                                        "&:hover": {
                                            outline: `1px solid ${server.color}`,
                                            color: server.color,
                                        },
                                    },
                                }}>
                                    &lt;- Go Back
                                </Button>
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </>
    )
}


export async function getServerSideProps({ req }: any) {
    if (req) {
        const cookies = req.headers.cookie ? req.headers.cookie : "";
        let serverName = req.url.split("/")[2];
        let type = 1;

        let serverInfo: { success: boolean, name: string, guildId: string, icon: string, bg: string, description: string, color: string, clientId: string, domain: string } = {
            success: false,
            name: decodeURI(serverName),
            guildId: "",
            icon: "https://cdn.restorecord.com/logo512.png",
            bg: "",
            description: "Verify to view the rest of the server.",
            color: "#4f46e5",
            clientId: "",
            domain: "",
        }

        if (isNaN(Number.parseInt(serverName as any))) type = 0;
        try {
            if (isNaN(Number(serverName)) || isNaN(Number(serverName))) type = 0;
            if (BigInt(serverName) > 18446744073709551615 || BigInt(serverName) > 18446744073709551615) type = 0;
            else type = 1;
        } catch (e) { type = 0; }

        await prisma.servers.findUnique({
            where: {
                name: type === 0 ? decodeURIComponent(serverName) : undefined,
                guildId: type === 1 ? BigInt(serverName) as bigint : undefined
            }
        }).then(async (res: any) => {
            if (res) {
                const customBot = await prisma.customBots.findUnique({ where: { id: res.customBotId }});
                const ownerAccount = await prisma.accounts.findUnique({ where: { id: res.ownerId } });
                if (!ownerAccount) return { props: { server: serverInfo, status: "error", err: "Owner account not found. Contact Owner", errStack: "" } }
                if (!customBot) return { props: { server: serverInfo, status: "error", err: "Custom bot not found. Contact Owner", errStack: "" } }

                serverInfo = {
                    success: true,
                    name: res.name,
                    guildId: res.guildId.toString(),
                    icon: res.picture ?? "https://cdn.restorecord.com/logo512.png",
                    bg: res.bgImage ? res.bgImage : "",
                    description: res.description,
                    color: `#${res.themeColor}`,
                    clientId: customBot?.clientId.toString(),
                    domain: customBot?.customDomain ? customBot.customDomain : "",
                }
            }
        })

        return { 
            props: {
                server: JSON.parse(JSON.stringify(serverInfo)),
                status: cookies.includes("verified=true") ? "finished" : "verifying",
                // err: is cookies "RC_err" value get value until RC_errStack
                err: cookies.includes("RC_err") ? cookies.split("RC_err=")[1].split("RC_errStack")[0].trim() : null, 
                errStack: cookies.includes("RC_errStack=") ? cookies.split("RC_errStack=")[1].split(";")[0] : "",
            }
        }

        // return {
        //     props: {
        //         status: cookies.includes("verified=true") ? "finished" : "verifying",
        //         err: cookies.includes("RC_err=") ? cookies.split("RC_err=")[1].split(";")[0] : "",
        //     }
        // }
    }
}
