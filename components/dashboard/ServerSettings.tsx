import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useQuery } from "react-query";
import functions from "../../src/functions";
import getServer from "../../src/getServer";
import { useToken } from "../../src/token";

export default function DashServerSettings({ user, id }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [serverName, setServerName] = useState("");
    const [guildId, setGuildId] = useState("");
    const [roleId, setRoleId] = useState("");

    const server = user.servers.find((server: any) => server.guildId === id);

    useEffect(() => {
        if (server) {
            setServerName(server.name);
            setGuildId(server.guildId);
            setRoleId(server.roleId);
        }
    }, [server]);

    if (!user.username) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        fetch(`/api/v1/settings`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": (process.browser && window.localStorage.getItem("token")) ?? token,
            },
            body: JSON.stringify({
                newServerName: serverName,
                newGuildId: guildId,
                newRoleId: roleId,
                
                serverName: server.name,
                guildId: server.guildId,
                roleId: server.roleId,
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    functions.ToastAlert(res.message, "error");
                }
                else {
                    functions.ToastAlert(res.message, "success");
                    router.push("/dashboard/settings");
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
        default:
            break;
        }
    }



    return (
        <>
            <Toaster />
            <div className="lg:mx-32 lg:mt-12 md:mt-8 md:mx-20 w-full">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
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
                                            <label htmlFor="guildId" className="block mb-2 text-sm font-medium text-gray-300">Guild Id</label>
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
                                        Edit
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                                You dont own this server.
                            </h2>
                        </>
                    )}
                            
                                          
                </div>
            </div>
        </>
    )
}

