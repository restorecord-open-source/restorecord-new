import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Link from "next/link";
import NavBar from "../components/landing/NavBar";

import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Head from "next/head";
import { Stack } from "@mui/material";
import { makeXTrack } from "../src/getIPAddress";
import LoadingButton from "../components/misc/LoadingButton";

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [totp, setTotp] = useState("");

    const [error, setError] = useState({ status: false, message: "" });

    const redirect_to: any = router.query.redirect_to;
    const username_query: any = router.query.username;
    
    function handleChange(e: any) {
        const { name, value } = e.target;
        switch (name) {
        case "username": setUsername(value); break;
        case "password": setPassword(value); break;
        case "totp": setTotp(value); break;
        }
    }

    useEffect(() => {
        try {
            if (localStorage.getItem("token")) {
                fetch(`/api/v2/self`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${localStorage.getItem("token")}`,
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.id) {
                            router.push(redirect_to ? redirect_to : "/dashboard");
                        } else {
                            window.localStorage.removeItem("token");
                            router.push("/login");
                        }
                    })
                    .catch(err => {
                        setError({ status: true, message: err });
                        console.error(err);
                    });
            }
        }
        catch (err: any) {}
    }, [router, redirect_to]);

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Login" />
                </Head>

                <Container maxWidth="lg" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>
                    <NavBar />

                    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: "3rem" }}>
                        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: "bold" }} gutterBottom>
                            Log into your Account
                        </Typography>

                        {error.message && (
                            <Alert severity={error.status ? "error" : "success"} sx={{ mb: "1rem" }}>
                                {error.message}
                            </Alert>
                        )}

                        <form onSubmit={(e) => e.preventDefault()}>
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
                                    value={username === "" ? username_query : username}
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
                                <LoadingButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: "2rem", mb: "0.5rem" }}
                                    event={async() => {
                                        await fetch(`/api/v2/auth/login`, {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "x-track": makeXTrack()
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
                                                    // setNotiTextE(res.message);
                                                    // setOpenE(true);
                                                    setError({ status: true, message: res.message });
                                                }
                                                else {
                                                    setError({ status: false, message: res.message });
                                                    localStorage.setItem("token", res.token);
                                                    router.push(redirect_to ? redirect_to : "/dashboard");
                                                }
                                            })
                                            .catch(err => {
                                                setError({ status: true, message: err.message });
                                            });
                                    }}
                                >
                                    Login
                                </LoadingButton>
                                <Stack direction="row" spacing={2} justifyContent="space-between">
                                    <Typography variant="body2" gutterBottom>
                                        <Link href="/forgot">
                                            Forgot password or username?
                                        </Link>
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <Link href="/register">
                                            {"Don't have an account? Sign Up"}
                                        </Link>
                                    </Typography>
                                </Stack>
                            </Box>
                        </form>
                    </Box>

                </Container>
            </Box>
        </>
    )
}