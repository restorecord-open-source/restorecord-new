import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react"

import NavBar from "../components/landing/NavBar"
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Link from "next/link";
import Head from "next/head";
import Footer from "../components/landing/Footer";

import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { makeXTrack } from "../src/getIPAddress";
import Stack from "@mui/material/Stack";
import LoadingButton from "../components/misc/LoadingButton";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");

    const [error, setError] = useState({ status: false, message: "" });

    const [token, setToken]: any = useState();
    const captchaRef: any = useRef();
    const router = useRouter();
    

    const onExpire = () => {
        setError({ status: true, message: "Captcha expired" });
    }

    const onError = (err: any) => {
        setError({ status: true, message: err });
    }

    const onSubmit = (e: any) => {
        e.preventDefault();
        captchaRef.current.execute();
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        switch (name) {
        case "username":
            setUsername(value);
            break;
        case "email":
            setEmail(value);
            break;
        case "password":
            setPassword(value);
            break;
        case "password2":
            setPassword2(value);
            break;
        default:
            break;
        }
    }

    useEffect(() => {
        try {
            if (token) {
                fetch(`/api/v2/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-track": makeXTrack()
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password,
                        captcha: token,
                        ref: router.query.r ? router.query.r : null
                    })
                })
                    .then(res => res.json())
                    .then(res => {
                        setToken(null);
                        if (res.success && res.token) {
                            setError({ status: false, message: "Account created" });

                            localStorage.setItem("token", res.token);
                            router.push("/dashboard");
                        } 
                        else {
                            setError({ status: true, message: res.message });
                        }
                    });
            }
        }
        catch (err) {
            console.error(err);
        }
    }, [email, password, router, token, username]);

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem", background: "rgba(0, 0, 0, 0.75)" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Register" />
                </Head>

                <Container maxWidth="lg" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>

                    <NavBar />

                    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: "3rem" }}>
                        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: "bold" }} gutterBottom>
                            Register an Account
                        </Typography>

                        {error.message && (
                            <Alert severity={error.status ? "error" : "success"} sx={{ mb: "1rem" }}>
                                {error.message}
                            </Alert>
                        )}

                        {router.query.r && (
                            <Alert severity="info" sx={{ mb: "1rem" }}>
                                You were invited by <strong>{router.query.r}</strong>, save up to 15% on your subscription!
                            </Alert>
                        )}

                        <form onSubmit={(e) => e.preventDefault()}>
                            <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: "1rem" }}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    InputProps={{ inputProps: { minLength: 3, maxLength: 20 } }}
                                    autoFocus
                                    value={username}
                                    onChange={handleChange}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 50 } }}
                                    value={email}
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
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 45 } }}
                                    autoComplete="password"
                                    value={password}
                                    onChange={handleChange}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password2"
                                    label="Confirm Password"
                                    type="password"
                                    id="password2"
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 45 } }}
                                    autoComplete="password"
                                    value={password2}
                                    onChange={handleChange}
                                />
                                <HCaptcha
                                    sitekey="748ea2c2-9a8d-4791-b951-af4c52dc1f0f"
                                    size="invisible"
                                    theme="dark"
                                    onVerify={setToken}
                                    onError={onError}
                                    onExpire={onExpire}
                                    ref={captchaRef}
                                />
                                <LoadingButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: "1rem", mb: "0.5rem" }}
                                    event={() => {
                                        setError({ status: false, message: "" });

                                        if (!username || !email || !password || !password2) {
                                            setError({ status: true, message: "Please fill out all fields" });
                                            return;
                                        }

                                        if (password !== password2) {
                                            setError({ status: true, message: "Passwords do not match" });
                                            return;
                                        }

                                        captchaRef.current.execute();
                                    }}
                                >Register</LoadingButton>
                                <Stack direction="row" spacing={2} justifyContent="space-between">
                                    <Typography variant="body2" gutterBottom>
                                        You agree to our{" "}
                                        <Link href="/terms">
                                            Terms of Service
                                        </Link>
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <Link href="/login">
                                            Already have an account? Sign In
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
