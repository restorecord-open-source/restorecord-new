import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useToken } from "../../src/token";
import { MuiColorInput, MuiColorInputColors } from "mui-color-input"

import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../src/theme";
import axios from "axios";

export default function DashServerSettings({ user, id }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [serverName, setServerName] = useState("");
    const [guildId, setGuildId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [picture, setPicture] = useState("");
    const [webhook, setWebhook] = useState("");
    const [background, setBackground] = useState("");
    const [description, setDescription] = useState("");
    const [webhookcheck, setWebhookCheck] = useState(false);
    const [vpncheck, setVpnCheck] = useState(false);
    const [themeColor, setThemeColor] = useState("#4e46ef");

    const server = user.servers.find((server: any) => server.guildId === id);
    
    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmDeleteTimer, setConfirmDeleteTimer] = useState(5);

    useEffect(() => {
        if (server) {
            setServerName(server.name);
            setGuildId(server.guildId);
            setRoleId(server.roleId);

            setWebhookCheck(server.webhook ? true : false);
            setWebhook(server.webhook ? server.webhook : "");
            setPicture(server.picture ? server.picture : "");
            setDescription(server.description ? server.description : "");
            setBackground(server.bgImage ? server.bgImage : "");
            setVpnCheck(server.vpncheck);
            setThemeColor(server.themeColor ? `#${server.themeColor}` : "#4e46ef");
        }
    }, [server]);

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v1/settings/server`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                newServerName: serverName,
                newGuildId: guildId,
                newRoleId: roleId,
                newWebhook: webhook,
                newWebhookCheck: webhookcheck,
                newVpnCheck: vpncheck,
                newPicture: picture,
                newBackground: background,
                newDescription: description,
                newThemeColor: themeColor,
                
                serverName: server.name,
                guildId: server.guildId,
                roleId: server.roleId,
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    setNotiTextE(res.message);
                    setOpenE(true);
                    // functions.ToastAlert(res.message, "error");
                }
                else {
                    setNotiTextS(res.message);
                    setOpenS(true);
                    setTimeout(() => {
                        router.push("/dashboard/settings");
                    }, 1250);
                    // functions.ToastAlert(res.message, "success");
                    // router.push("/dashboard/settings");
                }
            })
            .catch(err => {
                setNotiTextE(err.message);
                setOpenE(true);
                // functions.ToastAlert(err, "error");
            });

    }

    function handleChange(e: any) {
        switch (e.target.name) {
        case "serverName":
            setServerName(e.target.value);
            break;
        case "guildId":
            setGuildId(e.target.value);
            break;
        case "roleId":
            setRoleId(e.target.value);
            break;
        case "webhookcheck":
            setWebhookCheck(e.target.checked);
            break;
        case "webhook":
            setWebhook(e.target.value);
            break;
        case "vpncheck":
            setVpnCheck(e.target.checked);
            break;
        case "picture":
            setPicture(e.target.value);
            break;
        case "background":
            setBackground(e.target.value);
            break;
        case "description":
            setDescription(e.target.value);
            break;
        default:
            break;
        }
    }

    function onColorChange(color: string, colors: MuiColorInputColors) {
        setThemeColor(colors.hex);
    }



    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Edit Server
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

                                    Deleting this server will remove:
                                    <ul>
                                        <li>All Backups</li>
                                        <li>All Verified Members</li>
                                        <li>All Customized Settings</li>
                                    </ul>

                                    {confirmDeleteTimer > 0 && 
                                        <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.warning.main }}>
                                            ⚠ You can delete this Server in {confirmDeleteTimer} second{confirmDeleteTimer > 1 && "s"}.
                                        </Typography>
                                    }
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button disabled={confirmDeleteTimer > 0}
                                    onClick={() => {
                                        setConfirmDelete(false);

                                        axios.delete(`/api/v1/server/${guildId}`, { headers: {
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
                                                        router.push("/dashboard/settings");
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
                        
                        {(user.servers.find((server: any) => server.guildId === id)) ? (
                            <>
                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                    <Grid item>
                                        <Button variant="contained" sx={{ mb: 2, mr: 2 }} onClick={() => { router.push(`/dashboard/settings/`)} }>
                                            &lt;- Go Back
                                        </Button>
                                        <Button variant="contained" color="error" sx={{ mb: 2 }} onClick={() => { 
                                            setConfirmDelete(true) 
                                            new Promise((resolve, reject) => {
                                                let timer = 3;
                                                setConfirmDeleteTimer(timer--);
                                                const interval = setInterval(() => {
                                                    setConfirmDeleteTimer(timer);
                                                    timer--;
                                                    if (timer === -1) {
                                                        clearInterval(interval);
                                                        resolve(true);
                                                    }
                                                }, 1000);
                                            });
                                        }}>
                                            Delete Server
                                        </Button>
                                    </Grid>
                                </Grid>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={3} direction="column">
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Server Name
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="serverName" value={serverName} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Server Name" />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Guild ID
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="guildId" value={guildId} onChange={handleChange} inputProps={{ minLength: 17, maxLength: 20 }} placeholder="Guild ID" />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Member Role ID
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="roleId" value={roleId} onChange={handleChange} inputProps={{ minLength: 17, maxLength: 20 }} placeholder="Member Role ID" />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Server Icon
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="picture" value={picture} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Server Icon URL" type="url" />
                                        </Grid>
                                        {(user.role !== "free") && (
                                            <>
                                                <Grid item>
                                                    <Stack direction="row" spacing={1}>
                                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                            Webhook Logs
                                                        </Typography>
                                                        <Switch onChange={handleChange} name="webhookcheck" defaultChecked={server.webhook ? true : false} />
                                                    </Stack>
                                                    {webhookcheck && (
                                                        <TextField fullWidth variant="outlined" name="webhook" value={webhook} onChange={handleChange} placeholder="Webhook Url" type="url" />
                                                    )}
                                                </Grid>
                                                {(webhookcheck) && (
                                                    <Grid item>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                                VPN Check
                                                            </Typography>
                                                            <Switch onChange={handleChange} name="vpncheck" defaultChecked={server.vpncheck} />
                                                        </Stack>
                                                    </Grid>
                                                )}
                                            </>
                                        )}
                                        {user.role === "business" && (
                                            <>
                                                <Grid item>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                        Server Description
                                                    </Typography>
                                                    <TextField fullWidth variant="outlined" name="description" value={description} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Description" rows={3} multiline />
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                        Server Background Image
                                                    </Typography>
                                                    <TextField fullWidth variant="outlined" name="background" value={background} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Background Image URL" type="url" />
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                        Theme Color
                                                    </Typography>
                                                    <MuiColorInput format="hex" fallbackValue="#4e46ef" isAlphaHidden value={themeColor} onChange={onColorChange} sx={{ width: "100%" }} />
                                                </Grid>
                                            </>
                                        )}
                                        <Grid item>
                                            <Button variant="contained" type="submit" sx={{ mb: 2 }} fullWidth>
                                                Save Changes
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
                                            You do not have access to this server
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" sx={{ mb: 2 }} onClick={() => { router.push(`/dashboard/settings/`)} }>
                                            &lt;- Go Back
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

