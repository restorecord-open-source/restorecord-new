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

    const [users, setUsers]: any = useState({});

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
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                    Admin
                                </Typography>

                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setUsers({});
                                    setErrorMessages("");
                                    await axios.post("/api/admin/lookup", { query: searchQuery }, {
                                        headers: {
                                            Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                        },
                                    }).then((res: any) => {
                                        console.log(res.data.user);
                                        setUsers(res.data.users);
                                    }).catch((err) => {
                                        console.error(err);
                                        setErrorMessages(JSON.stringify(err.response.data));
                                    });
                                }}>
                                    <Stack direction="column" spacing={2}>
                                        <TextField label="Search" variant="outlined" placeholder="User ID/Username/Email" onChange={(e) => setSearchQuery(e.target.value)} />
                                        <Button variant="contained" type="submit">Get user info</Button>
                                    </Stack>
                                </form>
                                
                                {users.length > 0 && ( <>
                                    {users.map((user: any) => (
                                        <Paper sx={{ background: "#000", mt: 2, p: 3, borderRadius: "1rem" }} key={user.id}>
                                            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                                                <CardContent>
                                                    {Object.entries(user).map(([key, value]) => {
                                                        if (typeof value === "string") {
                                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{value}</code></Typography>);
                                                        } else if (value instanceof Date || key === "createdAt" || key === "updatedAt") {
                                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{new Date(value as any).toLocaleDateString()}</code></Typography>);
                                                        } else if (typeof value === "boolean") {
                                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{value ? "Yes" : "No"}</code></Typography>);
                                                        } else {
                                                            return (<Typography variant="body1" sx={{ mb: 1 }} key={key}>{key}: <code>{JSON.stringify(value)}</code></Typography>);
                                                        }
                                                    })}
                                                </CardContent>
                                                <CardContent>
                                                    {/* Upgrade, Update Email, Disable 2FA, Ban */}
                                                    <Stack direction="column" spacing={2}>
                                                        <Button variant="contained" color="info" onClick={() => {
                                                            console.log("more info");
                                                        }}>More info</Button>
                                                        <Button variant="contained" color="yellow" onClick={() => {
                                                            console.log("upgrade");
                                                        }}>Upgrade</Button>
                                                        <Button variant="contained" color="primary" onClick={() => {
                                                            console.log("update email");
                                                        }}>Update Email</Button>
                                                        <Button variant="contained" color="error" onClick={() => {
                                                            console.log("disable 2fa");
                                                        }}>Disable 2FA</Button>
                                                        <Button variant="contained" color="error" onClick={() => {
                                                            console.log("ban");
                                                        }}>Ban</Button>
                                                    </Stack>
                                                </CardContent>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </> )}
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