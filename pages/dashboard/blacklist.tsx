import { useRouter } from "next/router";
import { useInfiniteQuery, useQuery } from "react-query";
import { useToken } from "../../src/token";
import { useEffect, useState } from "react";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import getBlacklist from "../../src/dashboard/getBlacklist";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/lab/Alert";
import Badge from "@mui/material/Badge";
import Snackbar from "@mui/material/Snackbar";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import HubIcon from "@mui/icons-material/Hub";
// eslint-disable-next-line no-restricted-imports
import useTheme from "@mui/material/styles/useTheme";
import axios from "axios";

export default function Blacklist() {
    const router = useRouter();
    const theme = useTheme();
    const [token]: any = useToken()
    
    const [serverId, setServerId] = useState("");
    const [search, setSearch] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const { data: user, isError, isLoading: userLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });

    
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: listsLoading, refetch } = useInfiniteQuery("members", async ({ pageParam = 1 }: any) => await getBlacklist({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, serverId, search, pageParam), {
        getNextPageParam: (lastPage, allPages: any) => {
            const maxPages = lastPage.maxPages;
            const nextPage = allPages.length + 1;
            return nextPage <= maxPages ? nextPage : undefined;
        },
        retry: true 
    });

    useEffect(() => {
        let fetching = false;
        const onScroll = async (event: any) => {
            const { scrollHeight, scrollTop, clientHeight } = event.target.scrollingElement;

            if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.5) {
                fetching = true;
                if (hasNextPage) await fetchNextPage();
                fetching = false;
            }
        }

        const delayDebounceFn = setTimeout(() => {
            refetch();
        }, 1000)

        document.addEventListener('scroll', onScroll);
        return () => {
            document.addEventListener('scroll', onScroll);
            clearTimeout(delayDebounceFn);
        }       
    }, [hasNextPage, fetchNextPage, refetch, search]);

    function ShowType(type: number) {
        switch (type) {
        case 0:
            return (
                <Tooltip title="User ID" TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive>
                    <PersonIcon sx={{ color: theme.palette.primary.main }}/>
                </Tooltip>
            );
        case 1:
            return (
                <Tooltip title="IP Address" TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive>
                    <PublicIcon sx={{ color: theme.palette.primary.main }}/>
                </Tooltip>
            );
        case 2:
            return (
                <Tooltip title="ASN" TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive>
                    <HubIcon sx={{ color: theme.palette.primary.main }}/>
                </Tooltip>
            );
        }
    }


    return (
        <Box sx={{ display: "flex" }}>
            <NavBar user={data}>
                <Toolbar />

                <Container maxWidth="xl">
                    <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                        <CardContent>
                            <Badge badgeContent={<>BETA</>} color="primary" sx={{ [`& .MuiBadge-badge`]: { mt: "1.5rem", mr: "-2.5rem", color: "#fff", padding: "0.85rem", fontSize: "0.95rem", fontWeight: "bold" } }}>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                                    Blacklist
                                </Typography>
                            </Badge>

                            <Snackbar open={openE} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenE(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                                <Alert elevation={6} variant="filled" severity="error">
                                    {notiTextE}
                                </Alert>
                            </Snackbar>

                            <Snackbar open={openS} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                                <Alert elevation={6} variant="filled" severity="success">
                                    {notiTextS}
                                </Alert>
                            </Snackbar>

                            <Snackbar open={openI} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenI(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                                <Alert elevation={6} variant="filled" severity="info">
                                    {notiTextI}
                                </Alert>
                            </Snackbar>

                            <Grid justifyContent={"space-between"}>
                                <Grid item>
                                    <Stack direction="row" justifyContent={"space-between"} alignItems={"center"} sx={{ mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                            {listsLoading ? (
                                                <Skeleton animation="wave" variant="text" width={250} height={30} />
                                            ) : (
                                                <>
                                                    {data?.pages ? (
                                                        <>
                                                            {data?.pages?.[0]?.max === 0 ? "No Blacklisted Items" : `Showing ${data?.pages?.[0]?.max} Blacklisted Items.`}
                                                        </>
                                                    ) : (
                                                        "Loading..."
                                                    )}
                                                </>
                                            )}
                                        </Typography>
                                        <Button variant="contained" color="primary" onClick={() => router.push("/dashboard/blacklist/add")} sx={{ fontWeight: "500" }}>
                                            + Create Blacklist
                                        </Button>
                                    </Stack>
                                </Grid>
                                <Grid item>
                                    {listsLoading ? (
                                        <Skeleton animation="wave" variant="rectangular" width={"100%"} height={55} sx={{ borderRadius: "14px" }} />
                                    ) : (
                                        <TextField id="search" label="Search" variant="outlined" sx={{ width: "100%" }} onChange={(e) => setSearch(e.target.value)} />
                                    )}
                                </Grid>
                            </Grid>

                            {listsLoading ? (
                                <Stack spacing={2}>
                                    {[...Array(15)].map((_, i) => (
                                        <Paper key={i} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                            <CardContent>
                                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                                    <Grid item>
                                                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                            <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ mr: "0.5rem" }} />
                                                            <Skeleton animation="wave" variant="text" width={200} height={32} />
                                                        </div>
                                                        <Skeleton animation="wave" variant="text" width={200} height={20} />
                                                    </Grid>
                                                    <Grid item>
                                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                                            <Skeleton animation="wave" variant="rectangular" width={100} height={35} sx={{ borderRadius: "14px" }} />
                                                            <Skeleton animation="wave" variant="rectangular" width={100} height={35} sx={{ borderRadius: "14px" }} />
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Paper>
                                    ))}
                                </Stack>
                            ) : (
                                <>
                                    {(data?.pages?.[0]?.list ?? []).map((item: any) => {
                                    // {data?.pages?.map((page) => page?.list?.map((item: any) => {
                                        return (
                                            <Paper key={item.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                                <CardContent>
                                                    <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                                        <Grid item>
                                                            <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                                {ShowType(item.type)}

                                                                {item.value ? (
                                                                    <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word", ml: 1 }}>
                                                                        {item.type === 2 ? `AS${item.value}` : item.value}
                                                                    </Typography>
                                                                ) : (
                                                                    <Skeleton variant="text" width={50} />
                                                                )}
                                                            </div>
                                                            {(item.guildId && !userLoading) ? (
                                                                <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                                                    Server: {user.servers.find((g: any) => g.guildId === item.guildId)?.name}
                                                                </Typography>
                                                            ) : (
                                                                <Skeleton variant="text" width={50} />
                                                            )}
                                                            {item.reason ? (
                                                                <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                                                    Reason: {item.reason}
                                                                </Typography>
                                                            ) : (<> </>)}
                                                            <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                                                Blacklisted: {new Date(item.createdAt).toLocaleString()}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                                                            <Stack spacing={2} direction="column" justifyContent={"space-between"}>
                                                                <Button variant="contained" color="error" onClick={() => {                                                                
                                                                    axios.delete(`/api/v1/server/blacklist?id=${item.id}`, { 
                                                                        headers: {
                                                                            "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                                        },
                                                                        validateStatus: () => true
                                                                    })
                                                                        .then((res: any) => {
                                                                            if (!res.data.success) {
                                                                                setNotiTextE(res.data.message);
                                                                                setOpenE(true);
                                                                            }
                                                                            else {
                                                                                setNotiTextS(res.data.message);
                                                                                setOpenS(true);

                                                                                refetch();
                                                                            }
                                                                        })
                                                                        .catch((err): any => {
                                                                            setNotiTextE(err.message);
                                                                            setOpenE(true);
                                                                            console.error(err);
                                                                        });
                                                                }}>Remove</Button>
                                                                {/* <Button variant="contained" color="info" onClick={() => {
                                                                    // setUserId(item.userId);
                                                                    // setUserInfoGuild(item.guildId);
                                                                    // requestInfo(item.userId);
                                                                    // setLoadingInfo(true);
                                                                    // setOpen(true);
                                                                }}>Actions</Button> */}
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Paper>
                                        );
                                    })}
                                </>
                            )}

                            <Box sx={{ display: "flex", justifyContent: "center", mt: "1rem", alignItems: "center" }}>
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
                            </Box>
                                
                        </CardContent>
                    </Paper>
                </Container>

            </NavBar>
        </Box>
    )
}