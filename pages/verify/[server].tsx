import Head from "next/head";
import { prisma } from "../../src/db";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import theme from "../../src/theme";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import LockIcon from "@mui/icons-material/Lock";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import VerifiedIcon from "@mui/icons-material/Verified";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

export default function Verify({ server, status, err, errStack, captcha }: any) {
    const router = useRouter();

    const [disabled, setDisabled] = useState(false);

    const [nsfwModal, setNsfwModal] = useState(false);
    const [isAdult, setIsAdult] = useState(false);

    const [captchaToken, setCaptchaToken]: any = useState();
    const [loading, setLoading] = useState(false);
    const captchaRef: any = useRef();

    const onExpire = () => {
        console.error("Expired");
        window.location.reload();
    }

    const onError = (err: any) => {
        console.error(err);
    }

    function getCookie(name: string): string {
        return document.cookie.split("; ").reduce((cookieValue, cookie) => {
            const [cookieName, value] = cookie.split("=");
            return cookieName === name ? value : cookieValue;
        }, "");
    }

    useEffect(() => {
        if (server.nsfw && !isAdult && getCookie("nsfw") !== "true") {
            setNsfwModal(true);
        }

        if (status === "finished") {
            setDisabled(true);
            setTimeout(() => { setDisabled(false); }, 10000);
        }

        if (captcha && server.success) {
            document.cookie = "captcha=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = `https://discord.com/oauth2/authorize?client_id=${server.clientId}&redirect_uri=${server.domain}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.guildId}&prompt=none`;
        }

        if (captchaToken) {
            fetch("/api/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: errStack,
                    captcha: captchaToken,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success && data.code === 200) {
                        document.cookie = "RC_err=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        document.cookie = "RC_errStack=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        document.cookie = "captcha=true; path=/;";
                        window.location.reload();
                    } else {
                        window.location.reload();
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [server, status, captchaToken, errStack]);

    function ErrorAlert(err: string) {
        const errorMessages: any = {
            "404": "Sorry, we couldn't add the Verify role to your Account. Contact the server owner for assistance.",
            "403": "Oops! The bot is missing permissions. contact the server owner to fix this issue.",
            "401": "Oh no! The Bot Token is Invalid. Contact the server owner to fix this issue.",
            "304": "Sorry, This server doesn't allow verification with a wireless conection (LTE, 4G, 5G, etc). Please use WiFi or try again later.",
            "305": "Oops! This server doesn't allow verification with alt accounts. Please use your main account to verify.",
            "306": "Sorry, but you can't verify while using a VPN or proxy on this server. Please disable it and try again.",
            "307": "You're blacklisted in this server. Contact the server owner for more information.",
            "30001": "You've reached Discord's 100-server limit. Leave a server before verifying again.",
            "777": "Verification requires solving a captcha on this server. Please complete the captcha to proceed.",
        };
          
        const errorCodePrefix = err.match(/^\d+/);
        let errorMessage = `Discord API error: ${errStack}`;
        
        if (errorCodePrefix) {
            for (const key in errorMessages) {
                if (key.startsWith(errorCodePrefix[0])) {
                    errorMessage = errorMessages[key];
                    break;
                }
            }
        }

        return (
            <Alert severity="error" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(211, 47, 47, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                <AlertTitle>Error{err !== undefined ? `: ${err}` : ""}</AlertTitle>
                {errorMessage}
                {(err !== undefined && err === "403") && (
                    <>
                        {' '}
                        <Link href={`https://restr.co/perms`}>Click here</Link> to fix this issue.
                    </>
                )}
            </Alert>
        );
    }
      

    return (
        <>
            <Head>
                <meta name="description" content={server.description ? server.description : ""} />
                <meta property="og:description" content={server.description ? server.description : ""} />
                <meta property="og:title" content={`Verify in ${server.name}`} />
                <meta property="og:url" content={`/verify/${encodeURIComponent(server.name)}`} />
                <meta property="og:image" content={server.icon} />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content={server.color ?? "#000"} />
                <meta name="msapplication-navbutton-color" content={server.color ?? "#000"} />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                {(server.unlisted || server.private || server.locked) && ( <meta name="robots" content="noindex" /> )}
                <title>{server.name ? server.name : "RestoreCord"}</title>
            </Head>

            {(server.success && server.bg && !(nsfwModal)) && ( <Box sx={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${server.bg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", height: "100vh", width: "100vw", position: "absolute", top: "0", left: "0", zIndex: "-999", filter: "blur(0.5rem)" }} /> )}

            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
                    <Paper sx={{ borderRadius: "1rem", padding: "2rem", marginTop: "1rem", width: { xs: "100%", md: "50%" }, marginBottom: "2rem", boxShadow: "0px 10px 10px 5px rgba(0, 0, 0, 0.25)", backgroundColor: "#00000026", backdropFilter: "blur(1.5rem)" }}>
                        {server.success ? (
                            <>

                                {nsfwModal && (
                                    <Dialog open={nsfwModal} onClose={() => { setNsfwModal(false); }}>
                                        <DialogTitle>NSFW Server</DialogTitle>
                                        <DialogContent>
                                            <Typography variant="body1" component="p" sx={{ fontSize: { xs: "1rem", md: "1.5rem" }, whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                                                This server is marked as <b>NSFW</b>.<br/>
                                                Are you 18 years of age or older?
                                            </Typography>
                                        </DialogContent>
                                        <DialogActions>
                                            <Stack direction={{ sm: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" width="100%">
                                                <Button onClick={() => { 
                                                    setIsAdult(true); 
                                                    setNsfwModal(false);
                                                    document.cookie = `nsfw=true; path=/; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toUTCString()}`;
                                                }} color="success" fullWidth variant="contained">
                                                    Yes
                                                </Button>
                                                <Button onClick={() => {
                                                    setIsAdult(false); 
                                                    setNsfwModal(false); 
                                                    router.push("https://google.com");
                                                }} color="error" fullWidth variant="contained">
                                                    No
                                                </Button>
                                            </Stack>
                                        </DialogActions>
                                    </Dialog>
                                )}

                                {status === "finished" ? (
                                    <Alert severity="success" variant="filled" sx={{ mb: 2, backgroundColor: "rgba(28, 205, 30, 0.25)", backdropFilter: "blur(0.5rem)" }}>
                                        <AlertTitle>Success</AlertTitle>
                                        You have successfully verified in <b>{server.name}</b>!
                                    </Alert>
                                ) : ( <></> )}

                                <>{err ? ErrorAlert(err) : null}</>

                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row", textAlign: "center", width: "100%" }}>
                                    {server.locked && (
                                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={`This server is currently disabled.`}>
                                            <LockIcon sx={{ color: theme.palette.grey[500], width: "2rem", height: "2rem", marginLeft: "1rem" }} />
                                        </Tooltip>
                                    )}
                                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={server.name}>
                                        <Typography variant="h1" component="h1" sx={{ fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" }, mr: "0.5rem", textShadow: "0px 0px 15px rgba(0, 0, 0, 0.25)" }}>
                                            {server.name}
                                        </Typography>
                                    </Tooltip>
                                    {!server.ipLogging && (
                                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={`Upon joining this server, your IP address will not be logged or saved.`}>
                                            <PublicOffIcon sx={{ color: theme.palette.grey[500], width: "2rem", height: "2rem" }} />
                                        </Tooltip>
                                    )}
                                    {server.verified && (
                                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={`This server has been verified by RestoreCord and is deemed to be safe and legitimate.`}>
                                            <VerifiedIcon sx={{ width: "2rem", height: "2rem" }} />
                                        </Tooltip>
                                    )}
                                </Box>

                                {server.locked ? (
                                    <>
                                        <Typography variant="body1" component="p" sx={{ textAlign: "center", fontSize: { xs: "1rem", md: "1.75rem" }, whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                                            This server is currently disabled, due to a violation of our <Link href="/terms">Terms of Service</Link>.
                                        </Typography>

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
                                    </>
                                ) : (
                                    <>
                                        {server.description &&
                                        <Typography variant="body1" component="p" sx={{ textAlign: "center", fontSize: { xs: "1rem", md: "1.75rem" }, whiteSpace: "pre-line", overflowWrap: "break-word" }}>
                                            {!(nsfwModal) && server.description}
                                        </Typography>}

                                        {server.icon &&
                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: "1rem" }}>
                                            <Avatar src={!(nsfwModal) && server.icon} sx={{ width: { xs: "6rem", md: "8rem" }, height: { xs: "6rem", md: "8rem" } }} />
                                        </Box>}

                                        {/* if RC_err is 777 then show captcha */}
                                        {err === "777" && (
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: "1rem" }}>
                                                <HCaptcha
                                                    sitekey="748ea2c2-9a8d-4791-b951-af4c52dc1f0f"
                                                    size="normal"
                                                    theme="light"
                                                    onVerify={setCaptchaToken}
                                                    onError={onError}
                                                    onExpire={onExpire}
                                                    onClose={() => { setLoading(false); }}
                                                    ref={captchaRef}
                                                />
                                            </Box>
                                        )}

                                        {(!server.private) && (
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <Button variant="contained" color="primary" href={err === "777" ? "#" : (`https://discord.com/oauth2/authorize?client_id=${server.clientId}&redirect_uri=${server.domain}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.guildId}`)} rel="noopener noreferrer"
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
                                                    disabled={loading || disabled}
                                                    onClick={() => { if (err === "777") { setLoading(true); captchaRef.current.execute(); } }}
                                                >
                                                    {err === "777" ? (loading ? (<Stack direction={"row"} gap={1}><CircularProgress size={24} />Verifying...</Stack>) : ("Verify")) : ("Verify")}
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <Typography variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" } }}>
                                    Server not found
                                </Typography>

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
        const cookies = req.headers.cookie ? req.headers.cookie : "";
        const host = `https://${(req.headers['x-forwarded-host'] || req.headers.host)}`;

        let serverName = req.url.split("/")[2];
        let type = 1;

        let serverInfo: { success: boolean, name: string, guildId: string, icon: string, bg: string, description: string | null, theme: string, color: string, ipLogging: boolean, clientId: string, domain: string, locked: boolean, verified: boolean, unlisted: boolean, private: boolean, nsfw: boolean } = {
            success: false,
            name: decodeURI(serverName),
            guildId: "",
            icon: "https://cdn.restorecord.com/logo512.png",
            bg: "",
            description: null,
            theme: "DEFAULT",
            color: "#4f46e5",
            ipLogging: true,
            clientId: "",
            domain: "",
            locked: false,
            verified: false,
            unlisted: false,
            private: false,
            nsfw: false
        }

        const isDiscordId = (id: string): boolean => /^[0-9]{17,19}$/.test(id);
        type = isDiscordId(serverName) ? 1 : 0;

        await prisma.servers.findUnique({
            select: {
                id: true,
                customBotId: true,
                ownerId: true,
                name: true,
                guildId: true,
                picture: true,
                bgImage: true,
                description: true,
                theme: true,
                themeColor: true,
                ipLogging: true,
                private: true,
                locked: true,
                verified: true,
                unlisted: true,
                nsfw: true,
                customBot: {
                    select: {
                        clientId: true,
                        customDomain: true
                    }
                },
                owner: {
                    select: {
                        id: true
                    }
                }
            },
            where: {
                name: type === 0 ? decodeURIComponent(serverName) : undefined,
                guildId: type === 1 ? BigInt(serverName) as bigint : undefined
            }
        }).then(async (res) => {
            if (res) {
                if (!res.owner) return { props: { server: serverInfo, status: "error", err: "Owner account not found. Contact Owner", errStack: "" } }
                if (!res.customBot) return { props: { server: serverInfo, status: "error", err: "Custom bot not found. Contact Owner", errStack: "" } }

                serverInfo = {
                    success: true,
                    name: res.name,
                    guildId: res.private ? "" : res.guildId.toString(),
                    icon: res.picture ?? "https://cdn.restorecord.com/logo512.png",
                    bg: res.bgImage ? res.bgImage : "",
                    description: res.description,
                    theme: res.theme,
                    color: `#${res.themeColor}`,
                    ipLogging: res.ipLogging,
                    clientId: res.private ? "0" : res.customBot?.clientId.toString(),
                    domain: res.customBot?.customDomain ? (res.private ? "" : `https://${res.customBot.customDomain}`) : host,
                    locked: res.locked,
                    verified: res.verified,
                    unlisted: res.unlisted,
                    private: res.private,
                    nsfw: res.nsfw
                }
            }
        }).catch((err: any) => {
            console.error(err);
            return { props: { server: serverInfo, status: "error", err: "Server not found", errStack: "" } }
        });

        return { 
            props: {
                server: JSON.parse(JSON.stringify(serverInfo)),
                status: cookies.includes("verified=true") ? "finished" : "verifying",
                err: cookies.includes("RC_err") ? cookies.split("RC_err=")[1].split("RC_errStack")[0].trim() : "", 
                errStack: cookies.includes("RC_errStack=\"") ? (cookies.split("RC_errStack=\"")[1].split("\"")[0] ?? "") : (cookies.includes("RC_errStack") ? cookies.split("RC_errStack=")[1].split(";")[0] : ""),
                captcha: cookies.includes("captcha=true") ? true : false,
            }
        }
    }
}
