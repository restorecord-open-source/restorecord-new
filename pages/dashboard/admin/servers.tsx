import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../../src/token";
import { useState } from "react";

import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";
import ErrorPage from "../../_error";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import axios from "axios";
import Alert from "@mui/lab/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import theme from "../../../src/theme";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import LoadingButton from "../../../components/misc/LoadingButton";
import { IntlRelativeTime } from "../../../src/functions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Link from "next/link";

export default function AdminServer() {
    const router = useRouter();
    const [token]: any = useToken()
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessages, setErrorMessages]: any = useState("");
    const [successMessage, setSuccessMessage]: any = useState("");

    const [servers, setServers]: any = useState({});
    const [Modals, setModals]: any = useState({ info: false, unclaim: false });
    const [ModalData, setModalData]: any = useState({ info: {}, query: { rows: 0, time: 0 } });

    const [screenshotMode, setScreenshotMode] = useState(false);

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });


    if (isLoading) {
        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (!data.admin) {
        return <ErrorPage statusCode={404} />
    }

    
    async function getServerInfo(serverId: any) {
        await axios.post("/api/admin/server", { serverId: serverId }, {
            headers: {
                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        }).then((res: any) => {
            console.log(res.data.servers[0]);
            setModalData({ ...ModalData, info: res.data.servers[0] });
        }).catch((err) => {
            console.error(err);
            setErrorMessages(JSON.stringify(err.response.data));
        });
    }

    function renderInfoModal() {
        return (
            <Dialog open={Modals.info} onClose={() => setModals({ ...Modals, info: false })} fullWidth maxWidth="xl">
                <DialogTitle id="alert-dialog-title">
                    Server info
                    <IconButton aria-label="close" onClick={() => setModals({ ...Modals, info: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Paper sx={{ background: "#000", mt: 2, p: 3, borderRadius: "1rem" }}>
                        {Object.entries(ModalData.info).map(([key, value]) => {
                            if (typeof value === "string") {
                                return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{value}</code></Typography>);
                            } else if (value instanceof Date || key === "createdAt" || key === "updatedAt") {
                                return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{new Date(value as any).toLocaleDateString()}</code></Typography>);
                            } else if (typeof value === "boolean") {
                                return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{value ? "Yes" : "No"}</code></Typography>);
                            } else {
                                return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{JSON.stringify(value)}</code></Typography>);
                            }
                        })}
                    </Paper>
                </DialogContent>
            </Dialog>
        );
    }

    function renderUnclaimModal() {
        return (
            <Dialog open={Modals.unclaim} onClose={() => setModals({ ...Modals, unclaim: false })} fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    Unclaim server
                    <IconButton aria-label="close" onClick={() => setModals({ ...Modals, unclaim: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Paper sx={{ background: "#000", mt: 2, p: 3, borderRadius: "1rem" }}>
                        <Stack direction="column" spacing={2}>
                            <Typography variant="body1" sx={{ mb: 1 }}>Are you sure you want to unclaim this server?</Typography>
                            <Button variant="contained" color="error" onClick={async () => {
                                setModals({ ...Modals, unclaim: false });
                                setErrorMessages("");
                                await axios.post("/api/admin/unclaim", { serverId: ModalData.info.id }, {
                                    headers: {
                                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                    },
                                }).then((res: any) => {
                                    console.log(res.data);
                                    setSuccessMessage(JSON.stringify(res.data));
                                }).catch((err) => {
                                    console.error(err);
                                    setErrorMessages(JSON.stringify(err.response.data));
                                });
                            }}>Unclaim</Button>
                        </Stack>
                    </Paper>
                </DialogContent>
            </Dialog>
        )
    }


    function renderSearch() {
        return (
            <form onSubmit={async (e) => {
                e.preventDefault();
                setServers({});
                setErrorMessages("");

                await axios.post("/api/admin/server", { query: searchQuery }, {
                    headers: {
                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                    },
                }).then((res: any) => {
                    setServers(res.data.servers);
                    setModalData({ ...ModalData, query: { rows: res.data.rows, time: res.data.time } });
                }).catch((err) => {
                    console.error(err);
                    setErrorMessages(JSON.stringify(err.response.data));
                });
            }}>
                <Stack direction="column" spacing={2}>
                    <TextField label="Search" variant="outlined" placeholder="ID/Guild Id/Name" onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button variant="contained" type="submit">Get server info</Button>
                    <Alert severity="info" sx={{ bgcolor: "#000", color: "#fff" }}>{ModalData.query.rows} servers in {ModalData.query.time} sec</Alert>
                </Stack>
            </form>
        );
    }

    function renderSearchResult() {
        return (
            <>
                {servers.map((server: any) => (
                    <Paper sx={{ background: "#0a0a0a", mt: 2, p: 3, borderRadius: "1rem", border: `1px solid ${screenshotMode ? theme.palette.primary.main : "#0a0a0a"}` }} key={server.id}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                            <CardContent sx={{ pb: "1rem !important" }}>
                                {Object.entries(server).map(([key, value]) => {
                                    let newKey = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/(?:^|\s)([a-z])/g, (_, c) => c.toUpperCase());

                                    if (newKey.slice(-2, -1).toUpperCase() === newKey.slice(-2, -1) && newKey.slice(-1).toUpperCase() !== newKey.slice(-1)) {
                                        // if newKey is 2 characters long then dont capitalize the last character
                                        newKey = newKey.slice(0, -2) + newKey.slice(-2, -1).toUpperCase() + newKey.slice(-1);
                                    }
                                    

                                    if (screenshotMode) {
                                        switch (key) {
                                        case "id":
                                            newKey = "Database ID";
                                            break;
                                        case "guildId":
                                            newKey = "Server ID";
                                            break;
                                        case "pullTimeout":
                                            newKey = "Cooldown";
                                            break;
                                        case "createdAt":
                                            newKey = "Creation";
                                            break;
                                        }
                                    }

                                    if (value instanceof Date || key === "createdAt" || key === "updatedAt" || key === "pullTimeout") {
                                        return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code onClick={() => { navigator.clipboard.writeText(new Date(value as any).toLocaleDateString()); setSuccessMessage("Copied to clipboard!"); setTimeout(() => { setSuccessMessage(""); }, 1500); }} style={{ cursor: "pointer" }}>{new Intl.DateTimeFormat("en-UK", { dateStyle: "medium" }).format(new Date(value as any))} ({IntlRelativeTime(new Date(value as any).getTime()) ?? "Expired"})</code></b></Typography>);
                                    } else if (key === "ownerId") {
                                        return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <Link href={`/dashboard/admin/users?q=${value}`}><b><code>{String(value) as string}</code></b></Link></Typography>);
                                    } else if (typeof value === "boolean") {
                                        return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code style={{ color: value ? "#00d26a" : "#f92f60" }}>{value ? "✅ Yes" : "❌ No"}</code></b></Typography>);
                                    } else if (typeof value === "string") {
                                        return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code onClick={() => { navigator.clipboard.writeText(value); setSuccessMessage("Copied to clipboard!"); setTimeout(() => { setSuccessMessage(""); }, 1500); }} style={{ cursor: "pointer" }}>{key === "role" ? value.charAt(0).toUpperCase() + value.slice(1) : value}</code></b></Typography>);
                                    } else {
                                        return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code onClick={() => { navigator.clipboard.writeText(JSON.stringify(value)); setSuccessMessage("Copied to clipboard!"); setTimeout(() => { setSuccessMessage(""); }, 1500); }} style={{ cursor: "pointer" }}>{JSON.stringify(value)}</code></b></Typography>);
                                    }
                                })}
                            </CardContent>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Stack direction="column" spacing={2}>
                                    <LoadingButton variant="contained" color="info" event={async () => {
                                        getServerInfo(server.id);
                                        setModals({ ...Modals, info: true });
                                    }}>More info</LoadingButton>
                                    <LoadingButton variant="contained" color="yellow" event={async () => {
                                        setErrorMessages("");
                                        await axios.post("/api/admin/reset?option=cooldown", { serverId: server.id }, {
                                            headers: {
                                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                            },
                                        }).then((res: any) => {
                                            console.log(res.data);
                                            setSuccessMessage(JSON.stringify(res.data));
                                        }).catch((err) => {
                                            console.error(err);
                                            setErrorMessages(JSON.stringify(err.response.data));
                                        });
                                    }}>Reset Cooldown</LoadingButton>
                                    <LoadingButton variant="contained" color="primary" event={async () => {
                                        setErrorMessages("");
                                        await axios.post("/api/admin/reset?option=status", { serverId: server.id }, {
                                            headers: {
                                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                            },
                                        }).then((res: any) => {
                                            console.log(res.data);
                                            setSuccessMessage(JSON.stringify(res.data));
                                        }).catch((err) => {
                                            console.error(err);
                                            setErrorMessages(JSON.stringify(err.response.data));
                                        });
                                    }}>Reset Pull Status</LoadingButton>
                                    <LoadingButton variant="contained" color="error" event={async () => {
                                        setErrorMessages("");
                                        await axios.post("/api/admin/reset?option=member", { serverId: server.id }, {
                                            headers: {
                                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                            },
                                        }).then((res: any) => {
                                            console.log(res.data);
                                            setSuccessMessage(JSON.stringify(res.data));
                                        }).catch((err) => {
                                            console.error(err);
                                            setErrorMessages(JSON.stringify(err.response.data));
                                        });
                                    }}>Reset Members</LoadingButton>
                                    <LoadingButton variant="contained" color="error" event={async () => {
                                        getServerInfo(server.id);
                                        setModals({ ...Modals, unclaim: true });
                                    }}>UNCLAIM ID</LoadingButton>
                                </Stack>
                            </CardContent>
                        </Stack>
                    </Paper>
                ))}
            </>
        );
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2, "@media screen and (max-width: 600px)": { flexDirection: "column" } }}>
                                    <Typography variant="h5" sx={{ fontWeight: "500" }}>
                                        Admin Servers
                                    </Typography>
                                    <Stack direction="row" spacing={2}>
                                        <FormControlLabel control={<Switch checked={screenshotMode} onChange={() => setScreenshotMode(!screenshotMode)} />} label="Screenshot Mode" />
                                    </Stack>
                                </Stack>

                                {Modals.info && renderInfoModal()}
                                {Modals.unclaim && renderUnclaimModal()}

                                {renderSearch()}
                                
                                {errorMessages && ( <Alert severity="error" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{errorMessages}</Alert> )}
                                {successMessage && ( <Alert severity="success" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{successMessage}</Alert> )}

                                {servers.length > 0 && renderSearchResult()}
                            </CardContent>
                        </Paper>
                    </Container>
                
                </NavBar>
            </Box>
        </>
    )
}