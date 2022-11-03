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

                        <Badge badgeContent={<>FOR FREE</>} color="success" sx={{ mb: 4, boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", [`& .MuiBadge-badge`]: { backgroundColor: "rgb(52, 168, 83)", color: "#fff", padding: "0.75rem" } }}>
                            <Button variant="contained" color="primary" href="/login" size="large">
                                Get Started
                            </Button>
                        </Badge>

                        {/* <Box sx={{ position: "relative", minWidth: "50vw", maxWidth: "50vw", minHeight: "30vh", maxHeight: "30vh", zIndex: -1, display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center", mt: "8rem" }}>
                            <svg id="Dashboard" className="image-outline" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
                                <defs><style>{`.cls-1{fill:none;stroke:#fff;stroke-width:1px;fill-rule:evenodd;}`}</style></defs>
                                <path id="Outline" className="cls-1" d="M6.5,0.5h1907a6,6,0,0,1,6,6v1067a6,6,0,0,1-6,6H6.5a6,6,0,0,1-6-6V6.5A6,6,0,0,1,6.5.5Z"/>
                                <g id="Recent_Activity" data-name="Recent Activity">
                                    <path id="Button" className="cls-1" d="M1122,519h672a5,5,0,0,1,5,5v27a5,5,0,0,1-5,5H1122a5,5,0,0,1-5-5V524A5,5,0,0,1,1122,519Z"/>
                                    <g id="Last_3_Members" data-name="Last 3 Members">
                                        <g id="Member_3" data-name="Member 3">
                                            <path id="Server" className="cls-1" d="M1196,477.85h59a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7h-59a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,477.85Z"/>
                                            <path id="ID" className="cls-1" d="M1196,457.35h146a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7H1196a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,457.35Z"/>
                                            <path id="Name" className="cls-1" d="M1196,436.85h169a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7H1196a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,436.85Z"/>
                                            <path id="Avatar" className="cls-1" d="M1152,444.35a20,20,0,0,1,20,20v1a20,20,0,0,1-40,0v-1A20,20,0,0,1,1152,444.35Z"/>
                                        </g>
                                        <g id="Member_2" data-name="Member 2">
                                            <path id="Server-2" data-name="Server" className="cls-1" d="M1196,370.194h59a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7h-59a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,370.194Z"/>
                                            <path id="ID-2" data-name="ID" className="cls-1" d="M1196,349.694h146a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7H1196a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,349.694Z"/>
                                            <path id="Name-2" data-name="Name" className="cls-1" d="M1196,329.194h139a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7H1196a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,329.194Z"/>
                                            <path id="Avatar-2" data-name="Avatar" className="cls-1" d="M1152,336.694a20,20,0,0,1,20,20v1a20,20,0,0,1-40,0v-1A20,20,0,0,1,1152,336.694Z"/>
                                        </g>
                                        <g id="Member_1" data-name="Member 1">
                                            <path id="Server-3" data-name="Server" className="cls-1" d="M1196,262h59a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7h-59a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,262Z"/>
                                            <path id="ID-3" data-name="ID" className="cls-1" d="M1196,242h146a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7H1196a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,242Z"/>
                                            <path id="Name-3" data-name="Name" className="cls-1" d="M1196,221.5h110a7,7,0,0,1,7,7v1a7,7,0,0,1-7,7H1196a7,7,0,0,1-7-7v-1A7,7,0,0,1,1196,221.5Z"/>
                                            <path id="Avatar-3" data-name="Avatar" className="cls-1" d="M1152,229a20,20,0,0,1,20,20v1a20,20,0,0,1-40,0v-1A20,20,0,0,1,1152,229Z"/>
                                        </g>
                                    </g>
                                    <path id="Subtitle" className="cls-1" d="M1123,173h162a8,8,0,0,1,8,8v2a8,8,0,0,1-8,8H1123a8,8,0,0,1-8-8v-2A8,8,0,0,1,1123,173Z"/>
                                    <path id="Title" className="cls-1" d="M1130,118h203a14,14,0,0,1,0,28H1130A14,14,0,0,1,1130,118Z"/>
                                    <path id="Recent_Activity_Form" data-name="Recent Activity Form" className="cls-1" d="M1107,88h702a15,15,0,0,1,15,15V578a15,15,0,0,1-15,15H1107a15,15,0,0,1-15-15V103A15,15,0,0,1,1107,88Z"/>
                                </g>
                                <g id="Statistics">
                                    <path id="Graph" className="cls-1" d="M1018,262c-15.47,2.207-37.271,72.679-43,74s1.808,4-11,6-33.694,73.644-47,74-38.237-49.663-42-52,0.681-4.947-11-5-33.7-80.352-47-77-41.324,115.434-53,116-31.464-55.476-48-57-36.969,19.454-53,18-31.591-82.033-49-76-33.014,188.675-50,191-30.09-31.741-39-34-3.136-4.745-14-5-35.077-103.122-49-94-37.06,102.1-52,95-46-19-46-19v96h654V262"/>
                                    <path id="Statistics_Form" data-name="Statistics Form" className="cls-1" d="M351,88h702a15,15,0,0,1,15,15V578a15,15,0,0,1-15,15H351a15,15,0,0,1-15-15V103A15,15,0,0,1,351,88Z"/>
                                    <path id="Title-2" data-name="Title" className="cls-1" d="M375,118H490a14,14,0,0,1,0,28H375A14,14,0,0,1,375,118Z"/>
                                    <path id="Subtitle-2" data-name="Subtitle" className="cls-1" d="M368,173H665a9,9,0,0,1,9,9v2a9,9,0,0,1-9,9H368a9,9,0,0,1-9-9v-2A9,9,0,0,1,368,173Z"/>
                                </g>
                                <g id="Account">
                                    <g id="Sign_Out" data-name="Sign Out">
                                        <path id="Text" className="cls-1" d="M84.262,612.841h44.974a8,8,0,0,1,0,16H84.262A8,8,0,0,1,84.262,612.841Z"/>
                                        <path id="Form" className="cls-1" d="M13,597.844H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9v-30A9,9,0,0,1,13,597.844Z"/>
                                        <g id="Icon">
                                            <path className="cls-1" d="M22,613l2-2h8l-1,2H24v14h7l1,2H24l-2-2V613Z"/>
                                            <path className="cls-1" d="M29,619l-1,1,1,1h9l-2,3h2l3-3,1-1-4-4H36l2,3H29Z"/>
                                        </g>
                                    </g>
                                    <g id="Documentation">
                                        <path id="Text-2" data-name="Text" className="cls-1" d="M84.6,559.5h93.791a8,8,0,1,1,0,16H84.6A8,8,0,1,1,84.6,559.5Z"/>
                                        <path id="Form-2" data-name="Form" className="cls-1" d="M13,545H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9V554A9,9,0,0,1,13,545Z"/>
                                        <g id="Icon-2" data-name="Icon">
                                            <path className="cls-1" d="M27,558h4a8,8,0,0,1,8,8v8a3,3,0,0,1-3,3H27a3,3,0,0,1-3-3V561A3,3,0,0,1,27,558Z"/>
                                            <path className="cls-1" d="M39,577l-3-3H30l-3-3v-4l3-3h4l3,3v3l-1,1v1l1,1,3,3Z"/>
                                            <path className="cls-1" d="M32,567a2,2,0,1,1-2,2A2,2,0,0,1,32,567Z"/>
                                        </g>
                                    </g>
                                    <g id="Help">
                                        <path id="Text-3" data-name="Text" className="cls-1" d="M83.284,507.5h18.431a8,8,0,1,1,0,16H83.284A8,8,0,0,1,83.284,507.5Z"/>
                                        <path id="Form-3" data-name="Form" className="cls-1" d="M13,492.844H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9v-30A9,9,0,0,1,13,492.844Z"/>
                                        <g id="Icon-3" data-name="Icon">
                                            <path className="cls-1" d="M32,506a10,10,0,1,1-10,10A10,10,0,0,1,32,506Z"/>
                                            <path className="cls-1" d="M32,521h0.534a1,1,0,0,1,1,1v0.534a1,1,0,0,1-1,1H32a1,1,0,0,1-1-1V522A1,1,0,0,1,32,521Z"/>
                                            <path className="cls-1" d="M28,513l1-1v-2l2-1h4l2,2v1l1,1-1,1-2,2v2l-1,1-2.082-.013C32,518,32,516,32,516l3-2v-2l-1-1H32l-3,3Z"/>
                                        </g>
                                    </g>
                                    <g id="Upgrade">
                                        <path id="Form-4" data-name="Form" className="cls-1" d="M13,440H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9V449A9,9,0,0,1,13,440Z"/>
                                        <path id="Text-4" data-name="Text" className="cls-1" d="M83.533,456.5h44.931a8,8,0,0,1,0,16H83.533A8,8,0,0,1,83.533,456.5Z"/>
                                        <g id="Icon-4" data-name="Icon">
                                            <path className="cls-1" d="M30,459l1-1H41v-2l-2-1H25l-2,1v16l2,1H39l2-1v-2H31l-1-1V459"/>
                                            <path className="cls-1" d="M32,460v8H42v-8H32Z"/>
                                            <path className="cls-1" d="M36,462a2,2,0,1,1-2,2A2,2,0,0,1,36,462Z"/>
                                        </g>
                                    </g>
                                    <g id="Account-2" data-name="Account">
                                        <path id="Text-5" data-name="Text" className="cls-1" d="M83.542,403.5h45.914a8,8,0,0,1,0,16H83.542A8,8,0,0,1,83.542,403.5Z"/>
                                        <path id="Form-5" data-name="Form" className="cls-1" d="M13,387H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9V396A9,9,0,0,1,13,387Z"/>
                                        <g id="Icon-5" data-name="Icon">
                                            <path className="cls-1" d="M22,420v-4l1-1h2v-1l5-1v2l-1,1,1,1v2l1,1H22Z"/>
                                            <path className="cls-1" d="M32,415v-2h1l1-1v1h2l1-2,1,2h2l1-1v1l1,1-1,1H40v2h1l1,1-1,1v1l-1-1H38l-1,2-1-2H34v1l-1-1H32v-2l2-1Z"/>
                                            <path className="cls-1" d="M35,415l1-1h2l1,1v2l-1,1H36l-1-1v-2Z"/>
                                            <path className="cls-1" d="M29,404h2a3,3,0,0,1,3,3v1a3,3,0,0,1-3,3H29a3,3,0,0,1-3-3v-1A3,3,0,0,1,29,404Z"/>
                                        </g>
                                    </g>
                                </g>
                                <g id="Server-4" data-name="Server">
                                    <g id="Verified_Members" data-name="Verified Members">
                                        <path id="Text-6" data-name="Text" className="cls-1" d="M83.543,326.966H197.2a8,8,0,1,1,0,16H83.543A8,8,0,0,1,83.543,326.966Z"/>
                                        <path id="Form-6" data-name="Form" className="cls-1" d="M13,309.188H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9v-30A9,9,0,0,1,13,309.188Z"/>
                                        <g id="Icon-6" data-name="Icon">
                                            <path className="cls-1" d="M29.5,345.469l1,1h2l1-1,1-1h1l3-3v-1l1-1v-2l1-1v-8l-2-1-3-1-2-1-1-1h-2l-1,1-2,1-3,1-2,1v8l1,1v2l1,1v1l3,3h1Z"/>
                                            <path className="cls-1" d="M25.5,334.469v2l3,2v1h2v-1l6-6h1v-2h-1l-6,5h-2l-1-1-1-1Z"/>
                                        </g>
                                    </g>
                                    <g id="Custom_Bots" data-name="Custom Bots">
                                        <path id="Text-7" data-name="Text" className="cls-1" d="M83.242,273h79.512a8,8,0,0,1,0,16H83.242A8,8,0,0,1,83.242,273Z"/>
                                        <path id="Form-7" data-name="Form" className="cls-1" d="M13,257H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9V266A9,9,0,0,1,13,257Z"/>
                                        <g id="Icon-7" data-name="Icon">
                                            <path className="cls-1" d="M35.5,276h2l4,4v2l-4,4h-2v-1l4-3v-2l-4-3v-1Z"/>
                                            <path id="Shape_21_copy" data-name="Shape 21 copy" className="cls-1" d="M28.5,286h-2l-4-4v-2l4-4h2v1l-4,3v2l4,3v1Z"/>
                                        </g>
                                    </g>
                                    <g id="Backups">
                                        <path id="Text-8" data-name="Text" className="cls-1" d="M83.747,223.466h47.88a8,8,0,0,1,0,16H83.747A8,8,0,1,1,83.747,223.466Z"/>
                                        <path id="Form-8" data-name="Form" className="cls-1" d="M13,205H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9V214A9,9,0,0,1,13,205Z"/>
                                        <g id="Icon-8" data-name="Icon">
                                            <path className="cls-1" d="M23,223H35a6,6,0,0,1,6,6v10a2,2,0,0,1-2,2H25a2,2,0,0,1-2-2V223Z"/>
                                            <path className="cls-1" d="M32,233a3,3,0,1,1-3,3A3,3,0,0,1,32,233Z"/>
                                            <path className="cls-1" d="M25,225H35v4H25v-4Z"/>
                                        </g>
                                    </g>
                                    <g id="Servers">
                                        <path id="Text-9" data-name="Text" className="cls-1" d="M83.249,171.466h41a8,8,0,1,1,0,16h-41A8,8,0,0,1,83.249,171.466Z"/>
                                        <path id="Form-9" data-name="Form" className="cls-1" d="M13,153H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9V162A9,9,0,0,1,13,153Z"/>
                                        <g id="Icon-9" data-name="Icon">
                                            <path id="_1_outer" data-name="1 outer" className="cls-1" d="M22,171H41a1,1,0,0,1,1,1v3a1,1,0,0,1-1,1H22a1,1,0,0,1-1-1v-3A1,1,0,0,1,22,171Z"/>
                                            <path id="_1_inner" data-name="1 inner" className="cls-1" d="M24,173h1v1H24v-1Z"/>
                                            <path id="_1_outer-2" data-name="1 outer" className="cls-1" d="M22,177H41a1,1,0,0,1,1,1v3a1,1,0,0,1-1,1H22a1,1,0,0,1-1-1v-3A1,1,0,0,1,22,177Z"/>
                                            <path id="_1_inner-2" data-name="1 inner" className="cls-1" d="M24,179h1v1H24v-1Z"/>
                                            <path id="_1_outer-3" data-name="1 outer" className="cls-1" d="M22.5,183h19a1,1,0,0,1,1,1v3a1,1,0,0,1-1,1h-19a1,1,0,0,1-1-1v-3A1,1,0,0,1,22.5,183Z"/>
                                            <path id="_1_inner-3" data-name="1 inner" className="cls-1" d="M24.5,185h1v1h-1v-1Z"/>
                                        </g>
                                    </g>
                                </g>
                                <g id="Dashboard-2" data-name="Dashboard">
                                    <g id="Dashboard-3" data-name="Dashboard">
                                        <path id="Form-10" data-name="Form" className="cls-1" d="M13,80H226a9,9,0,0,1,9,9v30a9,9,0,0,1-9,9H13a9,9,0,0,1-9-9V89A9,9,0,0,1,13,80Z"/>
                                        <path id="Text-10" data-name="Text" className="cls-1" d="M83.781,95h64a8,8,0,0,1,0,16h-64A8,8,0,0,1,83.781,95Z"/>
                                        <path id="Icon-10" data-name="Icon" className="cls-1" d="M23,95v10h8V95H23Zm0,12v6h8v-6H23Zm10-4v10h8V103H33Zm0-2h8V95H33v6Z"/>
                                    </g>
                                </g>
                                <path id="NavBar_Line" data-name="NavBar Line" className="cls-1" d="M240,1080h-1V64h1V1080Z"/>
                                <path id="AppBar-2" data-name="AppBar" className="cls-1" d="M3.5,4.484h1913V49.516a15,15,0,0,1-15,15H18.5a15,15,0,0,1-15-15V4.484Z"/>
                                <path id="RestoreCord" className="cls-1" d="M31.992,24.387h97.855a8,8,0,0,1,8,8v2.289a8,8,0,0,1-8,8H31.992a8,8,0,0,1-8-8V32.387A8,8,0,0,1,31.992,24.387Z"/>
                            </svg>
                        </Box> */}


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
                                    <Paper elevation={1} sx={{ borderRadius: "8px", background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(0.25rem)", transition: "all 0.2s ease-in-out", "&:hover": { transform: "scale(1.05)", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)" }, border: "1px solid rgba(255, 255, 255, 0.125)" }}>
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