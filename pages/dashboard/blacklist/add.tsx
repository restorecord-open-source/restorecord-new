import { useRouter } from "next/router";
import { useInfiniteQuery, useQuery } from "react-query";
import { useToken } from "../../../src/token";

import NavBar from "../../../components/dashboard/navBar";
import getUser from "../../../src/dashboard/getUser";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Alert from "@mui/lab/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Badge from "@mui/material/Badge";
import Snackbar from "@mui/material/Snackbar";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import getBlacklist from "../../../src/dashboard/getBlacklist";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";


export default function Blacklist() {
    const router = useRouter();
    const [token]: any = useToken()
    
    const [blacklist, setBlacklist]: any = useState("");
    const [blacklistType, setBlacklistType]: any = useState("user");
    const [blacklistReason, setBlacklistReason]: any = useState("");
    const [blacklistServer, setBlacklistServer]: any = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [openI, setOpenI] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");
    const [notiTextI, setNotiTextI] = useState("X");

    const { data: user, isError, isLoading: userLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });

    return (
        <Box sx={{ display: "flex" }}>
            <NavBar user={user}>
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
                           
                            <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                <CardContent>
                                    <form>
                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                            {/* select: UserId, IP, ASN, Country */}
                                            <FormControl fullWidth variant="outlined" required>
                                                <InputLabel htmlFor="blacklist-type">Blacklist Type</InputLabel>
                                                <Select value={blacklistType} onChange={(e) => setBlacklistType(e.target.value)} name="blacklist-type" label="Blacklist Type" id="blacklist-type">
                                                    <MenuItem value="user">User</MenuItem>
                                                    <MenuItem value="ip">IP</MenuItem>
                                                    <MenuItem value="asn">ASN (Business)</MenuItem>
                                                </Select>
                                            </FormControl>
                                            {/* input: UserId, IP Address, ASN Number, Country */}
                                            {blacklistType === "user" ? (
                                                <TextField required fullWidth label="User ID" placeholder="9812345678912345678" variant="outlined" value={blacklist} onChange={(e) => setBlacklist(e.target.value)} inputProps={{ minLength: 17, maxLength: 19, pattern: "[0-9]{17,19}" }} />
                                            ) : blacklistType === "ip" ? (
                                                <TextField required fullWidth label="IP Address" placeholder="123.212.167.89" variant="outlined" value={blacklist} onChange={(e) => setBlacklist(e.target.value)} inputProps={{ minLength: 7, maxLength: 15, pattern: "[0-9.]{7,15}" }} />
                                            ) : blacklistType === "asn" ? (
                                                <TextField required fullWidth label="ASN Number" placeholder="15169" variant="outlined" value={blacklist} onChange={(e) => setBlacklist(e.target.value)} inputProps={{ minLength: 1, maxLength: 10, pattern: "[0-9]{1,10}" }} />
                                            ) : null}
                                            {/* input: Reason */}
                                            <TextField fullWidth label="Reason" variant="outlined" value={blacklistReason} onChange={(e) => setBlacklistReason(e.target.value)} />
                                            {/* server  select */}
                                            {userLoading ? (
                                                <>
                                                    <Skeleton animation="wave" variant="rectangular" width="100%" height={56} sx={{ borderRadius: "14px" }} /> 
                                                </>
                                            ) : (
                                                <FormControl fullWidth variant="outlined" required>
                                                    <InputLabel htmlFor="blacklist-server">Server</InputLabel>
                                                    <Select value={blacklistServer} onChange={(e) => setBlacklistServer(e.target.value)} name="blacklist-server" label="Server" id="blacklist-server">
                                                        {user.servers.map((server: any) => (
                                                            <MenuItem key={server.id} value={server.guildId}>{server.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )}
                                            <Button type="submit" variant="contained" onClick={(e: any) => {
                                                e.preventDefault();
                                                axios.put("/api/v1/server/blacklist", {
                                                    type: blacklistType,
                                                    value: blacklist,
                                                    reason: blacklistReason,
                                                    guildId: blacklistServer,
                                                }, {
                                                    headers: {
                                                        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    },
                                                    validateStatus: () => true
                                                }).then((res) => {
                                                    console.log(res.data);
                                                    if (!res.data.success) { 
                                                        setNotiTextE(res.data.message);
                                                        setOpenE(true);
                                                    } else {
                                                        setNotiTextS(res.data.message);
                                                        setOpenS(true);
                                                        setTimeout(() => {
                                                            router.push("/dashboard/blacklist");
                                                        }, 500);
                                                    }
                                                }).catch((err) => {
                                                    setNotiTextE(err.response.data.error);
                                                    setOpenE(true);
                                                });
                                            }}>Create</Button>
                                        </Stack>
                                    </form>
                                </CardContent>
                            </Paper>

                        </CardContent>
                    </Paper>
                </Container>

            </NavBar>
        </Box>
    )
}