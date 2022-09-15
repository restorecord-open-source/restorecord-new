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
import { useEffect } from "react";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

async function getStats() {
    return await axios.get(`/api/v1/stats`, {
        validateStatus: () => true
    })
        .then((res: any) => { return res.data; })
        .catch((err: any) => { return err; });    
}

export default function Info() {
    const { data, isError, isLoading, refetch } = useQuery('stats', async () => await getStats(), { retry: false,  refetchOnWindowFocus: true });

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
                                    {isLoading ? <Typography variant="h5">Loading...</Typography> : <Typography variant="h5">{data.accounts.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>}
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
                                    {isLoading ? <Typography variant="h5">Loading...</Typography> : <Typography variant="h5">{data.servers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>}
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
                                    {isLoading ? <Typography variant="h5">Loading...</Typography> : <Typography variant="h5">{data.members.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>}
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
                </Container>
            </Box>
        </>
    );
}