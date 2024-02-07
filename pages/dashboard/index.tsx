import { useRouter } from "next/router";
import { useQuery } from "react-query"
import { useToken } from "../../src/token";
import { countries } from "./blacklist";
import { useState, useEffect } from "react";
import { getMemberList, getMemberStats } from "../../src/dashboard/getMembers";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import theme from "../../src/theme";

import dynamic from "next/dynamic";
import Link from "next/link";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/lab/Alert";
import AlertTitle from "@mui/lab/AlertTitle";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import { AvatarFallback } from "../../src/functions";
import { TableBody } from "@mui/material";

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Dashboard() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const [statType, setStatType] = useState<"isp" | "country" | "state" | "city" | "server">("country");

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: true });

    const { data: memberList, isError: isError2, isLoading: isLoading2, refetch: refetchMemberList } = useQuery("memberList", async () => await getMemberList({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }), { retry: false });

    const { data: recentVerified, isError: recentVerifiedError, isLoading: recentVerifiedLoading } = useQuery("recentVerified", async () => await getMemberStats({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, "recent", 6), { retry: false });

    const { data: topAnalytics, isError: topAnalyticsError, isLoading: topAnalyticsLoading, refetch: refetchTopAnalytics } = useQuery("topAnalytics", async () => await getMemberStats({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, statType, 10), { retry: true, refetchOnWindowFocus: false, enabled: process.browser, refetchInterval: 10000, refetchOnMount: false, refetchOnReconnect: false });

    const { data: newsData, isError: newsError, isLoading: newsLoading } = useQuery("news", async () => await fetch("/api/v2/news").then(res => res.json()), { retry: false });

    useEffect(() => {
        refetchTopAnalytics();
    }, [statType]);

    if (isLoading) return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    if (isError || isError2 || newsError || recentVerifiedError || topAnalyticsError) return <div>Error</div>

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    const apexChart: any = {
        options: {
            chart: {
                id: "members",
                type: "area",
                foreColor: "#fff",
                dropShadow: {
                    enabled: true,
                    top: 0,
                    left: 0,
                    blur: 3,
                    opacity: 0.5
                },
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false
                },
                sparkline: {
                    enabled: false
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                colors: [
                    theme.palette.primary.main,
                    theme.palette.error.main,
                    theme.palette.warning.main,
                    theme.palette.info.main,
                    theme.palette.success.main,
                    theme.palette.secondary.main,
                ],
                curve: "smooth",
            },
            legend: {
                horizontalAlign: "left"
            },
            plotOptions: {
                bar: {
                    columnWidth: "30%",
                    horizontal: false,
                },
            },
            fill: {
                colors: [
                    theme.palette.primary.main,
                    theme.palette.error.main,
                    theme.palette.warning.main,
                    theme.palette.info.main,
                    theme.palette.success.main,
                    theme.palette.secondary.main,
                ],
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [200, 90, 100]
                }
            },
            colors: [
                theme.palette.primary.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.info.main,
                theme.palette.success.main,
                theme.palette.secondary.main,
            ],
            tooltip: {
                theme: "dark",
                marker: {
                    show: false
                },
                onDatasetHover: {
                    highlightDataSeries: true,
                },
            },
            noData: {
                text: "No data",
                align: "center",
                verticalAlign: "middle",
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#fff",
                    fontSize: "14px",
                    fontFamily: "Inter",
                    fontWeight: "bold"
                },
            },
            xaxis: {
                type: "datetime",
                labels: {
                    show: true,
                    rotate: -45,
                    rotateAlways: false,
                    hideOverlappingLabels: true,
                    formatter: function (value: any, timestamp: any) {
                        const date = new Date(timestamp);
                        return date.toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                        });
                    }
                },
                tooltip: {
                    enabled: false
                },
                crosshairs: {
                    show: false,
                },
                categories: new Array(30).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    });
                }).reverse(),
            },
            yaxis: {
                show: true,
                opposite: true,
                labels: {
                    offsetX: -5,
                    formatter: function (val: any) {
                        if (val === undefined) return 0;
                        
                        return val.toFixed(0);
                    }
                },
            },
            grid: {
                show: false,
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
        },
        series: memberList ? memberList.servers.map((server: any) => ({
            name: server.name,
            data: Array.from({ 
                length: 30
            }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return server.members.filter((member: any) => {
                    const createdAt = new Date(member.createdAt);
                    return createdAt.getDate() === date.getDate() && createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear();
                }).length;
            }).reverse()
        })) : []
    };

    
    function renderGraph() {
        return (
            <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #1a1a1a" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        {isLoading2 ? ( <CircularProgress /> ) : (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>Verified Members</Typography>
                                <Typography variant="body1" color="grey.200">Verified members over the past 30 days</Typography>

                                <ApexChart
                                    options={apexChart.options}
                                    series={apexChart.series}
                                    type="area"
                                    height={350}
                                />
                            </>
                        )}
                    </CardContent>
                </Paper>
            </Grid>
        )
    }

    function renderLastVerified() {
        return (
            <Grid item xs={12} md={6}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #1a1a1a" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        {recentVerifiedLoading && ( <CircularProgress /> )}

                        {!recentVerifiedLoading && (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>Recent Activity</Typography>
                                <Typography variant="body1" color="grey.200">Last verified members</Typography>
                            </>
                        )}

                        {!recentVerifiedLoading && recentVerified.content.map((member: any) => { 
                            return (
                                <List key={member.id} sx={{ width: "100%", maxWidth: 360 }}>
                                    <ListItem key={member.id} sx={{ wordBreak: "break-word" }} disablePadding={true}>
                                        <ListItemAvatar>
                                            <AvatarFallback url={member.avatar ? `https://cdn.discordapp.com/avatars/${member.userId}/${member.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${Number(member.username.split("#")[1]) % 5}.png?size=128`} fallback={`https://cdn.discordapp.com/embed/avatars/${Number(member.username.split("#")[1]) % 5}.png?size=128`} username={member.username} />
                                        </ListItemAvatar>
                                        <ListItemText primary={`${member.username.endsWith("#0") ? `@${member.username.slice(0, -2)}` : member.username}`} secondary={
                                            <>
                                                Id: {`${member.userId}`}<br/>
                                                Verified: {`${new Date(member.createdAt).toLocaleDateString()}`}
                                            </>
                                        } />
                                    </ListItem>
                                </List>
                            )
                        })}

                        {!recentVerifiedLoading && recentVerified.content.length === 0 && (
                            <List sx={{ width: "100%", maxWidth: 360 }}>
                                {Array.from({ length: 6 }, (_, i) => (
                                    <ListItem key={i} sx={{ wordBreak: "break-word" }} disablePadding={true}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ width: "40px", height: "40px" }} />
                                        </ListItemAvatar>
                                        <ListItemText primary={<Skeleton color="white" width={Math.floor(Math.random() * 150) + 50} height={"24px"} />} secondary={
                                            <>
                                                <Skeleton width={Math.floor(Math.random() * 150) + 50} height={"20px"} />
                                                <Skeleton width={Math.floor(Math.random() * 150) + 50} height={"20px"} />
                                            </>
                                        } />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        {!recentVerifiedLoading && ( 
                            <Link href="/dashboard/members">
                                <Button variant="filled" color="white" sx={{ width: "100%" }}>
                                    View All
                                </Button>
                            </Link>
                        )}

                    </CardContent>
                </Paper>
            </Grid>
        )
    }


    function rendertopAnalytics() {
        return (
            <Grid item xs={12} md={6}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #1a1a1a" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        {topAnalyticsLoading && <CircularProgress />}

                        {!topAnalyticsLoading && (
                            <>
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center" justifyContent={"space-between"}>
                                    <Typography variant="h4" sx={{ fontWeight: "700", wordBreak: "break-word" }}>Top Analytics</Typography>
                                    <FormControl sx={{ minWidth: 120 }}>
                                        <Select value={statType} onChange={(e) => { if ((data.role === "business" || data.role === "enterprise") && (e.target.value !== "country" && e.target.value !== "server")) setStatType(e.target.value as any)}} displayEmpty={true} inputProps={{ "aria-label": "Without label" }}>
                                            <MenuItem value="country">Country</MenuItem>
                                            <MenuItem value="server">Server</MenuItem>
                                            <MenuItem value="state" disabled={data.role !== "business" && data.role !== "enterprise"}>
                                                {data.role === "business" || data.role === "enterprise" ? (
                                                    "State"
                                                ) : (
                                                    <Tooltip title="Upgrade to Business plan to unlock this feature" arrow><>State</></Tooltip>
                                                )}
                                            </MenuItem>
                                            <MenuItem value="city" disabled={data.role !== "business" && data.role !== "enterprise"}>
                                                {data.role === "business" || data.role === "enterprise" ? (
                                                    "City"
                                                ) : (
                                                    <Tooltip title="Upgrade to Business plan to unlock this feature" arrow><>City</></Tooltip>
                                                )}
                                            </MenuItem>
                                            <MenuItem value="isp" disabled={data.role !== "business" && data.role !== "enterprise"}>
                                                {data.role === "business" || data.role === "enterprise" ? (
                                                    "ISP"
                                                ) : (
                                                    <Tooltip title="Upgrade to Business plan to unlock this feature" arrow><>ISP</></Tooltip>
                                                )}
                                            </MenuItem>
                                        </Select>

                                    </FormControl>
                                </Stack>
                            </>
                        )}

                        <Table>
                            <TableBody>
                                {!topAnalyticsLoading && topAnalytics.content.map((analytic: any, id: number) => {
                                    return (
                                        <TableRow key={id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {statType === "country" && countries.find((c: any) => c.name === analytic.name) && (<Avatar alt="Country" src={`https://cdn.ipregistry.co/flags/twemoji/${countries.find((c: any) => c.name === analytic.name)?.code.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0 }} />)}
                                                    <Typography variant="body1" color="grey.200">
                                                        {analytic.link ? <a href={analytic.link} target="_blank" rel="noopener noreferrer">{analytic.name}</a> : analytic.name}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1" color="grey.200">{analytic.count}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}

                                {!topAnalyticsLoading && topAnalytics.content.length === 0 && countries.slice(0, 10).map((country: any) => {
                                    return (
                                        <TableRow key={country.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Avatar alt="Country" src={`https://cdn.ipregistry.co/flags/twemoji/${country.code.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0 }} />
                                                    <Typography variant="body1" color="grey.200">{country.name}</Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1" color="grey.200">0</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Paper>
            </Grid>
        )
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        {newsLoading && <CircularProgress />}

                        {!newsLoading && newsData.news.map((item: any) => {
                            if (window.localStorage.getItem("alerts")?.includes(item.id)) return null;

                            return (
                                <Alert key={item.id} id={item.id} severity={item.severity === 0 ? "info" : (item.severity === 1 ? "success" : (item.severity === 2 ? "warning" : "error"))} sx={{ width: "100%", my: 2 }} onClose={() => {
                                    try {
                                        const alerts = JSON.parse(window.localStorage.getItem("alerts") ?? "[]");
                                        alerts.push(item.id);
                                        window.localStorage.setItem("alerts", JSON.stringify(alerts));
                                        document.getElementById(item.id)?.remove();
                                    } catch (err) {}
                                }}>
                                    <AlertTitle>{item.title}</AlertTitle>
                                    <Typography variant="body2" component="p" sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: item.content }}></Typography>
                                </Alert>
                            )
                        })}

                        {renderGraph()}

                        <Grid container spacing={3} sx={{ mt: 3 }}>
                            {renderLastVerified()}
                          
                            {rendertopAnalytics()}
                        </Grid>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}