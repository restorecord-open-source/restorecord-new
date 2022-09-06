import { useRouter } from "next/router";
import { useToken } from "../../src/token";
import { useState } from "react";
import { useQuery } from "react-query";

import getMembers from "../../src/dashboard/getMembers";
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

export default function VerifiedMembers({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();
    const [serverId, setServerId] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [loading, setLoading] = useState(false);

    const { data, isError, isLoading, refetch } = useQuery('members', async () => await getMembers({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, serverId), { retry: true });

    function handleSelect(event: SelectChangeEvent) {
        setServerId(event.target.value as string);
        setTimeout(() => {
            refetch();
        }, 10);
    }

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
                        
                        <Grid justifyContent={"space-between"}>
                            <Grid item>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                    {isLoading ? (
                                        <Skeleton animation="wave" variant="text" width={250} height={30} />
                                    ) : (
                                        <>
                                            {data.members.length === 0 ? "No verified members" : `Showing ${data.members.length} verified members.`}
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
                                {data.members.map((item: any) => {
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
                                                                        }, 500);
                                                                    })
                                                                    .catch((err): any => {
                                                                        setNotiTextE(err.message);
                                                                        setOpenE(true);
                                                                        console.error(err);
                                                                    });
                                                            }}>Pull</LoadingButton>
                                                            {/* <Button variant="contained" color="error" onClick={() => { }}>
                                                                Delete    
                                                            </Button> */}
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Paper>
                                    );
                                })}
                            </>
                        )}

                        

                    </CardContent>
                </Paper>
            </Container>

            {/* <div className="xl:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-10 w-full transition-all">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white sm:text-4xl text-2xl font-bold leading-tight">
						Verified Members
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
						View all your verified members.
                    </p>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    <div className="flex flex-col md:flex-row">
                        {(Array.isArray(data.members) && data.members.length === 0) ? (
                            <>
                                <div className="flex-1">
                                    <h2 className="text-gray-100 sm:text-2xl text-lg font-bold leading-tight mb-4">
                                        No verified members found.
                                    </h2>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <h2 className="text-gray-100 sm:text-2xl text-lg font-bold leading-tight mb-4">
                                        Showing {data.members.length} verified members.
                                    </h2>
                                </div>
                            </>
                        )}
                    </div>

                    {Array.isArray(data.members) && data.members.map((item: any) => {
                        return (
                            <div key={item.id}>
                                <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                    <div className="inline-flex">
                                        <h5 className="ml-2 text-2xl break-all font-bold tracking-tight text-white flex justify-center items-center">{item.username}</h5>
                                    </div>
                                    <hr className="border-b border-gray-700" />
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center">
                                            <span className="ml-2 text-sm text-gray-500 sm:flex hidden">{new Date(item.createdAt).toLocaleString()}</span>
                                            <span className="sm:flex hidden" style={{borderRight: "2px solid #374151", color: "transparent", marginLeft: "0.5rem"}}>​</span>
                                            <span className="ml-2 text-sm text-gray-500">{item.guildName} ({item.guildId}) {(item.ip && !(item.ip.includes("127.0.0.1") || item.ip.includes("::1"))) && ( <p className="font-normal text-gray-500">IP Address <span className="blur-[0.2rem] hover:blur-0 transition-all">{item.ip}</span></p>)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div> */}
        </>
    );
}
