import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useToken } from "../../src/token";

import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function DashServerSettings({ user, id }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [serverName, setServerName] = useState("");
    const [guildId, setGuildId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [webhook, setWebhook] = useState("");
    const [webhookcheck, setWebhookCheck] = useState(false);
    const [vpncheck, setVpnCheck] = useState(false);

    const server = user.servers.find((server: any) => server.guildId === id);
    
    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    useEffect(() => {
        if (server) {
            setServerName(server.name);
            setGuildId(server.guildId);
            setRoleId(server.roleId);

            setWebhookCheck(server.webhook ? true : false);
            setWebhook(server.webhook ? server.webhook : "");
            setVpnCheck(server.vpncheck);
        }
    }, []);

    function handleSubmit(e: any) {
        e.preventDefault();

        console.log(serverName, guildId, roleId, webhookcheck, vpncheck);

        fetch(`/api/v1/settings/server`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                newServerName: serverName,
                newGuildId: guildId,
                newRoleId: roleId,
                newWebhook: webhook,
                newWebhookCheck: webhookcheck,
                newVpnCheck: vpncheck,
                
                serverName: server.name,
                guildId: server.guildId,
                roleId: server.roleId,
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    setNotiTextE(res.message);
                    setOpenE(true);
                    // functions.ToastAlert(res.message, "error");
                }
                else {
                    setNotiTextS(res.message);
                    setOpenS(true);
                    setTimeout(() => {
                        router.push("/dashboard/settings");
                    }, 1250);
                    // functions.ToastAlert(res.message, "success");
                    // router.push("/dashboard/settings");
                }
            })
            .catch(err => {
                setNotiTextE(err.message);
                setOpenE(true);
                // functions.ToastAlert(err, "error");
            });

    }

    function handleChange(e: any) {
        switch (e.target.name) {
        case "serverName":
            setServerName(e.target.value);
            break;
        case "guildId":
            setGuildId(e.target.value);
            break;
        case "roleId":
            setRoleId(e.target.value);
            break;
        case "webhookcheck":
            setWebhookCheck(e.target.checked);
            break;
        case "webhook":
            setWebhook(e.target.value);
            break;
        case "vpncheck":
            setVpnCheck(e.target.checked);
            break;
        default:
            break;
        }
    }



    return (
        <>
            <Container maxWidth="xl">
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 2, fontWeight: "500" }}>
                            Change Server Settings
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
                        
                        {(user.servers.find((server: any) => server.guildId === id)) ? (
                            <>
                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                    <Grid item>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                            Editing {server.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" sx={{ mb: 2 }} onClick={() => { router.push(`/dashboard/settings/`)} }>
                                            Go Back
                                        </Button>
                                    </Grid>
                                </Grid>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={3} direction="column">
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Server Name
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="serverName" value={serverName} onChange={handleChange} />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Guild ID
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="guildId" value={guildId} onChange={handleChange} />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Role ID
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="roleId" value={roleId} onChange={handleChange} />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Server Description
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="description" value={server.description} onChange={handleChange} />
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                Server Icon
                                            </Typography>
                                            <TextField fullWidth variant="outlined" name="picture" value={server.picture} onChange={handleChange} />
                                        </Grid>
                                        <Grid item>
                                            <Stack direction="row" spacing={1}>
                                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                    Webhook Logs
                                                </Typography>
                                                <Switch onChange={handleChange} name="webhookcheck" defaultChecked={server.webhook ? true : false} />
                                            </Stack>
                                            {webhookcheck && (
                                                <TextField fullWidth variant="outlined" name="webhook" value={webhook} onChange={handleChange} />
                                            )}
                                        </Grid>
                                        {webhookcheck && (
                                            <Grid item>
                                                <Stack direction="row" spacing={1}>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                                        VPN Check
                                                    </Typography>
                                                    <Switch onChange={handleChange} name="vpncheck" defaultChecked={server.vpncheck} />
                                                </Stack>
                                            </Grid>
                                        )}
                                        <Grid item>
                                            <Button variant="contained" type="submit" sx={{ mb: 2 }} fullWidth>
                                                Save Changes
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            </>
                        ) : (
                            <>
                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                    <Grid item>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: "500" }}>
                                            You do not have access to this server
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" sx={{ mb: 2 }} onClick={() => { router.push(`/dashboard/settings/`)} }>
                                            Go Back
                                        </Button>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </CardContent>
                </Paper>
            </Container>

            {/* <Toaster />
            <div className="xl:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-10 w-full transition-all">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white sm:text-4xl text-2xl font-bold leading-tight">
                        Change Server Settings
                    </h1>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    {(Array.isArray(user.servers) && user.servers.find((server: any) => server.guildId === id)) ? (
                        <>
                            <h2 className="text-white text-3xl font-medium leading-tight mb-4">
                                {server.name}
                            </h2>

                            {Array.isArray(user.bots) && user.bots.length === 0 && (
                                <>
                                    <div className="flex p-4 mb-4 text-sm rounded-lg bg-red-200 text-red-800" role="alert">
                                        <svg className="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                        <div>
                                            <span className="font-medium">ERROR!</span> You currently have no Custom Bots associated with your account, please create one <button className="text-blue-400" onClick={ () => {
                                                router.push(`/dashboard/custombots`)
                                            }}>here</button> before creating a server
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                <form method="POST" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="serverName" className="block mb-2 text-sm font-medium text-gray-300">Server Name</label>
                                        <div className="relative mb-6">
                                            <input onChange={handleChange} required placeholder={server.name} name="serverName" type="text" id="serverName" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div>
                                            <label htmlFor="guildId" className="block mb-2 text-sm font-medium text-gray-300">Server Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required placeholder={server.guildId} name="guildId" type="text" id="guildId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="roleId" className="block mb-2 text-sm font-medium text-gray-300">Role Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required placeholder={server.roleId} name="roleId" type="text" id="roleId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="mt-4 transition-all relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Save
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                                You dont own this server.
                            </h2>
                        </>
                    )}
                            
                                          
                </div>
            </div> */}
        </>
    )
}

