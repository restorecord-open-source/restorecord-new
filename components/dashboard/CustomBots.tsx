import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery } from "react-query";
import { useToken } from "../../src/token";

import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { Link } from "@mui/material";
import Image from "next/image";

export default function DashCustomBot({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [botName, setbotName] = useState("");
    const [clientId, setclientId] = useState("");
    const [botSecret, setbotSecret] = useState("");
    const [botToken, setbotToken] = useState("");
    const [publicKey, setpublicKey] = useState("");

    const [createNewBot, setcreateNewBot] = useState(false);

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const { data, isError, isLoading, refetch } = useQuery("getCustomBotInfo", async() => {
        if (user.bots && user.bots.length > 0) {
            for (const bot of user.bots) {
                await fetch(`https://discord.com/api/users/@me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bot ${bot.botToken}`,
                    },
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.id) {
                            if (res.avatar === null) {
                                bot.avatar = `https://cdn.discordapp.com/embed/avatars/${res.discriminator % 5}.png`;
                            } else {
                                bot.avatar = `https://cdn.discordapp.com/avatars/${res.id}/${res.avatar}.png`;
                            }
                            bot.username = `${res.username}#${res.discriminator}`;
                            bot.clientId = res.id;
                            return bot;
                        } else if (res.message === "401: Unauthorized") {
                            bot.avatar = `https://cdn.discordapp.com/embed/avatars/0.png`;
                            bot.username = `Unknown Bot`;
                            bot.clientId = atob(bot.botToken.split(".")[0]);
                            return bot;
                        }
                    })
                    .catch(err => {
                        console.error(`Error: ${err}`);
                    })
            }
        }
    });

    if (isError) {
        return <p>Error</p>
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v1/settings/bot`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                botName: botName,
                clientId: clientId,
                botToken: botToken,
                botSecret: botSecret,
                publicKey: publicKey,
            })
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
                    }, 1500);
                }
            })
            .catch(err => {
                console.error(err);
                setNotiTextE(err.message);
                setOpenE(true);
            });
    }

    function handleChange(e: any) {
        switch (e.target.name) {
        case "botName":
            setbotName(e.target.value);
            break;
        case "clientId":
            setclientId(e.target.value);
            break;
        case "botToken":
            setbotToken(e.target.value);
            break;
        case "botSecret":
            setbotSecret(e.target.value);
            break;
        case "publicKey":
            setpublicKey(e.target.value);
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
                            Custom Bots
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


                        {(Array.isArray(user.bots) && user.bots.length > 0) && !createNewBot && (
                            <>
                                <Button variant="contained" sx={{ mb: 2 }} onClick={() => setcreateNewBot(true)}>
                                    Create New Bot
                                </Button>
                                {user.bots.map((item: any) => {
                                    return (
                                        <Paper key={item.id} variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                            <CardContent>
                                                <Grid container spacing={3} direction="row" justifyContent={"space-between"}>
                                                    <Grid item>
                                                        <div style={{ display: "inline-flex", alignItems: "center" }}>
                                                            <Avatar alt={item.username} src={item.avatar} sx={{ mr: "0.5rem" }} />
                                                            {item.username ? (
                                                                <Typography variant="h6" sx={{ fontWeight: "500" }}>
                                                                    {item.username}
                                                                </Typography>
                                                            ) : (
                                                                <Skeleton variant="text" width={150} />
                                                            )}
                                                        </div>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {item.username ? (
                                                                <>
                                                                    {item.name} - {item.clientId}
                                                                </>
                                                            ) : (
                                                                <Skeleton variant="text" width={190} height={20} />
                                                            )}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={12} md={3} lg={2} xl={1}>
                                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                                            {item.username ? (
                                                                <>
                                                                    <Button variant="contained" onClick={() => { router.push(`/dashboard/custombots/${item.clientId}`) }}>
                                                                        Edit
                                                                    </Button>
                                                                    <Button variant="contained" sx={{ background: "#43a047", "&:hover": { background: "#388e3c" } }} href={`https://discord.com/oauth2/authorize?client_id=${item.clientId}&scope=bot%20applications.commands&permissions=8`} target="_blank">
                                                                        Invite
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: "4px" }} />
                                                                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: "4px" }} />
                                                                </>
                                                            )}
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Paper>
                                    );
                                })}
                            </>
                        )}

                        {(createNewBot || (Array.isArray(user.bots) && user.bots.length === 0)) && (
                            <>
                                <Button variant="contained" sx={{ mb: 2 }} onClick={() => setcreateNewBot(false)}>
                                    Go Back
                                </Button>
                                <Paper variant="outlined" sx={{ borderRadius: "1rem", padding: "0.5rem", marginTop: "1rem" }}>
                                    <CardContent>
                                        <Stack spacing={1} direction="column" justifyContent={"space-between"}>
                                            <Alert variant="filled" severity="error">Before you create a bot, make sure you have read the <Link href="https://docs.restorecord.com/guides/create-a-custom-bot/" target="_blank">documentation</Link> and added a redirect/interaction URL to your bot.</Alert>
                                            <TextField label="Bot Name" name="botName" value={botName} onChange={handleChange} required />
                                            <TextField label="Client ID" name="clientId" value={clientId} onChange={handleChange} required />
                                            <TextField label="Bot Token" name="botToken" value={botToken} onChange={handleChange} required />
                                            <TextField label="Bot Secret" name="botSecret" value={botSecret} onChange={handleChange} required />
                                            {user.role === "business" && (
                                                <TextField label="Public Key" name="publicKey" value={publicKey} onChange={handleChange} required />
                                            )}
                                            <Button variant="contained" onClick={(e: any) => handleSubmit(e)}>
                                                Create Bot
                                            </Button>
                                        </Stack>

                                        <Typography variant="h6" sx={{ fontWeight: "500", marginBottom: "1rem", marginTop: "1rem" }}>
                                            How to add Redirect{user.role === "business" ? <> and Interaction URL</> : <></>}?
                                        </Typography>
                                        <Stack spacing={1} direction="row" justifyContent={"justify-between"} sx={{ marginTop: "1rem" }}>
                                            <Image src="https://docs.restorecord.com/static/botsetup/redirect_url.png" alt="Redirect URL" width={1920} height={1080} />
                                            {user.role === "business" && (
                                                <Image src="https://docs.restorecord.com/static/botsetup/interaction_url.png" alt="Interaction URL" width={1920} height={1080} />
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Paper>
                            </>
                        )}


                    </CardContent>
                </Paper>
            </Container>

            {/* <div className="xl:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-10 w-full transition-all">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white sm:text-4xl text-2xl font-bold leading-tight">
                        Custom Bots
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
                        Edit and create your custom bots here.
                    </p>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    {(Array.isArray(user.bots) && user.bots.length > 0) && !createNewBot && (
                        <>
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1">
                                    <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                                        Your Bots
                                    </h2>
                                </div>
                                <button className="sm:ml-2 ml-0 transition-all focus:ring-4 font-medium rounded-lg text-sm sm:px-5 px-0 py-2.5 sm:mr-2 mr-0 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white" onClick={(e) => {
                                    setcreateNewBot(true);
                                }}> Create New Bot </button>
                            </div>
                            {user.bots.map((item: any) => {
                                return (
                                    <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700"  key={item.id}>
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{item.name}</h5>
                                        <p className="mb-3 font-normal text-gray-400 whitespace-pre-line">{item.clientId}</p>
                                        <hr className="border-b border-gray-700" />
                                        <div className="sm:flex justify-between items-center mt-4">
                                            <div></div>
                                            <div className="flex items-center flex-col sm:flex-row">
                                                <button className="w-full sm:w-auto btn">
                                                    <a href={`https://discord.com/api/oauth2/authorize?client_id=${item.clientId}&permissions=8&scope=bot`} target="_blank" rel="noreferrer">
                                                        Invite
                                                    </a>
                                                </button>
                                                <button className="w-full sm:w-auto btn" onClick={() => { router.push(`/dashboard/custombots/${item.clientId}`) }}>
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                    
                    {(createNewBot || (Array.isArray(user.bots) && user.bots.length === 0)) && (
                        <>
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1">
                                    <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                                        Create a new Bot 
                                    </h2>
                                </div>
                                {createNewBot && (
                                    <button className="btn ml-2" onClick={(e) => {
                                        setcreateNewBot(false);
                                    }}> Back </button>
                                )}
                            </div>
                            <div className="flex p-4 mb-4 text-sm rounded-lg bg-yellow-200 text-yellow-800" role="alert">
                                <svg className="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                <div>
                                    <span className="font-medium">Warning!</span> To ensure your Bot is working correctly, please set OAuth2 Redirect link to <button className="border-b border-sky-400 hover:border-b-2 transition-all" title="Click to copy" onClick={(e) => {
                                        e.preventDefault();
                                        navigator.clipboard.writeText(`${window.location.origin}/api/callback`);
                                        functions.ToastAlert("Copied to clipboard", "success");
                                    }}>{window.location.origin}/api/callback</button> <button className="text-black font-bold ease-linear transition-all" onClick={(e) => {
                                        e.preventDefault();
                                        window.open(`https://docs.restorecord.com/guides/create-a-custom-bot/#setup-oauth2-redirect`, "_blank");
                                    }}>(Tutorial)</button></div>
                            </div>
                            
                            <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                <form method="POST" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="botName" className="block mb-2 text-sm font-medium text-gray-300">Bot Name</label>
                                        <div className="relative mb-6">
                                            <input onChange={handleChange} required name="botName" type="text" id="botName" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Bot Name" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="clientId" className="block mb-2 text-sm font-medium text-gray-300">Client Id</label>
                                        <div className="relative mb-6">
                                            <input onChange={handleChange} required name="clientId" type="text" id="clientId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" pattern="[0-9]{16-20}" placeholder="Client Id" />
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div>
                                            <label htmlFor="botToken" className="block mb-2 text-sm font-medium text-gray-300">Bot Token</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required name="botToken" type="text" id="botToken" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Bot Token" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="botSecret" className="block mb-2 text-sm font-medium text-gray-300">Client Secret</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required name="botSecret" type="text" id="botSecret" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Client Secret" />
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" className="mt-4 transition-all relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Create
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                </div>
            </div> */}
        </>
    )
}
