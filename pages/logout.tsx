import { useEffect, useState } from "react";
import { useToken } from "../src/token";

import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

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
                    if (!res.success) {
                        setNotiTextE(res.message);
                        setOpenE(true);
                    }
                    else {
                        setNotiTextS(res.message);
                        setOpenS(true);
                        window.localStorage.removeItem("token");
                        window.location.href = "/";
                    }
                })
        } catch (error) {
            console.error(error);
        }
    })

    return (
        <>
            <Container maxWidth="xl">
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