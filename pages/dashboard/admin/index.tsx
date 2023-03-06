import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useToken } from "../../../src/token";
import { useEffect, useState } from "react";

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
import CircularProgress from "@mui/material/CircularProgress";
import GroupIcon from "@mui/icons-material/Group";
import StorageIcon from "@mui/icons-material/Storage";
import Divider from "@mui/material/Divider";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import TimelineIcon from "@mui/icons-material/Timeline";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import PeopleIcon from "@mui/icons-material/People";
import SavingsIcon from "@mui/icons-material/Savings";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import theme from "../../../src/theme";

export default function Admin() {
    const router = useRouter();
    const [token]: any = useToken();
    const [stats, setStats]: any = useState({});

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });

    useEffect(() => {
        fetch("/api/admin/stats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        }).then(res => res.json()).then(data => {
            setStats(data);
        }).catch(err => {
            console.log(err);
        });
    }, []);

    if (isLoading) return <CircularProgress />
    if (isError) return <div>Error</div>

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress />
    }

    if (!data.admin) return <ErrorPage statusCode={404} /> 



    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                            <CardContent>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                    Admin Panel
                                </Typography>

                                <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                                    <Button variant="contained" href="/dashboard/admin/user"><GroupIcon sx={{ mr: 1 }} />User</Button>
                                    <Button variant="contained" href="/dashboard/admin/servers"><StorageIcon sx={{ mr: 1 }} />Servers</Button>
                                    <Button variant="contained" href="/dashboard/admin/bots"><SmartToyIcon sx={{ mr: 1 }} />Bots</Button>
                                    <Button variant="contained" href="/dashboard/admin/stats"><TimelineIcon sx={{ mr: 1 }} />Graphs</Button>
                                </Stack>
                            </CardContent>
                        </Paper>
                        
                        {/* 2 split with stats and last purchases */}
                        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 2 }}>
                            <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", width: "100%" }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                        Stats
                                    </Typography>

                                    {stats.accounts ? (
                                        <TableContainer component={Paper} sx={{ borderRadius: "1rem", boxShadow: "0 0 0 0", border: `1px solid ${theme.palette.divider}` }}>
                                            <Table>
                                                <TableBody>
                                                    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                        <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}><PeopleIcon sx={{ mr: 1, mb: -0.75 }} />Accounts</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">{stats.accounts}</Typography></TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                        <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}><SavingsIcon sx={{ mr: 1, mb: -0.75 }} />Premium Accounts</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">{stats.accountsPremium}</Typography></TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                        <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}><PaymentIcon sx={{ mr: 1, mb: -0.75 }} />Business Accounts</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">{stats.accountsBusiness}</Typography></TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                        <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}><StorageIcon sx={{ mr: 1, mb: -0.75 }} />Servers</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">{stats.servers}</Typography></TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                        <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}><SmartToyIcon sx={{ mr: 1, mb: -0.75 }} />Bots</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">{stats.customBots}</Typography></TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                        <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}><PaymentsIcon sx={{ mr: 1, mb: -0.75 }} />Payments</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">{stats.paymentsCompleted}</Typography></TableCell>
                                                    </TableRow>
                                                    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                        <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}><AccountBalanceIcon sx={{ mr: 1, mb: -0.75 }} />Total Revenue</Typography></TableCell>
                                                        <TableCell><Typography variant="body1">${stats.totalRevenue} (Today: ${stats.totalRevenueToday})</Typography></TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : ( <CircularProgress /> )}

                                </CardContent>
                            </Paper>


                            <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", width: "100%" }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "500" }}>
                                        Last Purchases
                                    </Typography>

                                    <TableContainer component={Paper} sx={{ borderRadius: "1rem", boxShadow: "0 0 0 0", border: `1px solid ${theme.palette.divider}` }}>
                                        <Table>
                                            <TableBody>
                                                <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                    <TableCell component="th" scope="row"><Typography variant="body1" sx={{ fontWeight: "600" }}>x</Typography></TableCell>
                                                    <TableCell><Typography variant="body1">uncomplete</Typography></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                </CardContent>
                            </Paper>
                        </Stack>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}