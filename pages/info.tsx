import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import NavBar from "../components/landing/NavBar";
import StorageIcon from "@mui/icons-material/Storage";
import PersonIcon from "@mui/icons-material/Person";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import CodeIcon from "@mui/icons-material/Code";
import SvgIcon from "@mui/icons-material/Storage";
import theme from "../src/theme";
import axios from "axios";
import { useQuery } from "react-query";
import Stack from "@mui/material/Stack";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

async function getStats() {
    return await axios.get(`/api/v1/stats`, {
        validateStatus: () => true
    })
        .then((res: any) => { return res.data; })
        .catch((err: any) => { return err; });    
}

async function getInfo() {
    return await axios.get(`/api/v1/info`, {
        validateStatus: () => true
    })
        .then((res: any) => { return res.data; })
        .catch((err: any) => { return err; });    
}

export default function Info() {
    let members24h: any = [];
    let members7d: any = [];
    let members30d: any = [];


    const { data, isError, isLoading, refetch } = useQuery('stats', async () => await getStats(), { retry: false,  refetchOnWindowFocus: true });
    const { data: data2, isError: isError2, isLoading: isLoading2, refetch: refetch2 } = useQuery('info', async () => await getInfo(), { retry: false,  refetchOnWindowFocus: true });

    const timeArr24h = Array.from({ length: 24 }, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - (24 - i));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const timeArr7d = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (7 - i));
        return date.toLocaleDateString();
    });

    const timeArr30d = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (30 - i));
        return date.toLocaleDateString();
    });

    if (!isLoading2 && data2) {
        members24h = Array.from({ length: 24 }, (_, i) => {
            return data2.last24h.filter((x: any) => {
                return x[i];
            }).length;
        });

        members7d = Array.from({ length: 7 }, (_, i) => {
            console.log(data2.last7d)
            return data2.last7d.filter((x: any) => {
                return x[i];
            }).length;
        });

        members30d = Array.from({ length: 30 }, (_, i) => {
            return data2.last30d.filter((x: any) => {
                return x[i];
            }).length;
        });
    }


    const apexChart24: any = {
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
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                colors: ['#4f46e5'],
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
                colors: ['#4f46e5'],
            },
            tooltip: {
                theme: 'dark',
                marker: {
                    show: false
                },
                onDatasetHover: {
                    highlightDataSeries: false,
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
                    fontFamily: 'Roboto',
                    fontWeight: 'bold'
                },
            },
            xaxis: {
                labels: {
                    show: false
                },
                tooltip: {
                    enabled: false
                },
                categories: timeArr24h
            },
            yaxis: {
                show: true,
                opposite: true,
                labels: {
                    offsetX: -5,
                    formatter: function (val: any) {
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
        series: [
            {
                name: "Members",
                data: members24h
            }
        ]
    };

    const apexChart7: any = {
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
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                colors: ['#4f46e5'],
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
                colors: ['#4f46e5'],
            },
            tooltip: {
                theme: 'dark',
                marker: {
                    show: false
                },
                onDatasetHover: {
                    highlightDataSeries: false,
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
                    fontFamily: 'Roboto',
                    fontWeight: 'bold'
                },
            },
            xaxis: {
                labels: {
                    show: false
                },
                tooltip: {
                    enabled: false
                },
                categories: timeArr7d
            },
            yaxis: {
                show: true,
                opposite: true,
                labels: {
                    offsetX: -5,
                    formatter: function (val: any) {
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
        series: [
            {
                name: "Members",
                data: members7d
            }
        ]
    };

    const apexChart30: any = {
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
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                colors: ['#4f46e5'],
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
                colors: ['#4f46e5'],
            },
            tooltip: {
                theme: 'dark',
                marker: {
                    show: false
                },
                onDatasetHover: {
                    highlightDataSeries: false,
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
                    fontFamily: 'Roboto',
                    fontWeight: 'bold'
                },
            },
            xaxis: {
                labels: {
                    show: false
                },
                tooltip: {
                    enabled: false
                },
                categories: timeArr30d
            },
            yaxis: {
                show: true,
                opposite: true,
                labels: {
                    offsetX: -5,
                    formatter: function (val: any) {
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
        series: [
            {
                name: "Members",
                data: members30d
            }
        ]
    };

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex" }}>
                <Container maxWidth="xl" sx={{ mx: "auto", justifyContent: "center", alignItems: "center"}}>
                    <NavBar />

                    <Grid container spacing={4}>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <ContactPageIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    {isLoading ? <Typography variant="h5">Loading...</Typography> : <Typography variant="h5">{data.accounts}</Typography>}
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Accounts
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <StorageIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    {isLoading ? <Typography variant="h5">Loading...</Typography> : <Typography variant="h5">{data.servers}</Typography>}
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Servers
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <PersonIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    {isLoading ? <Typography variant="h5">Loading...</Typography> : <Typography variant="h5">{data.members}</Typography>}
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Members
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <CodeIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    {isLoading ? <Typography variant="h5">Loading...</Typography> : <Typography variant="h5">{data.bots}</Typography>}
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Custom Bots
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 4 }}>
                        <Chart options={apexChart24.options} series={apexChart24.series} type="area" height={350} width={500} />
                        <Chart options={apexChart7.options} series={apexChart7.series} type="area" height={350} width={500} />
                        <Chart options={apexChart30.options} series={apexChart30.series} type="area" height={350} width={500} />
                    </Stack>
                </Container>
            </Box>
        </>
    );
}