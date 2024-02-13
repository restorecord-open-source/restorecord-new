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
import Avatar from "@mui/material/Avatar";
import Fade from "@mui/material/Fade";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { AlertTitle } from "@mui/material";

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

    const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));

    const [newServer, setNewServer] = useState({
        serverName: "",
        guildId: "",
        roleId: "",
        picture: "",
        ipLogging: false,
        discoverable: 0,
        captcha: false,
        authorizeOnly: false,
        blockAlts: false,
        blockWireless: false,
        unlisted: false,
        private: false,
        verified: false,
        webhook: "",
        background: "",
        description: "",
        minAccountAge: 0,
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
    const [confirmDeleteName, setConfirmDeleteName] = useState("");

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
                blockWireless: server.blockWireless,
                unlisted: server.unlisted,
                private: server.private,
                verified: server.verified,
                discoverable: server.discoverable,
                captcha: server.captcha,
                authorizeOnly: server.authorizeOnly,
                picture: server.picture ? server.picture : "",
                description: server.description ? server.description : "",
                minAccountAge: server.minAccountAge ? server.minAccountAge : 0,
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
                name: newServer.serverName,
                guildId: newServer.guildId,
                roleId: newServer.roleId,
                webhook: newServer.webhook,
                webhookCheck: newServer.webhookcheck,
                ipLogging: newServer.ipLogging,
                blockAlts: newServer.blockAlts,
                blockWireless: newServer.blockWireless,
                unlisted: newServer.unlisted,
                private: newServer.private,
                discoverable: newServer.discoverable,
                captcha: newServer.captcha,
                authorizeOnly: newServer.authorizeOnly,
                vpnCheck: newServer.vpncheck,
                picture: newServer.picture,
                background: newServer.background,
                minAccountAge: newServer.minAccountAge,
                description: newServer.description,
                theme: newServer.theme,
                themeColor: newServer.themeColor
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
        const { name, value, checked } = e.target;
        console.log(name, value, checked);
        setNewServer({ ...newServer, [name]: (value === "on" ? checked : value) });
    }

    function onColorChange(color: string, colors: MuiColorInputColors) {
        // setThemeColor(colors.hex);
        setNewServer({ ...newServer, themeColor: colors.hex });
    }

    async function getAllGuilds(botToken: string) {
        setAllServers([]);
        await axios.get("/api/v2/users/guilds", {
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

    async function getGuildRoles(guildId: string, botToken: string) {
        setAllRoles([]);
        await axios.get(`/api/v2/users/guilds/${guildId}/roles`, {
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

    async function getBotClient(botToken: string) {
        setBotClient({ loading: true, valid: false });

        await axios.get(`/api/v2/users/@me`, {
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

                            <Button variant="contained" color="error" sx={{ mb: 2 }} onClick={() => setConfirmDelete(true)}>
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
                                        <li><b style={{ fontSize: "1.25rem", color: "#ff0000", textDecoration: "underline" }}>All Verified Members</b></li>
                                        <li><b style={{ fontSize: "1.25rem" }}>All Backups</b></li>
                                        <li><b style={{ fontSize: "1.25rem" }}>All Customized Settings</b></li>
                                    </ul>

                                    <Stack direction="column" spacing={2}>
                                        <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                                            Enter the Server name to confirm deletion.
                                        </Typography>
                                        <TextField fullWidth variant="outlined" name="confirmDeleteName" value={confirmDeleteName} onChange={(e) => setConfirmDeleteName(e.target.value)} inputProps={{ maxLength: 191 }} placeholder="Server Name" />
                                    </Stack>

                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button disabled={confirmDeleteName !== server.name} variant="contained"
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
                                        <Stack direction={isMobile ? "column" : "row"} spacing={2} justifyContent="space-between">
                                            <Box sx={{ width: "100%" }}>
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
                                                    <Stack direction="row">
                                                        <Typography variant="h6">Unlisted</Typography>
                                                        <Tooltip arrow placement="top" title="If enabled, your server wont get shown on Search Engines.">
                                                            <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                        <Switch onChange={handleChange} name="unlisted" defaultChecked={server.unlisted} />
                                                    </Stack>
                                                    <Stack direction="row">
                                                        <Typography variant="h6">Private Server</Typography>
                                                        <Tooltip arrow placement="top" title="If enabled, Members can only verify through the Discord Embed or via a direct link.">
                                                            <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                        <Switch onChange={handleChange} name="private" defaultChecked={server.private} disabled={user.role === "free"} />
                                                    </Stack>
                                                    <Stack direction="column">
                                                        <Stack direction="row">
                                                            <Typography variant="h6">Server Icon</Typography>
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
                                                        <TextField fullWidth variant="outlined" name="background" value={newServer.background} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Background Image URL" type="url" disabled={user.role === "free" || user.role === "premium"} />
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
                                                        <MuiColorInput format="hex" fallbackValue="#4e46ef" isAlphaHidden value={newServer.themeColor} onChange={onColorChange} disabled={user.role === "free" || user.role === "premium"} sx={{ width: "100%" }} />
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                            <Box sx={{ position: "relative", width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", overflow: "hidden", borderRadius: "1rem", boxShadow: "0px 10px 10px 5px rgba(0, 0, 0, 0.25)" }}>
                                                {newServer.background && <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${newServer.background})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(0.5rem)" }} />}
                                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", flexDirection: "column" }}>
                                                    <Paper sx={{ borderRadius: "1rem", padding: "2rem", marginTop: "1rem", width: { xs: "100%", md: "75%" }, marginBottom: "2rem", boxShadow: "0px 10px 10px 5px rgba(0, 0, 0, 0.25)", backgroundColor: "#00000026", backdropFilter: "blur(1.5rem)" }}>
                                                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title={server.name}>
                                                            <Typography variant="h1" component="h1" sx={{ fontWeight: "700", fontSize: { xs: "1.5rem", md: "3rem" }, pl: "1rem", mr: "1rem", textShadow: "0px 0px 15px rgba(0, 0, 0, 0.25)", textAlign: "center" }}>
                                                                {newServer.serverName}
                                                            </Typography>
                                                        </Tooltip>
                                                       
                                                        {newServer.description && <Typography variant="body1" component="p" sx={{ textAlign: "center", fontSize: { xs: "1rem", md: "1.75rem" }, whiteSpace: "pre-line", overflowWrap: "break-word" }}>{newServer.description}</Typography>}

                                                        {newServer.picture && <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: "1rem" }}><Avatar src={newServer.picture} sx={{ width: { xs: "6rem", md: "8rem" }, height: { xs: "6rem", md: "8rem" } }} /></Box>}

                                                        {(!newServer.private) && (
                                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                <Button variant="contained" color="primary" 
                                                                    sx={{ 
                                                                        cursor: "pointer",
                                                                        width: "100%",
                                                                        marginTop: "2rem",
                                                                        backgroundColor: newServer.themeColor.includes("#") ? newServer.themeColor : "#4e46ef",
                                                                        outline: `1px solid ${newServer.themeColor.includes("#") ? newServer.themeColor : "#4e46ef"}`,
                                                                        color: theme.palette.getContrastText(newServer.themeColor.includes("#") ? newServer.themeColor : "#4e46ef"),
                                                                        "@media not all and (-webkit-min-device-pixel-ratio: 1.5), not all and (-o-min-device-pixel-ratio: 3/2), not all and (min--moz-device-pixel-ratio: 1.5), not all and (min-device-pixel-ratio: 1.5)": {
                                                                            "&:hover": {
                                                                                outline: `1px solid ${newServer.themeColor.includes("#") ? newServer.themeColor : "#4e46ef"}`,
                                                                                color: newServer.themeColor.includes("#") ? newServer.themeColor : "#4e46ef",
                                                                            },
                                                                        },
                                                                        "@media only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (-o-min-device-pixel-ratio: 3/2), only screen and (min--moz-device-pixel-ratio: 1.5), only screen and (min-device-pixel-ratio: 1.5)": {
                                                                            "&:hover": {
                                                                            // backgroundColor: `rgba(${parseInt(newServer.themeColor.slice(1, 3), 16)}, ${parseInt(newServer.themeColor.slice(3, 5), 16)}, ${parseInt(newServer.themeColor.slice(5, 7), 16)}, 0.65)`,
                                                                                backgroundColor: `rgba(${newServer.themeColor.includes("#") ? newServer.themeColor.slice(1, 3) : newServer.themeColor.slice(0, 2)}, ${newServer.themeColor.includes("#") ? newServer.themeColor.slice(3, 5) : newServer.themeColor.slice(2, 4)}, ${newServer.themeColor.includes("#") ? newServer.themeColor.slice(5, 7) : newServer.themeColor.slice(4, 6)}, 0.65)`,
                                                                                color: theme.palette.getContrastText(newServer.themeColor.includes("#") ? newServer.themeColor : "#4e46ef"),
                                                                            },
                                                                        },
                                                                    }}
                                                                >
                                                                    Verify
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </Paper>
                                                </Box>
                                            </Box>
                                        </Stack>
                                    </CustomTabPanel>

                                    <CustomTabPanel value={settingsTab} index={2}>
                                        {server.authorizeOnly && (
                                            <Alert severity="error" sx={{ mb: "1rem" }}>
                                                <AlertTitle>Warning</AlertTitle>
                                                You have enabled the &quot;Authorize Only&quot; feature, this means that RestoreCord will only add the member to your Database, <b>bypass any blacklists</b>, and will <b>NOT</b> give them the Verified Role or send a message to the Webhook URL.
                                            </Alert>
                                        )}
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
                                                <Typography variant="h6">Authorize Only</Typography>
                                                {user.role !== "enterprise" ? (
                                                    <Tooltip arrow placement="top" title="This feature requires the Enterprise subscription">
                                                        <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip arrow placement="top" title="If enabled, RestoreCord will ONLY add the member to your Database, and will not give them the Verified Role or send a message to the Webhook URL.">
                                                        <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                )}
                                                <Switch onChange={handleChange} name="authorizeOnly" defaultChecked={server.authorizeOnly} disabled={user.role === "free"} />
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
                                            <Stack direction="row">
                                                <Typography variant="h6">Block Wireless (LTE, 4G, 5G)</Typography>
                                                {user.role !== "enterprise" ? (
                                                    <Tooltip arrow placement="top" title="This feature requires the Enterprise subscription">
                                                        <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip arrow placement="top" title="If enabled, RestoreCord will block users from using a Wireless IP Address (LTE, 4G, 5G) to verify.">
                                                        <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                    </Tooltip>
                                                )}
                                                <Switch onChange={handleChange} name="blockWireless" defaultChecked={server.blockWireless} disabled={user.role !== "enterprise"} />
                                            </Stack>
                                            <Stack direction="column">
                                                <Stack direction="row">
                                                    <Typography variant="h6">Minimum Account Age (days)</Typography>
                                                    {user.role !== "enterprise" ? (
                                                        <Tooltip arrow placement="top" title="This feature requires the Enterprise subscription">
                                                            <CloseIcon color="error" sx={{ alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip arrow placement="top" title="If enabled, RestoreCord will block users from verifying if their Discord Account is younger than the specified amount of days.">
                                                            <InfoIcon sx={{ fontSize: "1rem", alignSelf: "center", ml: "0.25rem" }} />
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                                <TextField variant="outlined" name="minAccountAge" value={newServer.minAccountAge} onChange={handleChange} inputProps={{ maxLength: 191 }} placeholder="Minimum Account Age" type="number" disabled={user.role !== "enterprise"} />
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
