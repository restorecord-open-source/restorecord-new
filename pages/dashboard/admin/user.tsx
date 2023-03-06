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

export default function AdminUser() {
    const router = useRouter();
    const [token]: any = useToken()
    const [searchQuery, setSearchQuery] = useState("");
    const [serverSearchQuery, setServerSearchQuery] = useState("");
    const [errorMessages, setErrorMessages]: any = useState("");
    const [successMessage, setSuccessMessage]: any = useState("");

    // create blank object for user data
    const [user, setUser] = useState({
        id: "",
        username: "",
        email: "",
        role: "",
        twoFactor: false,
        expiry: new Date(0),
        admin: false,
        lastIp: "",
        createdAt: new Date(0),
    });

    const [server, setServer] = useState({
        id: "",
        name: "",
        ownerId: "",
        guildId: "",
        roleId: "",
        picture: "",
        vpn: false,
        webhook: "",
        bgImage: "",
        description: "",
        pulling: false,
        pullTimeout: new Date(0),
        createdAt: new Date(0),
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

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                    Admin
                                </Typography>

                                {/* <Stack direction="row" spacing={2}>
                                    <Button variant="contained" sx={{ textTransform: "none" }} onClick={() => { 
                                        function a(e: any) {
                                            for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++)
                                                t += "&args[]=" + encodeURIComponent(arguments[n]);
                                            return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
                                        }
                                        throw Error(a("[object Object]" === Object.prototype.toString.call({}) ? "object with keys {" + Object.keys({}).join(", ") + "}" : {}))
                                    }}>
                                        Trigger react error
                                    </Button>
                                    <Button variant="contained" sx={{ textTransform: "none" }} onClick={() => { throw Error("help") }}>
                                        Trigger onClick error
                                    </Button>
                                </Stack> */}

                                <Typography variant="h5" sx={{ mt: 2, fontWeight: "500" }}>
                                    Search User
                                </Typography>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setUser({ id: "", username: "", email: "", role: "", twoFactor: false, expiry: new Date(0), admin: false, lastIp: "", createdAt: new Date(0) });
                                    setErrorMessages("");
                                    await axios.post("/api/admin/lookup", { query: searchQuery }, {
                                        headers: {
                                            Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                    }).then((res: any) => {
                                        console.log(res.data.user);
                                        setUser(res.data.user);
                                    }).catch((err) => {
                                        console.error(err);
                                        setErrorMessages(JSON.stringify(err.response.data));
                                    });
                                }}>
                                    <Stack direction="column" spacing={2}>
                                        <TextField label="Search" variant="outlined" placeholder="User ID/Username/Email" onChange={(e) => setSearchQuery(e.target.value)} />
                                        <Button variant="contained" type="submit">Get user info</Button>
                                        <Stack direction="row" justifyContent="space-between" alignContent={"center"} sx={{ flexDirection: { xs: "column", sm: "row" } }}>
                                            <Button variant="contained" sx={{ width: "100%", backgroundColor: theme.palette.yellow.main, color: "#000000" }} onClick={async (e) => {
                                                e.preventDefault();

                                                await axios.post("/api/admin/plan", { user: searchQuery }, {
                                                    headers: {
                                                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    }
                                                }).then((res: any) => {
                                                    console.log(res.data);
                                                    setSuccessMessage(JSON.stringify(res.data));
                                                }).catch((err) => {
                                                    setErrorMessages(JSON.stringify(err.response.data));
                                                });
                                            }}>Add PREMIUM 1 MONTH</Button>
                                            <Button variant="contained" sx={{ width: "100%", backgroundColor: theme.palette.yellow.main, color: "#000000" }} onClick={async (e) => {
                                                e.preventDefault();

                                                await axios.post("/api/admin/plan", { user: searchQuery }, {
                                                    headers: {
                                                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    }
                                                }).then((res: any) => {
                                                    console.log(res.data);
                                                    setSuccessMessage(JSON.stringify(res.data));
                                                }).catch((err) => {
                                                    setErrorMessages(JSON.stringify(err.response.data));
                                                });
                                            }}>Add PREMIUM 1 YEAR</Button>
                                            <Button variant="contained" sx={{ width: "100%", backgroundColor: theme.palette.primary.main, color: "#ffffff" }} onClick={async (e) => {
                                                e.preventDefault();

                                                await axios.post("/api/admin/plan", { user: searchQuery }, {
                                                    headers: {
                                                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    }
                                                }).then((res: any) => {
                                                    console.log(res.data);
                                                    setSuccessMessage(JSON.stringify(res.data));
                                                }).catch((err) => {
                                                    setErrorMessages(JSON.stringify(err.response.data));
                                                });
                                            }}>Add BUSINESS 1 MONTH</Button>
                                            <Button variant="contained" sx={{ width: "100%", backgroundColor: theme.palette.primary.main, color: "#ffffff" }} onClick={async (e) => {
                                                e.preventDefault();

                                                await axios.post("/api/admin/plan", { user: searchQuery }, {
                                                    headers: {
                                                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    }
                                                }).then((res: any) => {
                                                    console.log(res.data);
                                                    setSuccessMessage(JSON.stringify(res.data));
                                                }).catch((err) => {
                                                    setErrorMessages(JSON.stringify(err.response.data));
                                                });
                                            }}>Add BUSINESS 1 YEAR</Button>
                                            <Button variant="contained" sx={{ width: "100%", backgroundColor: theme.palette.error.main, color: "#ffffff" }} onClick={async (e) => {
                                                e.preventDefault();

                                                await axios.post("/api/admin/plan", { user: searchQuery }, {
                                                    headers: {
                                                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    }
                                                }).then((res: any) => {
                                                    console.log(res.data);
                                                    setSuccessMessage(JSON.stringify(res.data));
                                                }).catch((err) => {
                                                    setErrorMessages(JSON.stringify(err.response.data));
                                                });
                                            }}>REMOVE ALL</Button>
                                        </Stack>

                                    </Stack>
                                </form>


                                {user.id && (
                                    <Paper sx={{ background: "#000", mt: 2, p: 3, borderRadius: "1rem" }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                User info
                                            </Typography>

                                            <Typography variant="body1" sx={{ mt: 1 }}>ID: <code>{user.id}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Username: <code>{user.username}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Email: <code>{user.email}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Subscription: <code>{user.role}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Expires: <code>{new Date(user.expiry).toLocaleString()}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>2FA: <code>{user.twoFactor ? "Enabled" : "Disabled"}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Admin: <code>{user.admin ? "Yes" : "No"}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Last IP: <code>{user.lastIp}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Creation date: <code>{new Date(user.createdAt).toLocaleString()}</code></Typography>
                                        </CardContent>
                                    </Paper>
                                )}
                            </CardContent>
                            
                            {errorMessages && (
                                <Alert severity="error" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>
                                    {errorMessages}
                                </Alert>
                            )}

                            {successMessage && (
                                <Alert severity="success" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>
                                    {successMessage}
                                </Alert>
                            )}
                        </Paper>
                    </Container>
                    
                </NavBar>
            </Box>
        </>
    )
}