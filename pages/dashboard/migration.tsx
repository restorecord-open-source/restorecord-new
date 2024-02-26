import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { useToken } from "../../src/token";
import { useEffect, useState } from "react";
import { IntlRelativeTime, stringAvatar } from "../../src/functions";

import theme from "../../src/theme";
import getUser from "../../src/dashboard/getUser";
import NavBar from "../../components/dashboard/navBar";

import axios from "axios";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Toolbar from "@mui/material/Toolbar";
import Snackbar from "@mui/material/Snackbar";
import Accordion from "@mui/material/Accordion";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { LinearProgressProps } from "@mui/material/LinearProgress";
import { Tab, Tabs } from "@mui/material";
import LoadingButton from "../../components/misc/LoadingButton";


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

function CustomTabPanel(props: any) {
    const { children, value, index, ...other } = props;
  
    return (
        <div role="tabpanel" hidden={value !== index} id={`custom-tabpanel-${index}`} aria-labelledby={`custom-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

type Migration = {
    id: number,
    guildId: string | bigint | number,
    status: "PENDING" | "PULLING" | "SUCCESS" | "FAILED" | "STOPPED",
    success: number,
    banned?: number,
    maxGuilds?: number,
    invalid?: number,
    failed?: number,
    blacklisted?: number,
    attempted: number,
    total: number,
    open: boolean,
    startedAt?: Date,
    updatedAt?: Date,
    createdAt: Date
}

const statusNames = {
    "PENDING": "Pending",
    "PULLING": "Pulling",
    "SUCCESS": "Successful",
    "FAILED": "Failed",
    "STOPPED": "Stopped by user"
}

export default function Server() {
    const router = useRouter();
    const [ token ]: any = useToken()

    const [migrations, setMigrations] = useState<Migration[]>([]);

    const [migrationTab, setMigrationTab] = useState(0);

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [isLoading, setIsLoading] = useState(true);

    const { data: user, isError, isLoading: isLoadingUser, refetch: reloadUser } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await axios.get(`/api/v2/self/servers/status`, { headers: { Authorization: (process.browser && window.localStorage.getItem("token")) ?? token } });
            setMigrations((migrations) => data.migrations.map((migration: Migration) => ({ ...migration, open: migrations.find((m) => m.guildId === migration.guildId)?.open ?? false })));
        };

        if (user && user.username) {
            fetchData();
            setIsLoading(false);
        }

        const interval = setInterval(fetchData, 2000);

        return () => clearInterval(interval);
    }, [user, token]);

    if (isLoadingUser) {
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
                <Typography variant="h4" sx={{ fontWeight: "700" }}>
                    Migrations
                </Typography>
            </Stack>
        )
    }

    function renderStatus(server: any, migration: Migration) {
        return (
            <Accordion sx={{ borderRadius: "1rem", border: "1px solid #1a1a1a", mt: "1rem", padding: "0.5rem" }} key={server.id} id={`server_${server.guildId}`} expanded={migration.open} onChange={() => { setMigrations(migrations.map((migration) => migration.guildId === server.guildId ? { ...migration, open: !migration.open } : migration)) }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header" sx={{ "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(180deg)" } }}>
                    <Stack spacing={2} justifyContent="space-between" sx={{ width: "100%" }} direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                            {server.picture === "" ? (
                                <Avatar {...stringAvatar(server.name, { sx: { mr: "0.5rem" } })} />
                            ) : (
                                <Avatar src={server.picture} alt={server.serverName} sx={{ mr: "0.5rem" }} />
                            )}
                        
                            <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word" }}>{server.name}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: "500", color: migration.status === "SUCCESS" ? theme.palette.success.main : (migration.status === "FAILED" || migration.status === "STOPPED") ? theme.palette.error.main : migration.status === "PENDING" ? theme.palette.info.main : theme.palette.warning.main }}>
                            {migration.status === "PENDING" ? ("Pending") : (`${migration.success} / ${migration.total} users pulled`)}
                        </Typography>
                    </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ display: "flex", flexDirection: "column" }}>
                    <LinearProgressWithLabel variant="determinate" value={migration.total === 0 ? 0 : ((migration.success) / migration.total) * 100} color={migration.status === "SUCCESS" ? "success" : (migration.status === "FAILED" || migration.status === "STOPPED") ? "error" : migration.status === "PENDING" ? "info" : "warning"} sx={{ borderRadius: "1rem", transition: "background-color 0.2s ease-out" }} />
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ width: "100%", mt: "1rem" }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography variant="body2" sx={{ fontWeight: "500", mt: "0.5rem" }}>
                                {migration.success} / {migration.total} users pulled ({statusNames[migration.status]})
                            </Typography>
                            {migration.createdAt && <Typography variant="body2" sx={{ fontWeight: "500" }}>Created {IntlRelativeTime(new Date(migration.createdAt).getTime())}</Typography>}
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {(migration.status === "PENDING" || migration.status === "PULLING") && (
                                <LoadingButton variant="contained" color="error" event={async() => {
                                    await axios.delete(`/api/v2/self/servers/${server.guildId}/stop?migrationId=${migration.id}`, {
                                        headers: {
                                            Authorization: (process.browser && window.localStorage.getItem("token")) ?? token 
                                        } 
                                    }).then((res) => {
                                        if (res.data.success) {
                                            setNotiTextS(res.data.message);
                                            setOpenS(true);
                                        } else {
                                            setNotiTextE(res.data.message);
                                            setOpenE(true);
                                        }
                                    }).catch((err) => {
                                        console.error(err);
                                        setNotiTextE("An error occurred");
                                        setOpenE(true);
                                    });
                                }} sx={{ mt: "0.5rem" }}>
                                    Stop Migration
                                </LoadingButton>
                            )}
                        </Box>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        )
    }
    
    return (
        <Box sx={{ display: "flex" }}>
            <NavBar user={user}>
                <Toolbar />
                    
                <Container maxWidth="xl">
                    <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                        <CardContent>
                            {renderNotifications()}
                            {rendertitleBarUI()}

                            {/* <Tabs value={migrationTab} onChange={(e, newValue) => setMigrationTab(newValue)}  aria-label="migration tab" sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile> 
                                <Tab label="Active" id="migration-tabs-0" aria-controls="migration-tabs-0" />
                                <Tab label="History" id="migration-tabs-1" aria-controls="migration-tabs-1" />
                            </Tabs> */}

                            {/* <CustomTabPanel value={migrationTab} index={0}> */}
                            {user.servers.map((server: any) => {
                                const migration = migrations.find((migration) => migration.guildId === server.guildId);

                                if (migration) {
                                    return renderStatus(server, migration);
                                }
                            })}

                            {(migrations.length === 0 && !isLoadingUser && !isLoading) && (
                                <Typography variant="body1" sx={{ fontWeight: "500" }}>
                                    No migrations found.
                                </Typography>
                            )}
                            {/* </CustomTabPanel> */}

                            {/* <CustomTabPanel value={migrationTab} index={1}>
                                {user.servers.map((server: any) => {
                                    const migration = migrations.find((migration) => migration.guildId === server.guildId);

                                    if (migration && migration.status !== "PENDING") {
                                        return renderStatus(server, migration);
                                    }
                                })}

                                {(migrations.length === 0 && !isLoadingUser && !isLoading) && (
                                    <Typography variant="body1" sx={{ fontWeight: "500" }}>
                                        No migrations found.
                                    </Typography>
                                )}
                            </CustomTabPanel> */}

                            {(isLoadingUser || isLoading) && <CircularProgress sx={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", mt: "1rem" }} />}
                        </CardContent>
                    </Paper>
                </Container>
            </NavBar>
        </Box>
    )
}