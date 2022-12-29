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

export default function DashBotSettings({ user, id }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [botSecret, setBotSecret] = useState("");
    const [botToken, setBotToken] = useState("");
    const [botName, setBotName] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [customDomain, setCustomDomain] = useState("");

    const [botId, setBotId] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    
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

        fetch(`/api/v1/settings/bot`, {
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
        console.log(e.target.value);
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



    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Change Bot Settings
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


                        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                            <DialogTitle id="alert-dialog-title">{"Are you sure you?"}
                                <IconButton aria-label="close" onClick={() => setConfirmDelete(false)} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                                        This action cannot be undone.
                                    </Typography>

                                    Deleting this Bot will remove all data associated with it, including all commands, events, and settings.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    setConfirmDelete(false);

                                    axios.delete(`/api/v1/settings/bot?id=${botId}`, { headers: {
                                        "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                    },
                                    validateStatus: () => true
                                    })
                                        .then((res: any) => {
                                            if (!res.data.success) {
                                                setNotiTextE(res.data.message);
                                                setOpenE(true);
                                            }
                                            else {
                                                setNotiTextS(res.data.message);
                                                setOpenS(true);
                                                setTimeout(() => {
                                                    router.push("/dashboard/bots");
                                                }, 1250);
                                            }
                                        })
                                        .catch((err: any) => {
                                            setNotiTextE(err.message);
                                            setOpenE(true);
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

                        {(user.bots.find((bot: any) => bot.clientId === id)) ? (
                            <>
                                <Stack spacing={2} direction="row" sx={{ mb: 2 }}>
                                    <Button variant="contained" onClick={() => { router.push(`/dashboard/custombots/`)} }>
                                        Go Back
                                    </Button>]
                                    <Button variant="contained" onClick={() => {
                                        axios.get(`/api/v1/bot/${bot.clientId}/refresh`, {
                                            headers: {
                                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                            }
                                        }).then(res => {
                                            if (!res.data.success) {
                                                setNotiTextE(res.data.message);
                                                setOpenE(true);
                                            }
                                            else {
                                                setNotiTextS(res.data.message);
                                                setOpenS(true);
                                            }
                                        }).catch(err => {
                                            console.error(err);
                                            setNotiTextE(err.message);
                                            setOpenE(true);
                                        });
                                    }}>
                                        Refresh Commands
                                    </Button>
                                    {/* red delete button */}
                                    <Button variant="contained" onClick={() => setConfirmDelete(true)} sx={{ color: theme.palette.error.main }}>
                                        Delete Bot
                                    </Button>
                                </Stack>
                                

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
                                        {user.role === "business" && (
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
                                                Custom Domain <small>(optional)</small>
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
                                    <Grid item>
                                        <Button variant="contained" sx={{ mb: 2 }} onClick={() => { router.push(`/dashboard/settings/`)} }>
                                            Go Back
                                        </Button>
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

