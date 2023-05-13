import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Avatar from "@mui/material/Avatar";
import theme from "../src/theme";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import { formatRoundNumber } from "../src/functions";


export default function Discovery() {
    const [search, setSearch] = useState("");
    const [serverList, setServerList]: any = useState(null);

    const { data, isError, isLoading, refetch } = useQuery("servers", () => axios.get(`/api/v2/discovery${search ? `?q=${search}` : ""}`).then((res) => res.data), { refetchOnWindowFocus: false });

    useEffect(() => {
        if (data) setServerList(data);

        const timeout = setTimeout(() => {
            refetch();
            if (search === "" || search.length < 3) return ;
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, serverList, data, refetch]);

    if (isError) return <div>Error, reload page</div>;

    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", height: "30vh !important" }}>
                    <Stack direction="column" spacing={2}>
                        <FormControl variant="standard" sx={{ width: "100%" }}>
                            <Typography variant="h5" component="h1" fontWeight={600}>Find your Server on RestoreCord</Typography>
                            <Typography variant="h6" component="div" fontWeight={400}>Discover new communities or find new members for your own server</Typography>
                            <TextField id="search" label="Explore communities" placeholder="Enter a search term" onChange={(e) => setSearch(e.target.value)} sx={{ width: "100%", mt: 4 }} />
                            {/* error text shown if text is shorter than 3 characters or longer than 99 */}
                            {(search.length < 3 || search.length > 99) && search.length !== 0 && <Typography variant="body2" component="div" fontWeight={400} sx={{ color: theme.palette.error.main }}>Search term must be between 3 and 99 characters</Typography>}
                        </FormControl>
                    </Stack>
                </Paper>
                <Typography variant="h6" component="h2" fontWeight={600} sx={{ marginTop: "1rem" }}>Featured Servers</Typography>
                {(!isLoading && serverList !== null) ? (
                    <Paper sx={{ padding: "0.5rem", marginTop: "1rem", display: "flex", background: "transparent" }}>
                        <Grid container spacing={{ xs: 2, sm: 2, md: 4 }} sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", marginBottom: "5rem" }}>
                            {serverList.servers.map((server: any) => (
                                <Grid item xs={12} md={6} lg={4} key={server.id} sx={{ "& *": { transition: "all 0.2s ease-in-out" } }}>
                                    <Link href={`https://discord.com/oauth2/authorize?client_id=${server.customBot.clientId}&redirect_uri=https://${server.customBot.customDomain}/api/callback&response_type=code&scope=identify+guilds.join&state=${server.guildId}`} sx={{ textDecoration: "none" }} target="_blank">
                                        <Card role="button" onClick={() => console.log("clicked")} sx={{ height: "100%", cursor: "pointer", borderRadius: "1rem", "&:hover": { backgroundColor: `rgb(2, 2, 10) !important`, transform: "translateY(-1px)" }, "&:hover img:first-of-type": { transform: "scale(1.02) translateZ(0)", filter: "brightness(1)" }, border: `1px solid #${server.themeColor !== "4f46e5" ? server.themeColor : "000000"}`, }}>
                                            <Box sx={{ height: "150px", position: "relative", display: "block", mb: "15px" }}>
                                                <Box sx={{ display: "block", position: "absolute", top: 0, left: 0, width: "100%", height: "100%", transform: "scale(1.01)", }}>
                                                    <CardMedia component="img" height="140" image={server.bgImage ? server.bgImage : server.picture} onError={(event: any) => event.target.src = "https://cdn.restorecord.com/logo512.png"} alt="server-image" sx={{ objectFit: "cover", filter: "brightness(0.75)" }} />
                                                </Box>
                                                <Avatar sx={{ width: 48, height: 48, position: "absolute", left: "12px", bottom: "-21px", transform: "scale(1.01) !important", outline: `0.15rem solid ${theme.palette.background.default}` }} alt="server-image" src={server.picture} />
                                            </Box>

                                            <CardContent>
                                                <Typography variant="h6" component="h2" fontWeight={600}>{server.name}</Typography>
                                                <Typography variant="body1" component="div" fontWeight={400}>{server.description}</Typography>
                                                <Typography variant="body2" component="div" fontWeight={400} sx={{ mt: 2 }}><span style={{ color: theme.palette.success.main }}>{formatRoundNumber(server.members)}+</span> members • Since {new Date(server.createdAt).toLocaleString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </Grid>
                            ))}
                            {serverList.servers.length === 0 && (
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                    <Typography variant="h6" component="h2" fontWeight={600}>No servers found</Typography>
                                    <Typography variant="body1" component="div" fontWeight={400}>No servers were found matching your search term</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                ) : <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress /></Box> }
            </Container>
        </>
    )
}