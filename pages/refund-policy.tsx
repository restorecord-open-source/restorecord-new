import NavBar from "../components/landing/NavBar";
import Footer from "../components/landing/Footer";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Head from "next/head";


export default function Terms() {
    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Refund Policy" />
                </Head>
                
                <Container maxWidth="lg" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>

                    <NavBar />

                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Typography color="primary" variant="h1" component="h1" sx={{ textAlign: "center", fontWeight: "bold", fontSize: { xs: "2.5rem", md: "3rem", lg: "4rem" } }}>
                            Refund policy
                        </Typography>

                        <Typography variant="body1" component="div" sx={{ textAlign: "left", wordBreak: "break-word", mb: "4rem" }}>
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="refunds">REFUNDS</Typography>
                            <br/>You are eligible for a full refund within 7 days from the date of purchase. After 7 days have passed, we can no longer offer you a refund. 
                            <Typography variant="h6" component="h2" sx={{ mt: "1rem", mb: "1rem" }} id="gifts">GIFTS</Typography>
                            <br/>Gifts purchased on RestoreCord are non-refundable.
                        </Typography>
                    </Box>
                </Container>

                <Footer />
            </Box>
        </>
    )   
}