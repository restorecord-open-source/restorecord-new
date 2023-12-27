import { useRouter } from "next/router";
import { useToken } from "../../src/token";
import { useQuery } from "react-query";
import { useEffect, useState } from "react";

import NavBar from "../../components/dashboard/navBar";
import DashServerSettings from "../../components/dashboard/ServerSettings";
import getUser from "../../src/dashboard/getUser";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CardContent from "@mui/material/CardContent";

export default function LinkAccount() {
    const router = useRouter();
    const [token]: any = useToken()
    const { id, t } = router.query;

    const [callback, setCallback] = useState({
        loading: false,
        error: false,
        message: ""
    });

    useEffect(() => {
        if (id && t) {
            setCallback({ ...callback, loading: true });
            fetch(`/api/callback-roles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token
                },
                body: JSON.stringify({
                    id: id,
                    t: t
                })
            })
                .then(res => res.json())
                .then(data => {
                    setCallback({ ...callback, loading: false, error: data.error ? true : false, message: data.message ? data.message : (data.error ? data.error : "Unknown error") });
                })
        } else {
            setCallback({ ...callback, loading: false, error: true, message: "Invalid request" });
        }
    }, [id, t])

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    if (isLoading) {
        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }
    
    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                    Link Account
                                </Typography>

                                {callback.loading && <CircularProgress />}
                                {callback.error && <Alert severity="error">{callback.message}</Alert>}
                                {(callback.error === false && callback.message) && <Alert severity="success">{callback.message}</Alert>}
                                
                            </CardContent>
                        </Paper>
                    </Container>
                                        
                </NavBar>
            </Box>
        </>
    )
}