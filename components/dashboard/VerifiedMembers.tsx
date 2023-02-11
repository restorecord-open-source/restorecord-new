import { useToken } from "../../src/token";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "react-query";

import axios from "axios";
import React from "react";

import getMembers, { BUG_HUNTER_LEVEL_1, CERTIFIED_MODERATOR, DISCORD_EMPLOYEE, DISCORD_PARTNER, EARLY_SUPPORTER, HOUSE_BALANCE, HOUSE_BRAVERY, HOUSE_BRILLIANCE, HYPESQUAD_EVENTS, VERIFIED_BOT_DEVELOPER } from "../../src/dashboard/getMembers";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Badge from "@mui/icons-material/Badge";

export default function VerifiedMembers({ user }: any) {
    const [token]: any = useToken();

    const [serverId, setServerId] = useState("");
    const [search, setSearch] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [open, setOpen] = useState(false);
    const [userInfoGuild, setUserInfoGuild] = useState("");
    const [userInfo, setUserInfo]: any = useState({});

    const [loading, setLoading] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(true);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery('members', async ({ pageParam = 1 }: any) => await getMembers({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, serverId, search, pageParam), {
        getNextPageParam: (lastPage, allPages: any) => {
            const maxPages = lastPage.maxPages;
            const nextPage = allPages.length + 1;
            return nextPage <= maxPages ? nextPage : undefined;
        },
        retry: true 
    });

    function handleSelect(event: SelectChangeEvent) {
        setServerId(event.target.value as string);
        setTimeout(() => {
            refetch();
        }, 100);
    }

    function requestInfo(userId: string) {
        setLoadingInfo(true);
        fetch(`/api/v1/member/${userId}`, {
            headers: {
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
        })
            .then(res => res.json())
            .then(res => {
                setLoadingInfo(false);
                if (!res.success) {
                    setNotiTextE(res.message);
                    setOpenE(true);
                } else {
                    setUserInfo(res.member)
                }
            }).catch(err => {
                setNotiTextE(err.message);
                setOpenE(true);
            });
    }

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

    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Verified Members
                        </Typography>

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

                        <Dialog open={open} onClose={() => { setOpen(false); setUserInfo({}); setLoadingInfo(true); } } maxWidth="sm" fullWidth sx={{ borderRadius: "50%" }}>
                            <DialogTitle sx={{ backgroundColor: "grey.900" }}>
                                <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h5" sx={{ fontWeight: "500" }}>
                                        More Info
                                    </Typography>
                                    <IconButton onClick={() => { setOpen(false); setUserInfo({}); setLoadingInfo(true); } }>
                                        <CloseIcon />
                                    </IconButton>
                                </Stack>
                            </DialogTitle>
                            <DialogContent sx={{ marginTop: 2 }}>
                                {(!loadingInfo && userInfo) ? (
                                    <>
                                        <Stack spacing={1} direction="row" alignItems="center" sx={{ borderRadius: "1rem", flexDirection: { xs: "column", md: "row" } }}>
                                            <Avatar alt={userInfo.username} src={userInfo.avatar.length < 5 ? `https://cdn.discordapp.com/embed/avatars/${userInfo.discriminator % 5}.png` : `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=2048`} />
                                            
                                            <Tooltip title={`${userInfo.username}#${userInfo.discriminator}`} placement="top">
                                                <Typography variant="h5" sx={{ fontWeight: "600", zIndex: 9999  }}>
                                                    {userInfo.username}#{userInfo.discriminator}
                                                </Typography>
                                            </Tooltip>

                                            {(userInfo.public_flags || userInfo.premium_type) ? 
                                                <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap" width="100%" sx={{ justifyContent: {xs: "center", md: "flex-start" } }}>
                                                    {(userInfo.premium_type > 0) &&                                                 <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Nitro"}                    placement="top"><Avatar alt="Nitro"                     src="https://cdn.discordapp.com/attachments/953322413393846393/1018637667900080218/24d05f3b46a110e538674edbac0db4cd.pnh.png" sx={{ width: 28, height: 28 }} /></Tooltip>}
                                                    {(userInfo.public_flags & DISCORD_EMPLOYEE) == DISCORD_EMPLOYEE &&              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Employee"}         placement="top"><Avatar alt="Discord Employee"          src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/Discord_Staff.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & DISCORD_PARTNER) == DISCORD_PARTNER &&                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Partner"}          placement="top"><Avatar alt="Discord Partner"           src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/discord_partner.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & HYPESQUAD_EVENTS) == HYPESQUAD_EVENTS &&              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Hypesquad"}        placement="top"><Avatar alt="Discord Hypesquad"         src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/HypeSquad_Event.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & BUG_HUNTER_LEVEL_1) == BUG_HUNTER_LEVEL_1 &&          <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Bug Hunter"}       placement="top"><Avatar alt="Discord Bug Hunter"        src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/Bug_Hunter.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & HOUSE_BRAVERY) == HOUSE_BRAVERY &&                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"House of Bravery"}         placement="top"><Avatar alt="House of Bravery"          src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/HypeSquad_Bravery.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & HOUSE_BRILLIANCE) == HOUSE_BRILLIANCE &&              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"House of Brilliance"}      placement="top"><Avatar alt="House of Brilliance"       src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/HypeSquad_Brilliance.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & HOUSE_BALANCE) == HOUSE_BALANCE &&                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"House of Balance"}         placement="top"><Avatar alt="House of Balance"          src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/HypeSquad_Balance.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & EARLY_SUPPORTER) == EARLY_SUPPORTER &&                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Early Supporter"}          placement="top"><Avatar alt="Early Supporter"           src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/early_supporter.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & VERIFIED_BOT_DEVELOPER) == VERIFIED_BOT_DEVELOPER &&  <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Verified Bot Developer"}   placement="top"><Avatar alt="Verified Bot Developer"    src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/Verified_Bot_Developer.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                    {(userInfo.public_flags & CERTIFIED_MODERATOR) == CERTIFIED_MODERATOR &&        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Certified Moderator"}      placement="top"><Avatar alt="Certified Moderator"       src="https://raw.githubusercontent.com/Mattlau04/Discord-SVG-badges/master/PNG/Discord_certified_moderator.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                                </Stack> : <></>}
                                        </Stack>

                                        <Stack spacing={1} direction="row" alignItems="center" sx={{ mt: 2 }}>
                                            {userInfo.location.isocode && <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200}} title={userInfo.location.country} placement="top"><Avatar alt="Bot" src={`https://cdn.ipregistry.co/flags/twemoji/${userInfo.location.isocode.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0 }} /></Tooltip>}
                                            {userInfo.ip && <Typography color="textSecondary" variant="body2">IP: <b>{userInfo.ip}</b></Typography>}
                                        </Stack>

                                        {userInfo.location.country && <Typography color="textSecondary" variant="body2">Country: <b>{userInfo.location.country}</b></Typography>}
                                        {userInfo.location.region && <Typography color="textSecondary" variant="body2">Region: <b>{userInfo.location.region}</b></Typography>}
                                        {userInfo.location.city && <Typography color="textSecondary" variant="body2">City: <b>{userInfo.location.city}</b></Typography>}
                                        {userInfo.location.provider && <Typography color="textSecondary" variant="body2">Provider: <b>{userInfo.location.provider}</b></Typography>}
                                        {userInfo.location.type && <Typography color="textSecondary" variant="body2">Type: <b>{userInfo.location.type}</b></Typography>}
                                        {userInfo.locale && <Typography color="textSecondary" variant="body2" sx={{ mt: 2 }}>Language: <b>{userInfo.locale.split("-")[1] ? userInfo.locale.split("-")[1] : userInfo.locale.toUpperCase()}</b></Typography>}
                                        {userInfo.mfa_enabled && <Typography color="textSecondary" variant="body2">2FA: <b>{userInfo.mfa_enabled ? "Enabled" : "Disabled"}</b></Typography>}
                                    </>
                                ) : <CircularProgress />}
                            </DialogContent>
                            <DialogActions sx={{ mx: 2, mb: 2, justifyContent: "flex-start" }}>
                                <LoadingButton loading={loading} variant="contained" color="success" onClick={() => {
                                    setLoading(true);
                                                                
                                    axios.put(`/api/v1/member/${userInfo.id}?guild=${userInfoGuild}`, {}, { 
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
                                            }
                                                                        
                                            setTimeout(() => {
                                                setLoading(false);
                                            }, 200);
                                        })
                                        .catch((err): any => {
                                            setNotiTextE(err.message);
                                            setOpenE(true);
                                            console.error(err);
                                        });
                                }}>Pull</LoadingButton>
                                <Button variant="contained" color="error" onClick={() => {
                                    axios.delete(`/api/v1/member/${userInfo.id}?guild=${userInfoGuild}`, { 
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
                                                setOpen(false);
                                                setLoadingInfo(true);
                                                setTimeout(() => { refetch(); }, 100);
                                                setUserInfo({});
                                            }
                                        })
                                        .catch((err): any => {
                                            setNotiTextE(err.message);
                                            setOpenE(true);
                                            console.error(err);
                                        });
                                }}>Delete</Button>
                            </DialogActions>
                        </Dialog>

                        {isLoading ? ( <CircularProgress /> ) : (
                            <>
                        
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                    {data?.pages ? ( 
                                        <>{data?.pages?.[0]?.max === 0 ? "No verified members" : `Showing ${data?.pages?.[0]?.max} verified members. (pullable ${data?.pages?.[0]?.pullable})`} </> 
                                    ) : (
                                        "Loading..."
                                    )}
                                </Typography>
                                <Stack direction="row" spacing={0} justifyContent="space-between" sx={{ flexDirection: { xs: "column", sm: "row" } }}>
                                    <TextField id="search" label="Search" variant="outlined" onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: "500", sm: "auto" } }} />
                                    <FormControl fullWidth sx={{ marginLeft: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } }}>
                                        <InputLabel id="server-select-label">Server</InputLabel>
                                        <Select labelId="server-select-label" id="server-select" label="Server" value={serverId} onChange={handleSelect}>
                                            <MenuItem value="all">All</MenuItem>
                                            {user.servers.map((server: any) => (
                                                <MenuItem key={server.id} value={server.guildId}>{server.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                                {/* {data?.pages?.map((page) => page.members.map((item: any) => { */}
                                {data?.pages?.map((page, index) => (data?.pages?.[index]?.members ?? []).map((item: any) => {
                                    return (
                                        <Paper key={item.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                            <CardContent>
                                                <Grid container direction="row" justifyContent={"space-between"}>
                                                    <Grid item>
                                                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                            {item.avatar.length > 1 ? (
                                                                <Avatar alt={item.username} src={`https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}.png?size=32`} srcSet={`https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}.png?size=64 2x, https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}.png?size=128 3x`} sx={{ mr: "0.5rem" }} />
                                                            ) : (
                                                                <Avatar alt={item.username} src={`https://cdn.discordapp.com/embed/avatars/${item.username.charCodeAt(0) % 5}.png?size=32`} srcSet={`https://cdn.discordapp.com/embed/avatars/${item.username.charCodeAt(0) % 5}.png?size=64 2x, https://cdn.discordapp.com/embed/avatars/${item.username.charCodeAt(0) % 5}.png?size=128 3x`} sx={{ mr: "0.5rem" }} />
                                                            )}
                                                            {item.username ? (
                                                                <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-word" }}>
                                                                    {item.username}
                                                                </Typography>
                                                            ) : (
                                                                <CircularProgress />
                                                            )}
                                                            {item.unauthorized && (
                                                                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} placement="top" disableInteractive title="Unauthorized">
                                                                    <Badge color="error" sx={{ ml: "0.5rem" }}>
                                                                        Unauthorized
                                                                    </Badge>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                                            ID: {item.userId}
                                                        </Typography>
                                                        <Typography variant="body2" color="textSecondary" sx={{ wordBreak: "break-word" }}>
                                                            Verified: {new Date(item.createdAt).toLocaleString()}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                                                        <Button variant="contained" color="info" sx={{  width: "100%", maxWidth: "100%", }} onClick={() => {
                                                            // setUserId(item.userId);
                                                            setUserInfoGuild(item.guildId);
                                                            requestInfo(item.userId);
                                                            setLoadingInfo(true);
                                                            setOpen(true);
                                                        }}>Actions</Button>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Paper>
                                    );
                                }) ?? <></>)}
                            </>)}

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
        </>
    );
}
