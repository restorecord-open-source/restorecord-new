import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

import Link from "next/link";
import MuiLink from "@mui/material/Link";
import NavBar from "../components/landing/NavBar";
import Footer from "../components/landing/Footer";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Head from "next/head";
import axios from "axios";
import LoadingButton from "@mui/lab/LoadingButton";
import { useToken } from "../src/token";

export default function Giveaway() {
    const [token]: any = useToken();
    const router = useRouter();

    const [discordID, setDiscordID] = useState("");
    const [email, setEmail] = useState("");
    const [giftCard, setGiftCard] = useState("");
    const [why, setWhy] = useState("");
    const [how, setHow] = useState("");
    const [like, setLike] = useState("");
    const [fp, setFp] = useState("");

    const [loading, setLoading] = useState(false);

    const errorMessages = {
        discordID: "You must enter a valid Discord ID to enter the giveaway.",
        email: "Enter a valid email address to enter the giveaway.",
        giftCard: "You must specify which gift card you would like if you win.",
        why: "You must tell us why you especially want to win the giveaway.",
        how: "You must tell us from where or how you heard about us.",
        like: "You must tell us what you like about RestoreCord.",
        submit: "An error occurred while submitting your entry. Please try again later."
    }

    const [error, setError] = useState({
        discordID: false,
        email: false,
        giftCard: false,
        why: false,
        how: false,
        like: false,
        submit: false
    });

    const [resp, setResp] = useState({
        success: false,
        message: ""
    });

    useEffect(() =>{
        const userAgentBrowser = window.navigator.userAgent;
        const userAgentOS = window.navigator.platform;
        const userAgentLanguage = window.navigator.language;
        const userAgentDevice = window.navigator.vendor;
        // @ts-ignore
        const userAgentBrave: any = window?.navigator?.brave ? true : false;
        // @ts-ignore
        const userAgentMemory: any = window?.navigator?.deviceMemory ? window?.navigator?.deviceMemory : 0;
        
        setFp(`${userAgentBrowser}|${userAgentOS}|${userAgentLanguage}|${userAgentDevice}|${userAgentBrave}|${userAgentMemory}`);
    }, []);

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem", background: "rgba(0, 0, 0, 0.75)" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Giveaway" />
                </Head>

                <Container maxWidth="xl" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>

                    <NavBar />

                    <Box sx={{ width: "100%", maxWidth: "700px", mx: "auto" }}>
                        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: "bold" }} gutterBottom>
                            Christmas Giveaway
                        </Typography>

                        <Alert severity="info" sx={{ mb: "1rem", width: "100%" }}>
                            <Typography variant="body1" component="p" sx={{ width: "100%" }}>
                                Thank you for your interest in our <b>Customer Appreciation Giveaway</b>! We are excited to offer our loyal customers the chance to win a $100 gift card to use on <a href="https://www.bitrefill.com">https://www.bitrefill.com</a>. To enter, simply fill out the form below and click the &quot;<i>Enter</i>&quot; button. Please note that only customers with a running subscription are eligible to participate in the giveaway. The winner will be randomly selected and announced on Friday, December 24th at 7PM UTC. <b>Good luck</b>, and thank you for your continued support!
                            </Typography>
                        </Alert>

                        <Alert severity="error" sx={{ mb: "1rem", width: "100%", display: error.discordID || error.email || error.giftCard || error.why || error.how || error.like || error.submit || (resp.success === false && resp.message) ? "flex" : "none" }}>
                            <Typography variant="body1" component="p" sx={{ width: "100%" }}>
                                {error.discordID ? errorMessages.discordID : ""}
                                {error.email ? errorMessages.email : ""}
                                {error.giftCard ? errorMessages.giftCard : ""}
                                {error.why ? errorMessages.why : ""}
                                {error.how ? errorMessages.how : ""}
                                {error.like ? errorMessages.like : ""}
                                {error.submit ? errorMessages.submit : ""}
                                {resp.success === false ? resp.message : ""}
                            </Typography>
                        </Alert>

                        <Alert severity="success" sx={{ mb: "1rem", width: "100%", display: resp.success ? "flex" : "none" }}>
                            <Typography variant="body1" component="p" sx={{ width: "100%" }}>
                                {resp.message}
                            </Typography>
                        </Alert>
                                

                        <form onSubmit={async (e) => {
                            e.preventDefault();

                            setLoading(true);
                            await new Promise(r => setTimeout(r, 100));

                            setError({
                                discordID: false,
                                email: false,
                                giftCard: false,
                                why: false,
                                how: false,
                                like: false,
                                submit: false
                            });

                            if (discordID.length < 17) { setError({ discordID: true, email: false, giftCard: false, why: false, how: false, like: false, submit: false }); setLoading(false); return; }
                            if (email.length < 1 || !email.includes("@") || !email.includes(".")) { setError({ discordID: false, email: true, giftCard: false, why: false, how: false, like: false, submit: false }); setLoading(false); return; }
                            if (giftCard.length < 1) { setError({ discordID: false, email: false, giftCard: true, why: false, how: false, like: false, submit: false }); setLoading(false); return; }
                            if (why.length < 1) { setError({ discordID: false, email: false, giftCard: false, why: true, how: false, like: false, submit: false }); setLoading(false); return; }
                            if (how.length < 1) { setError({ discordID: false, email: false, giftCard: false, why: false, how: true, like: false, submit: false }); setLoading(false); return; }
                            if (like.length < 1) { setError({ discordID: false, email: false, giftCard: false, why: false, how: false, like: true, submit: false }); setLoading(false); return; }
                           


                            await axios.post("/api/giveaway", {
                                discordID: discordID,
                                email: email,
                                giftCard: giftCard,
                                why: why,
                                how: how,
                                like: like,
                                // send fingerprint: fp but encode it to reverse base64 and base32
                                fp: fp.split('').map(char => char.charCodeAt(0).toString(2)).join(' ').split('').reverse().join('')
                            }, {
                                headers: {
                                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                },
                                validateStatus: () => true
                            }).then((res) => {
                                setLoading(false);
                                if (res.data.success) {
                                    setResp({ success: true, message: res.data.message });
                                } else {
                                    setResp({ success: false, message: res.data.message });
                                }
                            }).catch((err) => {
                                setLoading(false);
                                console.log(err);
                            });
                        }}>
                            <TextField fullWidth label="Discord ID" variant="outlined" placeholder="123456789012345678" sx={{ mb: "1rem" }} onChange={(e) => setDiscordID(e.target.value)} />
                            <TextField fullWidth label="Email" variant="outlined" placeholder="name@mail.com" sx={{ mb: "1rem" }} onChange={(e) => setEmail(e.target.value)} />
                            <TextField fullWidth label="Which Gift Card would you like to win?" placeholder="Amazon, Steam, Nitro etc." variant="outlined" sx={{ mb: "1rem" }} onChange={(e) => setGiftCard(e.target.value)} />
                            <TextField fullWidth label="Why do you want to win?" variant="outlined" placeholder="I want to win because..." sx={{ mb: "1rem" }} onChange={(e) => setWhy(e.target.value)} />
                            <TextField fullWidth label="How did you hear about us?" placeholder="I heard about RestoreCord from..." variant="outlined" sx={{ mb: "1rem" }} onChange={(e) => setHow(e.target.value)} />
                            <TextField fullWidth label="What do you like about RestoreCord?" placeholder="I like RestoreCord because..." variant="outlined" sx={{ mb: "1rem" }} onChange={(e) => setLike(e.target.value)} />
                            <LoadingButton fullWidth type="submit" variant="contained" loading={loading} sx={{ mb: "10rem" }}>
                                Enter
                            </LoadingButton>
                        </form>
                    </Box>

                </Container>
                <Footer />
            </Box>
        </>
    )
}