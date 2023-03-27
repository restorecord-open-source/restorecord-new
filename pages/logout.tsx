import { useEffect, useState } from "react";
import { useToken } from "../src/token";

import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Head from "next/head";

export default function Logout() {
    const [token]: any = useToken();

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    useEffect(() => {
        try {
            fetch(`/api/v1/logout`, {
                headers: {
                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                },
            })
                .then(res => res.json())
                .then(res => {
                    window.localStorage.removeItem("token");
                    window.location.href = "/";
                    if (!res.success || res.code === 50014) {
                        setNotiTextE(res.message);
                        setOpenE(true);
                    }
                    else {
                        setNotiTextS(res.message);
                        setOpenS(true);
                    }
                })
        } catch (error) {
            console.error(error);
        }
    })

    return (
        <>
            <Container maxWidth="xl">
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Logout" />
                </Head>

                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Logging out...
                        </Typography>

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
                    </CardContent>
                </Paper>
            </Container>
        </>
    )
}