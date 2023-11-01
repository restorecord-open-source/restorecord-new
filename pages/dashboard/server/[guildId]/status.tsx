import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import { darken } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { formatEstimatedTime, stringAvatar } from "../../../../src/functions";
import { useToken } from "../../../../src/token";
import { makeXTrack } from "../../../../src/getIPAddress";

import NavBar from "../../../../components/dashboard/navBar";
import getUser from "../../../../src/dashboard/getUser";
import theme from "../../../../src/theme";
import LoadingButton from "../../../../components/misc/LoadingButton";

import axios from "axios";
import Link from "next/link"

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MuiLink from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Badge from "@mui/material/Badge";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import { countries } from "../../blacklist";
import { LinearProgress, LinearProgressProps } from "@mui/material";


function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(props.value,)}%`}</Typography>
            </Box>
        </Box>
    );
}

export default function Server() {
    const router = useRouter();
    const [ token ]: any = useToken()
    const { guildId } = router.query;
    
    const [migrationStatus, setMigrationStatus] = useState<{ id: number, guildId: string | bigint | number, migrationGuildId: string | bigint | number, status: string, total: number, success: number, banned: number, maxGuilds: number, invalid: number, failed: number, blacklisted: number, startedAt: Date, updatedAt: Date, createdAt: Date }>({
        id: 0,
        guildId: "",
        migrationGuildId: "",
        status: "PENDING",
        total: 0,
        success: 0,
        banned: 0,
        maxGuilds: 0,
        invalid: 0,
        failed: 0,
        blacklisted: 0,
        startedAt: new Date(),
        updatedAt: new Date(),
        createdAt: new Date(),
    });

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const [isRotating, setIsRotating] = useState(false);

    const { data: user, isError, isLoading, refetch: reloadUser } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    useEffect(() => {
        if (user && user.username && (migrationStatus.status === "PULLING" || migrationStatus.status === "PENDING")) {
            const interval = setInterval(async () => {
                const { data } = await axios.get(`/api/v2/self/servers/${guildId}/status`, { headers: { Authorization: (process.browser && window.localStorage.getItem("token")) ?? token } });
                setMigrationStatus(data.migration);
            }, 500);

            return () => clearInterval(interval);
        }
    }, [user, guildId, token]);

    if (isLoading) {
        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!user || !user.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    function renderNotifications() {
        return (
            <>
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
            </>
        )
    }

    function rendertitleBarUI() {
        return (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ "@media screen and (max-width: 600px)": { flexDirection: "column" } }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: "700" }}>
                        Migration Status
                    </Typography>
                    <IconButton onClick={() => {
                        setIsRotating(true);
                        reloadUser();
                        setTimeout(() => { setIsRotating(false); }, 1000);
                    }} size="medium" sx={{ ml: 1, mt: 1, animation: `${isRotating ? "rotation 0.5s linear forwards" : ""}`, transition: "transform 0.2s ease-out", }}>
                        <RefreshIcon />
                    </IconButton>
                    <style jsx global>{`
                    @keyframes rotation {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }
                    `}</style>
                </Box>
            </Stack>
        )
    }

    function renderStatus(server: any) {
        return (
            <Paper key={server.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }} id={`server_${server.guildId}`}>
                <CardContent>
                    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                        {server.picture === "" ? (
                            <Avatar {...stringAvatar(server.name, { sx: { mr: "0.5rem" } })} />
                        ) : (
                            <Avatar src={server.picture} alt={server.serverName} sx={{ mr: "0.5rem" }} />
                        )}
                        
                        <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-all" }}>
                            {server.name}
                        </Typography>
                    </Box>

                    <LinearProgressWithLabel variant="determinate" value={migrationStatus.total === 0 ? 0 : ((migrationStatus.success + migrationStatus.banned + migrationStatus.invalid + migrationStatus.failed + migrationStatus.blacklisted) / migrationStatus.total) * 100} color={migrationStatus.status === "SUCCESS" ? "success" : migrationStatus.status === "FAILED" ? "error" : migrationStatus.status === "PENDING" ? "info" : "warning"} sx={{ borderRadius: "1rem", transition: "background-color 0.2s ease-out" }} />

                    <Typography variant="body2" sx={{ fontWeight: "500", mt: "0.5rem" }}>
                        {migrationStatus.status === "PENDING" ? ("Pending") : (`${migrationStatus.success + migrationStatus.banned + migrationStatus.invalid + migrationStatus.failed + migrationStatus.blacklisted} / ${migrationStatus.total} users pulled`)}
                    </Typography>
                </CardContent>
            </Paper>
        )
    }
    
    return (
        <Box sx={{ display: "flex" }}>
            <NavBar user={user}>
                <Toolbar />
                    
                <Container maxWidth="xl">
                    <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                        <CardContent>
                            {renderNotifications()}
                            {rendertitleBarUI()}


                            {user.servers.find((server: any) => server.guildId === guildId) ? (
                                renderStatus(user.servers.find((server: any) => server.guildId === guildId))
                            ) :  (
                                <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-all" }}>
                                    Server not found.
                                </Typography>
                            )}
                        </CardContent>
                    </Paper>
                </Container>
            </NavBar>
        </Box>
    )
}