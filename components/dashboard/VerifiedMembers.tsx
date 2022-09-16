import { useRouter } from "next/router";
import { useToken } from "../../src/token";
import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery } from "react-query";

import getMembers, { BOT_HTTP_INTERACTIONS, BUG_HUNTER_LEVEL_1, BUG_HUNTER_LEVEL_2, CERTIFIED_MODERATOR, DELETED, DISABLED, DISABLED_SUSPICIOUS_ACTIVITY, DISABLE_PREMIUM, DISCORD_EMPLOYEE, DISCORD_PARTNER, EARLY_SUPPORTER, HAS_UNREAD_URGENT_MESSAGES, HIGH_GLOBAL_RATE_LIMIT, HOUSE_BALANCE, HOUSE_BRAVERY, HOUSE_BRILLIANCE, HYPESQUAD_EVENTS, INTERNAL_APPLICATION, MFA_SMS, PREMIUM_DISCRIMINATOR, PREMIUM_PROMO_DISMISSED, QUARANTINED, SELF_DELETED, SPAMMER, SYSTEM, TEAM_PSEUDO_USER, UNDERAGE_DELETED, USED_DESKTOP_CLIENT, USED_MOBILE_CLIENT, USED_WEB_CLIENT, VERIFIED_BOT, VERIFIED_BOT_DEVELOPER, VERIFIED_EMAIL } from "../../src/dashboard/getMembers";
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
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import axios from "axios";
import LoadingButton from "@mui/lab/LoadingButton";
import theme from "../../src/theme";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import { useInView } from "react-intersection-observer";
import React from "react";

