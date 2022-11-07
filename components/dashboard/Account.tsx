import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useToken } from "../../src/token";

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
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import { useQRCode } from "next-qrcode";

export default function Account({ user }: any) {
    const [token]: any = useToken();
    const { Canvas: QRCode } = useQRCode();
    const router = useRouter();

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

    return (
        <>
            <Container maxWidth="xl">
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

                <Snackbar open={openI} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenI(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <Alert elevation={6} variant="filled" severity="info">
                        {notiTextI}
                    </Alert>
                </Snackbar>

                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Settings
                        </Typography>

                        <Stack spacing={2}>
                            <TextField label="User ID" variant="outlined" fullWidth value={user.id} disabled />
                            <TextField label="Username" variant="outlined" fullWidth value={user.username} disabled />
                            {/* <TextField label="Email" variant="outlined" fullWidth value={user.email} disabled /> */}
                        </Stack>
                        
                        {user.role !== "free" && (
                            <Box sx={{ mt: 2 }}>
                                <b>Subscription:</b>
                                <Typography variant="body1">
                                    <li><b>Type</b>: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</li>
                                </Typography>
                                <Typography variant="body1">
                                    <li><b>Expires</b>: {new Intl.DateTimeFormat(navigator.language, { year: "numeric", month: "long", day: "2-digit" }).format(new Date(user.expiry))}</li>
                                </Typography>
                            </Box>
                        )}

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
                        <Badge badgeContent={<>BETA</>} color="primary" sx={{ [`& .MuiBadge-badge`]: { mt: "1.5rem", mr: "-2.5rem", color: "#fff", padding: "0.85rem", fontSize: "0.95rem", fontWeight: "bold" } }}>
                            <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                2-Factor Authentication
                            </Typography>
                        </Badge>

                        <Typography variant="body1" sx={{ mb: 2 }}>
                            <b>2-Factor Authentication Status</b>: {user.tfa ? "Enabled" : "Disabled"}
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
                            {user.tfa === true && ( 
                                <LoadingButton variant="contained" color="primary" loading={loading2} sx={{ mt: 2}} fullWidth onClick={() => { }} disabled>Remove 2-Factor Authentication</LoadingButton>
                            )}

                            {(twoFASecret == "NULL" && user.tfa == false) && (
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
                                    Start 2-Factor Authentication Setup
                                </LoadingButton>
                            )}
                            {(twoFASecret !== "NULL" && user.tfa == false) && (
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
                                        Enable 2-Factor Authentication
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
        </>
    )
}