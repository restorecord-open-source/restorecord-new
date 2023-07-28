import Footer from "../components/landing/Footer";
import NavBar from "../components/landing/NavBar";
import SubscriptionList from "../src/SubscriptionList";
import theme from "../src/theme";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import Badge from "@mui/material/Badge";
import Head from "next/head";
import AOS from "aos";
import Typed from "typed.js";
import CardActions from "@mui/material/CardActions";
import Card from "@mui/material/Card";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import Avatar from "@mui/material/Avatar";
import Image from "next/image";

import { useEffect, useRef } from "react";


export default function Home() {
    const typingElement: any = useRef(null);
    const typed: any = useRef(null);
  
    useEffect(() => {
        AOS.init({
            offset: 200,
            duration: 400,
        });

        const options = {
            strings: [
                "safest",
                "easiest",
                "fastest",
                "best",
            ],
            typeSpeed: 90,
            backSpeed: 90,
            loop: true,
        };
      
        typed.current = new Typed(typingElement.current, options);
      
        return () => {
            typed.current.destroy();
        }
    }, [])

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - The Recovery Service" />
                </Head>

                <Container maxWidth="xl" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>
                    <NavBar />

                    <Box sx={{ my: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        {/* <Typography data-aos="fade-down" variant="h1" component="h1" sx={{ fontWeight: 900, textAlign: "center", fontSize: { xs: "1.5rem", md: "2.5rem", lg: "3.5rem" },  padding: 0, paddingLeft: { xs: "4px", sm: "40px" }, paddingRight: { xs: "4px", sm: "40px" } }}>
                            The <span style={{ color: theme.palette.secondary.main }} ref={typingElement}></span> way to<br/>backup your Discord servers.
                        </Typography>
                        <Typography data-aos="fade-down" color={theme.palette.grey[200]} variant="h5" component="h2" sx={{ fontWeight: 300, textAlign: "center", padding: 4, paddingLeft: { xs: "2rem", sm: "4rem", md: "12rem",  }, paddingRight: { xs: "2rem", sm: "4rem", md: "12rem",  } }}>
                            RestoreCord is a service for restoring or backing up Discord servers
                        </Typography>

                        <Badge data-aos="fade-down" badgeContent={<>FOR FREE</>} color="success" sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", [`& .MuiBadge-badge`]: { backgroundColor: "rgb(52, 168, 83)", color: "#fff" } }}>
                            <Button variant="contained" color="primary" href="/login" size="large">
                                Start Now
                            </Button>
                        </Badge> */}

                        {/* show text on the top with a small description and 2 button, Get Started and Learn More then an dashboard image to the bottom "https://cdn.restorecord.com/static/images/homepage/dashboard_mu.png" */}
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }} data-aos="zoom-in-down">
                            <Typography data-aos="fade-down" variant="h1" component="h1" sx={{ fontWeight: 900, textAlign: "center", fontSize: { xs: "1.5rem", md: "2.5rem", lg: "3.5rem" },  padding: 0, paddingLeft: { xs: "4px", sm: "40px" }, paddingRight: { xs: "4px", sm: "40px" } }}>
                                The <span style={{ color: theme.palette.secondary.main }} ref={typingElement}></span> way to<br/>backup your Discord servers.
                            </Typography>

                            <Typography data-aos="fade-down" color={theme.palette.grey[200]} variant="h5" component="h2" sx={{ fontWeight: 300, textAlign: "center", padding: 4, paddingLeft: { xs: "2rem", sm: "4rem", md: "12rem",  }, paddingRight: { xs: "2rem", sm: "4rem", md: "12rem" } }}>
                                Backup your Discord server with RestoreCord
                            </Typography>

                            <Badge data-aos="fade-down" badgeContent={<>FOR FREE</>} color="success" sx={{ boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)", [`& .MuiBadge-badge`]: { backgroundColor: "rgb(52, 168, 83)", color: "#fff" } }}>
                                <Button variant="contained" color="primary" href="/login" size="large">
                                    Get Started
                                </Button>
                            </Badge>
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", mt: 10 }} data-aos="zoom-in-up">
                            <Image src="https://cdn.restorecord.com/static/images/homepage/dashboard_mu.png" alt="Dashboard" width={1251} height={769} />
                        </Box>  

                        {/* <Box sx={{ marginTop: 30 }} data-aos="fade-up">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "auto", marginTop: "15px" }}>
                                <Box sx={{ width: 100, height: 100, backgroundColor: theme.palette.primary.main, boxShadow: `0px 0px 50px 25px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.25)`, borderRadius: 8, mx: 1 }}>
                                    <Typography sx={{ paddingTop: 3, fontStyle: "normal", fontWeight: 900, fontSize: 36, textAlign: "center", color: theme.palette.text.primary }}>
                                        1
                                    </Typography>
                                </Box>
                                <Box sx={{ width: 100, height: 100, backgroundColor: theme.palette.primary.main, boxShadow: `0px 0px 50px 25px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.25)`, borderRadius: 8, marginRight: 4, marginLeft: 1 }}>
                                    <Typography sx={{ paddingTop: 3, fontStyle: "normal", fontWeight: 900, fontSize: 36, textAlign: "center", color: theme.palette.text.primary }}>
                                        0
                                    </Typography>
                                </Box>
                                <Box sx={{ width: 100, height: 100, backgroundColor: theme.palette.primary.main, boxShadow: `0px 0px 50px 25px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.25)`, borderRadius: 8, mx: 1 }}>
                                    <Typography sx={{ paddingTop: 3, fontStyle: "normal", fontWeight: 900, fontSize: 36, textAlign: "center", color: theme.palette.text.primary }}>
                                        0
                                    </Typography>
                                </Box>
                                <Box sx={{ width: 100, height: 100, backgroundColor: theme.palette.primary.main, boxShadow: `0px 0px 50px 25px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.25)`, borderRadius: 8, mx: 1 }}>
                                    <Typography sx={{ paddingTop: 3, fontStyle: "normal", fontWeight: 900, fontSize: 36, textAlign: "center", color: theme.palette.text.primary }}>
                                        0
                                    </Typography>
                                </Box>
                                <Box sx={{ width: 100, height: 100, backgroundColor: theme.palette.primary.main, boxShadow: `0px 0px 50px 25px rgba(${parseInt(theme.palette.primary.main.slice(1, 3), 16)}, ${parseInt(theme.palette.primary.main.slice(3, 5), 16)}, ${parseInt(theme.palette.primary.main.slice(5, 7), 16)}, 0.25)`, borderRadius: 8, mx: 1}}>
                                    <Typography sx={{ paddingTop: 3, fontStyle: "normal", fontWeight: 900, fontSize: 36, textAlign: "center", color: theme.palette.text.primary }}>
                                        0
                                    </Typography>
                                </Box>
                            </Box>

                            <Typography sx={{ fontStyle: "normal", fontWeight: 900, fontSize: 32, textAlign: "center", color: theme.palette.text.primary, marginTop: 4 }}>
                                Verified Members
                            </Typography>
                            <Typography sx={{ fontStyle: "normal", fontWeight: 200, fontSize: 16, textAlign: "center", color: theme.palette.text.primary }}>
                                every day
                            </Typography>
                        </Box> */}


                        <Box id="features" sx={{ marginTop: 4 }} />

                        <Card sx={{ width: "100%", height: "auto", display: "block", borderRadius: 12 }} data-aos="zoom-in-down">
                            <Box sx={{ display: "flex", justifyContent: "flex-start", padding: "36px 50px", alignItems: "center" }}>
                                <Box>
                                    <Typography sx={{ fontStyle: "normal", fontWeight: 500, fontSize: { sm: 10, md: 20, }, textTransform: "uppercase", color: theme.palette.text.primary, marginTop: 2 }}>
                                        Backup
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: { xs: 24, sm: 32, md: 48 }, color: theme.palette.text.primary, marginTop: "10px", marginBottom: "27px" }}>
                                        Instant Server Backups
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 400, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginBottom: 2, display: "flex", alignItems: "center" }}>
                                        <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                                        Save your Servers Members, Channels, Roles & more with a single click
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 400, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginBottom: 2, display: "flex", alignItems: "center" }}>
                                        <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                                        Backup your Members and Restore them in minutes
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 400, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginBottom: 2, display: "flex", alignItems: "center" }}>
                                        <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                                        Restore everything within seconds
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>

                        <Box sx={{ marginTop: { xs: 5, md: 10 }, display: { sm: "block", md: "flex" }, flexDirection: { sm: "column", md: "row" }, justifyContent: "center", alignItems: "center" }}>
                            <Box sx={{ width: "100%", marginBottom: { xs: 5, md: 0 }, backgroundColor: theme.palette.primary.main, borderRadius: 8 }} data-aos="zoom-in-right">
                                <Box sx={{ py: 10, px: 6 }}>
                                    <Typography sx={{ fontStyle: "normal", fontWeight: 900, fontSize: { sm: 24, md: 48 }, color: theme.palette.text.primary }}>
                                        Backup & Restore your<br/>Server Members
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 500, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginTop: "5px" }}>
                                        RestoreCord allows you to backup your server members and restore them in just minutes.
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ marginLeft: { sm: 0, md: 12 }, marginTop: { xs: 5, md: 0 }, width: "100%", backgroundColor: theme.palette.primary.main, borderRadius: 8 }} data-aos="zoom-in-left">
                                <Box sx={{ py: 10, px: 6 }}>
                                    <Typography sx={{ fontStyle: "normal", fontWeight: 900, fontSize: { sm: 24, md: 48 }, color: theme.palette.text.primary }}>
                                        Customizable<br/>Verification Page
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 500, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginTop: "5px" }}>
                                        We offer the most customizable verification page. You can customize the page to your liking.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Card sx={{ width: "100%", height: "auto", display: "block", borderRadius: 12,  marginTop: 5 }} data-aos="zoom-in-up">
                            <Box sx={{ display: "flex", justifyContent: "flex-start", padding: "36px 50px", alignItems: "center" }}>
                                <Box>
                                    <Typography sx={{ fontStyle: "normal", fontWeight: 500, fontSize: { sm: 10, md: 20 }, textTransform: "uppercase", color: theme.palette.text.primary, marginTop: 2 }}>
                                        Security
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: { xs: 24, sm: 32, md: 48 }, color: theme.palette.text.primary, marginTop: "10px", marginBottom: "27px" }}>
                                        Secure & Reliable
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 400, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginBottom: 2, display: "flex", alignItems: "center" }}>
                                        <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                                        Block VPNs and Proxies with one click
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 400, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginBottom: 2, display: "flex", alignItems: "center" }}>
                                        <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                                        Advanced Verification Logging to prevent abuse
                                    </Typography>

                                    <Typography sx={{ fontStyle: "normal", fontWeight: 400, fontSize: { sm: 10, md: 20 }, color: theme.palette.text.primary, marginBottom: 2, display: "flex", alignItems: "center" }}>
                                        <CheckCircleOutlineRounded sx={{ color: theme.palette.success.main, mr: 1 }} />
                                        99.99% Uptime Guarantee with 24/7 Support
                                    </Typography>
                                </Box>
                            </Box>
                        </Card>


                        <Box id="reviews" sx={{ marginTop: 8 }}/>

                        <Box>
                            <Typography variant="h6" sx={{ fontStyle: "normal", fontWeight: 900, fontSize: { sm: 19, md: 38 }, textAlign: "center", color: theme.palette.text.primary, my: 4, mt: 10 }}>
                                What our customers say
                            </Typography>

                            <Typography variant="body1" sx={{ fontStyle: "normal", fontWeight: 400, fontSize: { sm: 10, md: 20 }, textAlign: "center", color: theme.palette.text.primary, my: 4, wordWrap: "break-word" }}>
                                We are proud to have helped thousands of businesses grow their sales and increase their revenue.
                            </Typography>


                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 5 }}>
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", mx: 2 }}>
                                    <Card sx={{ width: "100%", maxWidth: 600, height: "auto", display: "block", borderRadius: 12, marginTop: 5 }} data-aos="zoom-in">
                                        <Box sx={{ display: "flex", justifyContent: "center", padding: "36px 50px", alignItems: "center", flexDirection: "row" }}>
                                            <Avatar sx={{ width: 80, height: 80 }} alt="Imran A" src="https://user-images.trustpilot.com/6383be8baa4a6a001278a477/73x73.png" />
                                            <Box sx={{ marginLeft: "20px" }}>
                                                <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: 24, color: theme.palette.text.primary, marginTop: 2 }}>
                                                    Imran A.
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography sx={{ fontStyle: "normal", fontWeight: 300, fontSize: 20, color: theme.palette.text.primary, marginTop: 1, textAlign: "center",  padding: { xs: "0px 12px", sm: "0px 25px", md: "0px 50px" }, marginBottom: 2 }}>
                                            This was soo good this bot is the best and the support are just amazing answering all the questions you have and always have the best replies YALL SHOULD DEFINITELY USE THIS BOT
                                        </Typography>
                                    </Card>

                                    <Card sx={{ width: "100%", maxWidth: 600, height: "auto", display: "block", borderRadius: 12, marginTop: 5, mx: 2 }} data-aos="zoom-in">
                                        <Box sx={{ display: "flex", justifyContent: "center", padding: "36px 50px", alignItems: "center", flexDirection: "row" }}>
                                            <Avatar sx={{ width: 80, height: 80, background: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), fontSize: 24, fontWeight: 900 }}>C</Avatar>
                                            <Box sx={{ marginLeft: "20px" }}>
                                                <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: 24, color: theme.palette.text.primary, marginTop: 2 }}>
                                                    Carlos
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography sx={{ fontStyle: "normal", fontWeight: 300, fontSize: 20, color: theme.palette.text.primary, marginTop: 2, textAlign: "center",  padding: { xs: "0px 12px", sm: "0px 25px", md: "0px 50px" }, marginBottom: 2 }}>
                                            RestoreCord changed for the better. They now have custom bots, using rotating proxies, and custom domains. This is the best bot to evade Discord&apos;s tyrannical rules. Unlike other restore bots, RestoreCord can no longer be mass banned. Each custom bot has nothing similar to link them together with. Thank you RestoreCord for taking the time to improve your bot so a banwave couldn&apos;t occur again.
                                        </Typography>
                                    </Card>
                                </Box>
                                <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center", flexDirection: "column", mx: 2 }}>
                                    <Card sx={{ width: "100%", maxWidth: 600, height: "auto", display: "block", borderRadius: 12, marginTop: 5, mx: 2 }} data-aos="zoom-in">
                                        <Box sx={{ display: "flex", justifyContent: "center", padding: "36px 50px", alignItems: "center", flexDirection: "row" }}>
                                            <Avatar sx={{ width: 80, height: 80, background: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), fontSize: 24, fontWeight: 900 }}>ZS</Avatar>
                                            <Box sx={{ marginLeft: "20px" }}>
                                                <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: 24, color: theme.palette.text.primary, marginTop: 2 }}>
                                                    ZsoZso
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography sx={{ fontStyle: "normal", fontWeight: 300, fontSize: 20, color: theme.palette.text.primary, marginTop: 2, textAlign: "center",  padding: { xs: "0px 12px", sm: "0px 25px", md: "0px 50px" }, marginBottom: 2 }}>
                                            Perfect uptime, support and features. I&apos;ve been using RestoreCord since almost two months, it is working totally fine and the support is faster then light Really recommending it
                                        </Typography>
                                    </Card>
                                    <Card sx={{ width: "100%", maxWidth: 600, height: "auto", display: "block", borderRadius: 12, marginTop: 5 }} data-aos="zoom-in">
                                        <Box sx={{ display: "flex", justifyContent: "center", padding: "36px 50px", alignItems: "center", flexDirection: "row" }}>
                                            <Avatar sx={{ width: 80, height: 80, background: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), fontSize: 24, fontWeight: 900 }}>DM</Avatar>
                                            <Box sx={{ marginLeft: "20px" }}>
                                                <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: 24, color: theme.palette.text.primary, marginTop: 2 }}>
                                                    Daniel M.
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography sx={{ fontStyle: "normal", fontWeight: 300, fontSize: 20, color: theme.palette.text.primary, marginTop: 2, textAlign: "center",  padding: { xs: "0px 12px", sm: "0px 25px", md: "0px 50px" }, marginBottom: 2 }}>
                                            This is the best $hit let me tell you has saved my ass countless times no review I could leave on this trust pilot bull$hitz could describe how Amazing this damn bot is NONE! Its like one sec discord takes everything from you then boom its back!
                                        </Typography>
                                    </Card>
                                </Box>
                                <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center", flexDirection: "column", mx: 2 }}>
                                    <Card sx={{ width: "100%", maxWidth: 600, height: "auto", display: "block", borderRadius: 12, marginTop: 5, mx: 2 }} data-aos="zoom-in">
                                        <Box sx={{ display: "flex", justifyContent: "center", padding: "36px 50px", alignItems: "center", flexDirection: "row" }}>
                                            <Avatar sx={{ width: 80, height: 80, background: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), fontSize: 24, fontWeight: 900 }}>AS</Avatar>
                                            <Box sx={{ marginLeft: "20px" }}>
                                                <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: 24, color: theme.palette.text.primary, marginTop: 2 }}>
                                                    astral
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography sx={{ fontStyle: "normal", fontWeight: 300, fontSize: 20, color: theme.palette.text.primary, marginTop: 2, textAlign: "center",  padding: { xs: "0px 12px", sm: "0px 25px", md: "0px 50px" }, marginBottom: 2 }}>
                                            Had a good experience with restorecord support is super fast and fixes issues in several minutes
                                        </Typography>
                                    </Card>
                                    <Card sx={{ width: "100%", maxWidth: 600, height: "auto", display: "block", borderRadius: 12, marginTop: 5 }} data-aos="zoom-in">
                                        <Box sx={{ display: "flex", justifyContent: "center", padding: "36px 50px", alignItems: "center", flexDirection: "row" }}>
                                            <Avatar sx={{ width: 80, height: 80 }} alt="Katy" src="https://user-images.trustpilot.com/62db3d9e5f8ab200145a3d93/73x73.png" />
                                            <Box sx={{ marginLeft: "20px" }}>
                                                <Typography sx={{ fontStyle: "normal", fontWeight: 700, fontSize: 24, color: theme.palette.text.primary, marginTop: 2 }}>
                                                    Katy
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Typography sx={{ fontStyle: "normal", fontWeight: 300, fontSize: 20, color: theme.palette.text.primary, marginTop: 2, textAlign: "center",  padding: { xs: "0px 12px", sm: "0px 25px", md: "0px 50px" }, marginBottom: 2 }}>                                       
                                            I&apos;ve been using restorecord for a year and had a good experience until it was hit by a ban wave and went down. The new owner added new features and had plans to release an update in June or July, but it was delayed. I switched to another bot but it didn&apos;t work well, so I went back to restorecord when it became available again. The new update is great and the bot is getting all of my members. The site loads quickly and they&apos;re adding new features almost every day. Overall, I recommend restorecord as a good backup bot.
                                        </Typography>
                                    </Card>
                                </Box>
                            </Box>
                        </Box> 


                        <Box id="pricing" sx={{ marginTop: 8 }}/>

                        <Typography variant="h6" sx={{ fontStyle: "normal", fontWeight: 900, fontSize: 38, textAlign: "center", color: theme.palette.text.primary, my: 4, mt: 10 }} data-aos="fade-up">
                            Ready to get started?
                        </Typography>

                        <Grid container spacing={2} alignItems="flex-end">
                            {SubscriptionList.map((tier: any, id: any) => (
                                <Grid item key={tier.name} xs={12} md={4} data-aos="fade-up">
                                    <Card sx={{ borderRadius: 8, px: 0.75, py: 2 }}>
                                        {/* <CardHeader title={tier.name} titleTypographyProps={{ align: "center" }} subheaderTypographyProps={{ align: "center", }} sx={{ bgColor: "grey.700" }} /> */}
                                        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 32, color: theme.palette.text.primary, textAlign: "center", marginTop: 2 }}>{tier.name}</Typography>
                                        <CardContent>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "baseline", mb: 2 }}>
                                                <Typography component="h2" variant="h3" color="text.primary" sx={{ fontWeight: "600" }}>
                                                    ${tier.priceMonthly}
                                                </Typography>
                                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: "600" }}>
                                                    /monthly <Typography variant="body2" color="grey.700" sx={{ fontWeight: "500", alignItems: "center", display: "flex", mb: 1 }}>${tier.priceYearly} billed annually</Typography>
                                                </Typography>
                                            </Box>
                                            {tier.features.map((feature: any) => (
                                                <Typography variant="subtitle1" align="left" key={feature.name} sx={{ fontWeight: "400", alignItems: "center", display: "flex", mb: 1 }}>
                                                    {feature.icon} {feature.value}
                                                </Typography>
                                            ))}
                                        </CardContent>
                                        <CardActions>
                                            <Button href={tier.name === "Free" ? `/register` : `https://restorecord.com/dashboard/upgrade`} fullWidth variant="contained" sx={{ fontWeight: "600" }}>
                                                {tier.priceYearly === "0" ? "Sign Up" : "Try 7 days for free"}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    

                </Container>
                <div style={{ marginBottom: "5rem" }} />
                <Footer />
            </Box>
        </>
    );
}