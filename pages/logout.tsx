import { useEffect } from "react";
import { useToken } from "../src/token";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Head from "next/head";

export default function Logout() {
    const [token]: any = useToken();

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
                    window.location.href = "/";
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

                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500", justifyContent: "center", display: "flex", alignItems: "center" }}>
                    Logging out...
                </Typography>
            </Container>
        </>
    )
}