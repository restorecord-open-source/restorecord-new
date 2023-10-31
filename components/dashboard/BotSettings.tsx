import { useRouter } from "next/router";
import { useToken } from "../../src/token";
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../src/theme";
import AlertTitle from "@mui/material/AlertTitle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LoadingButton from "../misc/LoadingButton";
import CodeCopy from "../misc/codeCopy";

export default function DashBotSettings({ user, id }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [botSecret, setBotSecret] = useState("");
    const [botToken, setBotToken] = useState("");
    const [botName, setBotName] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [customDomain, setCustomDomain] = useState("");

    const [botId, setBotId] = useState("");
    const [errorText, setErrorText] = useState("");
    const [serverList, setServerList] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [customDomainSettings, setCustomDomainSettings]: any = useState({
        open: false,
        domain: "",
        error: "",
        warning: "",
        success: "",
        status: "",
        verification: {
            type: "",
            name: "",
            value: "",
        },
        validation: {
            name: "",
            value: "",
        },
    });
    
    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const bot = user.bots.find((bot: any) => bot.clientId === id);

    useEffect(() => {
        if (bot) {
            setBotSecret(bot.botSecret);
            setBotToken(bot.botToken);
            setBotName(bot.name);
            setPublicKey(bot.publicKey ? bot.publicKey : "");
            setCustomDomain(bot.customDomain ? bot.customDomain : "");
        }
    }, [bot]);

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v2/self/bots/${bot.clientId}/refresh`, {
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
            

        fetch(`/api/v2/self/bots/${bot.clientId}/edit`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                newBotSecret: botSecret,
                newBotToken: botToken,
                newBotName: botName,
                newPublicKey: publicKey,
                newCustomDomain: customDomain,

                botSecret: bot.botSecret,
                botToken: bot.botToken,
                botName: bot.name,
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
                        router.push("/dashboard/custombots");
                    }, 1500);
                }
            })
            .catch(err => {
                console.error(err);
                setNotiTextE(err.message);
                setOpenE(true);
            });

    }

    function handleChange(e: any) {
        switch (e.target.name) {
        case "botSecret":
            setBotSecret(e.target.value);
            break;
        case "botToken":
            setBotToken(e.target.value);
            break;
        case "botName":
            setBotName(e.target.value);
            break;
        case "publicKey":
            setPublicKey(e.target.value);
            break;
        case "customDomain":
            setCustomDomain(e.target.value);
            break;
        default:
            break;
        }
    }

    function deleteDialog() {
        return (
            <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">{"Are you sure?"}
                    <IconButton aria-label="close" onClick={() => setConfirmDelete(false)} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                            This action cannot be undone.
                        </Typography>
                            Deleting this Bot will:
                        <ul>
                            <li>Remove all data associated with this bot.</li>
                            <li><b>Delete ALL members & servers associated with this bot.</b></li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setConfirmDelete(false);

                        axios.delete(`/api/v2/self/bots/${botId}/delete`, { headers: {
                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                        },
                        validateStatus: () => true
                        })
                            .then((res: any) => {
                                if (!res.data.success) {
                                    setErrorText(res.data.message);
                                    setServerList(res.data.servers);
                                }
                                else {
                                    setNotiTextS(res.data.message);
                                    setOpenS(true);
                                    setTimeout(() => {
                                        router.push("/dashboard/custombots");
                                    }, 1250);
                                }
                            })
                            .catch((err: any) => {
                                setErrorText(err.message);
                                console.error(err);
                            });
                    } } color="error">
                        Delete
                    </Button>
                    <Button onClick={() => setConfirmDelete(false)} color="primary" autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }

    function renderCustomDomainSettings() {
        return (
            <Dialog open={customDomainSettings.open} onClose={() => setCustomDomainSettings({ ...customDomainSettings, open: false })} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    Custom Domain Settings
                    <IconButton aria-label="close" onClick={() => setCustomDomainSettings({ ...customDomainSettings, open: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {customDomainSettings.error && (
                        <Alert severity="error" sx={{ mb: "1rem" }}>
                            <AlertTitle>Error</AlertTitle>
                            <Typography variant="body1">
                                {customDomainSettings.error}
                            </Typography>
                        </Alert>
                    )}
                    
                    {customDomainSettings.warning && (
                        <Alert severity="warning" sx={{ mb: "1rem" }}>
                            <AlertTitle>Warning</AlertTitle>
                            <Typography variant="body1">
                                {customDomainSettings.warning}
                            </Typography>
                        </Alert>
                    )}
                    
                    {customDomainSettings.success && (
                        <Alert severity="success" sx={{ mb: "1rem" }}>
                            <AlertTitle>Success</AlertTitle>
                            <Typography variant="body1">
                                {customDomainSettings.success}
                            </Typography>
                        </Alert>
                    )}



                    {user.bots.find((bot: any) => bot.clientId === id).customDomain ? (
                        <>
                            <DialogContentText id="alert-dialog-description">
                                <Typography variant="body1">
                                    Your custom domain is currently set to <b>{user.bots.find((bot: any) => bot.clientId === id).customDomain}</b>.
                                </Typography>
                            </DialogContentText>
                            <DialogContentText id="alert-dialog-description">
                                <Typography variant="body1">
                                    To change your custom domain, you must first remove your current custom domain.
                                </Typography>
                            </DialogContentText>
                        </>
                    ) : (
                        <>
                            <DialogContentText id="alert-dialog-description">
                                <Typography variant="body1">
                                    You can set a custom domain to your bot. This will allow you to use your own domain for your bot, instead of using restorecord.com.
                                </Typography>
                                <TextField fullWidth variant="outlined" name="domain" value={customDomainSettings.domain} onChange={(e) => setCustomDomainSettings({ ...customDomainSettings, domain: e.target.value })} placeholder="example.com" sx={{ mt: 1 }} disabled={(customDomainSettings.verification.name || customDomainSettings.validation.name) ? true : false} />

                                {(customDomainSettings.verification.name || customDomainSettings.validation.name || customDomainSettings.status === "pending") && (
                                    <>
                                        <Typography variant="body1" sx={{ mt: 2 }}><b>Verification</b></Typography>
                                        <Typography variant="body1" sx={{ mt: 1 }}>To verify your domain, and add SSL to your domain, add the following DNS records to your domain.</Typography>
                                        {customDomainSettings.verification.name && (<>
                                            <Typography variant="body1" sx={{ mt: 2 }}><b>Type:</b> <CodeCopy>{customDomainSettings.verification.type}</CodeCopy></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}><b>Name:</b> <CodeCopy>{customDomainSettings.verification.name}</CodeCopy></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}><b>Value:</b> <CodeCopy>{customDomainSettings.verification.value}</CodeCopy></Typography>
                                        </>)}

                                        {customDomainSettings.validation.name && (<>
                                            <Typography variant="body1" sx={{ mt: 2 }}><b>Type:</b> <CodeCopy>TXT</CodeCopy></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}><b>Name:</b> <CodeCopy>{customDomainSettings.validation.name}</CodeCopy></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}><b>Value:</b> <CodeCopy>{customDomainSettings.validation.value}</CodeCopy></Typography>
                                        </>)}

                                        <Typography variant="body1" sx={{ mt: 2 }}><b>Type:</b> <CodeCopy>CNAME</CodeCopy></Typography>
                                        <Typography variant="body1" sx={{ mt: 1 }}><b>Name:</b> <CodeCopy>{customDomainSettings.domain}</CodeCopy></Typography>
                                        <Typography variant="body1" sx={{ mt: 1 }}><b>Value:</b> <CodeCopy>fallback.restorecord.com</CodeCopy></Typography>
                                    </>
                                )}
                            </DialogContentText>
                            <DialogActions>
                                <LoadingButton fullWidth variant="contained" color="primary" event={async () => {
                                    if (!customDomainSettings.domain) {
                                        setCustomDomainSettings({ ...customDomainSettings, error: "Please enter a domain." });
                                        return;
                                    }

                                    setCustomDomainSettings({ ...customDomainSettings, error: "", warning: "", success: "" });

                                    const res = await axios.post(`/api/v2/self/bots/${bot.clientId}/edit`, {
                                        domain: customDomainSettings.domain,
                                    }, {
                                        headers: {
                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                        validateStatus: () => true,
                                    });

                                    // setCustomDomainSettings({ ...customDomainSettings, verification: res.data.verification, validation: res.data.validation, ...(res.data.warning ? { warning: res.data.warning } : {}), ...(res.data.success ? { success: res.data.success } : {}) });
                                    setCustomDomainSettings({ ...customDomainSettings, ...(res.data.verification ? { verification: res.data.verification } : {}), ...(res.data.validation ? { validation: res.data.validation } : {}), ...((res.data.success && res.data.warning !== true) ? { success: res.data.message } : {}), ...(res.data.warning ? { warning: res.data.message } : {}), ...(!res.data.success && !res.data.warning ? { error: res.data.message } : {}) });
                                }}>
                                    {customDomainSettings.verification.type === "" ? "Set Domain" : "Verify Domain"}
                                </LoadingButton>
                            </DialogActions>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                            Edit Bot
                        </Typography>

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

                        {deleteDialog()}
                        {/* {renderCustomDomainSettings()} */}

                        {(user.bots.find((bot: any) => bot.clientId === id)) ? (
                            <>
                                <Stack direction="row" spacing={2} sx={{ mb: 2, "@media screen and (max-width: 600px)": { flexDirection: "column", alignItems: "center", "& > *": { mb: 1 } } }}>
                                    {/* <Button variant="contained" onClick={() => setCustomDomainSettings({ ...customDomainSettings, open: true })}>
                                        Custom Domain
                                    </Button> */}
                                    <Button variant="contained" onClick={() => {
                                        axios.get(`/api/v2/self/bots/${bot.clientId}/refresh`, {
                                            headers: {
                                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                            }
                                        }).then(res => {
                                            if (!res.data.success) {
                                                setErrorText(res.data.message);
                                            }
                                            else {
                                                setNotiTextS(res.data.message);
                                                setOpenS(true);
                                            }
                                        }).catch(err => {
                                            console.error(err);
                                            setErrorText(err.message);
                                        });
                                    }}>
                                        Refresh Commands
                                    </Button>
                                    {/* red delete button */}
                                    <Button variant="contained" color="error" onClick={() => { 
                                        setBotId(bot.clientId);
                                        setConfirmDelete(true);
                                    }}>
                                        Delete Bot
                                    </Button>
                                </Stack>

                                <Alert severity="error" sx={{ mb: "1rem", width: "100%", display: errorText ? "flex" : "none" }}>
                                    <AlertTitle>Error</AlertTitle>
                                    <Typography variant="body1">
                                        {errorText}
                                        {/* if errortext contains servers then get all servers from user with the server.id equal to serverList */}
                                        {errorText.includes("servers") && (
                                            <ul>
                                                {serverList.map((server: any, id: any) => (
                                                    <li key={id}>{user.servers.find((s: any) => s.id === Number(server) as number).name ?? "Unknown Server"}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </Typography>
                                </Alert>
                                

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={3} direction="column">
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Bot Name
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="botName" value={botName} onChange={handleChange} />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Client Secret
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="botSecret" value={botSecret} onChange={handleChange} />
                                        </Grid>
                                        {(user.role === "business" || user.role === "enterprise") && (
                                            <Grid item>
                                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                    Public Key
                                                </Typography>
                                                <TextField fullWidth variant="outlined" name="publicKey" value={publicKey} onChange={handleChange} />
                                            </Grid>
                                        )}
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Bot Token
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2, fontWeight: "500", color: "red" }}>
                                                Warning: Changing the Bot token to another Bot will make the Bot <u>unusable</u>, until changed back to the original token.
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="botToken" value={botToken} onChange={handleChange} />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Custom Domain <small><small>(optional)</small> <a href="https://docs.restorecord.com/guides/custom-domain/" target="_blank" rel="noreferrer">[Learn More]</a></small>
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="customDomain" value={customDomain} onChange={handleChange} placeholder="example.com" />
                                        </Grid>
                                        <Grid item>
                                            <Button variant="contained" type="submit" sx={{ mb: 2 }}>
                                                Save
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </>
                        ) : (
                            <>
                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                    <Grid item>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                            You do not have access to this bot
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </>
                        )}


                    </CardContent>
                </Paper>
            </Container>
        </>
    )
}

