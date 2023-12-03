import { useEffect } from "react";
import { useToken } from "../src/token";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Box from "@mui/material/Box";
import { useRouter } from "next/router";

export default function Logout() {
    const [token]: any = useToken();
    const router = useRouter();

    useEffect(() => {
        try {
            fetch(`/api/v2/logout`, {
                headers: {
                    "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                },
            })
                .then(res => res.json())
                .then(res => {
                    window.localStorage.removeItem("token");
                    window.localStorage.removeItem("org_token");
                    router.push("/");
                })
        } catch (error) {
            console.error(error);
        }
    })

    return (
        <>
            <Container maxWidth="xl">
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Logout" />
                </Head>

                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100vh" }}>
                    <Typography variant="h4" component="h4" color={"grey.300"}>You have been logged out.</Typography>
                </Box>
            </Container>
        </>
    )
}