import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../../src/token";
import { useEffect, useState } from "react";
import { IntlRelativeTime } from "../../../src/functions";

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
import FormLabel from "@mui/material/FormLabel";
import Slider from "@mui/material/Slider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import LoadingButton from "../../../components/misc/LoadingButton";

export default function AdminUser() {
    const router = useRouter();
    const [token]: any = useToken()
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessages, setErrorMessages]: any = useState("");
    const [successMessage, setSuccessMessage]: any = useState("");

    const [users, setUsers]: any = useState({});

    const [hideSensitive, setHideSensitive] = useState(false);
    const [screenshotMode, setScreenshotMode] = useState(false);

    const [Modals, setModals]: any = useState({
        info: false,
        upgrade: false,
        updateEmail: false,
        disable2FA: false,
        ban: false,
    });

    const [ModalData, setModalData]: any = useState({
        info: {},
        upgrade: {
            plan: "free",
            duration: 1,
        },
        updateEmail: {},
        disable2FA: {},
        ban: {},
        query: {
            rows: 0,
            time: 0,
        },
    });

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });

    useEffect(() => {
        if ((data && data.admin) && router.query.q) {
            setSearchQuery(router.query.q as string);
            setUsers({});
            setErrorMessages("");
            setSuccessMessage("");
            axios.post("/api/admin/lookup", { query: router.query.q }, {
                headers: {
                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                },
            }).then((res: any) => {
                setUsers(res.data.users);
                setModalData({ ...ModalData, query: { rows: res.data.rows, time: res.data.time } });
            }).catch((err) => {
                console.error(err);
                setErrorMessages(JSON.stringify(err.response.data));
            });
        }
    }, []);

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

    async function getUserInfo(userId: any) {
        await axios.post("/api/admin/lookup", { userId: userId }, {
            headers: {
                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        }).then((res: any) => {
            setModalData({ ...ModalData, info: res.data.users[0] });
        }).catch((err) => {
            console.error(err);
            setErrorMessages(JSON.stringify(err.response.data));
        });
    }

    function renderInfoModal() {
        return (
            <Dialog open={Modals.info} onClose={() => setModals({ ...Modals, info: false })} fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    User info
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

                        {/* login button */}
                        <LoadingButton variant="contained" color="primary" event={async () => {
                            var orgToken = (process.browser && window.localStorage.getItem("token")) ?? token;
                            window.localStorage.setItem("org_token", orgToken);

                            var newToken = await axios.post("/api/admin/login", { id: ModalData.info.id }, {
                                headers: {
                                    Authorization: orgToken,
                                },
                            }).then((res: any) => res.data.token).catch((err) => err.response.data);

                            var login = await axios.get("/api/v2/self", {
                                headers: {
                                    Authorization: newToken,
                                },
                            }).then((res: any) => res.data).catch((err) => err.response.data);

                            if (login.success) {
                                window.localStorage.setItem("token", newToken);
                                setSuccessMessage(login.message);
                            }

                            var popup = window.open("/dashboard", "popUpWindow", `menubar=no,width=1280,height=720,resizable=no,scrollbars=yes,status=no,top=${(window.innerHeight - 720) / 2},left=${(window.innerWidth- 1280) / 2}`)
                            if (popup) {
                                popup.focus();

                                popup.window.addEventListener("load", () => {
                                    popup?.window.addEventListener("unload", () => {
                                        window.localStorage.setItem("token", orgToken);
                                        window.localStorage.removeItem("org_token");
                                    });
                                });
                            }
                        }}>Login</LoadingButton>
                    </Paper>
                </DialogContent>
            </Dialog>
        );
    }

    function renderUpgradeModal() {
        return (
            <Dialog open={Modals.upgrade} onClose={() => setModals({ ...Modals, upgrade: false })} fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    Upgrade User
                    <IconButton aria-label="close" onClick={() => setModals({ ...Modals, upgrade: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {ModalData.info ? (
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            User ID: <code>{ModalData.info.id}</code><br />
                            Username: <code>{ModalData.info.username}</code><br />
                            Current Plan: <code>{ModalData.info.role}</code><br />
                            {/* Expires at: <code>{new Date(ModalData.info.expiry).toLocaleDateString()}</code><br /> */}
                            Expiry: <code>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(ModalData.info.expiry ?? "0"))}</code><br />
                        </Typography>
                    ) : ( <CircularProgress /> )}

                    <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="plan-select-label">Select Plan</InputLabel>
                        <Select labelId="plan-select-label" variant="outlined" sx={{ width: "100%" }} onChange={(e) => setModalData({ ...ModalData, upgrade: { ...ModalData.upgrade, plan: e.target.value }})}>
                            <MenuItem value="free">Free (Default)</MenuItem>
                            <MenuItem value="premium">Premium</MenuItem>
                            <MenuItem value="business">Business</MenuItem>
                        </Select>

                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            {/* <FormControl variant="outlined" sx={{ width: "100%" }}>
                                <InputLabel id="duration-select-label">Select Duration</InputLabel>
                                <Select labelId="duration-select-label" variant="outlined" sx={{ width: "100%" }} onChange={(e) => setModalData({ ...ModalData, upgrade: { ...ModalData.upgrade, duration: e.target.value }})}>
                                    <MenuItem value="0">NULL</MenuItem>
                                    <MenuItem value="1">1 Month</MenuItem>
                                    <MenuItem value="2">2 Month</MenuItem>
                                    <MenuItem value="3">3 Month</MenuItem>
                                    <MenuItem value="4">4 Month</MenuItem>
                                    <MenuItem value="5">5 Month</MenuItem>
                                    <MenuItem value="6">6 Months</MenuItem>
                                    <MenuItem value="7">7 Months</MenuItem>
                                    <MenuItem value="8">8 Months</MenuItem>
                                    <MenuItem value="9">9 Months</MenuItem>
                                    <MenuItem value="10">10 Months</MenuItem>
                                    <MenuItem value="11">11 Months</MenuItem>
                                    <MenuItem value="12">12 Months</MenuItem>
                                    <MenuItem value="12">1 Year</MenuItem>
                                    <MenuItem value="24">2 Years</MenuItem>
                                    <MenuItem value="36">3 Years</MenuItem>
                                    <MenuItem value="60">5 Years</MenuItem>
                                </Select>
                            </FormControl> */}
                            <FormControl variant="outlined" sx={{ width: "100%" }}>
                                <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
                                    <FormLabel component="legend">Duration Months: {ModalData?.upgrade?.duration}</FormLabel>
                                    <Slider
                                        aria-label="plan"
                                        defaultValue={1}
                                        valueLabelDisplay="auto"
                                        step={1}
                                        marks
                                        min={1}
                                        max={24}
                                        onChange={(e, value) => {
                                            setModalData({ ...ModalData, upgrade: { ...ModalData.upgrade, duration: value }});
                                        }}
                                        sx={{ mx: 1 }}
                                    />
                                </Stack>
                            </FormControl>
                        </Stack>

                        <LoadingButton variant="contained" sx={{ mt: 2 }} event={async () => {
                            await axios.post("/api/admin/upgrade", { userId: ModalData.info.id, plan: ModalData?.upgrade?.plan, expiry: new Date(ModalData?.upgrade?.duration ? Date.now() + (parseInt(ModalData?.upgrade?.duration) * 30 * 24 * 60 * 60 * 1000) : Date.now()).toISOString() }, {
                                headers: {
                                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                },
                            }).then((res: any) => {
                                setSuccessMessage(res.data.message);
                            }).catch((err) => {
                                console.error(err);
                                setErrorMessages(JSON.stringify(err.response.data));
                            });
                            
                            setModals({ ...Modals, upgrade: false });
                        }}>Upgrade</LoadingButton>
                    </FormControl>
                </DialogContent>
            </Dialog>
        );
    }

    function renderUpdateEmailModal() {
        return (
            <Dialog open={Modals.email} onClose={() => setModals({ ...Modals, email: false })} fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    Update Email
                    <IconButton aria-label="close" onClick={() => setModals({ ...Modals, email: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        User ID: <code>{ModalData.info.id}</code><br />
                        Username: <code>{ModalData.info.username}</code><br />
                        Current Email: <code>{ModalData.info.email}</code><br />
                    </Typography>

                    <FormControl fullWidth variant="outlined" required>
                        <InputLabel htmlFor="email">New Email</InputLabel>
                        <OutlinedInput id="email" type="email" label="New Email" onChange={(e) => setModalData({ ...ModalData, email: {
                            ...ModalData.email,
                            newEmail: e.target.value
                        }})} />

                        <LoadingButton variant="contained" color="yellow" sx={{ mt: 2 }} event={async () => {
                            setModals({ ...Modals, email: false });
                        }}>Send Verification Code</LoadingButton>
                        <LoadingButton variant="contained" sx={{ mt: 2 }} event={async () => {
                            setModals({ ...Modals, email: false });
                        }}>Update</LoadingButton>
                    </FormControl>
                </DialogContent>
            </Dialog>
        );
    }

    function renderDisable2FAModal() {
        return (
            <Dialog open={Modals.disable2FA} onClose={() => setModals({ ...Modals, disable2FA: false })} fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    Disable 2FA
                    <IconButton aria-label="close" onClick={() => setModals({ ...Modals, disable2FA: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        User ID: <code>{ModalData.info.id}</code><br />
                        Username: <code>{ModalData.info.username}</code><br />
                    </Typography>

                    <FormControl fullWidth variant="outlined" required>
                        <LoadingButton variant="contained" sx={{ mt: 2 }} event={async () => {
                            setModals({ ...Modals, disable2FA: false });
                        }}>Disable 2FA</LoadingButton>
                    </FormControl>
                </DialogContent>
            </Dialog>
        );
    }

    function renderBanModal() {
        return (
            <Dialog open={Modals.ban} onClose={() => setModals({ ...Modals, ban: false })} fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    Ban User
                    <IconButton aria-label="close" onClick={() => setModals({ ...Modals, ban: false })} sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500] }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        User ID: <code>{ModalData.info.id}</code><br />
                        Username: <code>{ModalData.info.username}</code><br />
                    </Typography>

                    <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="ban-reason-select-label">Select Ban Reason</InputLabel>
                        <Select labelId="ban-reason-select-label" variant="outlined" sx={{ width: "100%" }} onChange={(e) => setModalData({ ...ModalData, ban: {
                            ...ModalData?.ban,
                            reason: e.target.value
                        }})}>
                            {ModalData?.ban?.reasons?.map((reason: any) => (
                                <MenuItem key={reason.id} value={reason.id}>{reason.id} - {reason.reason}</MenuItem>
                            ))}
                        </Select>

                        <LoadingButton variant="contained" sx={{ mt: 2 }} event={async () => {
                            await axios.post("/api/admin/ban", { userId: ModalData.info.id, reason: ModalData.ban.reason }, {
                                headers: {
                                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                },
                            }).then((res: any) => {
                                setSuccessMessage(res.data.message);
                            }).catch((err) => {
                                console.error(err);
                                setErrorMessages(JSON.stringify(err.response.data));
                            });
                            setModals({ ...Modals, ban: false });
                        }}>Ban</LoadingButton>
                    </FormControl>
                </DialogContent>
            </Dialog>
        );
    }

    function renderSearch() {
        return (
            <form onSubmit={(e) => e.preventDefault()}>
                <Stack direction="column" spacing={2}>
                    <TextField label="Search" variant="outlined" placeholder="User ID/Username/Email" onChange={(e) => {
                        if (e.target.value === "") {
                            history.pushState(null, "", "/dashboard/admin/users");
                        } else {
                            history.pushState(null, "", `/dashboard/admin/users?q=${e.target.value}`);
                        }
                        
                        setSearchQuery(e.target.value); 
                    }} defaultValue={searchQuery ?? ""} value={searchQuery} />
                    <LoadingButton variant="contained" type="submit" event={async() => {
                        setUsers({});
                        setErrorMessages("");
                        setSuccessMessage("");
                        
                        await axios.post("/api/admin/lookup", { query: searchQuery }, {
                            headers: {
                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                            },
                        }).then((res: any) => {
                            setUsers(res.data.users);
                            setModalData({ ...ModalData, query: { rows: res.data.rows, time: res.data.time } });
                        }).catch((err) => {
                            console.error(err);
                            setErrorMessages(JSON.stringify(err.response.data));
                        });
                    }}>Get user info</LoadingButton>
                    <Alert severity="info" sx={{ bgcolor: "#000", color: "#fff" }}>{ModalData.query.rows} accounts in {ModalData.query.time} sec</Alert>
                </Stack>
            </form>
        );
    }

    function renderSearchResult() {
        return (
            <>
                {users.map((user: any) => (
                    <Paper sx={{ background: "#0a0a0a", mt: 2, p: 3, borderRadius: "1rem", border: `1px solid ${screenshotMode ? theme.palette.primary.main : "#0a0a0a"}` }} key={user.id}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                            <CardContent sx={{ pb: "1rem !important" }}>
                                {Object.entries(user).map(([key, value]) => {
                                    let newKey = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/(?:^|\s)([a-z])/g, (_, c) => c.toUpperCase());

                                    if (newKey.slice(-2, -1).toUpperCase() === newKey.slice(-2, -1) && newKey.slice(-1).toUpperCase() !== newKey.slice(-1)) {
                                        newKey = newKey.slice(0, -1) + newKey.slice(-1).toUpperCase();
                                    }
                                    

                                    if (hideSensitive && (key === "lastIp" || key === "admin" || key === "twoFactor" || key === "email")) return null;

                                    if (screenshotMode) {
                                        switch (key) {
                                        case "id":
                                            newKey = "Account Number";
                                            break;
                                        case "role":
                                            newKey = "Plan";
                                            break;
                                        case "expiry":
                                            newKey = "Expiration";
                                            break;
                                        case "createdAt":
                                            newKey = "Creation";
                                            break;
                                        }
                                    }

                                    if (value instanceof Date || key === "createdAt" || key === "updatedAt" || key === "expiry") {
                                        return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code onClick={() => { navigator.clipboard.writeText(new Date(value as any).toLocaleDateString()); setSuccessMessage("Copied to clipboard!"); setTimeout(() => { setSuccessMessage(""); }, 1500); }} style={{ cursor: "pointer" }}>{new Intl.DateTimeFormat("en-UK", { dateStyle: "medium" }).format(new Date(value as any))} ({IntlRelativeTime(new Date(value as any).getTime()) ?? "Expired"})</code></b></Typography>);
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
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, info: true });
                                    }}>More info</LoadingButton>
                                    <LoadingButton variant="contained" color="yellow" event={async () => {
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, upgrade: true });
                                    }}>Upgrade</LoadingButton>
                                    <LoadingButton variant="contained" color="primary" event={async () => {
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, email: true });
                                    }}>Update Email</LoadingButton>
                                    <LoadingButton variant="contained" color="error" event={async () => {
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, disable2FA: true });
                                    }}>Disable 2FA</LoadingButton>
                                    <LoadingButton variant="contained" color="error" event={async () => {
                                        try {
                                            await getUserInfo(user.id);

                                            const banReasons = await axios.get(`/api/admin/ban?h=1`, {
                                                headers: {
                                                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                },
                                            }).then((res) => res.data).catch((err) => err.response.data);

                                            if (banReasons.status === 200) {
                                                setModalData({ ...ModalData, ban: banReasons, info: { ...ModalData.info, id: user.id } });
                                                setModals({ ...Modals, ban: true });
                                            } else {
                                                setErrorMessages(JSON.stringify(banReasons));
                                            }
                                        } catch (error) {
                                            console.error(error);
                                        }
                                    }}>Ban</LoadingButton>
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
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2, "@media screen and (max-width: 600px)": { flexDirection: "column" } }}>
                                    <Typography variant="h5" sx={{ fontWeight: "500" }}>
                                        Admin Users
                                    </Typography>
                                    <Stack direction="row" spacing={2}>
                                        <FormControlLabel control={<Switch checked={hideSensitive} onChange={() => setHideSensitive(!hideSensitive)} />} label="Hide Sensitive" />
                                        <FormControlLabel control={<Switch checked={screenshotMode} onChange={() => setScreenshotMode(!screenshotMode)} />} label="Screenshot Mode" />
                                    </Stack>
                                </Stack>

                                {Modals.info && renderInfoModal()}
                                {Modals.upgrade && renderUpgradeModal()}
                                {Modals.email && renderUpdateEmailModal()}
                                {Modals.disable2FA && renderDisable2FAModal()}
                                {(Modals.ban && ModalData.ban) && renderBanModal()}

                                {renderSearch()}

                                {errorMessages && ( <Alert severity="error" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{errorMessages}</Alert> )}
                                {successMessage && ( <Alert severity="success" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{successMessage}</Alert> )}

                                {users.length > 0 && renderSearchResult()}
                            </CardContent>
                        </Paper>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}