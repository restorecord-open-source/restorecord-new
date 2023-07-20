/* eslint-disable @next/next/no-img-element */

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
    "Create a Discord Bot", 
    "Enter Bot Information",
    "Add Redirect URL",
    "Almost there"
];


export default function CustomBots() {
    const [ token ]: any = useToken()
    const router = useRouter();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<{[k: number]: boolean;}>({});

    const [botToken, setBotToken] = useState<string | null>(null);
    const [botSecret, setBotSecret] = useState<string | null>(null);
    const [botInfo, setBotInfo] = useState<any>(null); // [id, username, avatar, discriminator

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
        case 3: // Step 4 (Almost there)
            if (!botToken || !botSecret) return;
            // send request to /api/v2/users/@me with the bot token to get bot info
            
            fetch("/api/v2/users/@me", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bot ${botToken.trim()}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.message) {
                        setResponse({ loading: false, error: true, message: data.message });
                        return;
                    } else {
                        setResponse({ loading: false, error: false, message: "" });
                    }

                    setBotInfo(data);
                    handleNext();
                })
            break;
        default:
            if (!user) return;
            break;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStep, user]);

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
    
    function handleNext() {
        if (activeStep === steps.length - 1 && activeStep !== 3) return;

        switch (activeStep) {
        case 3:
            if (!botInfo || !botInfo.username || !botToken || !botSecret) return;

            fetch(`/api/v2/self/bots/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                },
                body: JSON.stringify({
                    botName: `${botInfo.username}#${botInfo.discriminator}`,
                    clientId: Buffer.from(botToken.split(".")[0], "base64").toString("ascii"),
                    botToken: botToken,
                    botSecret: botSecret,
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        console.error(`Error: ${data.message}`);
                        setResponse({ ...response, error: true, message: data.message });
                    } else {
                        setCompletedSteps((prev) => ({ ...prev, [activeStep]: true }));
    
                        setTimeout(() => { router.push("/dashboard/custombots"); }, 500);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setResponse({ ...response, error: true, message: err.message });
                });
    
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
        case 0: // Step 1 (Create a bot)
            return (
                <>
                    <Typography variant="h5" sx={{ fontWeight: "500" }}>Create a Discord Bot</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>Head over to the <Link href="https://discord.com/developers/applications" target="_blank">Discord Developer Portal</Link> and create a new application, then create a bot for that application.</Typography>
                    
                    <img src="https://mintlify.s3-us-west-1.amazonaws.com/restorecord/images/setup_create_bot.png" alt="Create a bot" style={{ width: isMobile ? "100%" : "45%", borderRadius: "1rem", display: "flex", margin: "auto" }} />
                </>
            )
            break;
        case 1: // Step 2 (Enter bot information)
            return (
                <>
                    <Typography variant="h5" sx={{ fontWeight: "500" }}>Enter Bot Information</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>Enter the Bot&apos;s Token and the Client Secret. You can find these in the Application&apos;s Bot page and the Application&apos;s OAuth2 page.</Typography>
                   
                    <Stack direction={isMobile ? "column" : "row"} spacing={2} sx={{ mb: 2 }}>
                        <img src="https://mintlify.s3-us-west-1.amazonaws.com/restorecord/images/setup_find_bot_token.png" alt="Find bot token" style={{ width: isMobile ? "100%" : "45%", borderRadius: "1rem", margin: "auto" }} />
                        <img src="https://mintlify.s3-us-west-1.amazonaws.com/restorecord/images/setup_find_client-secret.png" alt="Find client secret" style={{ width: isMobile ? "100%" : "45%", borderRadius: "1rem", margin: "auto" }} />
                    </Stack>

                    <TextField fullWidth label="Bot Token" variant="outlined" sx={{ mb: 2 }} value={botToken ?? ""} placeholder="OTU0MDU4NTYyNjAxMDk1MjU4.G3XIkA.AwDcJ49Xsq8Ah21aY5TnV4bm-O1erav2xusGEQ" onChange={(e) => setBotToken(e.target.value)} />
                    <TextField fullWidth label="Client Secret" variant="outlined" sx={{ mb: 0 }} value={botSecret ?? ""} placeholder="QuCUC3SyYLr11OXFiZvA45w949o5FISQ" onChange={(e) => setBotSecret(e.target.value)} />
                </>
            )
            break;
        case 2: // Step 3 (Add Redirect url)
            return (
                <>
                    <Typography variant="h5" sx={{ fontWeight: "500" }}>Add Redirect URL</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>Go to your Application&apos;s OAuth2 page and add the following redirect URL:<br/><code onClick={() => { try { navigator.clipboard.writeText("https://restorecord.com/api/callback"); setNotification({ ...notification, info: { open: true, text: "Copied to clipboard!" } }); } catch {} }} style={{ cursor: "pointer" }}>https://restorecord.com/api/callback</code></Typography>
                    
                    <img src="https://mintlify.s3-us-west-1.amazonaws.com/restorecord/images/setup_redirect-url.png" alt="Add redirect url" style={{ width: isMobile ? "100%" : "45%", borderRadius: "1rem", display: "flex", margin: "auto" }} />
                </>
            )
            break;
        case 3: // Step 3 (Almost there)
            return (
                <>
                    <Typography variant="h5" sx={{ fontWeight: "500" }}>Almost there!</Typography>
                    <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>Does this look correct?</Typography>

                    {response.error && (
                        <Alert severity="error" sx={{ mb: 2 }}>Whoops, there seems to be an error.<br/>{response.message}</Alert>
                    )}

                    {/* show a discord like card with the bot's info */}
                    {(botInfo && botInfo.username) && (
                        <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar src={botInfo.avatar ? `https://cdn.discordapp.com/avatars/${botInfo.id}/${botInfo.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${botInfo.discriminator % 5}.png?size=128`} />
                                    <Typography variant="h5" sx={{ fontWeight: "600" }}>{botInfo.username}</Typography>
                                    <Typography variant="body1" sx={{ color: "text.secondary" }}>#{botInfo.discriminator}</Typography>
                                </Stack>
                            </CardContent>
                        </Paper>
                    )}
                    
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
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                    Bot Creation
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
                                            disabled={activeStep === 1 && (!botToken || !botSecret) || activeStep === 3 && (!botInfo || !botInfo.username)}
                                            onClick={() => {
                                                const newCompleted = completedSteps;
                                                newCompleted[activeStep] = true;
                                                setCompletedSteps(newCompleted);
                                                handleNext();
                                            }} sx={{ mt: 2 }}>next</Button>

                                        {/* <Button fullWidth variant="outlined" disabled={activeStep === 0} onClick={handleBack} sx={{ mt: 2 }}>back</Button> */}
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