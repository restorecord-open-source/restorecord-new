
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import { useToken } from "../../../src/token";

import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";
import theme from "../../../src/theme";

import axios from "axios";
import Link from "next/link"

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import CircularProgress from "@mui/material/CircularProgress";
import StepButton from "@mui/material/StepButton";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import useMediaQuery from "@mui/material/useMediaQuery";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import TextField from "@mui/material/TextField";

const steps = [
    "Select your Bot", 
    "Choose a server", 
    "Almost there"
];


export default function Server() {
    const [ token ]: any = useToken()
    const router = useRouter();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<{[k: number]: boolean;}>({});

    const [selectedBot, setSelectedBot] = useState<string | null>(null);
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [serverName, setServerName] = useState<string | null>(null);

    const [allBots, setAllBots] = useState<any>([]);
    const [allServers, setAllServers] = useState<any>([]);
    const [allRoles, setAllRoles] = useState<any>([]);

    const [response, setResponse] = useState({
        loading: false,
        error: false,
        message: ""
    });

    const [notification, setNotification] = useState({
        success: {
            open: false,
            text: "X",
        },
        error: {
            open: false,
            text: "X",
        },
        info: {
            open: false,
            text: "X",
        },
    });
    
    
    const { data: user, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    useEffect(() => {
        switch (activeStep) {
        case 0:
            if (!user || !user.bots) return;

            for (let i = 0; i < user.bots.length; i++) {
                getBot(user.bots[i]);
            }
            break;
        case 1:
            if (!selectedBot) return;
            if (!selectedServer) getGuilds(user.bots.find((bot: any) => bot.clientId === selectedBot).botToken);

            break;
        case 2:
            if (!selectedServer || !selectedBot) return;
            if (!selectedRole) getRoles(user.bots.find((bot: any) => bot.clientId === selectedBot).botToken, selectedServer);
            break;
        }

        const timeout = setTimeout(() => {
            if (serverName || serverName === "") {
                setResponse({ ...response, error: false, loading: true });
                axios.get(`/api/v2/server?id=${serverName}`).then((res) => {
                    if (res.data.success === true) {
                        setResponse({ ...response, loading: false, error: true, message: "This server name is already taken" });
                    }
                }).catch((err) => {
                    console.error(`Error: ${err}`);
                });
            }
        }, 250);

        return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, user, serverName]);

    if (isLoading) {
        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!user || !user.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    function getRoles(botToken: any, guildId: any) {
        axios.get(`/api/v2/users/guilds/${guildId}/roles`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${botToken}`,
            },
        }).then((res) => {
            if (res.data) {
                const roles = res.data.filter((role: any) => role.position < res.data.find((role: any) => role?.tags?.bot_id === selectedBot)?.position && !role.tags).map((role: any) => { if (role.name === "@everyone") role.name = "No role"; return role; }).sort((a: any, b: any) => b.position - a.position);
                setAllRoles(roles);
            } else {
                handleBack();
            }
        }).catch((err) => {
            console.error(`Error: ${err}`);
        });
    }

    function getGuilds(botToken: any) {
        axios.get(`/api/v2/users/guilds`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${botToken}`,
            },
        }).then((res) => {
            if (res.data) {
                const guilds = res.data.filter((guild: any) => ((guild.permissions & (1 << 28) && guild.permissions & (1 << 0)) || guild.permissions & (1 << 3))).sort((a: any, b: any) => a.name.localeCompare(b.name));
                setAllServers(guilds);
            }
        }).catch((err) => {
            console.error(`Error: ${err}`);
        });
    }

    function getBot(bot: any) {
        for (let i = 0; i < allBots.length; i++) {
            if (allBots[i].botId === bot.botId) return;
        }
        
        fetch(`/api/v2/users/@me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${bot.botToken}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.id) {
                    if (data.avatar === null) bot.avatar = `https://cdn.discordapp.com/embed/avatars/${data.discriminator % 5}.png`;
                    else bot.avatar = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;

                    bot.username = `${data.username}#${data.discriminator}`;
                    bot.clientId = data.id;

                    setAllBots((prev: any) => [...prev, bot]);
                }
            })
            .catch((err) => {
                console.error(`Error: ${err}`);
            });
    }
    
    
    function handleNext() {
        if (activeStep === steps.length - 1 && activeStep !== 2) return;

        switch (activeStep) {
        case 0:
            if (!selectedBot) return;
            const popupWindow = window.open(`https://discord.com/oauth2/authorize?client_id=${selectedBot}&scope=bot&permissions=8`,"popUpWindow", `menubar=no,width=500,height=877,resizable=no,scrollbars=yes,status=no,top=${(window.innerHeight - 877) / 2},left=${(window.innerWidth- 500) / 2}`);
            popupWindow?.focus();

            const interval = setInterval(() => {
                if (popupWindow?.closed || isMobile) {
                    clearInterval(interval);

                    const newActiveStep = (activeStep === 3 - 1) && !(Object.keys(completedSteps).length) ? steps.findIndex((step, i) => !(i in completedSteps)) : activeStep + 1;
                    setActiveStep(newActiveStep);
                }
            }, 1000);
            break;
        case 2:
            if (!serverName || !selectedBot || !selectedServer || !selectedRole) return;

            fetch(`/api/v2/self/servers/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                },
                body: JSON.stringify({
                    serverName: serverName,
                    guildId: selectedServer,
                    roleId: selectedRole,
                    customBot: selectedBot,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (!data.success) {
                        console.error(`Error: ${data.message}`);
                        setResponse({ ...response, error: true, message: data.message });
                    } else {
                        setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));

                        setTimeout(() => { router.push("/dashboard/server"); }, 500);
                    }
                })

            break;
        default:
            const newActiveStep = (activeStep === 3 - 1) && !(Object.keys(completedSteps).length) ? steps.findIndex((step, i) => !(i in completedSteps)) : activeStep + 1;
            setActiveStep(newActiveStep);
            break;
        }
    }
    
    function handleBack() {
        if (activeStep === 0) return;

        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }

    function renderStep(step: number) {
        switch (step) {
        case 0: // Step 1 (Select your bot)
            return (
                <>
                    <Typography variant="h5" sx={{ fontWeight: "500" }}>Select your bot</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>Select the bot you would like to use on your server. This bot should <b>NOT</b> be created on your primary Discord account</Typography>

                    {allBots.length === 0 && <CircularProgress />}
                    {allBots.length > 0 && (
                        <Stack spacing={2} sx={{ width: "100%" }}>
                            {allBots.map((bot: any) => (
                                <ButtonBase key={bot.id} onClick={() => setSelectedBot(bot.clientId)} disableRipple>
                                    <Paper sx={{ width: "100%", display: "flex", alignItems: "center", p: 2,
                                        border: selectedBot === bot.clientId ?`2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                        borderRadius: 5,
                                        transition: "all 0.2s ease-in-out",
                                    }}>
                                        <Avatar src={bot.avatar} sx={{ mr: 2 }} />
                                        <Stack direction="column" sx={{ width: "100%" }}>
                                            <Typography variant="body1" sx={{ fontWeight: "500" }}>{bot.username}</Typography>
                                            {!isMobile && <Typography variant="body2" sx={{ color: "text.secondary" }}>{bot.clientId}</Typography>}
                                        </Stack>
                                    </Paper>
                                </ButtonBase>
                            ))}
                        </Stack>
                    )}
                </>
            )
            break;
        case 1: // Step 2 (Choose a server)
            return (
                <>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>Choose a server</Typography>
                    {selectedServer === null && <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>Choose the server were your members are going to verify in. This should be your primary Discord server</Typography>}

                    {allServers.length === 0 && <CircularProgress />}
                    {allServers.length > 0 && (
                        <Stack spacing={2} sx={{ width: "100%" }}>
                            {allServers.map((server: any) => (
                                <ButtonBase key={server.id} onClick={() => {
                                    setSelectedServer(server.id);
                                    setServerName(server.name);
                                }} disableRipple>
                                    <Paper sx={{ width: "100%", display: "flex", alignItems: "center", p: 2,
                                        border: selectedServer === server.id ?`2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                        borderRadius: 5,
                                        transition: "all 0.2s ease-in-out",
                                    }}>
                                        {server.icon && <Avatar src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`} sx={{ mr: 2 }} />}
                                        {/* discord like avatar if icon is null */}
                                        {!server.icon && <Avatar sx={{ mr: 2, bgcolor: "#313338", color: "#fff", fontSize: "18px" }}>{server.name.split(" ").map((word: string) => word.charAt(0)).join("")}</Avatar>}
                                        <Stack direction="column" sx={{ width: "100%" }}>
                                            <Typography variant="body1" sx={{ fontWeight: "500" }}>{server.name}</Typography>
                                            {!isMobile && <Typography variant="body2" sx={{ color: "text.secondary" }}>{server.id}</Typography>}
                                        </Stack>
                                    </Paper>
                                </ButtonBase>
                            ))}
                        </Stack>
                    )}
                    
                    {/* choose a server name with live preview https://current.domain/verify/servername */}
                    {/* {selectedServer && ( */}
                    <Stack spacing={2} sx={{ width: "100%" }}>
                        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>And choose a server name</Typography>
                        <TextField label="Server name" variant="outlined" value={serverName} onChange={(e) => setServerName(e.target.value)} />
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>This will be your verify link: <a href="javascript:void(0)">{window.location.origin}/verify/{encodeURIComponent(serverName ?? "")}</a></Typography>
                        {response?.error && <Typography variant="body2" sx={{ color: "error.main" }}>{response.message}</Typography>}
                    </Stack>
                    {/* )} */}

                    {selectedServer === null && <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>If you don&apos;t see your server, make sure the bot has <b>Administrator</b> permission. <small>if your server still does not show up <a href="#" onClick={(e) => { e.preventDefault(); setActiveStep(0); setTimeout(() => { setActiveStep(1); }, 10); }}>click here</a></small></Typography>}
                </>
            )
            break;
        case 2: // Step 3 (Almost there)
            return (
                <>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>Almost there!</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>Just one last step. You need to select a verified role for your members when they verify. Just make sure the Bot&apos;s own role is above than the one you pick.</Typography>

                    {allRoles.length === 0 && <CircularProgress />}
                    {allRoles.length > 0 && (
                        <Stack spacing={2} sx={{ width: "100%" }}>
                            {allRoles.map((role: any) => (
                                <ButtonBase key={role.id} onClick={() => setSelectedRole(role.id)} disableRipple>
                                    <Paper sx={{ width: "100%", display: "flex", alignItems: "center", p: 2,
                                        border: selectedRole === role.id ?`2px solid ${theme.palette.primary.main}` : "2px solid transparent",
                                        borderRadius: 5,
                                        transition: "all 0.2s ease-in-out",
                                    }}>
                                        <Avatar sx={{ mr: 2, bgcolor: role.color ? `#${role.color.toString(16)}` : "#313338", color: "#fff", fontSize: "18px" }}> </Avatar>
                                        <Stack direction="column" sx={{ width: "100%" }}>
                                            <Typography variant="body1" sx={{ fontWeight: "500" }}>{role.name}</Typography>
                                            {!isMobile && <Typography variant="body2" sx={{ color: "text.secondary" }}>{role.id}</Typography>}
                                        </Stack>
                                    </Paper>
                                </ButtonBase>
                            ))}
                        </Stack>
                    )}

                    <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>If you don&apos;t see the role, make sure the bot&apos;s role is above the role you want to give to your members. <small>if your role still does not show up <a href="#" onClick={(e) => {
                        e.preventDefault();
                        setActiveStep(1);
                        setTimeout(() => { setActiveStep(2); }, 10);
                    }}>click here</a></small></Typography>

                    {(response?.error && response?.message) && <Typography variant="body2" sx={{ mt: 2, mb: -3, color: "error.main" }}>{response.message}</Typography>}
                </>
            )
            break;
        default: // neither of the above
            return (
                <>
                    Error, reload page
                </>
            )
            break;
        }
    }



    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={user}>
                    <Toolbar />
                    
                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                    Server setup
                                </Typography>


                                <Snackbar open={notification.error.open} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setNotification({ ...notification, error: { open: false, text: "X" } }); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                                    <Alert elevation={6} variant="filled" severity="error">
                                        {notification.error.text}
                                    </Alert>
                                </Snackbar>

                                <Snackbar open={notification.success.open} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setNotification({ ...notification, success: { open: false, text: "X" } }); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                                    <Alert elevation={6} variant="filled" severity="success">
                                        {notification.success.text}
                                    </Alert>
                                </Snackbar>
                        
                                <Snackbar open={notification.info.open} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setNotification({ ...notification, info: { open: false, text: "X" } }); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                                    <Alert elevation={6} variant="filled" severity="info">
                                        {notification.info.text}
                                    </Alert>
                                </Snackbar>

                                <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                    <CardContent>
                                        {user.bots.length === 0 ? (
                                            <Alert variant="filled" severity="error">
                                                You don&apos;t have any bots to add to this server. You can add bots to your account{" "}
                                                <Link color={theme.palette.primary.light} href="/dashboard/custombots">here</Link>.
                                            </Alert>
                                        ) : (
                                            <>
                                                <Stepper activeStep={activeStep} orientation={isMobile ? "vertical" : "horizontal"} sx={{ mb: 2 }}>
                                                    {steps.map((label, index) => (
                                                        <Step key={label} completed={completedSteps[index]}>
                                                            <StepButton color="inherit" onClick={() => setActiveStep(index)}>
                                                                {label}
                                                            </StepButton>
                                                        </Step>
                                                    ))}
                                                </Stepper>

                                                <Box sx={{ mb: 2 }}>
                                                    {renderStep(activeStep)}
                                                </Box>

                                                <Button fullWidth variant="contained" 
                                                    disabled={(activeStep === 0 && selectedBot === null) || (activeStep === 1 && (selectedServer === null || (serverName === null || serverName === "") || response?.error)) || (activeStep === 2 && selectedRole === null)}
                                                    onClick={() => {
                                                        const newCompleted = completedSteps;
                                                        newCompleted[activeStep] = true;
                                                        setCompletedSteps(newCompleted);
                                                        handleNext();
                                                    }} sx={{ mt: 2 }}>next</Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Paper>

                            </CardContent>
                        </Paper>
                    </Container>

                </NavBar>
            </Box>
        </>
    )
}