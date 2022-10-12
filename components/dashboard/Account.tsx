import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useToken } from "../../src/token";
import Slide from "@mui/material/Slide";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

export default function Account({ user }: any) {
    const [token]: any = useToken();
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

    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [confirmCode, setConfirmCode] = useState("");
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

                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #2f2f2f" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Settings
                        </Typography>

                        <Stack spacing={2}>
                            <TextField label="User ID" variant="outlined" fullWidth value={user.id} disabled />
                            <TextField label="Username" variant="outlined" fullWidth value={user.username} disabled />
                            {/* <TextField label="Email" variant="outlined" fullWidth value={user.email} disabled /> */}
                        </Stack>
                        
                        <Box sx={{ mt: 2 }}>
                            <b>Subscription:</b>
                            <Typography variant="body1">
                                <li><b>Type</b>: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</li>
                            </Typography>
                            <Typography variant="body1">
                                <li><b>Expires</b>: {new Intl.DateTimeFormat(navigator.language, { year: "numeric", month: "long", day: "2-digit" }).format(new Date(user.expiry))}</li>
                            </Typography>
                        </Box>

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

                {/* <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #2f2f2f" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            2-Factor Authentication
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 2 }}>
                            <b>2-Factor Authentication</b>: {user.auth ? "Enabled" : "Disabled"}
                        </Typography>
                        
                        <Stack spacing={2}>
                            {user.auth ? (
                                <>
                                    <TextField label="2-Factor Authentication code" variant="outlined" type="password" fullWidth />
                                    <Button variant="contained" color="error" fullWidth onClick={(e: any) => { setOpenE(true); setNotiTextE("2-Factor Authentication disabled"); }}>
                                        Disable 2-Factor Authentication
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <TextField label="2-Factor Authentication code" variant="outlined" type="password" fullWidth />
                                    <Button variant="contained" color="primary" fullWidth onClick={(e: any) => { setOpenS(true); setNotiTextS("2-Factor Authentication enabled"); }}>
                                        Enable 2-Factor Authentication
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </CardContent>
                </Paper> */}

                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #2f2f2f" }}>
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

                            <LoadingButton variant="contained" color="primary" loading={loading2} fullWidth sx={{ mt: 2 }} onClick={(e: any) => {
                                setLoading2(true);
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
                                        setLoading2(false);
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