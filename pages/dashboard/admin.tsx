import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../src/token";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import ErrorPage from "../_error";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import axios from "axios";
import Alert from "@mui/lab/Alert";
import CircularProgress from "@mui/material/CircularProgress";

export default function Admin() {
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

    if (!data.username) {
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
                                        <Button variant="contained" type="submit">
                                            Get user info
                                        </Button>
                                    </Stack>
                                </form>

                                <Typography variant="h6" sx={{ fontWeight: "500", mt: 2 }}>
                                    Search Server
                                </Typography>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setServer({ id: "", name: "", ownerId: "", guildId: "", roleId: "", picture: "", vpn: false, webhook: "", bgImage: "", description: "", pulling: false, pullTimeout: new Date(0), createdAt: new Date(0) });
                                    setErrorMessages("");
                                    await axios.post("/api/admin/server", { query: serverSearchQuery }, {
                                        headers: {
                                            Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                    }).then((res: any) => {
                                        console.log(res.data.user);
                                        setServer(res.data.server);
                                    }).catch((err) => {
                                        console.error(err);
                                        setErrorMessages(JSON.stringify(err.response.data));
                                    });
                                }}>
                                    <Stack direction="column" spacing={2} >
                                        <TextField label="Search" variant="outlined" placeholder="Id/Guild Id/Name" onChange={(e) => setServerSearchQuery(e.target.value)} />
                                        <Button variant="contained" type="submit">
                                            Get Server Info
                                        </Button>
                                        <Button variant="contained" onClick={async (e) => {
                                            e.preventDefault();
                                            setErrorMessages("");

                                            await axios.post("/api/admin/reset?option=member", { query: serverSearchQuery }, {
                                                headers: {
                                                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                },
                                            }).then((res: any) => {
                                                console.log(res.data);
                                                setSuccessMessage(JSON.stringify(res.data));
                                            }).catch((err) => {
                                                console.error(err);
                                                setErrorMessages(JSON.stringify(err.response.data));
                                            });
                                        }}>
                                            Reset Members & Status
                                        </Button>
                                        <Button variant="contained" onClick={async (e) => {
                                            e.preventDefault();
                                            setErrorMessages("");

                                            await axios.post("/api/admin/reset?option=cooldown", { query: serverSearchQuery }, {
                                                headers: {
                                                    Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                },
                                            }).then((res: any) => {
                                                console.log(res.data);
                                                setSuccessMessage(JSON.stringify(res.data));
                                            }).catch((err) => {
                                                console.error(err);
                                                setErrorMessages(JSON.stringify(err.response.data));
                                            });
                                        }}>
                                            Reset Cooldown
                                        </Button>
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

                                {server.id && (
                                    <Paper sx={{ background: "#000", mt: 2, p: 3, borderRadius: "1rem" }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Server Info
                                            </Typography>
                                            
                                            <Typography variant="body1" sx={{ mt: 1 }}>ID: <code>{server.id}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Name: <code>{server.name}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>OwnerId: <code>{server.ownerId}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>GuildId: <code>{server.guildId}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>RoleId: <code>{server.roleId}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>VPN Check <code>{server.vpn ? "Enabled" : "Disabled"}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Webhook: <code>{server.webhook}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>BgImage: <code>{server.bgImage}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Description: <code>{server.description}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Pulling: <code>{server.pulling}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Pull timeout: <code>{new Date(server.pullTimeout).toLocaleString()}</code></Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>Creation date: <code>{new Date(server.createdAt).toLocaleString()}</code></Typography>
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