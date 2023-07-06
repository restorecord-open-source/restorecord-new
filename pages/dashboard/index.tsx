import { useRouter } from "next/router";
import { useQuery } from "react-query"
import { useToken } from "../../src/token";
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
import { countries } from "./blacklist";
import Stack from "@mui/material/Stack";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard() {
    const [ token ]: any = useToken()
    const router = useRouter();
    let memId: any = 0;

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: true });

    const { data: data2, isError: isError2, isLoading: isLoading2 } = useQuery("memberList", async () => await getMemberList({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }), { retry: false });

    const { data: recentVerified, isError: recentVerifiedError, isLoading: recentVerifiedLoading } = useQuery("recentVerified", async () => await getMemberStats({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, "recent", 6), { retry: false });

    const { data: topCountries, isError: topCountriesError, isLoading: topCountriesLoading } = useQuery("topCountries", async () => await getMemberStats({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, "country"), { retry: false });

    const { data: newsData, isError: newsError, isLoading: newsLoading } = useQuery("news", async () => await fetch("/api/v2/news").then(res => res.json()), { retry: false });

    if (isLoading || isLoading2 || newsLoading || recentVerifiedLoading || topCountriesLoading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress /></Box>
    if (isError || isError2 || newsError || recentVerifiedError || topCountriesError) return <div>Error</div>

    if (!data || !data.username || !data2) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}><CircularProgress /></Box>
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
                        return date.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                    }
                },
                tooltip: {
                    enabled: false
                },
                crosshairs: {
                    show: false,
                },
                categories: Array.from({ length: 56 }, (_, i) => {
                    const currentDate = new Date();
                    const daysAgo = Math.floor(i / 4) - 13; // Go back 14 days and add days incrementally
                    const hoursOffset = (i % 4) * 4; // Offset hours within each day
                    currentDate.setDate(currentDate.getDate() + daysAgo);
                    currentDate.setHours(hoursOffset);
                    return currentDate.getTime();
                }),
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
        series: data2 ? data2.servers.map((server: any) => ({
            name: server.name,
            data: Array.from({ length: 56 }, (_, i) => {
                const currentDate = new Date();
                const daysAgo = Math.floor(i / 4) - 13; // Go back 14 days and add days incrementally
                const hoursOffset = (i % 4) * 4; // Offset hours within each day
                currentDate.setDate(currentDate.getDate() + daysAgo);
                currentDate.setHours(hoursOffset);
                const currentSlot: any = currentDate.getTime();
                const nextSlot: any = currentSlot + 4 * 60 * 60 * 1000; // Add 4 hours
                return server.members.filter((member: any) => {
                    const createdAt: any = new Date(member.createdAt);
                    return (
                        createdAt >= currentSlot && createdAt < nextSlot
                    );
                }).length;
            })
        })) : [],
    };
    
    function renderGraph() {
        return (
            <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #18182e" }}>
                    <CardContent>
                        {isLoading2 ? ( <CircularProgress /> ) : (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>Verified Members</Typography>
                                <Typography variant="body1" color="grey.200">Verified members over the past 14 days</Typography>

                                <Chart options={apexChart.options} series={apexChart.series} type="area" height={350} />
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
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #18182e" }}>
                    <CardContent>
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
                                    <ListItem key={member.id} sx={{ wordBreak: "break-all" }} disablePadding={true}>
                                        <ListItemAvatar>
                                            {member.avatar.length > 1 ? (
                                                <Avatar src={`https://cdn.discordapp.com/avatars/${member.userId}/${member.avatar}?size=128`} />
                                            ) : (
                                                <Avatar src={`https://cdn.discordapp.com/embed/avatars/${member.avatar}.png`} />
                                            )}
                                        </ListItemAvatar>
                                        <ListItemText primary={`${member.username}`} secondary={
                                            <>
                                                Id: {`${member.userId}`}<br/>
                                                Verified: {`${new Date(member.createdAt).toLocaleDateString()}`}
                                            </>
                                        } />
                                    </ListItem>
                                </List>
                            )
                        })}

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


    function renderTopCountries() {
        // show a table like list of the top 10 countries with the most verified members
        return (
            <Grid item xs={12} md={6}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #18182e" }}>
                    <CardContent>
                        {topCountriesLoading && ( <CircularProgress /> )}

                        {!topCountriesLoading && (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>Top Countries</Typography>
                                <Typography variant="body1" color="grey.200">Countries with the most verified members</Typography>
                            </>
                        )}

                        <Table>
                            {!topCountriesLoading && topCountries.content.map((country: any) => {
                                return (
                                    <TableRow key={country.country} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                        <TableCell>
                                            {/* look up country code from countries via name */}
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {countries.find((c: any) => c.name === country.country) && (
                                                    <Avatar alt="Country" src={`https://cdn.ipregistry.co/flags/twemoji/${countries.find((c: any) => c.name === country.country)?.code.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0 }} />
                                                )}
                                                <Typography variant="body1" color="grey.200">{country.country}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" color="grey.200">{country.count}</Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            )}
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
                        {newsData.news.map((item: any) => {
                            if (window.localStorage.getItem("alerts")?.includes(item.id)) return null;

                            return (
                                <Alert key={item.id} id={item.id} severity={item.severity === 0 ? "info" : (item.severity === 1 ? "warning" : "error")} sx={{ width: "100%", my: 2 }} onClose={() => {
                                    try {
                                        const alerts = JSON.parse(window.localStorage.getItem("alerts") ?? "[]");
                                        alerts.push(item.id);
                                        window.localStorage.setItem("alerts", JSON.stringify(alerts));
                                        document.getElementById(item.id)?.remove();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}>
                                    <AlertTitle>{item.title}</AlertTitle>
                                    <Typography variant="body2" component="p" sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: item.content }}></Typography>
                                </Alert>
                            )
                        })}

                        {renderGraph()}

                        <Grid container spacing={3} sx={{ mt: 3 }}>
                            {renderLastVerified()}
                          
                            {renderTopCountries()}
                        </Grid>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}