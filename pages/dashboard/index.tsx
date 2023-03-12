import { useRouter } from "next/router";
import { useQuery } from "react-query"
import { useToken } from "../../src/token";
import { getMemberList } from "../../src/dashboard/getMembers";

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

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Dashboard() {
    const [ token ]: any = useToken()
    const router = useRouter();
    let memId: any = 0;

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: true });

    const { data: data2, isError: isError2, isLoading: isLoading2 } = useQuery('memberList', async () => await getMemberList({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }), { retry: false });


    if (isLoading || isLoading2) return <CircularProgress />
    if (isError || isError2) return <div>Error</div>

    if (!data || !data.username || !data2) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress />
    }

    const apexChart: any = {
        options: {
            chart: {
                id: 'members',
                type: 'area',
                foreColor: '#fff',
                dropShadow: {
                    enabled: true,
                    top: 0,
                    left: 0,
                    blur: 3,
                    opacity: 0.5
                },
                zoom: {
                    enabled: false
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
                horizontalAlign: 'left'
            },
            plotOptions: {
                bar: {
                    columnWidth: '30%',
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
                theme: 'dark',
                marker: {
                    show: false
                },
                onDatasetHover: {
                    highlightDataSeries: true,
                },
            },
            noData: {
                text: 'No data',
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: '#fff',
                    fontSize: '14px',
                    fontFamily: 'Inter',
                    fontWeight: 'bold'
                },
            },
            xaxis: {
                labels: {
                    show: true,
                    rotate: 0,
                    rotateAlways: false,
                    hideOverlappingLabels: true,
                },
                tooltip: {
                    enabled: false
                },
                crosshairs: {
                    show: false,
                },
                categories: new Array(14).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
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
        series: data2 ? data2.servers.map((server: any) => ({
            name: server.name,
            data: Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return server.members.filter((member: any) => {
                    const createdAt = new Date(member.createdAt);
                    return createdAt.getDate() === date.getDate() && createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear();
                }).length;
            }).reverse()
        })) : [],
    };

    function renderAlerts() {
        return (
            <Alert severity="error" sx={{ width: "100%", my: 2 }}>
                <AlertTitle>Warning</AlertTitle>
                <Typography variant="body2" component="p" sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html:`
                We have no association with https://discord.gg/restorecord, for your own safety, we highly advise against joining it.
                
                Our official accounts are <a href="https://discord.com/users/853058505649029190">xenos#0001 (853058505649029190)</a> and <a href="https://discord.com/users/853404526613889064">Bl4ckBl1zZ#5652 (853404526613889064)</a>, and support server is <a href="https://discord.gg/restorebot">https://discord.gg/restorebot</a>
                
                Please note that we will never ask for your password or personal information, never share it with anyone. Stay safe and happy new year 🎉
                `}}></Typography>
            </Alert>
        )
    }
    
    function renderStatistics() {
        return (
            <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #18182e" }}>
                    <CardContent>
                        {isLoading2 ? ( <CircularProgress /> ) : (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                    Statistics
                                </Typography>

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
                        {isLoading2 && ( <CircularProgress /> )}

                        {!isLoading2 && (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>Recent Activity</Typography>
                                <Typography variant="body1" color="grey.200">Last verified members</Typography>
                            </>
                        )}

                        {!isLoading2 && data2.servers.map((server: any) => { 
                            return (
                                <List key={server.id} sx={{ width: "100%", maxWidth: 360 }}>
                                    {server.members.map((member: any) => {
                                        memId++;
                                        if (memId > 3) return;

                                        return (
                                            <ListItem key={member.id} sx={{ wordBreak: "break-all" }}>
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
                                                        Server: {`${server.name}`}
                                                    </>
                                                } />
                                            </ListItem>
                                        )
                                    })}
                                </List>
                            )
                        })}

                        {!isLoading2 && ( 
                            <Link href="/dashboard/members">
                                <Button variant="filled" color="white" sx={{ width: '100%' }}>
                                    View All
                                </Button>
                            </Link>
                        )}

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
                        {renderAlerts()}

                        <Grid container spacing={3}>
                            {renderStatistics()}

                            {renderLastVerified()}
                        </Grid>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}