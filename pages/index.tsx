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
import Badge from "@mui/material/Badge";
import theme from "../src/theme";
import Head from "next/head";

const FeatureList: Features[] = [
    {
        name: "Fast Speed",
        description: "Our servers are located in the US and Europe, and we use the latest hardware to ensure the best possible speed.",
        icon: <SpeedRoundedIcon sx={{ fontSize: 32 }} />
    },
    {
        name: "Affordable Pricing",
        description: "We offer the best pricing in the market, with a free plan that includes all the features you need to get started.",
        icon: <SellRoundedIcon sx={{ fontSize: 32 }} />,
    },
    {
        name: "Support",
        description: "We have a dedicated support team that is always ready to help you with any questions you may have.",
        icon: <SupportAgentRoundedIcon sx={{ fontSize: 32 }} />,
    },
    {
        name: "Live Statistics",
        description: "RestoreCord has built-in live statistics that you can use to track your server's growth.",
        icon: <ShowChartRoundedIcon sx={{ fontSize: 32 }} />,
    },
    {
        name: "VPN Blocking",
        description: "We offer VPN blocking to prevent users from using VPNs to bypass your server's rules.",
        icon: <VpnKeyOffRoundedIcon sx={{ fontSize: 32 }} />,
    },
    {
        name: "Customization",
        description: "We offer a wide range of customization options to make your server stand out from the crowd.",
        icon: <TuneRoundedIcon sx={{ fontSize: 32 }} />,
    },
];

interface Features {
    name: string;
    description: string;
    icon: any;
}

export default function Home() {
    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - The Recovery Service" />
                </Head>

                <Container maxWidth="xl" sx={{ mx: "auto", justifyContent: "center", alignItems: "center"}}>
                    <NavBar />

                    <Box sx={{ my: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Typography color="primary" variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: "2.5rem", md: "3rem", lg: "4rem" } }}>
                            RestoreCord
                        </Typography>
                        <Typography color={theme.palette.grey[200]} variant="h5" component="h2" sx={{ textAlign: "center", padding: 4, paddingLeft: { xs: 2, sm: 16 }, paddingRight: { xs: 2, sm: 16 } }}>
                            We provide a free and easy to use Discord server backup service.
                        </Typography>

                        <Badge badgeContent={<>FOR FREE</>} color="success" sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", [`& .MuiBadge-badge`]: { backgroundColor: "rgb(52, 168, 83)", color: "#fff" } }}>
                            <Button variant="contained" color="primary" href="/login" size="large">
                                Get Started
                            </Button>
                        </Stack>

                        <Box id="features" sx={{ marginTop: 4 }} />

                        <Typography variant="h3" component="h2" sx={{ textAlign: "center", marginTop: 24, fontWeight: "semibold" }}>
                            Our Features
                        </Typography>
                        <Typography color={theme.palette.grey[600]} variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "normal", marginBottom: "2.5rem" }}>
                            Not sure what you need? Check out our features below.
                        </Typography>

                        <Grid container spacing={4}>
                            {FeatureList.map((feature, id) => (
                                <Grid item xs={12} sm={6} md={4} key={id}>
                                    <Paper 
                                        elevation={1} 
                                        sx={{ borderRadius: "8px", background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(0.25rem)", transition: "all 0.2s ease-in-out", "&:hover": { transform: "scale(1.05)", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)" }, border: "1px solid rgba(255, 255, 255, 0.125)" }}>
                                        <CardContent sx={{ alignItems: "center", display: "flex", flexDirection: "column" }}>
                                            <Paper elevation={0} sx={{ width: "56px", height: "56px", marginBottom: 2, borderRadius: "50%", alignItems: "center", justifyContent: "center", display: "flex", backgroundColor: theme.palette.primary.main, boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)" }}>
                                                {feature.icon}
                                            </Paper>
                                            <Typography variant="h5" component="h2" sx={{ textAlign: "center", fontWeight: "700", fontSize: "1.5rem" }}>
                                                {feature.name}
                                            </Typography>
                                            <Typography color={theme.palette.grey[600]} variant="h6" component="h2" sx={{ textAlign: "center", fontWeight: "500", fontSize: "1rem" }}>
                                                {feature.description}
                                            </Typography>
                                        </CardContent>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        <SubscriptionPlansSection />

                        <StatisticsSection />
                    </Box>
                </Container>
                <div style={{ marginBottom: "2.5rem" }} />
                <Footer />
            </Box>
        </>
    );
}