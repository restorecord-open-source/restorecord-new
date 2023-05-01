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

export default function AdminUser() {
    const router = useRouter();
    const [token]: any = useToken()
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessages, setErrorMessages]: any = useState("");
    const [successMessage, setSuccessMessage]: any = useState("");

    const [users, setUsers]: any = useState({});

    const [Modals, setModals]: any = useState({
        info: false,
        upgrade: false,
        updateEmail: false,
        disable2FA: false,
        ban: false,
    });

    const [ModalData, setModalData]: any = useState({
        info: {},
        upgrade: {},
        updateEmail: {},
        disable2FA: {},
        ban: {},
    });

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });


    if (isLoading) {
        return <CircularProgress />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress />
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
            console.log(res.data.users[0]);
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
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        User ID: <code>{ModalData.info.id}</code><br />
                        Username: <code>{ModalData.info.username}</code><br />
                        Current Plan: <code>{ModalData.info.role}</code><br />
                        {/* Expires at: <code>{new Date(ModalData.info.expiry).toLocaleDateString()}</code><br /> */}
                        Expiry: <code>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ModalData.info.expiry))}</code><br />
                    </Typography>

                    <FormControl fullWidth variant="outlined" required>
                        <InputLabel id="plan-select-label">Select Plan</InputLabel>
                        <Select labelId="plan-select-label" variant="outlined" sx={{ width: "100%" }}>
                            <MenuItem value="free">Free (Default)</MenuItem>
                            <MenuItem value="premium">Premium</MenuItem>
                            <MenuItem value="business">Business</MenuItem>
                            <MenuItem value="premium_1m">Premium 1 month</MenuItem>
                            <MenuItem value="business_1m">Business 1 month</MenuItem>
                        </Select>

                        <Button variant="contained" sx={{ mt: 2 }} onClick={async () => {
                            console.log("upgrade");
                            setModals({ ...Modals, upgrade: false });
                        }}>Upgrade</Button>
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

                        <Button variant="contained" color="yellow" sx={{ mt: 2 }} onClick={async () => {
                            console.log("update email");
                            setModals({ ...Modals, email: false });
                        }}>Send Verification Code</Button>
                        <Button variant="contained" sx={{ mt: 2 }} onClick={async () => {
                            console.log("update email");
                            setModals({ ...Modals, email: false });
                        }}>Update</Button>
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
                        <Button variant="contained" sx={{ mt: 2 }} onClick={async () => {
                            console.log("disable 2fa");
                            setModals({ ...Modals, disable2FA: false });
                        }}>Disable 2FA</Button>
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
                            ...ModalData.ban,
                            reason: e.target.value
                        }})}>
                            {ModalData?.ban?.reasons?.map((reason: any) => (
                                <MenuItem key={reason.id} value={reason.id}>{reason.id} - {reason.reason}</MenuItem>
                            ))}
                        </Select>

                        <Button variant="contained" sx={{ mt: 2 }} onClick={async () => {
                            await axios.post("/api/admin/ban", { userId: ModalData.info.id, reason: ModalData.ban.reason }, {
                                headers: {
                                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                },
                            }).then((res: any) => {
                                console.log(res.data);
                                setSuccessMessage(res.data.message);
                            }).catch((err) => {
                                console.error(err);
                                setErrorMessages(JSON.stringify(err.response.data));
                            });
                            setModals({ ...Modals, ban: false });
                        }}>Ban</Button>
                    </FormControl>
                </DialogContent>
            </Dialog>
        );
    }

    function renderSearch() {
        return (
            <form onSubmit={async (e) => {
                e.preventDefault();
                setUsers({});
                setErrorMessages("");
                await axios.post("/api/admin/lookup", { query: searchQuery }, {
                    headers: {
                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                    },
                }).then((res: any) => {
                    console.log(res.data.user);
                    setUsers(res.data.users);
                }).catch((err) => {
                    console.error(err);
                    setErrorMessages(JSON.stringify(err.response.data));
                });
            }}>
                <Stack direction="column" spacing={2}>
                    <TextField label="Search" variant="outlined" placeholder="User ID/Username/Email" onChange={(e) => setSearchQuery(e.target.value)} />
                    <Button variant="contained" type="submit">Get user info</Button>
                </Stack>
            </form>
        );
    }

    function renderSearchResult() {
        return (
            <>
                {users.map((user: any) => (
                    <Paper sx={{ background: "#000", mt: 2, p: 3, borderRadius: "1rem" }} key={user.id}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                            <CardContent>
                                {Object.entries(user).map(([key, value]) => {
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
                            </CardContent>
                            <CardContent>
                                <Stack direction="column" spacing={2}>
                                    <Button variant="contained" color="info" onClick={async () => {
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, info: true });
                                    }}>More info</Button>
                                    <Button variant="contained" color="yellow" onClick={async () => {
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, upgrade: true });
                                    }}>Upgrade</Button>
                                    <Button variant="contained" color="primary" onClick={async () => {
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, email: true });
                                    }}>Update Email</Button>
                                    <Button variant="contained" color="error" onClick={async () => {
                                        getUserInfo(user.id);
                                        setModals({ ...Modals, disable2FA: true });
                                    }}>Disable 2FA</Button>
                                    <Button variant="contained" color="error" onClick={async () => {
                                        getUserInfo(user.id);

                                        let banReasons = await axios.get(`/api/admin/ban?h=1`, {
                                            headers: {
                                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                            },
                                        }).then((res) => res.data).catch((err) => err.response.data);


                                        if (banReasons.status === 200) {
                                            setModalData({ ...ModalData, ban: banReasons });
                                            setModals({ ...Modals, ban: true });
                                        } 
                                        else {
                                            setErrorMessages(JSON.stringify(banReasons));
                                        }
                                    }}>Ban</Button>
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
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                    Admin Users
                                </Typography>

                                {Modals.info && renderInfoModal()}
                                {Modals.upgrade && renderUpgradeModal()}
                                {Modals.email && renderUpdateEmailModal()}
                                {Modals.disable2FA && renderDisable2FAModal()}
                                {Modals.ban && renderBanModal()}

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