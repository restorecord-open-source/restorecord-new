/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import NavBar from "../../components/landing/NavBar";
import getServer from "../../src/getServer";
import Link from "next/link";
import Head from "next/head";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import theme from "../../src/theme";
import Button from "@mui/material/Button";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { prisma } from "../../src/db";

export default function Verify({ server, status, err, errStack }: any) {
    const router = useRouter();
    const guildId = router.query.server;

    const { data, isLoading, error } = useQuery("server", async () => {
        return await getServer(guildId);
    }, { retry: false, refetchOnWindowFocus: false });

    if (error) {
        return (
            <>
                <Typography variant="h1">
                    Error
                </Typography>
            </>
        )
    }

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
                    An unknown error has occured: {errStack}
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
                {isLoading ? <title>Loading...</title> : <title>{data.success ? data.server.name : "RestoreCord"}</title>}
            </Head>

            {isLoading ? ( <></> ) : (
                <>
                    {data.success ? (
                        <Box sx={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${data.server.bg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", height: "100vh", width: "100vw", position: "absolute", top: "0", left: "0", zIndex: "-999", filter: "blur(0.5rem)" }} />
                    ) : ( <></> )}
                </>
            )}

            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
                    <Paper sx={{ borderRadius: "1rem", padding: "2rem", marginTop: "1rem", width: { xs: "100%", md: "50%" }, marginBottom: "2rem", boxShadow: "0px 10px 10px 5px rgba(0, 0, 0, 0.25)", backgroundColor: "#00000026", backdropFilter: "blur(1.5rem)" }}>

                        {isLoading ? ( <></> ) : (
                            <>
                                {status === "finished" ? (
                                    <Alert severity="success" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(28, 205, 30, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                                        <AlertTitle>Success</AlertTitle>
                                        You have successfully verified in <b>{data.server.name}</b>!
                                    </Alert>
                                ) : ( <></> )}
                            </>
                        )}

                        {isLoading ? ( <></> ) : (
                            <>{err ? (
                                <>{ErrorAlert(err)}</>
                            ) : ( <></> )}</>
                        )}
                        

                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Skeleton animation="wave" variant="text" width="20rem" height="56px" />
                            </Box>
                        ) : (
                            <>
                                {data.success ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={data.server.name}>
                                            <Typography variant="h1" component="h1" sx={{ fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" }, pl: "1rem", mr: "1rem", textShadow: "0px 0px 15px rgba(0, 0, 0, 0.25)", textAlign: "center" }}>
                                                {data.server.name}
                                            </Typography>
                                        </Tooltip>

                                        {data.server.verified && (
                                            <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={`Verified`}>
                                                <CheckCircle sx={{ color: theme.palette.grey[500], width: "2rem", height: "2rem" }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                ) : ( 
                                    <>
                                        <Typography variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" } }}>
                                            Server not found
                                        </Typography>
                                    </>
                                )}
                            </>
                        )}

                        {isLoading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <Skeleton animation="wave" variant="text" width="10rem" height="48px" />
                            </Box>
                        ) : (
                            <>
                                {data.success && (
                                    <Typography variant="body1" component="p" sx={{ textAlign: "center", fontSize: { xs: "1rem", md: "1.75rem" }, whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                                        {data.server.description}
                                    </Typography>
                                )}
                            </>
                        )}

                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: "1rem" }}>
                            {isLoading ? (
                                <Skeleton animation="wave" variant="circular" width="122px" height="122px" />
                            ) : (
                                <>
                                    {data.success && (
                                        <Avatar src={data.server.icon} sx={{ width: { xs: "6rem", md: "8rem" }, height: { xs: "6rem", md: "8rem" } }} />
                                    )}
                                </>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {isLoading ? (
                                <Skeleton animation="wave" variant="text" width="100%" height="56px" sx={{ width: "100%", marginTop: "2rem" }} />
                            ) : (
                                <>
                                    {data.success ? (
                                        <Button variant="contained" color="primary" href={`https://discord.com/oauth2/authorize?client_id=${data.server.clientId}&redirect_uri=${data.server.domain ? `https://${data.server.domain}` : window.location.origin}/api/callback&response_type=code&scope=identify+guilds.join&state=${data.server.guildId}`} target="_blank" rel="noreferrer"
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
                                            }}>
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
                                            Go back
                                        </Button>
                                    )}
                                </>
                            )}
                        </Box>
                    </Paper>

                    {isLoading ? (
                        <Skeleton animation="wave" variant="text" width="7.5rem" height="24px" />
                    ) : (
                        <>
                            {data.success && (
                                <Typography variant="body1" component="p" sx={{ textAlign: "center", mt: 1, color: "rgba(255, 255, 255, 0.15)", bottom: 0, position: "absolute", marginBottom: { xs: "0.25rem", md: "2rem" }, display: { xs: "none", md: "block" } }}>
                                    Created on {new Date(data.server.createdAt).toLocaleDateString()} by {data.server.owner}
                                </Typography>
                            )}
                        </>
                    )}
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

        let serverInfo: { name: string, description: string, icon: string, color: string } = {
            name: decodeURI(serverName),
            description: "Verify to view the rest of the server.",
            icon: "https://cdn.restorecord.com/logo512.png",
            color: "#4f46e5"
        }

        if (isNaN(Number.parseInt(serverName as any))) type = 0;
        try {
            if (isNaN(Number(serverName)) || isNaN(Number(serverName))) type = 0;
            if (BigInt(serverName) > 18446744073709551615 || BigInt(serverName) > 18446744073709551615) type = 0;
            else type = 1;
        } catch (e) { type = 0; }

        await prisma.servers.findUnique({
            where: {
                name: type === 0 ? serverName : undefined,
                guildId: type === 1 ? BigInt(serverName) as bigint : undefined
            }
        }).then((res) => {
            if (res) {
                serverInfo = {
                    name: res.name,
                    description: res.description,
                    icon: res.picture ?? "https://cdn.restorecord.com/logo512.png",
                    color: `#${res.themeColor}`,
                }
            }
        })

        return { 
            props: {
                server: JSON.parse(JSON.stringify(serverInfo)),
                status: cookies.includes("verified=true") ? "finished" : "verifying",
                err: cookies.includes("RC_err=") ? cookies.split("RC_err=")[1].split(";")[0] : "",
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
