import { useRouter } from "next/router";
import { useState } from "react";
import { stringAvatar } from "../../src/functions";
import { useToken } from "../../src/token";

import Link from "next/link";
import axios from "axios";

import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MuiLink from "@mui/material/Link";
import theme from "../../src/theme";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

export default function DashSettings({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [serverName, setServerName] = useState("");
    const [guildId, setGuildId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [customBot, setCustomBot] = useState("");

    const [picture, setPicture] = useState("");
    const [webhook, setWebhook] = useState("");
    const [description, setDescription] = useState("");
    const [bgimage, setBgimage] = useState("");


    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [createNewServer, setCreateNewServer] = useState(false);

    function handleSubmit(e: any, body: any, method: string = "POST") {
        e.preventDefault();

        fetch(`/api/v1/settings/server`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify(body),
            // body: JSON.stringify({
            //     serverName: serverName,
            //     guildId: guildId,
            //     roleId: roleId,
            //     customBot: customBot,
            // })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    setNotiTextE(res.message);
                    setOpenE(true);
                }
                else {
                    setNotiTextS(res.message);
                    setOpenS(true);

                    setTimeout(() => {
                        router.reload();
                    }, 2500);
                }
            })
            .catch(err => {
                console.error(err);
                setNotiTextE(err.message);
                setOpenE(true);
            });

    }

    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem", border: "1px solid #2f2f2f" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Settings
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
                        

                        {!createNewServer && (Array.isArray(user.servers) && user.servers.length >= 1) && (
                            <>
                                <Button variant="contained" sx={{ mb: 2 }} onClick={() => setCreateNewServer(true)}>
                                    Create New Server
                                </Button>
                                {user.servers.map((item: any) => {
                                    return (
                                        <Paper key={item.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }} id={`server_${item.guildId}`}>
                                            <CardContent>
                                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                                    <Grid item>
                                                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                            {item.picture === "https://cdn.restorecord.com/logo512.png" ? (
                                                                <Avatar {...stringAvatar(item.name, { sx: { mr: "0.5rem" } })}></Avatar>
                                                            ) : (
                                                                <Avatar src={item.picture} alt={item.serverName} sx={{ mr: "0.5rem" }} />
                                                            )}
                                                            <Typography variant="h6" sx={{ fontWeight: "500", wordBreak: "break-all" }}>
                                                                {item.name}
                                                            </Typography>
                                                        </div>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {item.description}
                                                        </Typography>
                                                        <Typography variant="body2" color="white" sx={{ wordBreak: "break-word" }}>
                                                            Verification URL
                                                            <MuiLink color={theme.palette.primary.light} href={`/verify/${encodeURIComponent(item.name)}`} rel="noopener noreferrer" target="_blank">
                                                                <br/>
                                                                {window.location.origin}/verify/{encodeURIComponent(item.name)}
                                                            </MuiLink>
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                                            <Button variant="contained" onClick={() => { router.push(`/dashboard/settings/${item.guildId}`)} }>
                                                                Edit
                                                            </Button>
                                                            <Button variant="contained" sx={{ background: "#43a047", "&:hover": { background: "#388e3c" } }} onClick={() => {
                                                                axios.put(`/api/v1/server/${item.guildId}`, {}, { 
                                                                    headers: {
                                                                        "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                                    },
                                                                    validateStatus: () => true
                                                                })
                                                                    .then(res => {
                                                                        if (!res.data.success) {
                                                                            if (res.data.pullTimeout) {
                                                                                setNotiTextE(`${res.data.message} ${new Intl.DateTimeFormat(navigator.language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(res.data.pullTimeout))}`);
                                                                            }
                                                                            else {
                                                                                setNotiTextE(res.data.message);
                                                                            }
                                                                            setOpenE(true);
                                                                        }
                                                                        else {
                                                                            setNotiTextS(res.data.message);
                                                                            setOpenS(true);
                                                                        }
                                                                    })
                                                                    .catch((err): any => {
                                                                        setNotiTextE(err.message);
                                                                        setOpenE(true);
                                                                        console.error(err);
                                                                    });
                                                            }}>Migrate</Button>
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Paper>
                                    );
                                })}
                            </>
                        )}

                        {(createNewServer || (Array.isArray(user.servers) && user.servers.length === 0)) && (
                            <>
                                <Button variant="contained" sx={{ mb: 2 }} onClick={() => setCreateNewServer(false)}>
                                    Go Back
                                </Button>
                                <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                    <CardContent>
                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                            {user.bots.length === 0 && (
                                                <Alert variant="filled" severity="error">
                                                    You don&apos;t have any bots to add to this server. You can add bots to your account{" "}
                                                    <MuiLink color={theme.palette.primary.light} href="/dashboard/custombots" rel="noopener noreferrer" target="_blank">
                                                        here
                                                    </MuiLink>.
                                                </Alert>
                                            )}
                                            <TextField label="Server Name" variant="outlined" value={serverName} onChange={(e) => setServerName(e.target.value)} required />
                                            <TextField label="Server Id" variant="outlined" value={guildId} onChange={(e) => setGuildId(e.target.value)} required />
                                            <TextField label="Member Role Id" variant="outlined" value={roleId} onChange={(e) => setRoleId(e.target.value)} required />
                                            <FormControl fullWidth variant="outlined" required>
                                                <InputLabel id="bot-select-label">Custom Bot</InputLabel>
                                                <Select labelId="bot-select-label" label="Custom Bot" value={customBot} onChange={(e) => setCustomBot(e.target.value as string)} required>
                                                    {user.bots.map((item: any) => {
                                                        return (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        );
                                                    })}
                                                </Select>
                                            </FormControl>
                                            <Button variant="contained" onClick={(e: any) => handleSubmit(e, { serverName, guildId, roleId, customBot, })}>Create</Button>
                                        </Stack>
                                    </CardContent>
                                </Paper>
                            </>
                        )}

                    </CardContent>
                </Paper>
            </Container>
        </>
    )
}

