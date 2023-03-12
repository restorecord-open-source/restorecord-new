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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";

export default function AdminServer() {
    const router = useRouter();
    const [token]: any = useToken()
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessages, setErrorMessages]: any = useState("");
    const [successMessage, setSuccessMessage]: any = useState("");

    const [users, setUsers]: any = useState({});

    const [Modals, setModals]: any = useState({
        info: false,
        upgrade: false,
        updateEmail: false,
        disable2FA: false,
        ban: false,
    });

    const [ModalData, setModalData]: any = useState({
        info: {},
        upgrade: {},
        updateEmail: {},
        disable2FA: {},
        ban: {},
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

    
    async function getUserInfo(userId: any) {
        await axios.post("/api/admin/lookup", { userId: userId }, {
            headers: {
                Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        }).then((res: any) => {
            console.log(res.data.users[0]);
            setModalData({ ...ModalData, info: res.data.users[0] });
        }).catch((err) => {
            console.error(err);
            setErrorMessages(JSON.stringify(err.response.data));
        });
    }

    function renderSearch() {
        return (
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
        );
    }

    function renderSearchResult() {
        return (
            <>
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
                                <Stack direction="column" spacing={2}>
                                    <Button variant="contained" color="info" onClick={async () => {
                                        getServerInfo(server.id);
                                        setModals({ ...Modals, info: true });
                                    }}>More info</Button>
                                </Stack>
                            </CardContent>
                        </Stack>
                    </Paper>
                ))}
            </>
        );
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


                                {renderSearch()}
                                {users.length > 0 && renderSearchResult()}
                            </CardContent>
                        
                            {errorMessages && ( <Alert severity="error" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{errorMessages}</Alert> )}
                            {successMessage && ( <Alert severity="success" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{successMessage}</Alert> )}
                        </Paper>
                    </Container>
                
                </NavBar>
            </Box>
        </>
    )
}