export default function VerifiedMembers({ user }: any) {
    const { ref, inView } = useInView()
    const [token]: any = useToken();
    const router = useRouter();
    const [serverId, setServerId] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [userInfo, setUserInfo]: any = useState({});

    const [loading, setLoading] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(true);

    const { data, isSuccess, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery('members', async ({ pageParam = 1 }: any) => await getMembers({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, serverId, pageParam), {
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
        }, 10);
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
        };

        document.addEventListener('scroll', onScroll);
        return () => {
            document.addEventListener('scroll', onScroll);
        }
    }, [hasNextPage, fetchNextPage]);

    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500", sm: { fontSize: "0.5rem" } }}>
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

                        <Dialog open={open} onClose={() => { setOpen(false); setLoadingInfo(true); setUserInfo({}); } } maxWidth="sm" fullWidth sx={{ borderRadius: "50%" }}>
                            <DialogTitle sx={{ backgroundColor: "grey.900" }}>
                                <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h5" sx={{ fontWeight: "500" }}>
                                        More Info
                                    </Typography>
                                    <IconButton onClick={() => { setOpen(false); setLoadingInfo(true); setUserInfo({}); } }>
                                        <CloseIcon />
                                    </IconButton>
                                </Stack>
                            </DialogTitle>
                            <DialogContent sx={{ marginTop: 2 }}>
                                <Stack spacing={1} direction="row" alignItems="center" sx={{ borderRadius: "1rem", flexDirection: { xs: "column", md: "row" } }}>
                                    {loadingInfo ? <Skeleton animation="wave" variant="circular" width={40} height={40}  /> : <Avatar alt={userInfo.username} src={userInfo.avatar.length < 2 ? `https://cdn.discordapp.com/embed/avatars/${userInfo.discriminator % 5}.png` : `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=2048`} />}
                                    {loadingInfo ? 
                                        <>
                                            <Skeleton animation="wave" variant="rectangular" width={135} height={28} sx={{ borderRadius: "4px" }} />
                                        </> : <>
                                            <Tooltip title={`${userInfo.username}#${userInfo.discriminator}`} placement="top">
                                                <Typography variant="h5" sx={{ fontWeight: "600", zIndex: 9999  }}>
                                                    {userInfo.username}#{userInfo.discriminator}
                                                </Typography>
                                            </Tooltip>
                                        </>
                                    }
                                    
                                    {(userInfo.public_flags || userInfo.premium_type) ? 
                                        <Stack spacing={1} direction="row" alignItems="center" flexWrap="wrap" width="100%" sx={{ justifyContent: {xs: "center", md: "flex-start" } }}>
                                            {(userInfo.premium_type > 0) &&                                                 <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Nitro"}                    placement="top"><Avatar alt="Nitro" src="https://cdn.discordapp.com/attachments/953322413393846393/1018637667900080218/24d05f3b46a110e538674edbac0db4cd.pnh.png" sx={{ width: 28, height: 28 }} /></Tooltip>}
                                            {(userInfo.public_flags & DISCORD_EMPLOYEE) == DISCORD_EMPLOYEE &&              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Employee"}         placement="top"><Avatar alt="Discord Employee" src="https://discord.id/img/flags/0.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & DISCORD_PARTNER) == DISCORD_PARTNER &&                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Partner"}          placement="top"><Avatar alt="Discord Partner" src="https://discord.id/img/flags/1.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & HYPESQUAD_EVENTS) == HYPESQUAD_EVENTS &&              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Hypesquad"}        placement="top"><Avatar alt="Discord Hypesquad Boss" src="https://discord.id/img/flags/2.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & BUG_HUNTER_LEVEL_1) == BUG_HUNTER_LEVEL_1 &&          <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Discord Bug Hunter"}       placement="top"><Avatar alt="Discord Hypesquad" src="https://discord.id/img/flags/3.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & HOUSE_BRAVERY) == HOUSE_BRAVERY &&                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"House of Bravery"}         placement="top"><Avatar alt="House of Bravery" src="https://discord.id/img/flags/6.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & HOUSE_BRILLIANCE) == HOUSE_BRILLIANCE &&              <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"House of Brilliance"}      placement="top"><Avatar alt="House of Brilliance" src="https://discord.id/img/flags/7.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & HOUSE_BALANCE) == HOUSE_BALANCE &&                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"House of Balance"}         placement="top"><Avatar alt="House of Balance" src="https://discord.id/img/flags/8.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & EARLY_SUPPORTER) == EARLY_SUPPORTER &&                <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Early Supporter"}          placement="top"><Avatar alt="Early Supporter" src="https://discord.id/img/flags/9.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & SYSTEM) == SYSTEM &&                                  <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"System"}                   placement="top"><Avatar alt="System" src="https://discord.id/img/flags/12.png" sx={{ width: 28, height: 28, borderRadius: 0 }} /></Tooltip>}
                                            {(userInfo.public_flags & VERIFIED_BOT) == VERIFIED_BOT &&                      <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Verified Bot"}             placement="top"><Avatar alt="Verified Bot" src="https://discord.id/img/flags/16.png" sx={{ width: 28, height: 28, borderRadius: 0 }}/></Tooltip>}
                                            {(userInfo.public_flags & VERIFIED_BOT_DEVELOPER) == VERIFIED_BOT_DEVELOPER &&  <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Verified Bot Developer"}   placement="top"><Avatar alt="Verified Bot Developer" src="https://discord.id/img/flags/17.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & CERTIFIED_MODERATOR) == CERTIFIED_MODERATOR &&        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title={"Certified Moderator"}      placement="top"><Avatar alt="Certified Moderator" src="https://discord.id/img/flags/18.png" sx={{ width: 28, height: 28 }}/></Tooltip>}
                                            {(userInfo.public_flags & DELETED) == DELETED && <span>Deleted</span>}
                                            {(userInfo.public_flags & SELF_DELETED) == SELF_DELETED && <span>Self Deleted</span>}
                                            {(userInfo.public_flags & DISABLED) == DISABLED && <span>Disabled</span>}
                                        </Stack> : <></>}
                                </Stack>

                                <Stack spacing={1} direction="row" alignItems="center" sx={{ mt: 2 }}>
                                    {loadingInfo ? 
                                        <>
                                            <Skeleton animation="wave" variant="rectangular" width={30} height={16} sx={{ borderRadius: "4px" }} /> 
                                            <Skeleton animation="wave" variant="rectangular" width={120} height={16} sx={{ borderRadius: "4px" }} /> 
                                        </> : <>
                                            {userInfo.location.isocode && <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200}} title={userInfo.location.country} placement="top"><Avatar alt="Bot" src={`https://cdn.ipregistry.co/flags/twemoji/${userInfo.location.isocode.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0 }} /></Tooltip>}
                                            {userInfo.ip && <Typography color="textSecondary" variant="body2">IP: <b>{userInfo.ip}</b></Typography>}
                                        </>
                                    }

                                </Stack>
                                {loadingInfo ? 
                                    <>
                                        <Skeleton animation="wave" variant="rectangular" width={225} height={16} sx={{ borderRadius: "4px", mt: 0.5 }} />
                                        <Skeleton animation="wave" variant="rectangular" width={230} height={16} sx={{ borderRadius: "4px", mt: 0.5 }} />
                                        <Skeleton animation="wave" variant="rectangular" width={200} height={16} sx={{ borderRadius: "4px", mt: 0.5 }} />
                                        <Skeleton animation="wave" variant="rectangular" width={190} height={16} sx={{ borderRadius: "4px", mt: 0.5 }} />
                                        <Skeleton animation="wave" variant="rectangular" width={170} height={16} sx={{ borderRadius: "4px", mt: 0.5 }} />
                                    </> : <>
                                        {userInfo.location.country && <Typography color="textSecondary" variant="body2">Country: <b>{userInfo.location.country}</b></Typography>}
                                        {userInfo.location.region && <Typography color="textSecondary" variant="body2">Region: <b>{userInfo.location.region}</b></Typography>}
                                        {userInfo.location.city && <Typography color="textSecondary" variant="body2">City: <b>{userInfo.location.city}</b></Typography>}
                                        {userInfo.location.provider && <Typography color="textSecondary" variant="body2">Provider: <b>{userInfo.location.provider}</b></Typography>}
                                        {userInfo.location.type && <Typography color="textSecondary" variant="body2">Type: <b>{userInfo.location.type}</b></Typography>}
                                        {userInfo.locale && <Typography color="textSecondary" variant="body2" sx={{ mt: 2 }}>Language: <b>{userInfo.locale.split("-")[1] ? userInfo.locale.split("-")[1] : userInfo.locale.toUpperCase()}</b></Typography>}
                                        {userInfo.mfa_enabled && <Typography color="textSecondary" variant="body2">2FA: <b>{userInfo.mfa_enabled ? "Enabled" : "Disabled"}</b></Typography>}
                                    </>
                                }
                            </DialogContent>
                        </Dialog>
                        
                        <Grid justifyContent={"space-between"}>
                            <Grid item>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                    {isLoading ? (
                                        <Skeleton animation="wave" variant="text" width={250} height={30} />
                                    ) : (
                                        <>
                                            {data?.pages.map((page) => {
                                                return (
                                                    page.max === 0 ? "No verified members" : `Showing ${page.max} verified members.`
                                                )
                                            })}
                                        </>
                                    )}
                                </Typography>
                            </Grid>
                            <Grid item>
                                {isLoading ? (
                                    <Skeleton animation="wave" variant="rectangular" width={"100%"} height={55} sx={{ borderRadius: "4px" }} />
                                ) : (
                                    <>
                                        <FormControl fullWidth>
                                            <InputLabel id="server-select-label">Server</InputLabel>
                                            <Select labelId="server-select-label" id="server-select" label="Server" value={serverId} onChange={handleSelect}>
                                                <MenuItem value="all">All</MenuItem>
                                                {user.servers.map((server: any) => (
                                                    <MenuItem key={server.id} value={server.guildId}>{server.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
                                )}
                            </Grid>
                        </Grid>

                        {isLoading ? (
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
                                                        <Skeleton animation="wave" variant="rectangular" width={100} height={35} sx={{ borderRadius: "4px" }} />
                                                        <Skeleton animation="wave" variant="rectangular" width={100} height={35} sx={{ borderRadius: "4px" }} />
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <>
                                {data?.pages.map((page) =>
                                    page.members.map((item: any) => {
                                        return (
                                            <Paper key={item.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                                <CardContent>
                                                    <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
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
                                                                    <Skeleton variant="text" width={150} />
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
                                                            <Stack spacing={2} direction="column" justifyContent={"space-between"}>
                                                                <LoadingButton id={`user_${item.userId}`} loading={loading} variant="contained" sx={{ background: "#43a047", "&:hover": { background: "#388e3c" } }} onClick={() => {
                                                                    setLoading(true);
                                                                
                                                                    axios.put(`/api/v1/member/${item.userId}`, {}, { 
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
                                                                <Button variant="contained" color="info" onClick={() => {
                                                                    setUserId(item.userId);
                                                                    requestInfo(item.userId);
                                                                    setLoadingInfo(true);
                                                                    setOpen(true);
                                                                }}>Info</Button>
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Paper>
                                        );
                                    }))}
                            </>
                        )}

                        {hasNextPage && (
                            // center box
                            <Box sx={{ display: "flex", justifyContent: "center", mt: "1rem" }}>
                                <Button variant="contained" color="primary" onClick={() => {
                                    fetchNextPage();
                                }}>Load More</Button>
                            </Box>
                        )}

                        

                    </CardContent>
                </Paper>
            </Container>
        </>
    );
}
