import { useRouter } from "next/router";
import { useQuery } from "react-query"
import { useToken } from "../../src/token";
import { useEffect, useRef, useState } from "react";
import { useQRCode } from "next-qrcode";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import LoadingButton from "../../components/misc/LoadingButton";
import theme from "../../src/theme";

import axios from "axios";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AlertTitle from "@mui/material/AlertTitle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import Grid from "@mui/material/Grid";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { makeXTrack } from "../../src/getIPAddress";
import { IntlRelativeTime } from "../../src/functions";

export default function AccountSettings() {
    const [ token ]: any = useToken()
    const router = useRouter();
    
    const { Canvas: QRCode } = useQRCode();
    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const [twoFASecret, setTwoFASecret] = useState("NULL");
    const [twoFAUrl, setTwoFAUrl] = useState("NULL");

    const [userData, setUserData] = useState({ username: "", email: "", userId: "" });
    const [options, setOptions] = useState({ twoFA: false, darkMode: false });

    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");

    const [confirmCode, setConfirmCode] = useState<string | null>(null);

    const [twoFACode, setTwoFACode] = useState("");

    const [apiTokenName, setApiTokenName] = useState("");
    const [apiTokenExpiration, setApiTokenExpiration] = useState(0);

    const codeRef: any = useRef<HTMLInputElement>();
    const confirmEmailRef: any = useRef<HTMLInputElement>();

    const { data, isError, isLoading, refetch } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: true });

    const { data: apiTokens, isError: apiTokensIsError, isLoading: apiTokensIsLoading, refetch: apiTokensRefetch } = useQuery("apiTokens", async () => await axios.get("/api/v2/self/tokens", {
        headers: { 
            Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
        },
    }), { retry: false, refetchOnWindowFocus: true });

    useEffect(() => {
        if (data && data.username) {
            setUserData({ ...userData, username: data.username, email: data.email, userId: data.userId });
        }
    }, [data]);


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

    function renderSuccessNotification() {
        return (

            <Snackbar open={openS} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                <Alert elevation={6} variant="filled" severity="success">
                    {notiTextS}
                </Alert>
            </Snackbar>
        )
    }

    function renderErrorNotification() {
        return (
            <Snackbar open={openE} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenE(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                <Alert elevation={6} variant="filled" severity="error">
                    {notiTextE}
                </Alert>
            </Snackbar>
        )
    }

    function renderInfoNotification() {
        return (
            <Snackbar open={openI} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenI(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                <Alert elevation={6} variant="filled" severity="info">
                    {notiTextI}
                </Alert>
            </Snackbar>
        )
    }

    function renderUserInfo() {
        return (
            <Stack spacing={2}>
                <TextField label="Account Number" variant="outlined" fullWidth value={data.id} disabled />
                <TextField label="Username" variant="outlined" fullWidth value={userData.username} onChange={(e) => { setUserData({ ...userData, username: e.target.value }) }} />
                <TextField label="Email" variant="outlined" fullWidth value={userData.email} onChange={(e) => { setUserData({ ...userData, email: e.target.value }) }} />
                <TextField label="Discord ID" variant="outlined" fullWidth value={userData.userId ?? ""} onChange={(e) => { setUserData({ ...userData, userId: e.target.value }) }} />

                {((data.username !== userData.username) || (data.email !== userData.email)) && (
                    <Typography variant="body1" sx={{ mb: 2 }} color="text.secondary">
                        Changing {data.username !== userData.username && "your username"}{data.username !== userData.username && data.email !== userData.email && " and "}{data.email !== userData.email && "your email"} requires you to confirm {data.email !== userData.email ? "your old email and " : ""}your password, {data.email !== userData.email ? <b>this will also change your billing email</b> : ""}.
                    </Typography>
                )}



                <TextField sx={{ display: (data.username === userData.username && data.email === userData.email) ? "none" : "block" }} label="Confirm Password" variant="outlined" fullWidth type="password" value={password} onChange={(e) => { setPassword(e.target.value) }} required />
                <LoadingButton sx={{ display: ((data.username === userData.username && data.email === userData.email) || confirmCode !== null) ? "none" : "block" }} event={async () => {
                    if (userData.username.length < 3) {
                        setNotiTextE("Username must be at least 3 characters long");
                        setOpenE(true);
                        return;
                    }

                    try {
                        await axios.patch("/api/v2/self", { 
                            ...((data.username !== userData.username) ? { username: userData.username } : {}),
                            ...((data.email !== userData.email) ? { email: userData.email } : {}),
                            password: password 
                        }, { 
                            headers: { 
                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                "x-track": makeXTrack()
                            },
                            validateStatus: () => true
                        }).then((res) => {
                            if (res.data.success) {
                                setNotiTextS(res.data.message);
                                setOpenS(true);

                                // if response code is 201 (created), then we need to confirm email so hide the fields and show the confirm code field
                                if (res.status === 201) {
                                    setConfirmCode("");
                                    setPassword("");
                                    confirmEmailRef.current.style.display = "block";
                                    confirmEmailRef.current.focus();
                                }
                            } else {
                                setNotiTextE(res.data.message);
                                setOpenE(true);
                            }
                        });
                    } catch (e) {
                        console.error(e);
                        setNotiTextE("An error occurred");
                        setOpenE(true);
                    }
                }}>Save Changes</LoadingButton>

                <TextField sx={{ display: "none" }} label="Email Confirmation Code" variant="outlined" fullWidth type="text" value={confirmCode} onChange={(e) => { setConfirmCode(e.target.value) }} required ref={confirmEmailRef} />
                <LoadingButton sx={{ display: confirmCode === null ? "none" : "block" }} event={async () => {
                    try {
                        await axios.patch("/api/v2/self", { 
                            password: password,
                            email: userData.email,
                            code: confirmCode 
                        }, { 
                            headers: { 
                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                "x-track": makeXTrack()
                            },
                            validateStatus: () => true
                        }).then((res) => {
                            if (res.data.success) {
                                refetch();
                                setNotiTextS(res.data.message);
                                setOpenS(true);

                                setPassword("");
                                setConfirmCode(null);

                                confirmEmailRef.current.style.display = "none";
                            } else {
                                setNotiTextE(res.data.message);
                                setOpenE(true);
                            }
                        });
                    } catch (e) {
                        console.error(e);
                        setNotiTextE("An error occurred");
                        setOpenE(true);
                    }
                }}>Confirm Email</LoadingButton>


                <LoadingButton sx={{ display: data.userId === userData.userId ? "none" : "block" }} event={async () => {
                    if (userData.userId.length < 16 || userData.userId.length > 19) {
                        setNotiTextE("Discord ID must be a valid ID");
                        setOpenE(true);
                        return;
                    }

                    try {
                        await axios.patch("/api/v2/self", { 
                            userId: userData.userId, 
                        }, { 
                            headers: { 
                                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                "x-track": makeXTrack()
                            },
                            validateStatus: () => true
                        }).then((res) => {
                            if (res.data.success) {
                                refetch();
                                setNotiTextS(res.data.message);
                                setOpenS(true);
                            } else {
                                setNotiTextE(res.data.message);
                                setOpenE(true);
                            }
                        });
                    } catch (e) {
                        console.error(e);
                        setNotiTextE("An error occurred");
                        setOpenE(true);
                    }
                }}>Save Changes</LoadingButton>
            </Stack>
        )
    }
   
    function renderSubscription() {
        return (
            <Box sx={{ mt: 2 }}>
                <b>Subscription:</b>
                <Typography variant="body1">
                    <li><b>Type</b>: {data.role.charAt(0).toUpperCase() + data.role.slice(1)}</li>
                </Typography>
                <Typography variant="body1">
                    <li><b>Expires</b>: {new Intl.DateTimeFormat(navigator.language, { year: "numeric", month: "long", day: "2-digit" }).format(new Date(data.expiry))}</li>
                </Typography>
            </Box>
        )
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />
                    <Container maxWidth="xl">

                        {openS ? renderSuccessNotification() : null}
                        {openE ? renderErrorNotification() : null}
                        {openI ? renderInfoNotification() : null}

                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                    Account
                                </Typography>

                                {renderUserInfo()}
                        
                                {data.role !== "free" ? renderSubscription() : null}
                            </CardContent>
                        </Paper>

                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                    Security
                                </Typography>

                                {/* <Typography variant="body1" sx={{ mb: 2 }}>
                                    <b>2FA Status</b>: {data.tfa ? "Enabled" : "Disabled"}
                                </Typography> */}

                                {(!options.twoFA) && (
                                    <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems="center">
                                        {data.tfa == 1 ? <TaskAltIcon sx={{ color: theme.palette.success.main }} /> : <HighlightOffIcon sx={{ color: theme.palette.error.main }} />}
                                        <Typography variant="body1" sx={{ mb: 2 }}>{data.tfa == 1 ? "Your account is secured by two-factor authentication." : "Your account is not secured by two-factor authentication."}</Typography>
                                        {data.tfa == 1 ? ( <LoadingButton variant="contained" color="error" event={() => { setOptions({ ...options, twoFA: true }) }} sx={{ ml: { sm: "auto !important" }, width: { xs: "100%", sm: "unset !important" } }}>Disable</LoadingButton> ) : ( <LoadingButton variant="contained" color="success" event={() => { setOptions({ ...options, twoFA: true }) }} sx={{ ml: { sm: "auto !important" }, width: { xs: "100%", sm: "unset !important" } }}>Enable</LoadingButton> )}
                                    </Stack>
                                )}

                                {twoFASecret !== "NULL" ? (
                                    <>
                                        <QRCode text={twoFAUrl} options={{ type: "image/png", level: "H", margin: 0, scale: 6, color: { dark: "#ffffff", light: "#1e1e1e", } }} />
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            Or use the secret (hover for 3s): <Typography variant="caption" sx={{ filter: "blur(0.25rem)", transition: "0.5s all", transitionDelay: "0s", [`&:hover`]: { filter: "blur(0px)", transitionDelay: "0.5s", } }}>{twoFASecret}</Typography>
                                        </Typography>
                                    </>
                                ) : null}

                                {options.twoFA && (
                                    <Stack spacing={2}>
                                        {(data.tfa == 1) && (
                                            <>
                                                <Alert severity="warning">
                                                    <AlertTitle>Warning</AlertTitle>
                                                    Once 2FA is disabled, anyone with your password can access your account.
                                                </Alert>
                                                <TextField label="Current 2FA code" variant="outlined" type="twoFACode" placeholder="123 456" defaultValue="" fullWidth required onChange={(e) => { setTwoFACode(e.target.value); }} onPaste={(e) => { setTwoFACode(e.clipboardData.getData("text")); }} />
                                                <TextField label="Confirm Password" variant="outlined" type="password" fullWidth required onChange={(e) => { setPassword(e.target.value); }} />
                                                <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems="center">
                                                    <LoadingButton color="error" sx={{ width: "100%" }} event={async () => {
                                                        try {
                                                            await axios.patch("/api/v2/self", { 
                                                                password: password,
                                                                code: twoFACode,
                                                            }, {
                                                                headers: { 
                                                                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                                    "x-track": makeXTrack()
                                                                },
                                                                validateStatus: () => true
                                                            }).then((res) => {
                                                                if (res.data.success) {
                                                                    refetch();
                                                                    setNotiTextS(res.data.message);
                                                                    setOpenS(true);
                                                                } else {
                                                                    setNotiTextE(res.data.message);
                                                                    setOpenE(true);
                                                                }
                                                            });
                                                        } catch (e) {
                                                            console.error(e);
                                                            setNotiTextE("An error occurred");
                                                            setOpenE(true);
                                                        }
                                                    }}>Remove 2-Factor Authentication</LoadingButton>
                                                    <LoadingButton color="info" event={() => { setOptions({ ...options, twoFA: false }) }}>Cancel</LoadingButton>
                                                </Stack>
                                            </>
                                        )}

                                        {(twoFASecret == "NULL" && data.tfa == 0) && (
                                            <>
                                                <TextField label="Confirm Password" variant="outlined" type="password" fullWidth required onChange={(e) => { setPassword(e.target.value); }} />
                                                <LoadingButton event={() => {
                                                    setNotiTextI("Updating...");
                                                    setOpenI(true);

                                                    axios.patch(`/api/v2/self`, {
                                                        password: password,
                                                    }, {
                                                        headers: {
                                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                            "x-track": makeXTrack()
                                                        },
                                                        validateStatus: () => true
                                                    }).then((res: any) => {
                                                        setOpenI(false);
        
                                                        if (!res.data.success) {
                                                            setNotiTextE(res.data.message);
                                                            setOpenE(true);
                                                        }
                                                        else {
                                                            setNotiTextS(res.data.message);
                                                            setOpenS(true);
                                                            setTwoFASecret(res.data.secret);
                                                            setTwoFAUrl(res.data.url);
                                                        }
                                                    }).catch((err: any) => {
                                                        console.error(err);
                                                        setNotiTextE(err);
                                                        setOpenE(true);
                                                    });
                                                }}>
                                                    Start 2FA Setup
                                                </LoadingButton>
                                            </>
                                        )}
                                        {(twoFASecret !== "NULL" && data.tfa == 0) && (
                                            <>
                                                <TextField label="2-Factor Authentication code" variant="outlined" type="twoFACode" placeholder="123 456" defaultValue="" fullWidth required onChange={(e) => { setTwoFACode(e.target.value); }} onPaste={(e) => { setTwoFACode(e.clipboardData.getData("text")); }} />
                                                <LoadingButton variant="contained" color="success" event={() => { 
                                                    setNotiTextI("Updating...");
                                                    setOpenI(true);

                                                    axios.patch(`/api/v2/self`, {
                                                        password: password,
                                                        code: twoFACode,
                                                    }, {
                                                        headers: {
                                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                            "x-track": makeXTrack()
                                                        },
                                                        validateStatus: () => true
                                                    }).then((res: any) => {
                                                        setOpenI(false);
        
                                                        if (!res.data.success) {
                                                            setNotiTextE(res.data.message);
                                                            setOpenE(true);
                                                        }
                                                        else {
                                                            setNotiTextS(res.data.message);
                                                            setOpenS(true);
                                                
                                                            setTimeout(() => {
                                                                location.reload();
                                                            }, 2000);
                                                        }
                                        
                                                    }).catch((err: any) => {
                                                        console.error(err);
                                                        setNotiTextE(err);
                                                        setOpenE(true);
                                                    });
                                                }}>
                                                    Enable 2FA
                                                </LoadingButton>
                                            </>
                                        )}
                                    </Stack>
                                )}
                            </CardContent>
                        </Paper>

                        {data.admin && (
                            <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                                <CardContent sx={{ pb: "1rem !important" }}>
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                        API Tokens
                                    </Typography>

                                    {apiTokensIsLoading && (
                                        <Stack spacing={2}>
                                            <CircularProgress />
                                        </Stack>
                                    )}

                                    {apiTokensIsError && (
                                        <Stack spacing={2}>
                                            <Typography variant="body1" sx={{ mb: 2 }}>
                                                An error occurred while loading your tokens.
                                            </Typography>
                                        </Stack>
                                    )}

                                    <form method="POST">
                                        <Stack spacing={2}>
                                            <TextField label="Token Name" variant="outlined" fullWidth required onChange={(e) => { setApiTokenName(e.target.value); }} />
                                            <TextField label="Token Expiration (in days)" variant="outlined" fullWidth required onChange={(e) => { setApiTokenExpiration(parseInt(e.target.value)); }} />

                                            <LoadingButton sx={{ mt: 2, width: "100%" }} event={async() => {
                                                await axios.post(`/api/v2/self/tokens`, {
                                                    name: apiTokenName,
                                                    expiration: apiTokenExpiration,
                                                }, {
                                                    headers: {
                                                        "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    },
                                                    validateStatus: () => true
                                                }).then((res: any) => {
                                                    setOpenI(false);
        
                                                    if (!res.data.success) {
                                                        setNotiTextE(res.data.message);
                                                        setOpenE(true);
                                                    }
                                                    else {
                                                        setNotiTextS(res.data.message);
                                                        setOpenS(true);
                                            
                                                        apiTokensRefetch();
                                                    }
                                        
                                                }).catch((err: any) => {
                                                    console.error(err);
                                                    setNotiTextE(err);
                                                    setOpenE(true);
                                                });
                                            }}>Create Token</LoadingButton>
                                        </Stack>
                                    </form>

                                    {apiTokens && apiTokens.data.sessions.length > 0 && (
                                        <Stack spacing={2} sx={{ mt: 2 }}>
                                            <Typography variant="body1">
                                                You have {apiTokens.data.sessions.length} API Token{apiTokens.data.sessions.length > 1 ? "s" : ""}.
                                            </Typography>

                                            {apiTokens.data.sessions.map((token: any) => (
                                                <Paper key={token.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                                    <CardContent>
                                                        <Grid container direction="row" justifyContent={"space-between"}>
                                                            <Grid item sx={{ wordBreak: "break-word" }}>
                                                                {token.name}
                                                                <Typography variant="body2" color="textSecondary">ID: {token.id}</Typography>
                                                                <Typography variant="body2" color="textSecondary">Expiration: {IntlRelativeTime(new Date(token.expiry).getTime())}</Typography>
                                                                <Typography variant="body2" color="textSecondary">Created: {IntlRelativeTime(new Date(token.createdAt).getTime())}</Typography>
                                                            </Grid>
                                                            <Stack direction="column" spacing={2}>
                                                                <LoadingButton variant="contained" color="info" sx={{  width: "100%", maxWidth: "100%", }} event={() => {
                                                                    navigator.clipboard.writeText(token.token);
                                                                    setNotiTextS("Copied to clipboard");
                                                                    setOpenS(true);

                                                                    setTimeout(() => {
                                                                        setOpenS(false);
                                                                    }, 3000);
                                                                }}>Copy</LoadingButton>
                                                                <LoadingButton variant="contained" color="error" sx={{  width: "100%", maxWidth: "100%", }} event={async() => {
                                                                    await axios.delete(`/api/v2/self/tokens`, {
                                                                        headers: {
                                                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                                        },
                                                                        data: {
                                                                            id: token.id
                                                                        },
                                                                        validateStatus: () => true
                                                                    }).then((res: any) => {
                                                                        setOpenI(false);
            
                                                                        if (!res.data.success) {
                                                                            setNotiTextE(res.data.message);
                                                                            setOpenE(true);
                                                                        }
                                                                        else {
                                                                            setNotiTextS(res.data.message);
                                                                            setOpenS(true);
                                                                
                                                                            apiTokensRefetch();
                                                                        }
                                                            
                                                                    }).catch((err: any) => {
                                                                        console.error(err);
                                                                        setNotiTextE(err);
                                                                        setOpenE(true);
                                                                    });

                                                                }}>Delete</LoadingButton>
                                                            </Stack>
                                                        </Grid>
                                                    </CardContent>
                                                </Paper>
                                            ))}

                                        </Stack>
                                    )}
                                </CardContent>
                            </Paper>
                        )}

                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <form method="POST">
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                        Change password
                                    </Typography>

                                    <Stack spacing={2}>
                                        <TextField label="Old password" variant="outlined" type="password" fullWidth required onChange={(e) => { setPassword(e.target.value); }} />
                                        <TextField label="New password" variant="outlined" type="password" fullWidth required onChange={(e) => { setNewPassword(e.target.value); }} />
                                        <TextField label="Confirm password" variant="outlined" type="password" fullWidth required onChange={(e) => { setNewPassword2(e.target.value); }} />
                                        <TextField label="Code" variant="outlined" fullWidth required onChange={(e) => { setConfirmCode(e.target.value); }} ref={codeRef} sx={{ display: "none" }} />
                                    </Stack>

                                    <LoadingButton sx={{ mt: 2, width: "100%" }} event={() => {
                                        setNotiTextI("Updating...");
                                        setOpenI(true);
                            
                                        axios.post(`/api/v2/self`, {
                                            password: password,
                                            newPassword: newPassword,
                                            newPassword2: newPassword2,
                                            confirmCode: confirmCode
                                        }, {
                                            headers: {
                                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                            },
                                            validateStatus: () => true
                                        }).then((res: any) => {
                                            setOpenI(false);

                                            if (!res.data.success) {
                                                setNotiTextE(res.data.message);
                                                setOpenE(true);
                                            }
                                            else {
                                                setNotiTextS(res.data.message);
                                                setOpenS(true);
                                        
                                                if (res.data.message.includes("changed")) {
                                                    setTimeout(() => {
                                                        router.push(`/login`);
                                                    }, 2000);
                                                } else {
                                                    if (codeRef.current) {
                                                        codeRef.current.style.display = "block";
                                                        codeRef.current.focus();
                                                    }
                                                }
                                            }
                                
                                        }).catch((err: any) => {
                                            console.error(err);
                                            setNotiTextE(err);
                                            setOpenE(true);
                                        });
                                    }}>Change password</LoadingButton>
                                </form>
                            </CardContent>
                        </Paper>



                        {/* <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #ff0000" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                    Delete account
                                </Typography>

                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    <b>Warning</b>: This action cannot be undone.
                                </Typography>

                                <Button variant="contained" color="error" fullWidth onClick={(e: any) => { setOpenE(true); setNotiTextE("Account deleted"); }}>
                                    Delete account
                                </Button>
                            </CardContent>
                        </Paper> */}


                    </Container>
                </NavBar>
            </Box>
        </>
    )
}