import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import functions from "../../src/functions";
import { useToken } from "../../src/token";
import Image from "next/future/image";

export default function DashSettings({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [serverName, setServerName] = useState("");
    const [guildId, setGuildId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [customBot, setCustomBot] = useState("");

    const [createNewServer, setCreateNewServer] = useState(false);

    if (!user.username) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v1/settings/server`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                serverName: serverName,
                guildId: guildId,
                roleId: roleId,
                customBot: customBot,
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    functions.ToastAlert(res.message, "error");
                }
                else {
                    functions.ToastAlert(res.message, "success");
                    document.location.reload();
                    // router.push("/dashboard/settings");
                    // setTimeout(() => router.push(`/dashboard/settings/${guildId}`), 1000);
                }
            })
            .catch(err => {
                functions.ToastAlert(err, "error");
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
        default:
            break;
        }
    }

    return (
        <>
            <Toaster />
            
            <div className="sm:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-8 w-full">
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
                                <button className="btn ml-2" onClick={(e) => {
                                    console.log(createNewServer);
                                    setCreateNewServer(true);
                                    console.log(createNewServer);
                                }}> Create New Server
                                </button>
                            </div>
                            {user.servers.map((item: any) => {
                                return (
                                    <>
                                        <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700" key={item.id}>
                                            <div className="inline-flex">
                                                <Image src={item.picture} alt="icon" className="w-10 h-10 rounded-full ring-2 ring-gray-500 p-1" width={48} height={48} loading="lazy" />
                                                <h5 className="mb-2 ml-2 text-2xl font-bold tracking-tight text-white">{item.name}</h5>
                                            </div>
                                            <p className="font-normal text-gray-400">{item.description}</p>
                                            <div className="mb-3 font-normal">
                                                Verification URL(s)
                                                <p>
                                                    <a target="_blank" rel="noreferrer" href={`${window.location.origin}/verify/${encodeURIComponent(item.name)}`} className="text-sky-400 cursor-pointer hover:text-sky-600 transition-all">{window.location.origin}/verify/{encodeURIComponent(item.name)}</a>
                                                </p>
                                                <p>
                                                    <a target="_blank" rel="noreferrer" href={`${window.location.origin}/verify/${encodeURIComponent(item.guildId)}`} className="text-sky-400 cursor-pointer hover:text-sky-600 transition-all">{window.location.origin}/verify/{encodeURIComponent(item.guildId)}</a>
                                                </p>
                                            </div>
                                            <hr className="border-b border-gray-700" />
                                            <div className="flex justify-between items-center mt-4">
                                                <div className="flex items-center">
                                                    <svg className="h-6 w-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    <span className="ml-2 text-sm text-gray-500">{new Date(item.createdAt).toUTCString()}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <button className="ml-2 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white transition-all;" onClick={
                                                        () => {
                                                            functions.ToastAlert("Please wait, this may take a while depending on the size of your server.", "info");
                                                            axios.get(`/api/v1/server/migrate/${item.guildId}`,
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
                                                                    console.log(err);
                                                                    functions.ToastAlert("", "error");
                                                                });
                                                        }
                                                    }>Pull Members</button>
                                                    <button className="ml-2 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white transition-all;" onClick={
                                                        () => {
                                                            router.push(`/dashboard/settings/${item.guildId}`)
                                                        }
                                                    }>Edit</button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
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
                                <form method="POST" onSubmit={handleSubmit}>
                                    <div>
                                        <label htmlFor="serverName" className="block mb-2 text-sm font-medium text-gray-300">Server Name</label>
                                        <div className="relative mb-6">
                                            <input onChange={handleChange} required name="serverName" type="text" id="serverName" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="Server Name" />
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div>
                                            <label htmlFor="guildId" className="block mb-2 text-sm font-medium text-gray-300">Server Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required name="guildId" type="text" id="guildId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" pattern="[0-9]{17-18}" placeholder="Server Id" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="roleId" className="block mb-2 text-sm font-medium text-gray-300">Role Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required name="roleId" type="text" id="roleId" className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" pattern="[0-9]{17-18}" placeholder="Role Id" />
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
            </div>
        </>
    )
}

