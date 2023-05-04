import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Link from "next/link";
import MuiLink from "@mui/material/Link";
import NavBar from "../components/landing/NavBar";
import Footer from "../components/landing/Footer";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Head from "next/head";
import theme from "../src/theme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material";

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [totp, setTotp] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const redirect_to: any = router.query.redirect_to;
    const username_query: any = router.query.username;


    function onSubmit(e: any) {
        e.preventDefault();
        fetch(`/api/v2/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                totp: totp
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
                    localStorage.setItem("token", res.token);
                    // setTimeout(() => router.push(redirect_to ? redirect_to : "/dashboard"), 500);
                    router.push(redirect_to ? redirect_to : "/dashboard");
                }
            })
            .catch(err => {
                setNotiTextE(err.message);
                setOpenE(true);
            });
    }
    
    function handleChange(e: any) {
        const { name, value } = e.target;
        switch (name) {
        case "username":
            setUsername(value);
            break;
        case "password":
            setPassword(value);
            break;
        case "totp":
            setTotp(value);
            break;
        default:
            break;
        }
    }

    useEffect(() => {
        try {
            if (localStorage.getItem("token")) {
                fetch(`/api/v2/self`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${localStorage.getItem("token")}`
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.id) {
                            router.push(redirect_to ? redirect_to : "/dashboard");
                        } else {
                            window.localStorage.removeItem("token");
                            window.location.href = "/";
                        }
                    })
                    .catch(err => {
                        setNotiTextE(err);
                        setOpenE(true);
                        console.error(err);
                    });
            }
        }
        catch (err: any) {}
    }, [router, redirect_to]);

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem", background: "rgba(0, 0, 0, 0.75)" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Login" />
                </Head>

                <Container maxWidth="lg" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>
                    <NavBar />

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

                    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: "3rem" }}>
                        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: "bold" }} gutterBottom>
                            Log into your Account
                        </Typography>

                        <form onSubmit={onSubmit}>
                            <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: "3rem" }}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    placeholder="Username"
                                    autoComplete="username"
                                    InputProps={{ inputProps: { minLength: 2, maxLength: 20 } }}
                                    autoFocus
                                    value={username}
                                    defaultValue={username_query}
                                    onChange={handleChange}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="password"
                                    placeholder="••••••••••••"
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 45 } }}
                                    value={password}
                                    onChange={handleChange}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    name="totp"
                                    label="2FA Code"
                                    id="totp"
                                    placeholder="Leave blank if you don't have 2FA enabled"
                                    autoComplete="2fa"
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 6, pattern: "[0-9]*" } }}
                                    value={totp}
                                    onChange={handleChange}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: "2rem", mb: "0.5rem" }}
                                >
                                    Login
                                </Button>
                                <Grid container>
                                    <Grid item xs>
                                        <Link href="/forgot">
                                            <MuiLink variant="body2" component="a" href="/forgot">
                                                Forgot password?
                                            </MuiLink>
                                        </Link>
                                    </Grid>
                                    <Grid item>
                                        <Link href="/register">
                                            <MuiLink variant="body2" component="a" href="/register">
                                                {"Don't have an account? Sign Up"}
                                            </MuiLink>
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        </form>
                    </Box>

                </Container>
            </Box>
        </>
    )
}