import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../../src/token";
import { useTheme } from "@mui/material/styles";

import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";
import ErrorPage from "../../_error";

import Link from "next/link";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import GroupIcon from "@mui/icons-material/Group";
import StorageIcon from "@mui/icons-material/Storage";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import TimelineIcon from "@mui/icons-material/Timeline";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import PeopleIcon from "@mui/icons-material/People";
import SavingsIcon from "@mui/icons-material/Savings";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import TableHead from "@mui/material/TableHead";
import useMediaQuery from "@mui/material/useMediaQuery";
import theme from "../../../src/theme";
import { IntlRelativeTime } from "../../../src/functions";

export default function Admin() {
    const router = useRouter();
    const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));
    const [token]: any = useToken();

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: true, refetchOnWindowFocus: false });


    const { data: stats, isError: statsError, isLoading: statsLoading } = useQuery("stats", async () => await fetch("/api/admin/stats", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
        }
    }).then(res => res.json()), { retry: true, refetchOnWindowFocus: true, refetchInterval: 1000, refetchIntervalInBackground: true, refetchOnMount: true, refetchOnReconnect: true });

    if (isLoading) return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    if (isError || statsError) return <div>Error</div>

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    if (!data.admin) return <ErrorPage statusCode={404} /> 

    // function relativeTime(date: Date): string {
    // const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    // return seconds < 60 ? `${seconds}s` : seconds < 3600 ? `${Math.floor(seconds / 60)}m` : seconds < 86400 ? `${Math.floor(seconds / 3600)}h` : seconds < 604800 ? `${Math.floor(seconds / 86400)}d` : seconds < 2629800 ? `${Math.floor(seconds / 604800)}w` : seconds < 31557600 ? `${Math.floor(seconds / 2629800)}mo` : `${Math.floor(seconds / 31557600)}y`;
    // }

    function tableElement(name: string, value: string, icon?: any) {
        return (
            <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}>{icon}{name}</Typography></TableCell>
                <TableCell><Typography variant="body1">{value}</Typography></TableCell>
            </TableRow>
        )
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #1a1a1a" }}>
                            <CardContent sx={{ pb: "1rem !important" }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                    Admin Panel
                                </Typography>

                                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
                                    <Button fullWidth={true} variant="contained" href="/dashboard/admin/users" onClick={(e) => { e.preventDefault(); router.push("/dashboard/admin/users"); }}><GroupIcon sx={{ mr: 1 }} />User</Button>
                                    <Button fullWidth={true} variant="contained" href="/dashboard/admin/servers" onClick={(e) => { e.preventDefault(); router.push("/dashboard/admin/servers"); }}><StorageIcon sx={{ mr: 1 }} />Servers</Button>
                                    <Button fullWidth={true} variant="contained" href="/dashboard/admin/members" onClick={(e) => { e.preventDefault(); router.push("/dashboard/admin/members"); }}><SmartToyIcon sx={{ mr: 1 }} />Members</Button>
                                    <Button fullWidth={true} variant="contained" href="/dashboard/admin/logs" onClick={(e) => { e.preventDefault(); router.push("/dashboard/admin/logs"); }}><TimelineIcon sx={{ mr: 1 }} />Logs</Button>
                                </Stack>
                            </CardContent>
                        </Paper>
                        
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1 }}>
                            <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", width: "100%", border: "1px solid #1a1a1a" }}>
                                <CardContent sx={{ pb: "1rem !important" }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                        Stats
                                    </Typography>

                                    {statsLoading ? <CircularProgress /> : (
                                        <TableContainer component={Paper} sx={{ borderRadius: "1rem", boxShadow: "0 0 0 0", border: `1px solid ${theme.palette.divider}` }}>
                                            <Table>
                                                <TableBody>
                                                    {tableElement("Accounts", stats.accounts.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), <PeopleIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                    {tableElement("Premium", stats.accountsPremium.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), <SavingsIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                    {tableElement("Business", stats.accountsBusiness.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), <PaymentsIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                    {tableElement("Servers", stats.servers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), <StorageIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                    {tableElement("Migrations", `${stats.activeMigrations.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${stats.migrations.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`, <StorageIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                    {tableElement("Members", "~" + stats.members.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), <GroupsIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                    {tableElement("Bots", stats.customBots.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), <SmartToyIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                    {tableElement("Revenue", `~$${Math.round(stats.totalRevenue + (6289 /* shoppy */ + 16133 /* sellix */ + 3731 /* sellapp */)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} (${stats.payments.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")})`, <AccountBalanceIcon sx={{ mr: 1, mb: -0.75 }} />)}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </CardContent>
                            </Paper>

                            <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", width: "100%", border: "1px solid #1a1a1a" }}>
                                <CardContent sx={{ pb: "1rem !important" }}>
                                    {statsLoading ? <CircularProgress /> : (
                                        <>
                                            <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                                Last Purchases
                                            </Typography>
                                            <Typography variant="body1" sx={{ mb: 2, fontWeight: "500" }}>
                                                Revenue Last 24h: ${stats.totalRevenueToday}<br />
                                                Revenue Last 7d: ${stats.totalRevenue7d}<br />
                                                Revenue Last 30d: ${stats.totalRevenue30d}<br />
                                            </Typography>

                                            <TableContainer component={Paper} sx={{ borderRadius: "1rem", boxShadow: "0 0 0 0", border: `1px solid ${theme.palette.divider}` }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            {isMobile ? ( <></> ) : ( <TableCell><Typography variant="body1" sx={{ fontWeight: "600" }}>ID</Typography></TableCell> )}
                                                            <TableCell><Typography variant="body1" sx={{ fontWeight: "600" }}>Plan</Typography></TableCell>
                                                            <TableCell><Typography variant="body1" sx={{ fontWeight: "600" }}>Date</Typography></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {stats.lastPurchases.map((purchase: any, index: any) => (
                                                            <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} key={index}>
                                                                {isMobile ? ( <></> ) : ( <TableCell component="th" scope="row"><Typography variant="body1">{purchase.id}</Typography></TableCell> )}
                                                                <TableCell><Typography variant="body1">{purchase.plan}</Typography></TableCell>
                                                                {/* <TableCell><Typography variant="body1">{purchase.date}</Typography></TableCell> */}
                                                                <TableCell><Typography variant="body1">{IntlRelativeTime(new Date(purchase.date).getTime())}</Typography></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </>
                                    )}

                                </CardContent>
                            </Paper>
                        </Stack>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}