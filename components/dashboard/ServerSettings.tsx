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

    const [newServer, setNewServer] = useState({
        serverName: "",
        guildId: "",
        roleId: "",
        picture: "",
        ipLogging: false,
        discoverable: 0,
        webhook: "",
        background: "",
        description: "",
        webhookcheck: false,
        vpncheck: false,
        themeColor: "#4e46ef",
    });


    const server = user.servers.find((server: any) => server.guildId === id);
    
    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmDeleteTimer, setConfirmDeleteTimer] = useState(5);

    useEffect(() => {
        if (server) {
            setNewServer({
                ...newServer,
                serverName: server.name,
                guildId: server.guildId,
                roleId: server.roleId,
                webhookcheck: server.webhook ? true : false,
                webhook: server.webhook ? server.webhook : "",
                ipLogging: server.ipLogging,
                discoverable: server.discoverable,
                picture: server.picture ? server.picture : "",
                description: server.description ? server.description : "",
                background: server.bgImage ? server.bgImage : "",
                vpncheck: server.vpncheck,
                themeColor: server.themeColor ? `#${server.themeColor}` : "#4e46ef",
            });
        }
    }, [server]);

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v2/self/servers/${server.guildId}/edit`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                newServerName: newServer.serverName,
                newGuildId: newServer.guildId,
                newRoleId: newServer.roleId,
                newWebhook: newServer.webhook,
                newWebhookCheck: newServer.webhookcheck,
                newIpLogging: newServer.ipLogging,
                newDiscoverable: newServer.discoverable,
                newVpnCheck: newServer.vpncheck,
                newPicture: newServer.picture,
                newBackground: newServer.background,
                newDescription: newServer.description,
                newThemeColor: newServer.themeColor,
                
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
                        router.push("/dashboard/server");
                    }, 1250);
                    // functions.ToastAlert(res.message, "success");
                    // router.push("/dashboard/server");
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
            setNewServer({ ...newServer, serverName: e.target.value });
            break;
        case "guildId":
            setNewServer({ ...newServer, guildId: e.target.value });
            break;
        case "roleId":
            setNewServer({ ...newServer, roleId: e.target.value });
            break;
        case "webhookcheck":
            setNewServer({ ...newServer, webhookcheck: e.target.checked });
            break;
        case "webhook":
            setNewServer({ ...newServer, webhook: e.target.value });
            break;
        case "ipLogging":
            setNewServer({ ...newServer, ipLogging: e.target.checked });
            break;
        case "discoverable":
            setNewServer({ ...newServer, discoverable: e.target.checked ? 1 : 0 });
            break;
        case "vpncheck":
            setNewServer({ ...newServer, vpncheck: e.target.checked });
            break;
        case "picture":
            setNewServer({ ...newServer, picture: e.target.value });
            break;
        case "background":
            setNewServer({ ...newServer, background: e.target.value });
            break;
        case "description":
            setNewServer({ ...newServer, description: e.target.value });
            break;
        default:
            break;
        }
    }

    function onColorChange(color: string, colors: MuiColorInputColors) {
        // setThemeColor(colors.hex);
        setNewServer({ ...newServer, themeColor: colors.hex });
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

                                        axios.delete(`/api/v2/self/servers/${newServer.guildId}/delete`, { headers: {
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
                                                        router.push("/dashboard/server");
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
                                            <TextField fullWidth variant="outlined" name="serverName" value={newServer.serverName} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Server Name" />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Guild ID
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="guildId" value={newServer.guildId} onChange={handleChange} inputProps={{ minLength: 17, maxLength: 20 }} placeholder="Guild ID" />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Member Role ID
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="roleId" value={newServer.roleId} onChange={handleChange} inputProps={{ minLength: 17, maxLength: 20 }} placeholder="Member Role ID" />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Server Icon
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="picture" value={newServer.picture} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Server Icon URL" type="url" />
                                        </Grid>
                                        <Grid item>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                    IP Logging
                                                </Typography>
                                                <Switch onChange={handleChange} name="ipLogging" defaultChecked={server.ipLogging} />
                                            </Stack>
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
                                                    {newServer.webhookcheck && (
                                                        <TextField fullWidth variant="outlined" name="webhook" value={newServer.webhook} onChange={handleChange} placeholder="Webhook Url" type="url" />
                                                    )}
                                                </Grid>
                                                {(newServer.webhookcheck) && (
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
                                        {(user.role === "business" || user.role === "enterprise") && (
                                            <>
                                                {server.discoverable !== 2 && (
                                                    <Grid item>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                            Discoverable
                                                            </Typography>
                                                            <Switch onChange={handleChange} name="discoverable" defaultChecked={server.discoverable} />
                                                        </Stack>
                                                    </Grid>
                                                )}
                                                <Grid item>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                        Server Description
                                                    </Typography>
                                                    <TextField fullWidth variant="outlined" name="description" value={newServer.description} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Description" rows={3} multiline />
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                        Server Background Image
                                                    </Typography>
                                                    <TextField fullWidth variant="outlined" name="background" value={newServer.background} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Background Image URL" type="url" />
                                                </Grid>
                                                <Grid item>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                        Theme Color
                                                    </Typography>
                                                    <MuiColorInput format="hex" fallbackValue="#4e46ef" isAlphaHidden value={newServer.themeColor} onChange={onColorChange} sx={{ width: "100%" }} />
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
                                </Grid>
                            </>
                        )}
                    </CardContent>
                </Paper>
            </Container>
        </>
    )
}

