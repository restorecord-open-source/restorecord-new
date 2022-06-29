import { useRouter } from "next/router";
import { useEffect, useState } from "react"
import { useQuery } from "react-query";
import getUser from "../../src/dashboard/getUser";
import functions from "../../src/functions";
import { useToken } from "../../src/token"


export default function DashSettings({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [serverName, setServerName] = useState("");
    const [guilId, setGuilId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [customBot, setCustomBot] = useState("");


    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });


    if (isError) {
        functions.ToastAlert("Something went wrong.", "error")
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    if (!user || isLoading) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    function handleSubmit(e: any) {
        e.preventDefault();

        if (serverName === "" || guilId === "" || roleId === "" || customBot === "") {
            functions.ToastAlert("Please fill all fields.", "error")
            return;
        }

        

    }

    function handleChange(e: any) {
        switch (e.target.name) {
        case "serverName":
            setServerName(e.target.value);
            break;
        case "guilId":
            setGuilId(e.target.value);
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
            <div className="lg:mx-48 lg:mt-16 md:mt-8 md:mx-24 w-full">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
                            Settings
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
                            Edit your Servers, Backups and much more.
                    </p>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    {Array.isArray(data.servers) && data.servers.length === 0 && (
                        <>
                            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                                Your Servers
                            </h2>
                            {data.servers.map((item: any) => {
                                return (
                                    <>
                                        <div key={item.id}>
                                            <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                                <div className="inline-flex">
                                                    <img className="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 " src={item.picture} alt="Server Image" />
                                                    <h5 className="mb-2 ml-2 text-2xl font-bold tracking-tight text-white">{item.name}</h5>
                                                </div>
                                                <p className="mb-3 font-normal text-gray-400 whitespace-pre-line">{item.description}</p>
                                                <hr className="border-b border-gray-700" />
                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="flex items-center">
                                                        <svg className="h-6 w-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        <span className="ml-2 text-sm text-gray-500">{new Date(item.createdAt).toUTCString()}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button className="ml-2 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800 text-white transition-all;" onClick={
                                                            () => {
                                                                router.push(`/dashboard/settings/${item.guildId}`)
                                                            }
                                                        }>Select</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
                            })}
                        </>
                    )}
                    
                    {Array.isArray(data.servers) && data.servers.length > 0 && (
                        <>
                            <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                                Create new Server
                            </h2>
                            {Array.isArray(data.bots) && data.bots.length === 0 && (
                                <>
                                    <div className="flex p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
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
                                <form method="POST">
                                    <div>
                                        <label htmlFor="serverName" className="block mb-2 text-sm font-medium text-gray-300">Server Name</label>
                                        <div className="relative mb-6">
                                            <input onChange={handleChange} required name="serverName" type="text" id="serverName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Server Name" />
                                        </div>
                                    </div>
                                    <div className="grid gap-6 grid-cols-2">
                                        <div>
                                            <label htmlFor="guildId" className="block mb-2 text-sm font-medium text-gray-300">Guild Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required name="guildId" type="text" id="guildId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" pattern="[0-9]{17}" placeholder="Guild Id" />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="roleId" className="block mb-2 text-sm font-medium text-gray-300">Role Id</label>
                                            <div className="relative mb-6">
                                                <input onChange={handleChange} required name="roleId" type="text" id="roleId" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" pattern="[0-9]{17}" placeholder="Role Id" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="customBot" className="block mb-2 text-sm font-medium text-gray-300">Custom Bot</label>
                                        <select onChange={handleChange} required name="customBot" id="customBot" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                            <option value="" selected disabled>Select a Custom Bot</option>
                                            {Array.isArray(data.bots) && data.bots.length > 0 && data.bots.map((item: any) => {
                                                return (
                                                    <option key={item.id} value={item.id}>{item.name} ({item.clientId})</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <button onClick={handleSubmit} className="mt-4 transition-all relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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

