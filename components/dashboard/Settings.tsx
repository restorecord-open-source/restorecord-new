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
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
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

    const [modalGuildId, setModalGuildId] = useState("1");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [createNewServer, setCreateNewServer] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

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
        case "customBot":
            setCustomBot(e.target.value);
            break;
        case "picture":
            setPicture(e.target.value);
            break;
        case "webhook":
            setWebhook(e.target.value);
            break;
        case "description":
            setDescription(e.target.value);
            break;
        case "bgimage":
            setBgimage(e.target.value);
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
                        
                        <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" fullWidth maxWidth="sm">
                            <DialogTitle id="alert-dialog-title">{"Are you sure you?"}
                                <IconButton aria-label="close" onClick={() => setConfirmDelete(false)} sx={{ position: 'absolute', right: 8, top: 8, color: theme.palette.grey[500] }}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    <Typography variant="body1" sx={{ fontWeight: "500", color: theme.palette.error.main }}>
                                        This action cannot be undone.
                                    </Typography>

                                    Deleting this server will remove:
                                    <ul>
                                        <li>All Backups</li>
                                        <li>All Verified Members</li>
                                        <li>All Customized Settings</li>
                                    </ul>
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => {
                                    setConfirmDelete(false);

                                    axios.delete(`/api/v1/server/${modalGuildId}`, { headers: {
                                        "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                    },
                                    validateStatus: () => true
                                    })
                                        .then(res => {
                                            if (!res.data.success) {
                                                setNotiTextE(res.data.message);
                                                setOpenE(true);
                                            }
                                            else {
                                                setNotiTextS(res.data.message);
                                                setOpenS(true);
                                                document.querySelector(`div#server_${modalGuildId}`)?.remove();
                                            }
                                        })
                                        .catch(err => {
                                            setNotiTextE(err.message);
                                            setOpenE(true);
                                            console.error(err);
                                        });
                                } } color="error">
                                    Delete
                                </Button>
                                <Button onClick={() => setConfirmDelete(false)} color="primary" autoFocus>
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {!createNewServer && (Array.isArray(user.servers) && user.servers.length > 0) && (
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
                                                                            setNotiTextE(res.data.message);
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
                                                            <Button variant="contained" color="error" onClick={() => {
                                                                // axios.delete(`/api/v1/server/${item.id}`, { headers: {
                                                                //     "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                                // },
                                                                // validateStatus: () => true
                                                                // })
                                                                //     .then(res => {
                                                                //         if (!res.data.success) {
                                                                //             setNotiTextE(res.data.message);
                                                                //             setOpenE(true);
                                                                //         }
                                                                //         else {
                                                                //             setNotiTextS(res.data.message);
                                                                //             setOpenS(true);
                                                                //         }
                                                                //     })
                                                                //     .catch(err => {
                                                                //         setNotiTextE(err.message);
                                                                //         setOpenE(true);
                                                                //         console.error(err);
                                                                //     });

                                                                setModalGuildId(item.guildId);

                                                                setConfirmDelete(true);
                                                            }
                                                            }>Delete</Button>
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
                                            <TextField label="Role Id" variant="outlined" value={roleId} onChange={(e) => setRoleId(e.target.value)} required />
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

            {/* <Toaster />

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[99999]" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0" >
                        <div className="fixed inset-0 bg-black bg-opacity-50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-900 p-8 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                                        Actions
                                        <button className="absolute top-0 right-0 m-6 text-white" onClick={closeModal}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </Dialog.Title>

                                    <form method="POST" className="mt-4 text-base leading-6 text-gray-400" onSubmit={(e) => {e.preventDefault(); handleSubmit(e, { picture: picture, webhook: webhook, description: description, bgimage: bgimage, guildId: modalGuildId, }, "PATCH")}}>
                                        <div>
                                            <label htmlFor="picture" className="block mb-2 text-sm font-medium text-gray-300">Picture</label>
                                            <div className="relative mb-6">
                                                <input defaultValue={user?.servers?.find((e: any) => e.guildId === modalGuildId)?.picture} required onPaste={handleChange} onChange={handleChange} name="picture" type="text" id="picture" pattern="^https?://i.imgur.com(?:/[^/#?]+)+\.(?:jpg|gif|png|jpeg)$" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="https://i.imgur.com/3Ben2fI.png" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="webhook" className="block mb-2 text-sm font-medium text-gray-300">Webhook Logs (Not available)</label>
                                            <div className="relative mb-6">
                                                <input defaultValue={user?.servers?.find((e: any) => e.guildId === modalGuildId)?.webhook} required onPaste={handleChange} onChange={handleChange} name="webhook" type="text" id="webhook" pattern="^.*(discord|discordapp)\.com\/api\/webhooks\/([\d]+)\/([a-zA-Z0-9_-]+)$" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="https://discordapp.com/api/webhooks/10963827193122..." />
                                            </div>
                                        </div>
                                        {user.role === "business" &&
                                            <>
                                                <div>
                                                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-300">Description</label>
                                                    <div className="relative mb-6">
                                                        <input defaultValue={user?.servers?.find((e: any) => e.guildId === modalGuildId)?.description} required onPaste={handleChange} onChange={handleChange} name="description" type="text" id="description" max={255} maxLength={255} className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Gaming Server for COD and Minecraft" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="bgimage" className="block mb-2 text-sm font-medium text-gray-300">Background Image (Not available)</label>
                                                    <div className="relative mb-6">
                                                        <input defaultValue={user?.servers?.find((e: any) => e.guildId === modalGuildId)?.bgImage} required onPaste={handleChange} onChange={handleChange} name="bgimage" type="text" id="bgimage" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="https://i.imgur.com/5RaXq8u.jpg" />
                                                    </div>
                                                </div>
                                            </>
                                        }
                                        <button type="submit" className="mt-4 transition-all relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Save
                                        </button>
                                    </form>

                                    <button onClick={
                                        () => {
                                            functions.ToastAlert("Please wait, this may take a while depending on the size of your server.", "info");
                                            axios.get(`/api/v1/server/migrate/${modalGuildId}`,
                                                {
                                                    headers: {
                                                        "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
                                                    },
                                                    validateStatus: () => true
                                                })
                                                .then(res => {
                                                    if (!res.data.success) {
                                                        functions.ToastAlert(res.data.message, "error");
                                                    }
                                                    else {
                                                        functions.ToastAlert(res.data.message, "success");
                                                    }
                                                })
                                                .catch(err => {
                                                    console.error(err);
                                                    functions.ToastAlert("", "error");
                                                });
                                        }
                                    } className="mt-4 transition-all relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-500/95 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        Pull Members
                                    </button>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            
            <div className="xl:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-10 w-full transition-all">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white sm:text-4xl text-2xl font-bold leading-tight">
                        Settings
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
                        Edit your Servers, Backups and much more.
                    </p>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    {!createNewServer && (Array.isArray(user.servers) && user.servers.length > 0) && (
                        <>
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1">
                                    <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                                        Your Servers
                                    </h2>
                                </div>
                                <button className="sm:ml-2 ml-0 transition-all focus:ring-4 font-medium rounded-lg text-sm sm:px-5 px-0 py-2.5 sm:mr-2 mr-0 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white" onClick={(e) => {
                                    setCreateNewServer(true);
                                }}> Create New Server
                                </button>
                            </div>
                            {user.servers.map((item: any) => {
                                return (
                                    <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700" key={item.id} id={`server_${item.id}`}>
                                        <div className="inline-flex">
                                            <Image src={item.picture} alt="icon" className="w-10 h-10 rounded-full ring-2 ring-gray-500 p-1 object-cover" width={256} height={256} loading="lazy" />
                                            <h5 className="mb-2 ml-2 text-2xl font-bold tracking-tight text-white">{item.name}</h5>
                                        </div>
                                        <p className="font-normal text-gray-400">{item.description}</p>
                                        <div className="mb-3 font-normal">
                                            Verification URL(s)
                                            <p>
                                                <a target="_blank" rel="noreferrer" href={`${window.location.origin}/verify/${encodeURIComponent(item.name)}`} className="break-all text-sky-400 cursor-pointer hover:text-sky-600 transition-all">{window.location.origin}/verify/{encodeURIComponent(item.name)}</a>
                                            </p>
                                            <p>
                                                <a target="_blank" rel="noreferrer" href={`${window.location.origin}/verify/${encodeURIComponent(item.guildId)}`} className="break-all text-sky-400 cursor-pointer hover:text-sky-600 transition-all">{window.location.origin}/verify/{encodeURIComponent(item.guildId)}</a>
                                            </p>
                                        </div>
                                        <hr className="border-b border-gray-700" />
                                        <div className="sm:flex justify-between items-center mt-4">
                                            <div className="sm:flex hidden items-center">
                                                <svg className="h-6 w-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <span className="ml-2 text-sm text-gray-500">{new Date(item.createdAt).toUTCString()}</span>
                                            </div>
                                            <div className="flex items-center flex-col sm:flex-row">
                                                <button onClick={() => { openModal(); setModalGuildId(item.guildId); }} className="w-full sm:w-auto ml-0 sm:ml-2 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white transition-all">
                                                    Actions
                                                </button>
                                                <button className="w-full sm:w-auto ml-0 sm:ml-2 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white transition-all;" onClick={() => { router.push(`/dashboard/settings/${item.guildId}`)} }>
                                                        Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                    
                    {(createNewServer || (Array.isArray(user.servers) && user.servers.length === 0)) && (
                        <>
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1">
                                    <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                                        Create new Server
                                    </h2>
                                </div>
                                {createNewServer && (
                                    <button className="btn ml-2" onClick={(e) => {
                                        setCreateNewServer(false);
                                    }}> Back </button>
                                )}
                            </div>
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
                                <form method="POST" onSubmit={(e) => {e.preventDefault(); handleSubmit(e, { serverName: serverName, guildId: guildId, roleId: roleId, customBot: customBot })}}>
                                    <div>
                                        <label htmlFor="serverName" className="block mb-2 text-sm font-medium text-gray-300">Server Name</label>
                                        <div className="relative mb-6">
                                            <input onChange={handleChange} onPaste={handleChange} required name="serverName" type="text" id="serverName" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Server Name" />
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div>
                                            <label htmlFor="guildId" className="block mb-2 text-sm font-medium text-gray-300">Server Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} onPaste={handleChange} required name="guildId" type="text" id="guildId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Server Id" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="roleId" className="block mb-2 text-sm font-medium text-gray-300">Role Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} onPaste={handleChange} required name="roleId" type="text" id="roleId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Role Id" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="customBot" className="block mb-2 text-sm font-medium text-gray-300">Custom Bot</label>
                                        <select onChange={handleChange} required name="customBot" id="customBot" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500">
                                            <option value="" selected disabled>Select a Custom Bot</option>
                                            {Array.isArray(user.bots) && user.bots.length > 0 && user.bots.map((item: any) => {
                                                return (
                                                    <option key={item.id} value={item.id}>{item.name} ({item.clientId})</option>
                                                )
                                            })}
                                        </select>
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

