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
import BlurredBlob from "../misc/BlurredBlob";
import TextSB2 from "../misc/TextSB2";
import LoadingButton from "../misc/LoadingButton";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import OutlinedInput from "@mui/material/OutlinedInput";
import Chip from "@mui/material/Chip";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function VerifiedMembers({ user }: any) {
    const [token]: any = useToken();

    const [serverId, setServerId] = useState("");
    const [search, setSearch] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [open, setOpen] = useState(false);
    const [userInfo, setUserInfo]: any = useState({});
    const [userInfoID, setUserInfoID]: any = useState("");

    const [exportOptions, setExportOptions] = useState<any>({
        open: false,
        serverId: "",
        format: "csv",
        options: [
            { label: "Id", value: "id" },
            { label: "User Id", value: "userId" },
            { label: "Access Token", value: "accessToken" },
            { label: "Refresh Token", value: "refreshToken" },
            { label: "Username", value: "username" },
            { label: "Created At", value: "createdAt" },
        ],
        selectedOptions: []
    });

    const [importOptions, setImportOptions] = useState<any>({
        open: false,
        serverId: "",
        format: "json",
        file: null
    });

    const [loading, setLoading] = useState(false);
    const [loadingInfo, setLoadingInfo] = useState(true);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery("members", async ({ pageParam = 1 }: any) => await getMembers({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, serverId, search, pageParam), {
        getNextPageParam: (lastPage, allPages: any) => {
            const maxPages = lastPage.maxPages;
            const nextPage = allPages.length + 1;
            return nextPage <= maxPages ? nextPage : undefined;
        },
        retry: true,
        refetchOnWindowFocus: false
    });

    function handleSelect(event: SelectChangeEvent) {
        setServerId(event.target.value as string);
        setTimeout(() => {
            refetch();
        }, 100);
    }

    function requestInfo(userId: string) {
        setLoadingInfo(true);
        fetch(`/api/v2/member/${userId}`, {
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

        document.addEventListener("scroll", onScroll);
        return () => {
            document.addEventListener("scroll", onScroll);
            clearTimeout(delayDebounceFn);
        }       
    }, [hasNextPage, fetchNextPage, refetch, search]);

    function renderMoreInfo() {
        return (
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
                                    <Typography variant="h5" sx={{ fontWeight: "600", zIndex: 9999 }}>
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

                            {(userInfo.location && userInfo.location !== undefined && userInfo.location !== null && Object.keys(userInfo.location).length > 0) && (
                                <>
                                    <Stack spacing={1} direction="row" alignItems="center" sx={{ mt: 2 }}>
                                        {userInfo.location.country ? <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200}} title={userInfo.location.country} placement="top"><Avatar alt="Bot" src={`https://cdn.ipregistry.co/flags/twemoji/${userInfo.location.isocode.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0 }} /></Tooltip> : <></>}
                                        {userInfo.ip ? <TextSB2>IP: <b>{userInfo.ip}</b></TextSB2> : <TextSB2>IP: <b>Unavailable</b></TextSB2>}
                                    </Stack>

                                    {userInfo.location.country ? <TextSB2>Country: <b>{userInfo.location.country}</b></TextSB2> : <></>}
                                    {userInfo.location.region && <TextSB2>Region: <b>{userInfo.location.region}</b></TextSB2>}
                                    {userInfo.location.city && <TextSB2>City: <b>{userInfo.location.city}</b></TextSB2>}
                                    <TextSB2>Provider: <b>{userInfo.location.provider ? userInfo.location.provider : <BlurredBlob toolTipText={"Upgrade to view"} />}</b></TextSB2>
                                    <TextSB2>Type: <b>{userInfo.location.type ? userInfo.location.type : <BlurredBlob toolTipText={"Upgrade to view"} />}</b></TextSB2>
                                    {(userInfo.locale) && (
                                        <>
                                            <TextSB2 sx={{ mt: 2 }}>Discord Language: <b>{userInfo.locale.split("-")[1] ? userInfo.locale.split("-")[1] : userInfo.locale.toUpperCase()}</b></TextSB2>
                                            <TextSB2>Discord 2FA: <b>{userInfo.mfa_enabled ? "Enabled" : "Disabled"}</b></TextSB2>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    ) : <CircularProgress />}
                </DialogContent>
                <DialogActions sx={{ mx: 2, mb: 2, justifyContent: "flex-start" }}>
                    <LoadingButton variant="contained" color="success" event={() => {
                        setLoading(true);
                                                                
                        axios.put(`/api/v2/member/${userInfoID}`, {}, { 
                            headers: {
                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                            },
                            validateStatus: () => true
                        }).then((res: any) => {
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
                        }).catch((err): any => {
                            setNotiTextE(err.message);
                            setOpenE(true);
                            console.error(err);
                        });
                    }}>Pull</LoadingButton>
                    <Button variant="contained" color="error" onClick={() => {
                        axios.delete(`/api/v2/member/${userInfoID}`, { 
                            headers: {
                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                            },
                            validateStatus: () => true
                        }).then((res: any) => {
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
                        }).catch((err): any => {
                            setNotiTextE(err.message);
                            setOpenE(true);
                            console.error(err);
                        });
                    }}>Delete</Button>
                </DialogActions>
            </Dialog>
        )
    }

    function renderExportModal() {
        return (
            <Dialog open={exportOptions.open} onClose={() => setExportOptions({ ...exportOptions, open: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: "grey.900" }}>
                    <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" sx={{ fontWeight: "500" }}>
                            Export
                        </Typography>
                        <IconButton onClick={() => setExportOptions({ ...exportOptions, open: false })}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ marginTop: 2 }}>
                    {user.role !== "business" && user.role !== "enterprise" && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            You need to have the <b>Business</b> plan to export data.
                        </Alert>
                    )}

                    <Stack spacing={1} direction="row" alignItems="center">
                        <Typography variant="body1" sx={{ fontWeight: "500" }}>
                            Options
                        </Typography>
                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title="Select what you want to export" placement="top">
                            <HelpOutlineOutlinedIcon sx={{ color: "grey.500", fontSize: "1rem" }} />
                        </Tooltip>
                    </Stack>

                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="server-select-label">Server</InputLabel>
                        <Select labelId="server-select-label" id="server-select" label="Server" value={exportOptions.serverId} onChange={(event: any) => setExportOptions({ ...exportOptions, serverId: event.target.value })}>
                            {user.servers.map((server: any) => (
                                <MenuItem key={server.id} value={server.guildId}>{server.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* multi select for the options */}
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="options-select-label">Options</InputLabel>
                        <Select labelId="options-select-label" id="options-select" label="Options" multiple value={exportOptions.selectedOptions} input={<OutlinedInput label="Format" />} onChange={(event: any) =>  setExportOptions({ ...exportOptions, selectedOptions: event.target.value })} renderValue={(selected) => ( <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{selected.map((value: any) => ( <Chip key={value} label={value} /> ))}</Box> )} MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}>
                            {exportOptions.options.map((option: any) => (
                                <MenuItem key={option.value} value={option.value} sx={{ padding: 0 }}>
                                    <Checkbox checked={exportOptions.selectedOptions.indexOf(option.value) > -1} />
                                    <ListItemText primary={option.label} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="format-select-label">Format</InputLabel>
                        <Select labelId="format-select-label" id="format-select" label="Format" value={exportOptions.format} onChange={(event: any) => setExportOptions({ ...exportOptions, format: event.target.value })}>
                            <MenuItem value="json">JSON</MenuItem>
                            <MenuItem value="csv">CSV</MenuItem>
                        </Select>
                    </FormControl>

                    {/* warning when u export ur members they prob wont be able to be used again on restorecord */}
                    <Alert severity="error" sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: "500" }}>
                            Warning
                        </Typography>
                        <Typography variant="body2">
                            We do not recommend using the members in your Application after exporting them, we don&apos;t gurantee that they will be able to be used again on RestoreCord.
                        </Typography>
                    </Alert>


                </DialogContent>

                <DialogActions sx={{ mx: 2, mb: 2, justifyContent: "flex-start" }}>
                    <LoadingButton variant="contained" color="success" fullWidth={true} disabled={(user.role !== "business" && user.role !== "enterprise") || exportOptions.selectedOptions.length === 0} event={() => {
                        axios.post(`/api/v2/self/servers/${exportOptions.serverId}/export?options=${exportOptions.selectedOptions.join(",")}&format=${exportOptions.format}`, {}, {
                            headers: {
                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                "Content-Type": "application/octet-stream"
                            },
                            validateStatus: () => true,
                            responseType: "blob"
                        }).then((res: any) => {
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", res.headers["content-disposition"].split("filename=")[1]);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();


                            setTimeout(() => {
                                setExportOptions({ ...exportOptions, open: false });
                            }, 200);
                        }).catch((err): any => {
                            setNotiTextE(err.message);
                            setOpenE(true);
                            console.error(err);
                        });
                    }}>Export</LoadingButton>
                </DialogActions>
            </Dialog>
        )   
    }

    function renderImportModal() {
        return (
            <Dialog open={importOptions.open} onClose={() => setImportOptions({ ...importOptions, open: false })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: "grey.900" }}>
                    <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" sx={{ fontWeight: "500" }}>
                            Import
                        </Typography>
                        <IconButton onClick={() => setImportOptions({ ...importOptions, open: false })}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{ marginTop: 2 }}>
                    <Stack spacing={1} direction="row" alignItems="center">
                        <Typography variant="body1" sx={{ fontWeight: "500" }}>
                            Options
                        </Typography>
                        <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 200 }} title="Select what you want to import" placement="top">
                            <HelpOutlineOutlinedIcon sx={{ color: "grey.500", fontSize: "1rem" }} />
                        </Tooltip>
                    </Stack>

                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="server-select-label">Server</InputLabel>
                        <Select labelId="server-select-label" id="server-select" label="Server" value={importOptions.serverId} onChange={(event: any) => setImportOptions({ ...importOptions, serverId: event.target.value })}>
                            {user.servers.map((server: any) => (
                                <MenuItem key={server.id} value={server.guildId}>{server.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel id="format-select-label">Format</InputLabel>
                        <Select labelId="format-select-label" id="format-select" label="Format" value={importOptions.format} onChange={(event: any) => setImportOptions({ ...importOptions, format: event.target.value })}>
                            <MenuItem value="json">JSON</MenuItem>
                            <MenuItem value="csv" disabled>CSV</MenuItem>
                        </Select>
                    </FormControl>

                    {/* <Button fullWidth variant="contained" component="label" sx={{ mt: 2 }} startIcon={<CloudUploadIcon />} disabled={importOptions.serverId.length === 0}>
                        <input
                            type="file"
                            onChange={(e) => setImportOptions({ ...importOptions, file: e.target.files })}
                            accept=".txt,.csv,.json"
                            style={{ display: "none" }}
                        />
                        {importOptions.file ? `Selected: "${importOptions.file[0].name}"` : "Select File"}
                    </Button> */}

                    <TextField fullWidth label="File" id="file" name="file" value={importOptions.file ? importOptions.file[0].name : "Select File"} sx={{ mt: 1 }} InputProps={{endAdornment: (<input type="file" accept="application/json, text/csv" onChange={(e) => setImportOptions({ ...importOptions, file: e.target.files })} tabIndex={ -1 } style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: 0 }} />) }} />
                        
                    {/* warning when u export ur members they prob wont be able to be used again on restorecord */}
                    <Alert severity="error" sx={{ my: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: "500" }}>
                            Warning
                        </Typography>
                        <Typography variant="body2">
                            THIS CAN NOT BE STOPPED OR PAUSED,
                            Once Imported you may not be able to use the members in your Application again.
                        </Typography>
                    </Alert>

                    <LoadingButton variant="contained" color="success" fullWidth={true} disabled={importOptions.serverId.length === 0 || !importOptions.file} event={() => {
                        const data = new FormData();
                        data.append("file", importOptions.file[0]);

                        axios.post(`/api/v2/self/servers/${importOptions.serverId}/import?format=${importOptions.format}`, data, {
                            headers: {
                                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                "Content-Type": "multipart/form-data"
                            },
                            validateStatus: () => true
                        }).then((res: any) => {
                            if (!res.data.success) {
                                setNotiTextE(res.data.message);
                                setOpenE(true);
                            }
                            else {
                                setNotiTextS(res.data.message);
                                setOpenS(true);
                                setImportOptions({ ...importOptions, open: false });
                                setTimeout(() => { refetch(); }, 100);
                            }
                        }).catch((err): any => {
                            setNotiTextE(err.message);
                            setOpenE(true);
                            console.error(err);
                        });
                    }}>Start Import</LoadingButton>

                </DialogContent>

            </Dialog>
        )
    }

    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #18182e" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>
                                Verified Members
                            </Typography>

                            <Box>
                                {/* if localstorage beta = 7728 then show import button */}
                                {window.localStorage.getItem("beta") === "728" && (
                                    <Button variant="contained" color="success" onClick={() => setImportOptions({ ...importOptions, open: true })} sx={{ mr: 1 }}>Import</Button>
                                )}
                                <Button variant="contained" color="yellow" onClick={() => setExportOptions({ ...exportOptions, open: true })} sx={{ ml: 1 }}>Export</Button>
                            </Box>
                        </Stack>

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

                        {open && renderMoreInfo()}
                        {exportOptions.open && renderExportModal()}
                        {importOptions.open && renderImportModal()}

                        {isLoading ? ( <CircularProgress /> ) : (
                            <>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                    {data?.pages ? ( 
                                        <>{data?.pages?.[0]?.max === 0 ? "No verified members" : `Showing ${data?.pages?.[0]?.max} verified members. (pullable ${data?.pages?.[0]?.pullable})`} </> 
                                    ) : (
                                        "Loading..."
                                    )}
                                </Typography>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={0} justifyContent="space-between">
                                    <TextField id="search" label="Search" variant="outlined" onChange={(e) => setSearch(e.target.value)} sx={{ width: { xs: "100%", sm: "30%" } }} />
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
                                                                <Avatar alt={item.username.replace("@", "")} src={`https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}.png?size=32`} srcSet={`https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}.png?size=64 2x, https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}.png?size=128 3x`} sx={{ mr: "0.5rem" }} />
                                                            ) : (
                                                                <Avatar alt={item.username.replace("@", "")} src={`https://cdn.discordapp.com/embed/avatars/${item.username.charCodeAt(0) % 5}.png?size=32`} srcSet={`https://cdn.discordapp.com/embed/avatars/${item.username.charCodeAt(0) % 5}.png?size=64 2x, https://cdn.discordapp.com/embed/avatars/${item.username.charCodeAt(0) % 5}.png?size=128 3x`} sx={{ mr: "0.5rem" }} />
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
                                                            setUserInfoID(item.id);
                                                            requestInfo(item.id);
                                                            // requestInfo(item.userId);
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
