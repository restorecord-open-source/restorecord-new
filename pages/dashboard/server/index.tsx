import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import { darken } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { formatEstimatedTime, stringAvatar } from "../../../src/functions";
import { useToken } from "../../../src/token";
import { makeXTrack } from "../../../src/getIPAddress";

import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";
import theme from "../../../src/theme";
import LoadingButton from "../../../components/misc/LoadingButton";

import axios from "axios";
import Link from "next/link"

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControlLabel from "@mui/material/FormControlLabel";
import Badge from "@mui/material/Badge";
import RefreshIcon from "@mui/icons-material/Refresh";
import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";
import { countries } from "../blacklist";

export default function Server() {
    const [ token ]: any = useToken()
    const router = useRouter();
    
    const [pullSettings, setPullSettings] = useState({
        serverId: 0,
        pullWindow: false,
        giveRoleOnJoin: false,
        customPullCountCheck: false,
        specificCountry: false,
        customPullCount: 0,
        selectedServer: "",
        selectedRole: "",
        countryCode: "",
    });

    const [serverName, setServerName] = useState("");
    const [guildId, setGuildId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [customBot, setCustomBot] = useState("");

    const [allServers, setAllServers] = useState([]);
    const [allRoles, setAllRoles]: any = useState([]);
    const [botClient, setBotClient]: any = useState({ loading: true, valid: false });

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const [isRotating, setIsRotating] = useState(false);

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
            if (res.data.code || res.data.message) { setAllRoles([]); setNotiTextE(res.data.message); setOpenE(true); }
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
            if (res.data.code || res.data.message) { setBotClient({ loading: false, valid: false }); setNotiTextE(res.data.message); setOpenE(true); }
            else setBotClient({ loading: false, valid: true, ...res.data });
        }).catch(err => {
            setBotClient({ loading: false, valid: false });
            console.error(err);
        });
    }

    const { data: user, isError, isLoading, refetch: reloadUser } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

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
            </>
        )
    }

    function rendertitleBarUI() {
        return (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ "@media screen and (max-width: 600px)": { flexDirection: "column" } }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "700" }}>
                        Servers
                    </Typography>
                    <IconButton onClick={() => {
                        setIsRotating(true);
                        reloadUser();
                        setTimeout(() => { setIsRotating(false); }, 1000);
                    }} size="medium" sx={{ ml: 1, mt: 1, animation: `${isRotating ? "rotation 0.5s linear forwards" : ""}`, transition: "transform 0.2s ease-out" }}>
                        <RefreshIcon />
                    </IconButton>
                    <style jsx global>{`
                    @keyframes rotation {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }
                    `}</style>
                </Box>
                <Button variant="contained" sx={{ mb: 2 }} onClick={(e) => {
                    e.preventDefault();
                    router.push("/dashboard/server/new");
                }}>
                    + Create New Server
                </Button>
            </Stack>
        )
    }

    function renderServer(server: any) {
        return (
            <Paper key={server.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }} id={`server_${server.guildId}`}>
                <CardContent>
                    <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                        <Grid item>
                            <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                                {server.picture === "" ? (
                                    <Avatar {...stringAvatar(server.name, { sx: { mr: "0.5rem" } })} />
                                ) : (
                                    <Avatar src={server.picture} alt={server.serverName} sx={{ mr: "0.5rem" }} />
                                )}
                                {/* if on cooldown then show tooltip with remaining time ticking down */}
                                {new Date(server.pullTimeout).getTime() - new Date().getTime() > 0 ? (
                                    <Tooltip title={`Cooldown: ${formatEstimatedTime(new Date(server.pullTimeout).getTime() - new Date().getTime())}`} placement="top" arrow>
                                        <Badge badgeContent={server.pulling ? "Pulling" : (new Date(server.pullTimeout).getTime() - new Date().getTime() > 0 ? "Cooldown" : "Idle")} color={new Date(server.pullTimeout).getTime() - new Date().getTime() > 0 ? "warning" : "info"} sx={{ [`& .MuiBadge-badge`]: { mt: "0.95rem", mr: "-3rem", color: "#fff", padding: "0.75rem", fontSize: "0.75rem", fontWeight: "bold", display: (server.pulling || new Date(server.pullTimeout).getTime() - new Date().getTime() > 0) ? "flex" : "none" } }}>
                                            <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word" }}>
                                                {server.name}
                                            </Typography>
                                        </Badge>
                                    </Tooltip>
                                ) : (
                                    <Badge badgeContent={server.pulling ? "Pulling" : (new Date(server.pullTimeout).getTime() - new Date().getTime() > 0 ? "Cooldown" : "Idle")} color={new Date(server.pullTimeout).getTime() - new Date().getTime() > 0 ? "warning" : "info"} sx={{ [`& .MuiBadge-badge`]: { mt: "0.95rem", mr: "-3rem", color: "#fff", padding: "0.75rem", fontSize: "0.75rem", fontWeight: "bold", display: (server.pulling || new Date(server.pullTimeout).getTime() - new Date().getTime() > 0) ? "flex" : "none" } }}>
                                        <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word" }}>
                                            {server.name}
                                        </Typography>
                                    </Badge>
                                )}
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                {server.description}
                            </Typography>
                            <Typography variant="body2" color="white" sx={{ wordBreak: "break-word" }}>
                                Verification URL
                                <Link href={(user.bots.find((bot: any) => bot.id === (user.servers.find((server: any) => server.guildId === server.guildId).customBotId)).customDomain != null ? "https://" + user.bots.find((bot: any) => bot.id === (user.servers.find((server: any) => server.guildId === server.guildId).customBotId)).customDomain : window.location.origin.replace("www.", "")) + "/verify/" + encodeURIComponent(server.name)} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.light }}>
                                    <br/>
                                    {(user.bots.find((bot: any) => bot.id === (user.servers.find((server: any) => server.guildId === server.guildId).customBotId)).customDomain != null ? "https://" + user.bots.find((bot: any) => bot.id === (user.servers.find((server: any) => server.guildId === server.guildId).customBotId)).customDomain : window.location.origin.replace("www.", ""))}/verify/{encodeURIComponent(server.name)}
                                </Link>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={1.5}>
                            <Stack spacing={1} direction="column">
                                <Button variant="contained" onClick={() => { router.push(`/dashboard/server/${server.guildId}`)} }>
                                    Edit
                                </Button>
                                <LoadingButton variant="contained" color="success" event={() => {
                                    setGuildId(server.guildId);
                                    reloadUser();
                                    setBotClient({ loading: true, valid: false });
                                    getAllGuilds(user.bots.find((bot: any) => String(bot.id) === String(user.servers.find((serv: any) => serv.guildId === server.guildId).customBotId)).botToken);
                                    getBotClient(user.bots.find((bot: any) => String(bot.id) === String(user.servers.find((serv: any) => serv.guildId === server.guildId).customBotId)).botToken);
                                    setPullSettings({ ...pullSettings, serverId: server.id, pullWindow: true, giveRoleOnJoin: false, customPullCountCheck: false, specificCountry: false });
                                }}>Migrate</LoadingButton>
                                {(user.role === "business" || user.role === "enterprise") && (
                                    <LoadingButton variant="contained" color="yellow" event={async() => {
                                        await axios.post(`/api/v2/self/servers/${server.guildId}/backup/create`, {}, {
                                            headers: {
                                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                            },
                                            validateStatus: () => true
                                        })
                                            .then(res => {
                                                setOpenI(false);
                                                if (!res.data.success) {
                                                    setNotiTextE(res.data.message);
                                                    setOpenE(true);
                                                }
                                                else {
                                                    setNotiTextS(res.data.message);
                                                    setOpenS(true);
                                                }
                                            })
                                            .catch((err): any => {
                                                setNotiTextE(err.message);
                                                setOpenE(true);
                                                console.error(err);
                                            });
                                    }}>Backup</LoadingButton>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Paper>
        )
    }
    
    return (
        <Box sx={{ display: "flex" }}>
            <NavBar user={user}>
                <Toolbar />
                    
                <Container maxWidth="xl">
                    <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                        <CardContent>
                            {renderNotifications()}
                            {rendertitleBarUI()}

                            <Dialog open={pullSettings.pullWindow} onClose={() => setPullSettings({ ...pullSettings, pullWindow: false })} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                                <DialogTitle id="alert-dialog-title">
                                    Migration
                                    <IconButton aria-label="close" onClick={() => setPullSettings({ ...pullSettings, pullWindow: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>
                                <DialogContent>
                                    {!botClient.loading && !botClient.valid && (
                                        <Alert severity="error" sx={{ width: "100%", mb: "1rem" }}>
                                            <Typography variant="body1" sx={{ fontWeight: "400" }}>The Bot linked to this server has an Invalid Bot Token, please update it <Link href={`/dashboard/custombots/${user.bots.find((bot: any) => String(bot.id) === String(user.servers.find((server: any) => server.id === pullSettings.serverId)?.customBotId)).clientId}`}>here</Link>.</Typography>
                                        </Alert>
                                    )}

                                    <Typography variant="body1" sx={{ fontWeight: "400", mb: "1rem" }}>
                                        Select the server you want to pull your members into, make sure you invited the bot to the server.
                                    </Typography>
                                    {(allServers.length === 0 && botClient.valid) ? (
                                        <CircularProgress />
                                    ) : (botClient.valid) && (
                                        <FormControl fullWidth variant="outlined" required>
                                            <InputLabel id="server-select-label">Select Server</InputLabel>
                                            <Select labelId="server-select-label" label="Select Server" value={pullSettings.selectedServer} onChange={(e) => { setAllRoles([]); setPullSettings({ ...pullSettings, selectedServer: e.target.value as string }); }} required>
                                                {Array.isArray(allServers) && allServers.map((item: any) => {
                                                    if (allServers.filter((i: any) => i.name === item.name).length > 1) return <MenuItem key={item.id} value={item.id}>{item.name} ({item.id})</MenuItem>;
                                                    else return <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>;
                                                })}
                                            </Select>
                                        </FormControl>
                                    )}

                                    {/* give role on join checkbox */}
                                    {(allServers.length !== 0 && pullSettings.selectedServer) && (
                                        <>
                                            <Stack direction="column" spacing={2} alignItems="left">
                                                <FormControlLabel control={<Checkbox checked={pullSettings.giveRoleOnJoin} onChange={(e) => { 
                                                    if (e.target.checked === true) getGuildRoles(pullSettings.selectedServer, user.bots.find((bot: any) => String(bot.id) === String(user.servers.find((server: any) => server.id === pullSettings.serverId)?.customBotId))?.botToken);
                                                    setPullSettings({ ...pullSettings, giveRoleOnJoin: e.target.checked })
                                                }} />} label="Give role on join" />
                                                <FormControlLabel control={<Checkbox checked={pullSettings.customPullCountCheck} onChange={(e) => setPullSettings({ ...pullSettings, customPullCountCheck: e.target.checked })} />} label="Custom Pull amount" />
                                                {/* if no business or enterprise plan then show note */}
                                                {(user.role !== "business" && user.role !== "enterprise") ? (
                                                    <Tooltip title="This feature is only available for Business and Enterprise plans.">
                                                        <FormControlLabel control={<Checkbox />} label="Specific Country" disabled={user.role !== "business" && user.role !== "enterprise"} />
                                                    </Tooltip>
                                                ) : (
                                                    <FormControlLabel control={<Checkbox checked={pullSettings.specificCountry} onChange={(e) => setPullSettings({ ...pullSettings, specificCountry: e.target.checked })} />} label="Specific Country" />
                                                )}     
                                            </Stack>
                                        </>
                                    )}
                                    {/* role select */}
                                    {(pullSettings.giveRoleOnJoin && pullSettings.selectedServer && botClient) && (
                                        <>
                                            <Typography variant="body1" sx={{ fontWeight: "400", mb: "1rem", mt: "1rem" }}>Select the role you want to give to your members.</Typography>
                                            {allRoles.length === 0 ? (
                                                <CircularProgress />
                                            ) : (
                                                <FormControl fullWidth variant="outlined" required>
                                                    <InputLabel id="role-select-label">Select Role</InputLabel>
                                                    <Select labelId="role-select-label" label="Select Role" value={pullSettings.selectedRole} onChange={(e) => setPullSettings({ ...pullSettings, selectedRole: e.target.value as string }) } required>
                                                        {Array.isArray(allRoles) && allRoles.filter((item: any) => item.name !== "@everyone").map((item: any, id: number) => {
                                                            const botRole: any = allRoles.filter((i: any) => i.tags && i.tags.bot_id === botClient?.id);
                                                            if (item.position < botRole[0]?.position && !item.tags) {
                                                                return <MenuItem key={item.id} value={item.id} sx={{ 
                                                                    color: theme.palette.getContrastText(`#${item.color.toString(16).padStart(6, "0")}`), 
                                                                    backgroundColor: `#${item.color.toString(16).padStart(6, "0")}`,
                                                                    transition: "all 0.1s ease-in-out",
                                                                    "&:hover": {
                                                                        color: theme.palette.getContrastText(`#${item.color.toString(16).padStart(6, "0")}`),
                                                                        backgroundColor: darken(`#${item.color.toString(16).padStart(6, "0")}`, 0.25),
                                                                    },
                                                                    "&.Mui-selected": {
                                                                        color: theme.palette.getContrastText(`#${item.color.toString(16).padStart(6, "0")}`),
                                                                        backgroundColor: darken(`#${item.color.toString(16).padStart(6, "0")}`, 0.5),
                                                                        "&:hover": {
                                                                            color: theme.palette.getContrastText(`#${item.color.toString(16).padStart(6, "0")}`),
                                                                            backgroundColor: darken(`#${item.color.toString(16).padStart(6, "0")}`, 0.75),
                                                                        },
                                                                    },
                                                                }}>{item.name} {allRoles.filter((i: any) => i.name === item.name).length > 1 ? `(${item.id})` : ""}</MenuItem>;
                                                            }
                                                        })}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        </>
                                    )}
                                    {/* country select */}
                                    {(pullSettings.specificCountry && pullSettings.selectedServer) && (
                                        <>
                                            <Typography variant="body1" sx={{ fontWeight: "400", mb: "1rem", mt: "1rem" }}>Select the country you want to pull members from.</Typography>
                                            <FormControl fullWidth variant="outlined" required>
                                                <InputLabel id="country-select-label">Select Country</InputLabel>
                                                <Select labelId="country-select-label" label="Select Country" value={pullSettings.countryCode} onChange={(e) => setPullSettings({ ...pullSettings, countryCode: e.target.value as string }) } required>
                                                    {countries.map((country: any) => {
                                                        return (
                                                            <MenuItem key={country.code} value={country.code}>
                                                                <Stack direction="row" alignItems="center">
                                                                    <Avatar src={`https://cdn.ipregistry.co/flags/twemoji/${country.code.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0, mr: 1 }} />
                                                                    {country.name}
                                                                </Stack>
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </FormControl>
                                        </>
                                    )}

                                    {/* custom pull count */}
                                    {(pullSettings.customPullCountCheck && pullSettings.selectedServer) && (
                                        <>
                                            <Typography variant="body1" sx={{ fontWeight: "400", mb: "0.5rem", mt: "1rem" }}>Enter the amount of members you want to pull.</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: "300", mb: "1rem" }}>Note: This will only count &quot;successfully&quot; pulled members, errors will not be counted.</Typography>
                                            <TextField fullWidth label="Pull Amount" variant="outlined" type={"number"} value={pullSettings.customPullCount} onChange={(e) => setPullSettings({ ...pullSettings, customPullCount: Number(e.target.value) as number }) } />
                                        </>
                                    )}

                                    {/* small arrow down icon with the text "advanced options" */}
                                    {(!botClient.loading && botClient.valid) && (
                                        <Accordion sx={{ my: "1rem" }}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                                                <Typography variant="body1" sx={{ fontWeight: "400" }}>Advanced Options</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Alert severity="warning" sx={{ width: "100%", mb: "1rem" }}>
                                                    <Typography variant="body1" sx={{ fontWeight: "400" }}>These options are for advanced users only, please do not change these settings unless you know what you are doing.</Typography>
                                                </Alert>

                                                <Typography variant="body1" sx={{ mb: "1rem" }}>Enter Server ID manually</Typography>
                                                <TextField fullWidth label="Server ID" variant="outlined" value={pullSettings.selectedServer} onChange={(e) => setPullSettings({ ...pullSettings, selectedServer: e.target.value }) } />
                                                {(pullSettings.giveRoleOnJoin && pullSettings.selectedServer) && (
                                                    <>
                                                        <Typography variant="body1" sx={{ mb: "1rem", mt: "1rem" }}>Enter Role ID manually</Typography>
                                                        <TextField fullWidth label="Role ID" variant="outlined" value={pullSettings.selectedRole} onChange={(e) => setPullSettings({ ...pullSettings, selectedRole: e.target.value }) } />
                                                    </>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    )}

                                    {(guildId !== "" && new Date(user.servers.find((item: any) => item.guildId === guildId).pullTimeout).getTime() - new Date().getTime() > 0) && (
                                        <Alert severity="info" sx={{ width: "100%" }}>
                                            <Typography variant="body1" sx={{ fontWeight: "400" }}>This server is currently on cooldown, you can pull members again in {formatEstimatedTime(new Date(user.servers.find((item: any) => item.guildId === guildId).pullTimeout).getTime() - new Date().getTime())}.</Typography>
                                        </Alert>
                                    )}
                                </DialogContent>
                                <DialogActions>
                                    <Stack direction={{ sm: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="center" width="100%">
                                        <Button onClick={() => { 
                                            getAllGuilds(user.bots.find((bot: any) => String(bot.id) === String(user.servers.find((server: any) => server.id === pullSettings.serverId)?.customBotId))?.botToken); 
                                            getGuildRoles(pullSettings.selectedServer, user.bots.find((bot: any) => String(bot.id) === String(user.servers.find((server: any) => server.id === pullSettings.serverId)?.customBotId))?.botToken);
                                        }} color="primary" variant="contained" sx={{ width: "100%", mb: { sm: "1rem", md: "0" } }}>
                                            Refresh Server List
                                        </Button>
                                        {guildId !== "" && user.servers.find((item: any) => item.guildId === guildId).pulling && user.role !== "enterprise" ? (
                                            <LoadingButton event={() => (
                                                axios.delete(`/api/v2/self/servers/${guildId}/stop`, {
                                                    headers: {
                                                        "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    },
                                                    validateStatus: () => true
                                                }).then(res => {
                                                    setOpenI(false);
                                                    if (!res.data.success) {
                                                        setNotiTextE(res.data.message);
                                                        setOpenE(true);
                                                    }
                                                    else {
                                                        setNotiTextS(res.data.message);
                                                        setOpenS(true);
                                                        // setPullWindow(false);
                                                        setPullSettings({ ...pullSettings, pullWindow: false });
                                                    }
                                                }).catch((err): any => {
                                                    setNotiTextE(err.message);
                                                    setOpenE(true);
                                                    console.error(err);
                                                })
                                            )} color="error" sx={{ width: "100%", mt: { sm: "1rem", md: "0" } }}>
                                                Stop All Migrations
                                            </LoadingButton>
                                        ) : (
                                            <LoadingButton event={() => (
                                                axios.put(`/api/v2/self/servers/${guildId}/pull?server=${pullSettings.selectedServer}${pullSettings.giveRoleOnJoin ? `&role=${pullSettings.selectedRole}` : ""}${pullSettings.customPullCountCheck ? `&pullCount=${pullSettings.customPullCount}` : ""}${pullSettings.specificCountry ? `&country=${pullSettings.countryCode}` : ""}`, {}, {
                                                    headers: {
                                                        "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                        "x-track": makeXTrack()
                                                    },
                                                    validateStatus: () => true
                                                }).then(res => {
                                                    setOpenI(false);
                                                    if (!res.data.success) {
                                                        if (res.data.pullTimeout) {
                                                            const timeArr = new Date(new Date(res.data.pullTimeout).getTime() - new Date().getTime()).toISOString().substr(11, 8).split(":");
                                                            const hours = parseInt(timeArr[0]);
                                                            const minutes = parseInt(timeArr[1]);
                                                            const seconds = parseInt(timeArr[2]);
                                                            const timeString = `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""} ` : ""}${minutes > 0 ? `${minutes} minute${minutes > 1 ? "s" : ""} ` : ""}${seconds > 0 ? `${seconds} second${seconds > 1 ? "s" : ""} ` : ""}`;
                                                            setNotiTextE(`${res.data.message} ${timeString}`);
                                                        }
                                                        else {
                                                            setNotiTextE(res.data.message);
                                                        }
                                                        setOpenE(true);
                                                    }
                                                    else {
                                                        setNotiTextS(res.data.message);
                                                        setOpenS(true);
                                                        // setPullWindow(false);
                                                        setPullSettings({ ...pullSettings, pullWindow: false });
                                                    }
                                                }).catch((err): any => {
                                                    setNotiTextE(err.message);
                                                    setOpenE(true);
                                                    console.error(err);
                                                })
                                            )} color="success" sx={{ width: "100%", mt: { sm: "1rem", md: "0" } }} disabled={guildId !== "" && new Date(user.servers.find((item: any) => item.guildId === guildId).pullTimeout).getTime() - new Date().getTime() > 0}>
                                                    Pull Members
                                            </LoadingButton>
                                        )}
                                    </Stack>
                                </DialogActions>
                            </Dialog>

                            {user.servers.length > 0 ? (
                                user.servers.map((item: any) => renderServer(item))
                            ) : (
                                <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                    <CardContent>
                                        <Typography variant="body1" color={grey[200]} sx={{ fontWeight: "400", textAlign: "center" }}>You don&apos;t have any servers yet :(</Typography>
                                        <Typography variant="body2" color={grey[400]} sx={{ fontWeight: "300", textAlign: "center" }}>Click Create New Server above to get started.</Typography>
                                    </CardContent>
                                </Paper>
                            )}

                        </CardContent>
                    </Paper>
                </Container>

            </NavBar>
        </Box>
    )
}