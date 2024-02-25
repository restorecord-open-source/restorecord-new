import axios from "axios";
import debounce from "lodash/debounce";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "react-query";

import theme from "../src/theme";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CardMedia from "@mui/material/CardMedia";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AlertTitle from "@mui/material/AlertTitle";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import { Skeleton } from "@mui/material";


async function getDiscovery(search?: any, page: number = 1) {
    return await axios.get(`/api/v2/discovery?page=${page}${search ? `&q=${search}` : ""}`, {
        validateStatus: () => true
    })
        .then(res => { return res.data; })
        .catch(err => { return err; });
}

export default function Discovery() {
    const router = useRouter();
    const searchQuery = router.query.q ? router.query.q.toString() : "";

    const { data: serverList, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery("servers", async ({ pageParam = 1 }: any) => await getDiscovery(searchQuery, pageParam), {
        getNextPageParam: (lastPage, allPages: any) => {
            const maxPages = lastPage.pages;
            const nextPage = allPages.length + 1;
            return nextPage <= maxPages ? nextPage : undefined;
        },
        retry: true,
        refetchOnWindowFocus: false
    });

    const handleChange = useCallback(
        debounce(
            (e) => {
                if (e.target.value.length >= 3 && e.target.value.length <= 99) {
                    router.push(`?q=${e.target.value}`);
                } else if (e.target.value.length === 0) {
                    router.push("");
                }
                refetch();
            },
            300
        ), []
    );


    useEffect(() => {
        let fetching = false;
        const onScroll = async (event: any) => {
            const { scrollHeight, scrollTop, clientHeight } = event.target.scrollingElement;
      
            if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.5) {
                fetching = true;
                if (hasNextPage) {
                    await fetchNextPage();
                }
                fetching = false;
            }
        };
      
        const delayDebounceFn = debounce(() => {
            refetch();
        }, 300);
      
        document.addEventListener("scroll", onScroll);
      
        return () => {
            document.removeEventListener("scroll", onScroll);
            delayDebounceFn.cancel();
        };
    }, [hasNextPage, fetchNextPage, refetch, searchQuery]);

    return (
        <>
            <Container maxWidth="xl">
                <Alert severity="info" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <AlertTitle>RestoreCord Discovery is in Beta</AlertTitle>
                    <Typography>This feature is still in development and may change at any time</Typography>
                </Alert>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", height: { xs: "20vh !important", md: "30vh !important" } }}>
                    <Stack direction="column" spacing={2}>
                        <FormControl variant="standard" sx={{ width: "100%" }}>
                            <Typography variant="h5" component="h1" fontWeight={600} sx={{ fontSize: { xs: "1.2rem", md: "2rem" }}}>Find your Server on RestoreCord</Typography>
                            <Typography variant="h6" component="div" fontWeight={400} sx={{ display: { xs: "none", md: "flex" }}}>Discover new communities or find new members for your own server</Typography>
                            <TextField id="search" label="Explore communities" placeholder="Enter a search term" onChange={handleChange} sx={{ width: "100%", mt: 4 }} />
                            {(searchQuery.length < 3 || searchQuery.length > 99) && searchQuery.length !== 0 && <Typography variant="body2" component="div" fontWeight={400} sx={{ color: theme.palette.error.main }}>Search term must be between 3 and 99 characters</Typography>}
                        </FormControl>
                    </Stack>
                </Paper>
                <Typography variant="h6" component="h2" fontWeight={600} sx={{ marginTop: "1rem" }}>Featured Servers</Typography>
                {(!isLoading && serverList !== null && serverList !== undefined) ? (
                    <Paper sx={{ padding: "0.5rem", marginTop: "1rem", display: "flex", background: "transparent" }}>
                        <Grid container spacing={{ xs: 2, sm: 2, md: 4 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginBottom: "5rem" }}>
                            {serverList?.pages.map((page: any) => page.servers.map((server: any) => (
                                <Grid item xs={12} md={6} lg={4} key={server.id} sx={{ "& *": { transition: "all 0.2s ease-in-out" } }}>
                                    <Link href={`https://discord.com/oauth2/authorize?client_id=${server.customBot.clientId}&redirect_uri=https://${server.customBot.customDomain}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.guildId}&prompt=none`} sx={{ textDecoration: "none" }} target="_blank">
                                        <Card role="button" sx={{ height: "100%", cursor: "pointer", borderRadius: "1rem", "&:hover": { backgroundColor: `rgb(2, 2, 2) !important`, transform: "translateY(-1px)" }, "&:hover img:first-of-type": { transform: "scale(1.02) translateZ(0)", filter: "brightness(1)" }, border: `1px solid #${server.themeColor !== "4f46e5" ? server.themeColor : "000000"}` }}>
                                            <Box sx={{ height: "150px", position: "relative", display: "block", mb: "15px" }}>
                                                <Box sx={{ display: "block", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scale(1.01)" }}>
                                                    <CardMedia component="img" height="140" image={server.bgImage ?? (server.picture ?? "https://cdn.restorecord.com/logo512.png")} onError={(event: any) => event.target.src = "https://cdn.restorecord.com/logo512.png"} alt="Server Background" sx={{ objectFit: "cover", filter: "brightness(0.75)" }} />
                                                </Box>
                                                <Avatar sx={{ width: 48, height: 48, position: "absolute", left: "12px", bottom: "-21px", transform: "scale(1.01) !important", outline: `0.15rem solid ${theme.palette.background.default}` }} alt="Server Picture" src={server.picture} />
                                            </Box>

                                            <CardContent>
                                                <Typography variant="h6" component="h2" fontWeight={600}>{server.name}</Typography>
                                                <Typography variant="body1" component="div" fontWeight={400}>{server.description}</Typography>
                                                <Typography variant="body2" component="div" fontWeight={400} sx={{ mt: 2 }}>Since {new Date(server.createdAt).toLocaleString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </Grid>
                            )))}

                            {serverList?.pages.length === 0 && (
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                    <Typography variant="h6" component="h2" fontWeight={600}>No servers found</Typography>
                                    <Typography variant="body1" component="div" fontWeight={400}>No servers were found matching your search term</Typography>
                                </Grid>
                            )}

                            {hasNextPage && (
                                <Button variant="contained" color="primary" onClick={() => {
                                    fetchNextPage();
                                }}>Load More</Button>
                            )}
                            {isFetchingNextPage && (
                                <Typography variant="body2" color="textSecondary" sx={{ ml: "0.5rem" }}>
                                    Loading...
                                </Typography>
                            )}
                        </Grid>
                    </Paper>
                ) : (
                    <Paper sx={{ padding: "0.5rem", marginTop: "1rem", display: "flex", background: "transparent" }}>
                        <Grid container spacing={{ xs: 2, sm: 2, md: 4 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginBottom: "5rem" }}>
                            {Array.from({ length: 18 }, (_, i) => (
                                <Grid item xs={12} md={6} lg={4} key={i} sx={{ "& *": { transition: "all 0.2s ease-in-out" } }}>
                                    <Card role="button" sx={{ height: "100%", borderRadius: "1rem", border: `1px solid #000000` }}>
                                        <Box sx={{ height: "150px", position: "relative", display: "block", mb: "15px" }}>
                                            <Box sx={{ display: "block", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scale(1.01)" }}>
                                                <Skeleton variant="rectangular" animation="wave" width="100%" height={140} sx={{ filter: "brightness(0.75)" }} />
                                            </Box>
                                            <Skeleton variant="circular" animation="wave" width={48} height={48} sx={{ position: "absolute", left: "12px", bottom: "-21px", transform: "scale(1.01) !important", outline: `0.15rem solid ${theme.palette.background.default}` }} />
                                        </Box>

                                        <CardContent>
                                            <Skeleton variant="text" animation="wave" height={"32px"} width={Math.floor(Math.random() * 150) + 100} />
                                            <Skeleton variant="text" animation="wave" height={"24px"} width={Math.floor(Math.random() * 150) + 100} />
                                            <Skeleton variant="text" animation="wave" height={"20px"} width={Math.floor(Math.random() * 150) + 100} />
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                )}
            </Container>
        </>
    )
}