import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { grey } from "@mui/material/colors";
import { useToken } from "../../../src/token";

import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import { Dialog } from "@mui/material";

export default function CustomBots() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const [updatedBots, setUpdatedBots]: any = useState([]);

    const { data: user, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    useEffect(() => {
        if (user && user.bots.length > 0) {
            const fetchBotData = async () => {
                const botData = await Promise.all(
                    user.bots.map((bot: any) =>
                        fetch(`/api/v2/users/@me`, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bot ${bot.botToken}`,
                            },
                        })
                            .then((res) => res.json())
                            .then((res) => {
                                if (res.id) {
                                    bot.valid = true;
                                    if (res.avatar === null) {
                                        bot.avatar = `https://cdn.discordapp.com/embed/avatars/${
                                            res.discriminator % 5
                                        }.png`;
                                    } else {
                                        bot.avatar = `https://cdn.discordapp.com/avatars/${res.id}/${res.avatar}.png`;
                                    }
                                    bot.username = `${res.username}#${res.discriminator}`;
                                    bot.clientId = res.id;
                                } else if (res.message === "401: Unauthorized") {
                                    bot.valid = false;
                                    bot.avatar = `https://cdn.discordapp.com/embed/avatars/0.png`;
                                    bot.username = `Unknown Bot/Deleted`;
                                    bot.clientId = atob(bot.botToken.split(".")[0]);
                                }
                                return bot;
                            })
                            .catch((err) => {
                                console.error(`Error: ${err}`);
                                return bot;
                            })
                    )
                );
    
                setUpdatedBots(botData);
            };
    
            fetchBotData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);


    if (isLoading) return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    if (isError) return <div>Error</div>

    if (!user || !user.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
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

                
                <Snackbar open={openI} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenI(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Alert elevation={6} variant="filled" severity="success">
                        {notiTextI}
                    </Alert>
                </Snackbar>
            </>
        )
    }

    function renderBot(BotClient: any) {
        return (
            <Paper key={BotClient.id} id={BotClient.clientId} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
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
                                    <Skeleton variant="text" width={150} height={"32px"} />
                                )}
                            </div>
                            <Typography variant="body2" color="textSecondary">
                                {BotClient.username ? (
                                    <>{BotClient.name} - {BotClient.clientId}</>
                                ) : (
                                    <Skeleton variant="text" width={"190px"} height={"20px"} />
                                )}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                            <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                {BotClient.username ? (
                                    <>
                                        <Button variant="contained" color={BotClient.valid ? "primary" : "error"} onClick={() => { router.push(`/dashboard/custombots/${BotClient.clientId}`) }}>
                                            {BotClient.valid ? "Manage" : "Update"}
                                        </Button>
                                        {BotClient.valid && (
                                            <Button variant="contained" color="success" href={`https://discord.com/oauth2/authorize?client_id=${BotClient.clientId}&scope=bot applications.commands&permissions=8`} target="_blank" rel="noreferrer">
                                                Invite
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Skeleton variant="rectangular" width={"100px"} height={"40px"} sx={{ borderRadius: "14px" }} />
                                        <Skeleton variant="rectangular" width={"100px"} height={"40px"} sx={{ borderRadius: "14px" }} />
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
                <Box sx={{ display: "inline-flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "700" }}>
                        Custom Bots
                    </Typography>
                </Box>
                <Button variant="contained" sx={{ mb: 2 }} onClick={(e) => {
                    e.preventDefault();
                    router.push("/dashboard/custombots/new");
                }}>
                    + Create New Bot
                </Button>
            </Stack>
        )
    }
    
    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={user}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent>
                                {renderNotifications()}
                                {rendertitleBarUI()}


                                {/* if one or more bots are invalid then show an alert at the top */}
                                {updatedBots.some((bot: any) => bot.valid === false) && (
                                    <Alert severity="warning" sx={{ my: "1rem" }}>
                                        <Typography variant="body1" color={grey[200]} sx={{ fontWeight: "400" }}>One or more of your bots have an Invalid Token, usually this means that the Bot was deleted/disabled by Discord, or the token was changed. <Link href="https://docs.restorecord.com/faq#why-is-my-bot-invalid" target="_blank" rel="noreferrer">Learn More</Link></Typography>
                                    </Alert>
                                )}


                                {(user && user.bots.length > 0) ? (
                                    user.bots ? (
                                        user.bots.map((bot: any) => {
                                            return renderBot(bot);
                                        })
                                    ) : (
                                        updatedBots.map((BotClient: any) => {
                                            return renderBot(BotClient);
                                        })
                                    )
                                ) : (
                                    <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                        <CardContent>
                                            <Typography variant="body1" color={grey[200]} sx={{ fontWeight: "400", textAlign: "center" }}>You don&apos;t have any bots yet :(</Typography>
                                            <Typography variant="body2" color={grey[400]} sx={{ fontWeight: "300", textAlign: "center" }}>Click Create New Bot above to get started.</Typography>
                                        </CardContent>
                                    </Paper>
                                )}

                            </CardContent>
                        </Paper>
                    </Container>
                    
                </NavBar>
            </Box>
        </>
    )
}