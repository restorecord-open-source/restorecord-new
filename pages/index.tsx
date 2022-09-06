import Footer from "../components/landing/Footer";
import NavBar from "../components/landing/NavBar";
import StatisticsSection from "../components/landing/sections/Statistics";
import SubscriptionPlansSection from "../components/landing/sections/SubscriptionPlans";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import VpnKeyOffRoundedIcon from '@mui/icons-material/VpnKeyOffRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

export default function Home() {
    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex" }}>
                <Container maxWidth="xl" sx={{ mx: "auto", justifyContent: "center", alignItems: "center"}}>
                    <NavBar />

                    <Box sx={{ my: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Typography color="primary" variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: "2.5rem", md: "3rem", lg: "4rem" } }}>
                            RestoreCord
                        </Typography>
                        <Typography color="grey.200" variant="h5" component="h2" sx={{ textAlign: "center", padding: 4, paddingLeft: { xs: 2, sm: 16 }, paddingRight: { xs: 2, sm: 16 } }}>
                            RestoreCord helps you Backup your Discord Server, you can save your Server Channels, Roles, Settings and Members.
                        </Typography>

                        <Button variant="contained" color="primary" href="/login">
                            Get Started
                        </Button>

                        <Typography variant="h3" component="h2" sx={{ textAlign: "center", marginTop: 32, fontWeight: "semibold" }} id="features">
                            Our Features
                        </Typography>
                        <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "normal", marginBottom: "2.5rem" }}>
                            Not sure what you need? Check out our features below.
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={1} sx={{ borderColor: "grey.800", borderRadius: "8px" }}>
                                    <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                                        <Paper elevation={0} sx={{ width: "56px", height: "56px", marginBottom: 2, borderRadius: "50%", alignItems: "center", justifyContent: "center", display: "flex", backgroundColor: "primary.main", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)" }}>
                                            <SpeedRoundedIcon sx={{ fontSize: 32 }} />
                                        </Paper>
                                        <Typography variant="h5" component="h2" sx={{ textAlign: "center", fontWeight: "700", fontSize: "1.5rem" }}>
                                            Fast Speed
                                        </Typography>
                                        <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "500", fontSize: "1rem" }}>
                                            We are working hard to make RestoreCord pull members from your server as fast as possible.
                                        </Typography>
                                    </CardContent>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={1} sx={{ borderColor: "grey.800", borderRadius: "8px", fontSize: "1.25rem" }}>
                                    <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                                        <Paper elevation={0} sx={{ width: "56px", height: "56px", marginBottom: 2, borderRadius: "50%", alignItems: "center", justifyContent: "center", display: "flex", backgroundColor: "primary.main", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)" }}>
                                            <SellRoundedIcon sx={{ fontSize: 32 }} />
                                        </Paper>
                                        <Typography variant="h5" component="h2" sx={{ textAlign: "center", fontWeight: "700", fontSize: "1.5rem" }}>
                                            Affordable Pricing
                                        </Typography>
                                        <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "500", fontSize: "1rem" }}>
                                            We try to make RestoreCord as affordable as possible, starting at $2 per month.
                                        </Typography>
                                    </CardContent>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={1} sx={{ borderColor: "grey.800", borderRadius: "8px", fontSize: "1.25rem" }}>
                                    <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                                        <Paper elevation={0} sx={{ width: "56px", height: "56px", marginBottom: 2, borderRadius: "50%", alignItems: "center", justifyContent: "center", display: "flex", backgroundColor: "primary.main", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)" }}>
                                            <SupportAgentRoundedIcon sx={{ fontSize: 32 }} />
                                        </Paper>
                                        <Typography variant="h5" component="h2" sx={{ textAlign: "center", fontWeight: "700", fontSize: "1.5rem" }}>
                                            Support
                                        </Typography>
                                        <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "500", fontSize: "1rem" }}>
                                            We have a 24/7 support team to help you with any questions you have.
                                        </Typography>
                                    </CardContent>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={1} sx={{ borderColor: "grey.800", borderRadius: "8px", fontSize: "1.25rem" }}>
                                    <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                                        <Paper elevation={0} sx={{ width: "56px", height: "56px", marginBottom: 2, borderRadius: "50%", alignItems: "center", justifyContent: "center", display: "flex", backgroundColor: "primary.main", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)" }}>
                                            <ShowChartRoundedIcon sx={{ fontSize: 32 }} />
                                        </Paper>
                                        <Typography variant="h5" component="h2" sx={{ textAlign: "center", fontWeight: "700", fontSize: "1.5rem" }}>
                                            Live Statistics
                                        </Typography>
                                        <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "500", fontSize: "1rem" }}>
                                            RestoreCord has a built in live statistics to help you keep track of your servers and members.
                                        </Typography>
                                    </CardContent>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={1} sx={{ borderColor: "grey.800", borderRadius: "8px", fontSize: "1.25rem" }}>
                                    <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                                        <Paper elevation={0} sx={{ width: "56px", height: "56px", marginBottom: 2, borderRadius: "50%", alignItems: "center", justifyContent: "center", display: "flex", backgroundColor: "primary.main", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)" }}>
                                            <VpnKeyOffRoundedIcon sx={{ fontSize: 32 }} />
                                        </Paper>
                                        <Typography variant="h5" component="h2" sx={{ textAlign: "center", fontWeight: "700", fontSize: "1.5rem" }}>
                                            VPN Blocking
                                        </Typography>
                                        <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "500", fontSize: "1rem" }}>
                                            We offer a VPN blocking feature to help you protect your server from people who are using VPNs.
                                        </Typography>
                                    </CardContent>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Paper elevation={1} sx={{ borderColor: "grey.800", borderRadius: "8px", fontSize: "1.25rem" }}>
                                    <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                                        <Paper elevation={0} sx={{ width: "56px", height: "56px", marginBottom: 2, borderRadius: "50%", alignItems: "center", justifyContent: "center", display: "flex", backgroundColor: "primary.main", boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)" }}>
                                            <TuneRoundedIcon sx={{ fontSize: 32 }} />
                                        </Paper>
                                        <Typography variant="h5" component="h2" sx={{ textAlign: "center", fontWeight: "700", fontSize: "1.5rem" }}>
                                            Customization
                                        </Typography>
                                        <Typography color="grey.600" variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "500", fontSize: "1rem" }}>
                                            On RestoreCord you can customize your servers verification page to your liking.
                                        </Typography>
                                    </CardContent>
                                </Paper>
                            </Grid>
                        </Grid>

                        <SubscriptionPlansSection />

                        <StatisticsSection />
                    </Box>
                </Container>
                <Footer />
            </Box>
        </>
    );
}