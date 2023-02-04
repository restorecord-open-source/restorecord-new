import { useRouter } from "next/router";
import { useQuery } from "react-query"
import { useToken } from "../../src/token";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { useQRCode } from "next-qrcode";
import { useRef, useState } from "react";

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

    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    const [loading4, setLoading4] = useState(false);

    const [twoFASecret, setTwoFASecret] = useState("NULL");
    const [twoFAUrl, setTwoFAUrl] = useState("NULL");

    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [confirmCode, setConfirmCode] = useState("");

    const [twoFACode, setTwoFACode] = useState("");

    const codeRef: any = useRef<HTMLInputElement>();

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: true });


    if (isLoading) {
        return <CircularProgress />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress />
    }

    function renderSuccessNotificaton() {
        return (

            <Snackbar open={openS} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                <Alert elevation={6} variant="filled" severity="success">
                    {notiTextS}
                </Alert>
            </Snackbar>
        )
    }

    function renderErrorNotificaton() {
        return (
            <Snackbar open={openE} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenE(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                <Alert elevation={6} variant="filled" severity="error">
                    {notiTextE}
                </Alert>
            </Snackbar>
        )
    }

    function renderInfoNotificaton() {
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
                <TextField label="User ID" variant="outlined" fullWidth value={data.id} disabled />
                <TextField label="Username" variant="outlined" fullWidth value={data.username} disabled />
                {/* <TextField label="Email" variant="outlined" fullWidth value={user.email} disabled /> */}
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

                        {openS ? renderSuccessNotificaton() : null}
                        {openE ? renderErrorNotificaton() : null}
                        {openI ? renderInfoNotificaton() : null}
                        

                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                    Account
                                </Typography>

                                {renderUserInfo()}
                        
                                {data.role !== "free" ? renderSubscription() : null}

                                {/* <LoadingButton variant="contained" color="primary" loading={loading1} sx={{ mt: 2}} fullWidth onClick={() => { 
                                    setLoading1(true);
                                    setNotiTextI("Updating...");
                                    setOpenI(true);

                                    setTimeout(() => {
                                        setOpenI(false);
                                        setLoading1(false);
                                        setOpenS(true);
                                        setNotiTextS("Updated");
                                    }, 1000);
                                }}>Update</LoadingButton> */}
                            </CardContent>
                        </Paper>

                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                    2FA
                                </Typography>

                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    <b>2FA Status</b>: {data.tfa ? "Enabled" : "Disabled"}
                                </Typography>

                                {twoFASecret !== "NULL" ? (
                                    <>
                                        <QRCode 
                                            text={twoFAUrl}
                                            options={{
                                                type: "image/png",
                                                level: "H",
                                                margin: 0,
                                                scale: 6,
                                                color: {
                                                    dark: "#ffffff",
                                                    light: "#1e1e1e",
                                                }
                                            }} />
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            Or use the secret (hover for 3s): <Typography variant="caption" sx={{
                                                filter: "blur(0.25rem)",
                                                transition: "0.5s all",
                                                transitionDelay: "0s",
                                                [`&:hover`]: {
                                                    filter: "blur(0px)",
                                                    transitionDelay: "0.5s",
                                                },
                                            }}>{twoFASecret}</Typography>
                                        </Typography>
                                    </>
                                ) : null}

                                <Stack spacing={2}>
                                    <TextField label="Confirm Password" variant="outlined" type="password" fullWidth required onChange={(e) => { setPassword(e.target.value); }} onPaste={(e) => { setPassword(e.clipboardData.getData("text")); }} />
                                    {data.tfa === true && ( 
                                        <LoadingButton variant="contained" color="primary" loading={loading2} sx={{ mt: 2}} fullWidth onClick={() => { }} disabled>Remove 2-Factor Authentication</LoadingButton>
                                    )}

                                    {(twoFASecret == "NULL" && data.tfa == false) && (
                                        <LoadingButton variant="contained" color="primary" loading={loading2} fullWidth onClick={(e: any) => {
                                            setLoading2(true);
                                            setNotiTextI("Updating...");
                                            setOpenI(true);

                                            axios.patch(`/api/v1/user`, {
                                                password: password,
                                                code: twoFACode,
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
                                                    setTwoFASecret(res.data.secret);
                                                    setTwoFAUrl(res.data.url);
                                                }
                                        
                                                setTimeout(() => {
                                                    setLoading2(false);
                                                }, 500);
                                            }).catch((err: any) => {
                                                console.error(err);
                                                setNotiTextE(err);
                                                setOpenE(true);
                                            });
                                        }}>
                                        Start 2FA Setup
                                        </LoadingButton>
                                    )}
                                    {(twoFASecret !== "NULL" && data.tfa == false) && (
                                        <>
                                            <TextField label="2-Factor Authentication code" variant="outlined" type="twoFACode" placeholder="123 456" defaultValue="" fullWidth required onChange={(e) => { setTwoFACode(e.target.value); }} onPaste={(e) => { setTwoFACode(e.clipboardData.getData("text")); }} />
                                            <LoadingButton variant="contained" color="success" loading={loading1} fullWidth onClick={(e: any) => { 
                                                setLoading1(true);
                                                setNotiTextI("Updating...");
                                                setOpenI(true);

                                                axios.patch(`/api/v1/user`, {
                                                    password: password,
                                                    code: twoFACode,
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
                                                
                                                        setTimeout(() => {
                                                            location.reload();
                                                        }, 2000);
                                                    }
                                        
                                                    setTimeout(() => {
                                                        setLoading1(false);
                                                    }, 500);
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
                            </CardContent>
                        </Paper>

                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                            <CardContent>
                                <form method="POST">
                                    <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                Change password
                                    </Typography>

                                    <Stack spacing={2}>
                                        <TextField label="Old password" variant="outlined" type="password" fullWidth required onChange={(e) => { setPassword(e.target.value); }} onPaste={(e) => { setPassword(e.clipboardData.getData("text")); }} />
                                        <TextField label="New password" variant="outlined" type="password" fullWidth required onChange={(e) => { setNewPassword(e.target.value); }} onPaste={(e) => { setNewPassword(e.clipboardData.getData("text")); }} />
                                        <TextField label="Confirm password" variant="outlined" type="password" fullWidth required onChange={(e) => { setNewPassword2(e.target.value); }} onPaste={(e) => { setNewPassword2(e.clipboardData.getData("text")); }} />
                                        <TextField label="Code" variant="outlined" fullWidth required onChange={(e) => { setConfirmCode(e.target.value); }} onPaste={(e) => { setConfirmCode(e.clipboardData.getData("text")); }} ref={codeRef} sx={{ display: "none" }} />
                                    </Stack>

                                    <LoadingButton variant="contained" color="primary" loading={loading3} fullWidth sx={{ mt: 2 }} onClick={(e: any) => {
                                        setLoading3(true);
                                        setNotiTextI("Updating...");
                                        setOpenI(true);
                            
                                        axios.post(`/api/v1/user`, {
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
                                
                                            setTimeout(() => {
                                                setLoading3(false);
                                            }, 500);
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
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
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