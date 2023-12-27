import { useToken } from "../../src/token";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useState } from "react";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import theme from "../../src/theme";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Badge from "@mui/material/Badge";
import LoadingButton from "../../components/misc/LoadingButton";
import TextField from "@mui/material/TextField";
import { grey } from "@mui/material/colors";

export default function Backups() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [backupData, setBackupData]: any = useState({});
    const [backupId, setBackupId] = useState("0");
    const [serverId, setServerId] = useState("0");
    const [confirmDeleteTimer, setConfirmDeleteTimer] = useState(5);

    const [dialogs, setDialogs]: any = useState({
        view: false,
        delete: false,
        restore: false,
    });

    const [restoreOptions, setRestoreOptions]: any = useState({
        instant: false,
        clearGuild: false,
        settings: false,
        channels: false,
        roles: false,
        messages: false,
        invite: "",
        guildId: "",
        discordId: "",
    });

    const { data: userData, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    if (isLoading) return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    if (isError) return <div>Error</div>;

    if (!userData.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    async function getBackup(serverId: string) {
        await axios.get(`/api/v2/self/servers/${serverId}/backup`, {
            headers: {
                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        }).then((res) => {
            setBackupData(res.data.backup);
        }).catch((err) => {
            setNotiTextE(err.response.data.message);
            setOpenE(true);
        });
    }
    
    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={userData}>
                    <Toolbar />
                    
                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Badge badgeContent={<>BETA</>} color="primary" sx={{ [`& .MuiBadge-badge`]: { mt: "1.5rem", mr: "-2.5rem", color: "#fff", padding: "0.85rem", fontSize: "0.95rem", fontWeight: "bold" } }}>
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                        Backups
                                    </Typography>
                                </Badge>

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

                                {/* <Dialog open={dialogs.view} onClose={() => setDialogs({ ...dialogs, view: true })} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                                    <DialogTitle id="alert-dialog-title">{"Viewing backup"}
                                        <IconButton aria-label="close" onClick={() => setDialogs({ ...dialogs, view: true })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                                            <CloseIcon />
                                        </IconButton>
                                    </DialogTitle>
                                    <DialogActions>
                                        <Button onClick={() => setDialogs({ ...dialogs, view: false })} color="primary" autoFocus>
                                            Go back
                                        </Button>
                                    </DialogActions>
                                </Dialog> */}

                                <Dialog open={dialogs.delete} onClose={() => setDialogs({ ...dialogs, delete: true })} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                                    <DialogTitle id="alert-dialog-title">{"Are you sure?"}
                                        <IconButton aria-label="close" onClick={() => setDialogs({ ...dialogs, delete: true })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                                            <CloseIcon />
                                        </IconButton>
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                                                This action cannot be undone.
                                            </Typography><br/>

                                            Deleting this Backup will permanently remove it from the database.<br/>
                                            If you delete this Backup this will remove following data:
                                            <li>Server Settings</li>
                                            <li>Channels</li>
                                            <li>Roles</li>
                                            <li>Member Nicknames/Roles</li>

                                            {confirmDeleteTimer > 0 && 
                                                <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.warning.main }}>
                                                    ⚠ You can delete this Backup in {confirmDeleteTimer} second{confirmDeleteTimer > 1 && "s"}.
                                                </Typography>
                                            }
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button disabled={confirmDeleteTimer > 0}
                                            onClick={() => {
                                                setDialogs({ ...dialogs, delete: false })

                                                axios.delete(`/api/v2/self/servers/${serverId}/backup/delete/`, { 
                                                    headers: {
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
                                                            userData.backups.splice(userData.backups.findIndex((backup: any) => backup.backupId === backupId), 1);
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
                                        <Button onClick={() => setDialogs({ ...dialogs, delete: false })} color="primary" autoFocus>
                                            Cancel
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                <Dialog open={dialogs.restore} onClose={() => setDialogs({ ...dialogs, restore: false })} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                                    <DialogTitle id="alert-dialog-title">{"Are you sure?"}
                                        <IconButton aria-label="close" onClick={() => setDialogs({ ...dialogs, restore: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                                            <CloseIcon />
                                        </IconButton>
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                                                This action cannot be undone.
                                            </Typography><br/>

                                            <Typography variant="body1">
                                                Options:
                                            </Typography>
                                            {restoreOptions.invite === "" ? (
                                                <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, instant: e.target.checked })} color={"primary"} sx={{ color: theme.palette.primary.main }} />} label="Instantly restore backup" />
                                            ) : (
                                                <>
                                                    <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.warning.main, mb: 2 }}>
                                                        You need to join the server <a href={`https://discord.gg/${restoreOptions.invite}`} target="_blank" rel="noreferrer">{`https://discord.gg/${restoreOptions.invite}`}</a> and enter your Discord ID below, to transfer ownership.
                                                    </Typography>

                                                    <TextField label="Your Discord ID" variant="outlined" fullWidth value={restoreOptions.discordId} onChange={(e) => setRestoreOptions({ ...restoreOptions, discordId: e.target.value })} /><br/><br/>
                                                </>
                                            )}

                                            {!restoreOptions.instant && (
                                                <>
                                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, clearGuild: e.target.checked })} color={"error"} sx={{ color: theme.palette.error.main }} />} label="Delete all channels, roles, before restoring from backup" /><br/><br/>
                                    
                                                    <Typography variant="body1" sx={{ fontWeight: "500" }}>
                                                        What do you want to restore?
                                                    </Typography>
                                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, settings: e.target.checked })} />} label="Server Settings" /><br/>
                                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, channels: e.target.checked })} />} label="Channels" /><br/>
                                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, roles: e.target.checked })} />} label="Roles" /><br/>
                                                    <FormControlLabel control={<Checkbox onChange={(e) => setRestoreOptions({ ...restoreOptions, messages: e.target.checked })} />} label="Messages" /><br/>
                                                </>
                                            )}
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <LoadingButton event={() => {
                                            axios.post(`/api/v2/self/servers/${serverId}/backup/restore`, {
                                                ...restoreOptions
                                            }, {
                                                headers: {
                                                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                },
                                                validateStatus: () => true
                                            })
                                                .then((res: any) => {
                                                    console.log(res.data);
                                                    if (!res.data.success) {
                                                        setNotiTextE(res.data.message);
                                                        setOpenE(true);
                                                    }
                                                    else if (res.data.invite) {
                                                        setRestoreOptions({ ...restoreOptions, invite: res.data.invite, guildId: res.data.guildId });
                                                    } else {
                                                        setDialogs({ ...dialogs, restore: false })
                                                        setRestoreOptions({ instant: false, settings: false, channels: false, roles: false, clearGuild: false, invite: "", guildId: "" });

                                                        setNotiTextS(res.data.message);
                                                        setOpenS(true);
                                                    }
                                                })
                                                .catch((err: any) => {
                                                    setNotiTextE(err.message);
                                                    setOpenE(true);
                                                    console.error(err);
                                                });
                                        } } color="success">
                                            Restore
                                        </LoadingButton>
                                        <Button onClick={() => setDialogs({ ...dialogs, restore: false })} color="primary" autoFocus>
                                            Cancel
                                        </Button>
                                    </DialogActions>
                                </Dialog>

                                {(Array.isArray(userData.backups) && userData.backups.length >= 1) ? (
                                    <>
                                        <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                            {userData.backups.length} Backup{userData.backups.length > 1 ? "s" : ""}
                                        </Typography>
                                        {userData.backups.map((backup: any) => (
                                            <Paper key={backup.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }} id={`backup_${backup.backupId}`}>
                                                <CardHeader title={userData.servers.find((server: any) => server.guildId === backup.guildId).name} subheader={new Intl.DateTimeFormat(navigator.language, { dateStyle: "long", timeStyle: "medium" }).format(new Date(backup.createdAt))} />
                                                <CardContent>
                                                    <Typography variant="h6" sx={{ fontWeight: "400" }}>
                                                        Server: <span style={{ fontWeight: "500" }}>{backup.name}</span>
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: "400" }}>
                                                        Channel: <span style={{ fontWeight: "500" }}>{backup.channels}</span>
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: "400" }}>
                                                        Roles: <span style={{ fontWeight: "500" }}>{backup.roles}</span>
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: "400" }}>
                                                        Messages: <span style={{ fontWeight: "500" }}>{backup.messages}</span>
                                                    </Typography>
                                                </CardContent>
                                                <CardActions sx={{ justifyContent: "flex-start", ml: "0.5rem", mb: "0.75rem" }}>
                                                    {/* <Button variant="contained" color="primary" onClick={(e) => {
                                                        setBackupId(backup.backupId);
                                                        setServerId(backup.guildId)
                                                        getBackup(backup.guildId);
                                                        setDialogs({ ...dialogs, view: true })
                                                    }}>View Backup</Button> */}
                                                    <Button variant="contained" color="success" onClick={(e) => {
                                                        setBackupId(backup.backupId);
                                                        setServerId(backup.guildId)
                                                        setDialogs({ ...dialogs, restore: true })
                                                    }}>Restore</Button>
                                                    <Button variant="contained" color="error" onClick={(e) => { 
                                                        setBackupId(backup.backupId);
                                                        setServerId(backup.guildId)
                                                        setDialogs({ ...dialogs, delete: true })
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
                                                    }}>Delete</Button>
                                                </CardActions>
                                            </Paper>
                                        ))}
                                    </>
                                ) : (
                                    <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                        <CardContent>
                                            {(userData.role === "business" || userData.role === "enterprise") ? (
                                                <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                                    <CardContent>
                                                        <Typography variant="body1" color={grey[200]} sx={{ fontWeight: "400", textAlign: "center" }}>You don&apos;t have any backups yet :(</Typography>
                                                        <Typography variant="body2" color={grey[400]} sx={{ fontWeight: "300", textAlign: "center" }}>Click the Backup button on the Servers page to create a backup.</Typography>
                                                    </CardContent>
                                                </Paper>
                                            ) : (
                                                <>
                                                    <Typography variant="body1" sx={{ mb: 2, fontWeight: "400" }}>
                                                        Backups are only available for users with a Business subscription.
                                                    </Typography>
                                                    <Button variant="contained" color="primary" href="/dashboard/upgrade">Upgrade</Button>
                                                </>
                                            )}
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