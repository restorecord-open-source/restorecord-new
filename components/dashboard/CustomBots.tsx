import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "react-query";
import { useToken } from "../../src/token";

import Image from "next/image";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";

export default function DashCustomBot({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [botName, setbotName] = useState("");
    const [clientId, setclientId] = useState("");
    const [botSecret, setbotSecret] = useState("");
    const [botToken, setbotToken] = useState("");
    const [publicKey, setpublicKey] = useState("");

    const [createNewBot, setcreateNewBot] = useState(false);

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const { data, isError, isLoading  } = useQuery("getCustomBotInfo", async() => {
        if (user.bots && user.bots.length > 0) {
            for (const bot of user.bots) {
                await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 100) + 100));
                await fetch(`/api/v1/users/@me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bot ${bot.botToken}`,
                    },
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.id) {
                            if (res.avatar === null) {
                                bot.avatar = `https://cdn.discordapp.com/embed/avatars/${res.discriminator % 5}.png`;
                            } else {
                                bot.avatar = `https://cdn.discordapp.com/avatars/${res.id}/${res.avatar}.png`;
                            }
                            bot.username = `${res.username}#${res.discriminator}`;
                            bot.clientId = res.id;
                            return bot;
                        } else if (res.message === "401: Unauthorized") {
                            bot.avatar = `https://cdn.discordapp.com/embed/avatars/0.png`;
                            bot.username = `Unknown Bot/Deleted`;
                            bot.clientId = atob(bot.botToken.split(".")[0]);
                            return bot;
                        }
                    })
                    .catch(err => {
                        console.error(`Error: ${err}`);
                    })
            }
        }
    }, {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    if (isError) {
        return <p>Error</p>
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v1/settings/bot`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                botName: botName,
                clientId: clientId,
                botToken: botToken,
                botSecret: botSecret,
                publicKey: publicKey,
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    setNotiTextE(res.message);
                    setOpenE(true);
                }
                else {
                    setNotiTextS(res.message);
                    setOpenS(true);
                    setTimeout(() => {
                        router.reload();
                    }, 1500);
                }
            })
            .catch(err => {
                console.error(err);
                setNotiTextE(err.message);
                setOpenE(true);
            });

        fetch(`/api/v1/bot/${clientId}/refresh`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    console.error(res.message);
                }
            })
            .catch(err => {
                console.error(err);
            });
                
    }

    function handleChange(e: any) {
        switch (e.target.name) {
        case "botName":
            setbotName(e.target.value);
            break;
        case "clientId":
            setclientId(e.target.value);
            break;
        case "botToken":
            setbotToken(e.target.value);
            break;
        case "botSecret":
            setbotSecret(e.target.value);
            break;
        case "publicKey":
            setpublicKey(e.target.value);
            break;
        default:
            break;
        }
    }

    function renderNotifications() {
        return (
            <>
                <Snackbar open={openE} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenE(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Alert elevation={6} variant="filled" severity="error">
                        {notiTextE}
                    </Alert>
                </Snackbar>

                <Snackbar open={openS} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Alert elevation={6} variant="filled" severity="success">
                        {notiTextS}
                    </Alert>
                </Snackbar>
            </>
        )
    }

    function renderCreateBotUI() {
        return (
            <>
                <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                    <CardContent>
                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                            <Alert variant="filled" severity="error">Before you create a bot, make sure you have read the <Link href="https://docs.restorecord.com/guides/create-a-custom-bot/" target="_blank">documentation</Link> and added a redirect/interaction URL to your bot.</Alert>
                            <TextField label="Bot Name" name="botName" value={botName} onChange={handleChange} required />
                            <TextField label="Client ID" name="clientId" value={clientId} onChange={handleChange} required />
                            <TextField label="Bot Token" name="botToken" value={botToken} onChange={handleChange} required />
                            <TextField label="Client Secret" name="botSecret" value={botSecret} onChange={handleChange} required />
                            {(user.role === "business" || user.role === "enterprise") && (
                                <TextField label="Public Key" name="publicKey" value={publicKey} onChange={handleChange} />
                            )}
                            <Button variant="contained" onClick={(e: any) => handleSubmit(e)}>
                                Create Bot
                            </Button>
                        </Stack>

                        <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "1rem", marginTop: "1rem" }}>
                            How to add Redirect{user.role === "business" ? <> and Interaction URL</> : <></>}?
                        </Typography>
                        <Stack spacing={1} direction="row" justifyContent={"justify-between"} sx={{ marginTop: "1rem" }}>
                            <Image src="https://docs.restorecord.com/static/botsetup/redirect_url.png" alt="Redirect URL" width={1920} height={1080} />
                            {(user.role === "business" || user.role === "enterprise") && (
                                <Image src="https://docs.restorecord.com/static/botsetup/interaction_url.png" alt="Interaction URL" width={1920} height={1080} />
                            )}
                        </Stack>
                    </CardContent>
                </Paper>
            </>
        )
    }

    function renderBot(BotClient: any) {
        return (
            <Paper key={BotClient.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                <CardContent>
                    <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                        <Grid item>
                            <div style={{ display: "inline-flex", alignItems: "center" }}>
                                <Avatar alt={BotClient.username} src={BotClient.avatar} sx={{ mr: "0.5rem" }} />
                                {BotClient.username ? (
                                    <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                        {BotClient.username}
                                    </Typography>
                                ) : (
                                    <Skeleton variant="text" width={150} />
                                )}
                            </div>
                            <Typography variant="body2" color="textSecondary">
                                {BotClient.username ? (
                                    <>{BotClient.name} - {BotClient.clientId}</>
                                ) : (
                                    <Skeleton variant="text" width={190} height={20} />
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                            <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                {BotClient.username ? (
                                    <>
                                        <Button variant="contained" color="primary" onClick={() => { router.push(`/dashboard/custombots/${BotClient.clientId}`) }}>
                                            Edit
                                        </Button>
                                        <Button variant="contained" color="success" href={`https://discord.com/oauth2/authorize?client_id=${BotClient.clientId}&scope=bot applications.commands&permissions=8`} target="_blank" rel="noreferrer">
                                            Invite
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: "14px" }} />
                                        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: "14px" }} />
                                    </>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Paper>
        )
    }

    function rendertitleBarUI() {
        return (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ "@media screen and (max-width: 600px)": { flexDirection: "column" } }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                    Custom Bots
                </Typography>
                <Button variant="contained" sx={{ mb: 2 }} onClick={() => setcreateNewBot(true)}>
                    + Create New Bot
                </Button>
            </Stack>
        )
    } 

    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                    <CardContent>
                        {renderNotifications()}

                        {(user.bots.length > 0) && !createNewBot && (
                            <>
                                {rendertitleBarUI()}
                                {user.bots.map((item: any) => renderBot(item))}
                            </>
                        )}

                        {(createNewBot || (user.bots.length === 0)) && renderCreateBotUI()}
                    </CardContent>
                </Paper>
            </Container>
        </>
    )
}
