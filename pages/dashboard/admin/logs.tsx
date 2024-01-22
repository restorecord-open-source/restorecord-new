import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../../src/token";
import { useEffect, useState } from "react";
import { IntlRelativeTime } from "../../../src/functions";

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
import FormLabel from "@mui/material/FormLabel";
import Slider from "@mui/material/Slider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import LoadingButton from "../../../components/misc/LoadingButton";

export default function AdminUser() {
    const router = useRouter();
    const [token]: any = useToken()
    const [errorMessages, setErrorMessages]: any = useState("");
    const [successMessage, setSuccessMessage]: any = useState("");

    const [logsData, setLogsData] = useState("");

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });


    function handleStream() {
        setLogsData("not finished yet");
    }

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

    if (!data.admin) {
        return <ErrorPage statusCode={404} />
    }
    
    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: "500" }}>
                                    Admin Logs
                                </Typography>

                                <Paper sx={{ background: "#0a0a0a", mt: 2, p: 3, borderRadius: "1rem", border: `1px solid #0a0a0a` }}>
                                    <Stack direction="row" spacing={2}>
                                        <LoadingButton variant="contained" sx={{ color: "#fff", background: "#1a1a1a", borderRadius: "1rem", padding: "0.5rem 1rem", fontWeight: "500" }} event={async () => handleStream()}>
                                            Get Logs
                                        </LoadingButton>
                                    </Stack>

                                    {logsData && (
                                        <Paper sx={{ background: "#1a1a1a", mt: 2, p: 3, borderRadius: "1rem", border: `1px solid #1a1a1a` }}>
                                            <Typography variant="body2" sx={{ color: "#fff", whiteSpace: "pre-wrap" }}>
                                                {logsData}
                                            </Typography>
                                        </Paper>
                                    )}
                                </Paper>

                                {errorMessages && ( <Alert severity="error" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{errorMessages}</Alert> )}
                                {successMessage && ( <Alert severity="success" sx={{ mt: 2, bgcolor: "#000", color: "#fff" }}>{successMessage}</Alert> )}
                            </CardContent>
                        </Paper>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}