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

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");


    const redirect_to: any = router.query.redirect_to;
    const username_query: any = router.query.username;


    const onSubmit = (e: any) => {
        e.preventDefault();
        fetch(`/api/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
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
                    setTimeout(() => router.push(redirect_to ? redirect_to : "/dashboard"), 500);
                }
            })
            .catch(err => {
                setNotiTextE(err.message);
                setOpenE(true);
            });
    }
    
    const handleChange = (e: any) => {
        const { name, value } = e.target;
        switch (name) {
        case "username":
            setUsername(value);
            break;
        case "password":
            setPassword(value);
            break;
        default:
            break;
        }
    }

    useEffect(() => {
        try {
            if (localStorage.getItem("token")) {
                fetch(`/api/v1/user`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${localStorage.getItem("token")}`
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.success) {
                            // setNotiTextS("You are already logged in");
                            // setOpenS(true);
                            setTimeout(() => router.push("/dashboard"), 100);
                        }
                        else {
                            localStorage.removeItem("token");
                        }
                    })
                    .catch(err => {
                        setNotiTextE(err);
                        setOpenE(true);
                        console.error(err);
                    });
            }
        }
        catch (err) {
            console.error(err);
        }
    }, [router]);

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem" }}>
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
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 45 } }}
                                    value={password}
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

                    {/* <div>
                    <div>
                        <h1>Log into your Account</h1>
                    </div>
                    <form onSubmit={onSubmit}>
                        <div>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">Username</label>
                                <div className="relative mb-6">
                                    <input name="username" onChange={handleChange} type="text" id="username" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Username" defaultValue={username_query} />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <input name="password" onChange={handleChange} type="password" id="password" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••••" />
                                </div>
                            </div>
                            
                            <div>
                                <a>
                                    Don&#39;t have an account? Register <Link href="/register"><span>here</span></Link>.
                                </a>
                            </div>
                        </div>

                        
                        <div>
                            <button type="button"  onClick={() => setOpen(true) }>
                                Login
                            </button>
                        </div>
                    </form>
                </div> */}
                </Container>
                <Footer />
            </Box>
        </>
    )
}