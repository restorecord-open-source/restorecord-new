import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../../src/token";
import { useState } from "react";
import { AvatarFallback, IntlRelativeTime } from "../../../src/functions";

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
import Link from "@mui/material/Link";
import { Avatar } from "@mui/material";

export default function AdminMember() {
    const router = useRouter();
    const [token]: any = useToken()
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessages, setErrorMessages]: any = useState("");
    const [successMessage, setSuccessMessage]: any = useState("");

    const [members, setMembers]: any = useState({});

    const [hideSensitive, setHideSensitive] = useState(false);
    const [screenshotMode, setScreenshotMode] = useState(false);

    const [Modals, setModals]: any = useState({
        info: false,
    });

    const [ModalData, setModalData]: any = useState({
        info: {},
        query: {
            rows: 0,
            time: 0,
        },
    });

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
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

    async function getMemberInfo(memberId: any) {
        await axios.post("/api/admin/members", { dcId: memberId }, {
            headers: {
                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        }).then((res: any) => {
            setModalData({ ...ModalData, info: res.data.members[0] });
        }).catch((err) => {
            console.error(err);
            setErrorMessages(JSON.stringify(err.response.data));
        });
    }

    function renderInfoModal() {
        return (
            <Dialog open={Modals.info} onClose={() => setModals({ ...Modals, info: false })} fullWidth maxWidth="sm">
                <DialogTitle id="alert-dialog-title">
                    Member info
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
                        }) ?? "No data"}
                    </Paper>
                </DialogContent>
            </Dialog>
        );
    }

    function renderSearch() {
        return (
            <form onSubmit={async (e) => {
                e.preventDefault();
                setMembers({});
                setErrorMessages("");
                setSuccessMessage("");
                await axios.post("/api/admin/members", { query: searchQuery }, {
                    headers: {
                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                    },
                }).then((res: any) => {
                    setMembers(res.data.members);
                    setModalData({ ...ModalData, query: { rows: res.data.rows, time: res.data.time } });
                }).catch((err) => {
                    console.error(err);
                    setErrorMessages(JSON.stringify(err.response.data));
                });
            }}>
                <Stack direction="column" spacing={2}>
                    <TextField label="Search" variant="outlined" placeholder="Discord ID" onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button variant="contained" type="submit">Get member info</Button>
                    <Alert severity="info" sx={{ bgcolor: "#000", color: "#fff" }}>{ModalData.query.rows} members in {ModalData.query.time} sec</Alert>
                </Stack>
            </form>
        );
    }

    function renderSearchResult() {
        return (
            <>
                {members.map((member: any) => (
                    <Paper sx={{ background: "#0a0a0a", mt: 2, p: 3, borderRadius: "1rem", border: `1px solid ${screenshotMode ? theme.palette.primary.main : "#0a0a0a"}` }} key={member.id}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                                <AvatarFallback url={member.avatar ? `https://cdn.discordapp.com/avatars/${member.userId}/${member.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(member.username.split("#")[1]) % 5}.png?size=128`} fallback={`https://cdn.discordapp.com/embed/avatars/${Number(member.username.split("#")[1]) % 5}.png?size=512`} username={member.username} sx={{ width: "100px", height: "100px" }} />
                                <CardContent sx={{ pb: "1rem !important" }}>
                                    {Object.entries(member).map(([key, value]) => {
                                        let newKey = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/(?:^|\s)([a-z])/g, (_, c) => c.toUpperCase());

                                        if (hideSensitive && (key === "ip" || key === "isp" || key === "city" || key === "state" || key === "country")) return null;
                                        if (key === "avatar") return null;

                                        if (screenshotMode) {
                                            switch (key) {
                                            case "createdAt": newKey = "Verified"; break;
                                            case "vpn": newKey = "VPN"; break;
                                            case "isp": newKey = "ISP"; break;
                                            case "guildId": newKey = "Server"; break;
                                            case "username":
                                                if (typeof value === "string" && value.endsWith("#0")) {
                                                    newKey = "Username";
                                                    value = `@${value}`.slice(0, -2);
                                                }
                                                break;
                                            }
                                        }

                                        if (value instanceof Date || key === "createdAt" || key === "updatedAt" || key === "expiry") {
                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code onClick={() => { navigator.clipboard.writeText(new Date(value as any).toLocaleDateString()); setSuccessMessage("Copied to clipboard!"); setTimeout(() => { setSuccessMessage(""); }, 1500); }} style={{ cursor: "pointer" }}>{new Intl.DateTimeFormat("en-UK", { dateStyle: "medium" }).format(new Date(value as any))} ({IntlRelativeTime(new Date(value as any).getTime()) ?? "Unknown"})</code></b></Typography>);
                                        } else if (key === "guildId") {
                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code><Link href={`/verify/${String(value)}`} target="_blank">{String(value)}</Link></code></b></Typography>);
                                        } else if (typeof value === "boolean") {
                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code style={{ color: value ? "#00d26a" : "#f92f60" }}>{value ? "✅ Yes" : "❌ No"}</code></b></Typography>);
                                        } else if (typeof value === "string") {
                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code onClick={() => { navigator.clipboard.writeText(value as string); setSuccessMessage("Copied to clipboard!"); setTimeout(() => { setSuccessMessage(""); }, 1500); }} style={{ cursor: "pointer" }}>{key === "role" ? value.charAt(0).toUpperCase() + value.slice(1) : value}</code></b></Typography>);
                                        } else {
                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{newKey}: <b><code onClick={() => { navigator.clipboard.writeText(JSON.stringify(value)); setSuccessMessage("Copied to clipboard!"); setTimeout(() => { setSuccessMessage(""); }, 1500); }} style={{ cursor: "pointer" }}>{JSON.stringify(value)}</code></b></Typography>);
                                        }
                                    })}
                                </CardContent>
                            </Stack>
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
                                        Admin Members
                                    </Typography>
                                    <Stack direction="row" spacing={2}>
                                        <FormControlLabel control={<Switch checked={hideSensitive} onChange={() => setHideSensitive(!hideSensitive)} />} label="Hide Sensitive" />
                                        <FormControlLabel control={<Switch checked={screenshotMode} onChange={() => setScreenshotMode(!screenshotMode)} />} label="Screenshot Mode" />
                                    </Stack>
                                </Stack>

                                {Modals.info && renderInfoModal()}

                                {renderSearch()}

                                {errorMessages && ( <Alert severity="error" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{errorMessages}</Alert> )}
                                {successMessage && ( <Alert severity="success" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{successMessage}</Alert> )}

                                {members.length > 0 && renderSearchResult()}
                            </CardContent>
                        </Paper>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}