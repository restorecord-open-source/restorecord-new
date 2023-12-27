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
import theme from "../../src/theme";
import axios from "axios";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import { ImageFallback } from "../../src/functions";
import Skeleton from "@mui/material/Skeleton";
import Link from "next/link";

function CustomTabPanel(props: any) {
    const { children, value, index, ...other } = props;
  
    return (
        <div role="tabpanel" hidden={value !== index} id={`custom-tabpanel-${index}`} aria-labelledby={`custom-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

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
        captcha: false,
        blockAlts: false,
        webhook: "",
        background: "",
        description: "",
        theme: "DEFAULT",
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

    const [settingsTab, setSettingsTab] = useState(0);
    const [allServers, setAllServers] = useState([]);
    const [allRoles, setAllRoles] = useState([]);
    const [botClient, setBotClient]: any = useState({ loading: true, valid: false });

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
                blockAlts: server.blockAlts,
                discoverable: server.discoverable,
                captcha: server.captcha,
                picture: server.picture ? server.picture : "",
                description: server.description ? server.description : "",
                background: server.bgImage ? server.bgImage : "",
                theme: server.theme ? server.theme : "DEFAULT",
                vpncheck: server.vpncheck,
                themeColor: server.themeColor ? `#${server.themeColor}` : "#4e46ef",
            });
            
            getBotClient(user.bots.find((bot: any) => bot.id === server.customBotId).botToken);
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
                newBlockAlts: newServer.blockAlts,
                newDiscoverable: newServer.discoverable,
                newCaptcha: newServer.captcha,
                newVpnCheck: newServer.vpncheck,
                newPicture: newServer.picture,
                newBackground: newServer.background,
                newDescription: newServer.description,
                newTheme: newServer.theme,
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
                }
                else {
                    setNotiTextS(res.message);
                    setOpenS(true);
                    setTimeout(() => {
                        router.push("/dashboard/server");
                    }, 1250);
                }
            })
            .catch(err => {
                setNotiTextE(err.message);
                setOpenE(true);
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
        case "blockAlts":
            setNewServer({ ...newServer, blockAlts: e.target.checked });
            break;
        case "discoverable":
            setNewServer({ ...newServer, discoverable: e.target.checked ? 1 : 0 });
            break;
        case "captcha":
            setNewServer({ ...newServer, captcha: e.target.checked });
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
        case "theme":
            setNewServer({ ...newServer, theme: e.target.value });
            break;
        default:
            break;
        }
    }

    function onColorChange(color: string, colors: MuiColorInputColors) {
        // setThemeColor(colors.hex);
        setNewServer({ ...newServer, themeColor: colors.hex });
    }

    function getAllGuilds(botToken: string) {
        setAllServers([]);
        axios.get("/api/v2/users/guilds", {
            headers: {
                "Authorization": `Bot ${botToken}`,
            },
        }).then(res => {
            if (res.data.code || res.data.message) { setAllServers([]); setNotiTextE(res.data.message); setOpenE(true); }
            else setAllServers(res.data);
        }).catch(err => {
            setAllServers([]);
            console.error(err);
        });
    }

    function getGuildRoles(guildId: string, botToken: string) {
        setAllRoles([]);
        axios.get(`/api/v2/users/guilds/${guildId}/roles`, {
            headers: {
                "Authorization": `Bot ${botToken}`,
            },
        }).then(res => {
            if (res.data.code || res.data.message) { setAllRoles([]); }
            else setAllRoles(res.data);
        }).catch(err => {
            setAllRoles([]);
            console.error(err);
        });
    }

    function getBotClient(botToken: string) {
        setBotClient({ loading: true, valid: false });

        axios.get(`/api/v2/users/@me`, {
            headers: {
                "Authorization": `Bot ${botToken}`,
            },
        }).then(res => {
            if (res.data.code || res.data.message) { setBotClient({}); setBotClient({ loading: false, valid: false }); }
            else setBotClient({ ...res.data, loading: false, valid: true });
        }).catch(err => {
            setBotClient({ loading: false, valid: false });
            console.error(err);
        });
    }


    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} justifyContent="space-between">
                            <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                Edit Server
                            </Typography>

                            <Button variant="contained" color="error" sx={{ mb: 2 }} onClick={() => { 
                                setConfirmDelete(true) 
                                new Promise((resolve, reject) => {
                                    let timer = 15;
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
                                Delete
                            </Button>
                        </Stack>

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
                                        <li><b style={{ fontSize: "1.25rem" }}>All Backups</b></li>
                                        <li><b style={{ fontSize: "1.25rem" }}>All Verified Members</b></li>
                                        <li><b style={{ fontSize: "1.25rem" }}>All Customized Settings</b></li>
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
                                {(!botClient.loading && !botClient.valid) && (
                                    <Alert severity="warning" sx={{ my: "1rem" }}>
                                        <Typography variant="body1" sx={{ fontWeight: "400" }}>Your bot has an Invalid Token, usually this means that the Bot was deleted/disabled by Discord, or the token was changed. <Link href="https://docs.restorecord.com/troubleshooting/invalid-token" target="_blank" rel="noreferrer">Learn More</Link></Typography>
                                    </Alert>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <Tabs value={settingsTab} onChange={(e, newValue) => setSettingsTab(newValue)}  aria-label="settings tab" sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile> 
                                        <Tab label="General" id="settings-tabs-0" aria-controls="settings-tabs-0" />
                                        <Tab label="Visual" id="settings-tabs-1" aria-controls="settings-tabs-1" />
                                        <Tab label="Security" id="settings-tabs-2" aria-controls="settings-tabs-2" />
                                        <Tab label="Bot Info" id="settings-tabs-3" aria-controls="settings-tabs-3" />
                                        {/* <Tab label="Discovery" id="sub-tabs-3" aria-controls="basic-tabs-3" /> */}
                                    </Tabs>

                                    <CustomTabPanel value={settingsTab} index={0}>
                                        <Stack direction="column" spacing={2}>
                                            <Stack direction="column">
                                                <Typography variant="h6">Server Name</Typography>
                                                <TextField fullWidth variant="outlined" name="serverName" value={newServer.serverName} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Server Name" />
                                            </Stack>
                                            {/* full width */}
                                            <Stack direction="row" spacing={2} justifyContent="space-between">
                                                <Stack direction="column" sx={{ width: "100%" }}>
                                                    <Typography variant="h6">Guild ID</Typography>
                                                    <TextField fullWidth variant="outlined" name="guildId" value={newServer.guildId} onChange={handleChange} inputProps={{ minLength: 17, maxLength: 20 }} placeholder="Guild ID" />
                                                </Stack>
                                                <Stack direction="column" sx={{ width: "100%" }}>
                                                    <Typography variant="h6">Member Role ID</Typography>
                                                    <TextField fullWidth variant="outlined" name="roleId" value={newServer.roleId} onChange={handleChange} inputProps={{ minLength: 17, maxLength: 20 }} placeholder="Member Role ID" />
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                    </CustomTabPanel>

                                    <CustomTabPanel value={settingsTab} index={1}>
                                        <Stack direction="column" spacing={2}>
                                            <Stack direction="row">
                                                <Typography variant="h6">Show on Discovery</Typography>
                                                {user.role !== "business" && user.role !== "enterprise" ? (
                                                    <Tooltip arrow placement="top" title="This feature requires the Business subscription or higher.">
                                                        <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip arrow placement="top" title="If enabled, your server will be shown on the RestoreCord Discovery page, located at https://restorecord.com/discovery.">
                                                        <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                )}
                                                <Switch onChange={handleChange} name="discoverable" defaultChecked={server.discoverable} disabled={user.role !== "business" && user.role !== "enterprise"} />
                                            </Stack>
                                            <Stack direction="column">
                                                <Stack direction="row">
                                                    <Typography variant="h6">Server Icon</Typography>
                                                    {user.role === "free" && (
                                                        <Tooltip arrow placement="top" title="This feature requires the Premium subscription or higher.">
                                                            <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                                <TextField fullWidth variant="outlined" name="picture" value={newServer.picture} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Server Icon URL" type="url" disabled={user.role === "free"} />
                                            </Stack>
                                            <Stack direction="column">
                                                <Typography variant="h6">Server Description</Typography>
                                                <TextField fullWidth variant="outlined" name="description" value={newServer.description} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Description" rows={3} multiline />
                                            </Stack>
                                            <Stack direction="column">
                                                <Stack direction="row">
                                                    <Typography variant="h6">Server Background Image</Typography>
                                                    {user.role === "free" && (
                                                        <Tooltip arrow placement="top" title="This feature requires the Premium subscription or higher.">
                                                            <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                                <TextField fullWidth variant="outlined" name="background" value={newServer.background} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Background Image URL" type="url" disabled={user.role === "free"} />
                                            </Stack>
                                            <Stack direction="column">
                                                <Stack direction="row">
                                                    <Typography variant="h6">Theme Color</Typography>
                                                    {user.role === "free" ? (
                                                        <Tooltip arrow placement="top" title="This feature requires the Premium subscription or higher.">
                                                            <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip arrow placement="top" title="This is the color that will be used for the Buttons and other elements on the Verification Page.">
                                                            <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                                <MuiColorInput format="hex" fallbackValue="#4e46ef" isAlphaHidden value={newServer.themeColor} onChange={onColorChange} sx={{ width: "100%" }} disabled={user.role === "free"} />
                                            </Stack>
                                        </Stack>
                                    </CustomTabPanel>

                                    <CustomTabPanel value={settingsTab} index={2}>
                                        <Stack direction="column" spacing={2}>
                                            <Stack direction="row">
                                                <Typography variant="h6">IP Logging</Typography>
                                                <Tooltip arrow placement="top" title="If disabled, you will not be able to see the IP Address of the user who verified during the time of verification.">
                                                    <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                </Tooltip>
                                                <Switch onChange={handleChange} name="ipLogging" defaultChecked={server.ipLogging} />
                                            </Stack>
                                            <Stack direction="row">
                                                <Typography variant="h6">Captcha</Typography>
                                                <Tooltip arrow placement="top" title="Captcha may significantly increase the time it takes for a user to verify, and may cause users to leave your server.">
                                                    <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                </Tooltip>
                                                <Switch onChange={handleChange} name="captcha" defaultChecked={server.captcha} />
                                            </Stack>
                                            <Stack direction="row">
                                                <Typography variant="h6">Webhook Logs</Typography>
                                                {user.role === "free" ? (
                                                    <Tooltip arrow placement="top" title="This feature requires the Premium subscription or higher.">
                                                        <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip arrow placement="top" title="If enabled, RestoreCord will send a message to the specified Webhook URL when a user verifies.">
                                                        <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                )}
                                                <Switch onChange={handleChange} name="webhookcheck" defaultChecked={server.webhook ? true : false} disabled={user.role === "free"} />
                                            </Stack>
                                            {(newServer.webhookcheck) && (
                                                <Stack direction="column">
                                                    <Typography variant="h6">Webhook URL</Typography>
                                                    <TextField fullWidth variant="outlined" name="webhook" value={newServer.webhook} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Webhook URL" type="url" disabled={user.role === "free"} />
                                                </Stack>
                                            )}
                                            <Stack direction="row">
                                                <Typography variant="h6">Block VPNS & Proxys</Typography>
                                                {user.role === "free" ? (
                                                    <Tooltip arrow placement="top" title="This feature requires the Premium subscription or higher.">
                                                        <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip arrow placement="top" title="If enabled, RestoreCord will block users from verifying if they are using a VPN or Proxy (Residential VPNs may not be blocked due to them being real IP Addresses).">
                                                        <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                )}
                                                <Switch onChange={handleChange} name="vpncheck" defaultChecked={server.vpncheck} disabled={user.role === "free"} />
                                            </Stack>
                                            <Stack direction="row">
                                                <Typography variant="h6">Block Alts</Typography>
                                                {user.role === "free" ? (
                                                    <Tooltip arrow placement="top" title="This feature requires the Premium subscription or higher.">
                                                        <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip arrow placement="top" title="If enabled, RestoreCord will check if the User has verified with the same IP Address before, and if so, will block them from verifying again.">
                                                        <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                )}
                                                <Switch onChange={handleChange} name="blockAlts" defaultChecked={server.blockAlts} disabled={user.role === "free"} />
                                            </Stack>
                                        </Stack>
                                    </CustomTabPanel>

                                    <CustomTabPanel value={settingsTab} index={3}>
                                        {/* this server is connected to ... bot */}

                                        {(!botClient.loading && botClient.valid) ? (
                                            <Typography variant="h6">This server is connected to <b>{botClient.username ? `${botClient.username}#${botClient.discriminator} (${botClient.id})` : `${user.bots.find((bot: any) => bot.id === server.customBotId).name} (${user.bots.find((bot: any) => bot.id === server.customBotId).clientId})`}</b> Bot</Typography> 
                                        ) : (
                                            <Alert severity="error">
                                                <Typography variant="body1" sx={{ fontWeight: "400" }}>Your bot has an Invalid Token, please update it <Link href={`/dashboard/custombots/${user.bots.find((bot: any) => bot.id === server.customBotId).clientId}`}>here</Link>.</Typography>
                                            </Alert>
                                        )}

                                        {/* bots are not changeable, due to the members specifcally authorizing/allowing that exact bot the pull them */}
                                        <Alert severity="info" sx={{ my: "1rem" }}>
                                            <Typography variant="body1" sx={{ fontWeight: "400" }}>You cannot change the Bot connected to this server, due to the members specifically authorizing/allowing that exact bot to pull them.</Typography>
                                        </Alert>

                                        {(!botClient.loading) ? (botClient.valid) && (
                                            <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                                <CardContent>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <ImageFallback url={`https://cdn.discordapp.com/avatars/${botClient.id}/${botClient.avatar}.png`} fallback={`https://cdn.discordapp.com/embed/avatars/${botClient.discriminator % 5}.png`} sx={{ width: "3rem", height: "3rem", borderRadius: "50%" }} />
                                                        <Typography variant="h5" sx={{ fontWeight: "600" }}>{botClient.username}</Typography>
                                                        <Typography variant="body1" sx={{ color: "text.secondary" }}>#{botClient.discriminator}</Typography>
                                                        <Typography variant="body1" sx={{ color:"text.secondary" }}>({botClient.id})</Typography>
                                                    </Stack>
                                                </CardContent>
                                            </Paper>
                                        ) : (
                                            <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                                <CardContent>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        {/* <ImageFallback url={`https://cdn.discordapp.com/avatars/${botClient.id}/${botClient.avatar}.png`} fallback={`https://discord.com/embed/avatars/${botClient.discriminator % 5}.png`} sx={{ width: "3rem", height: "3rem", borderRadius: "50%" }} /> */}
                                                        {/* <Typography variant="h5" sx={{ fontWeight: "600" }}>{botClient.username}</Typography> */}
                                                        {/* <Typography variant="body1" sx={{ color: "text.secondary" }}>#{botClient.discriminator}</Typography> */}
                                                        <Skeleton variant="circular" width={40} height={40} />
                                                        <Skeleton variant="text" width={100} height={40} />
                                                        <Skeleton variant="text" width={50} height={40} />
                                                    </Stack>
                                                </CardContent>
                                            </Paper>
                                        )}
                                    </CustomTabPanel>


                                    <Button variant="contained" type="submit" sx={{ mb: 2 }} fullWidth>
                                        Save Changes
                                    </Button>
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
