import { useRouter } from "next/router";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import functions from "../../src/functions";
import { useToken } from "../../src/token";

export default function DashCustomBot({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const [botName, setbotName] = useState("");
    const [clientId, setclientId] = useState("");
    const [botSecret, setbotSecret] = useState("");
    const [botToken, setbotToken] = useState("");

    const [createNewBot, setcreateNewBot] = useState(false);


    if (!user.username) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
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
                }
            })
            .catch(err => {
                functions.ToastAlert(err, "error");
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
                                    <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                                        Your Bots
                                    </h2>
                                </div>
                                <button className="btn ml-2" onClick={(e) => {
                                    setcreateNewBot(true);
                                }}> Create New Bot </button>
                            </div>
                            {user.bots.map((item: any) => {
                                return (
                                    <>
                                        <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700"  key={item.id}>
                                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{item.name}</h5>
                                            <p className="mb-3 font-normal text-gray-400 whitespace-pre-line">{item.clientId}</p>
                                            <hr className="border-b border-gray-700" />
                                            <div className="flex justify-between items-center mt-4">
                                                <div></div>
                                                <div className="flex items-center">
                                                    <button className="btn" onClick={() => { router.push(`https://discord.com/api/oauth2/authorize?client_id=${item.clientId}&permissions=8&scope=bot`) }}>
                                                        Invite
                                                    </button>
                                                    {/* <button className="btn" onClick={() => { router.push(`/dashboard/settings/${item.clientId}`) }}>
                                                        Edit
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )
                            })}
                        </>
                    )}
                    
                    {(createNewBot || (Array.isArray(user.bots) && user.bots.length === 0)) && (
                        <>
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1">
                                    <h2 className="text-white text-3xl font-bold leading-tight mb-4">
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
            </div>
        </>
    )
}
