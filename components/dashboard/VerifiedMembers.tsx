import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { useToken } from "../../src/token";
import Image from "next/future/image";
import { useQuery } from "react-query";
import getMembers from "../../src/dashboard/getMembers";
import { useEffect, useState } from "react";

export default function VerifiedMembers({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();
    const [serverId, setServerId] = useState("");

    const { data, isError, isLoading, refetch } = useQuery('members', async () => await getMembers({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, serverId), { retry: false });

    if (!user.username || isLoading) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        );
    }

    function handleSelect(e: any) {
        if (e.target.value !== "") {
            // if target value is all then set serverId to null
            setServerId(e.target.value === "all" ? null : e.target.value);
            refetch();
        }
    }



    return (
        <>
            <Toaster />

            <div className="xl:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-10 w-full transition-all">
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
                                
                                {/* <label htmlFor="server" className="font-medium leading-tight flex items-center justify-center h-11">Select a Server</label>
                                <select id="server" onChange={(e) => handleSelect(e)} className="mb-4 sm:ml-2 ml-0 sm:w-52 w-full border text-sm rounded-lg p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="all">All Servers</option>
                                    {Array.isArray(user.servers) && user.servers.map((server: any) => {
                                        return (
                                            <option key={server.id} value={server.guildId}>{server.name}</option>
                                        )
                                    })}
                                </select> */}
                            </>
                        )}
                    </div>

                    {Array.isArray(data.members) && data.members.map((item: any) => {
                        return (
                            <div key={item.id}>
                                <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                    <div className="inline-flex">
                                        {item.avatar.length > 1 ? (
                                            <Image onError={(e) => {
                                            }} placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAACQElEQVR4nO3c25nqIBSGYdxTCOmEdBI7wU5iC1ZArAQswQqci8w8T3bG48Twk8n3XnrDcq1wUCDGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFiajTqA11hrq6qqqmr4YUoppXQ6nVRR/XHWWu99COHySAjBe2+tVYf8V3jvY4wP8/5TjNF7rw5/yX6desowlXNueupHZXDOqb/WQrRt+8bUD9EVHrDWPjPNThFCYH6+zlr73mHnlhgjNRjLln1qcEXm7FODsbnH/VtCCOqvXgDvvST7vbWvi5xzwuz3Vv37QDX4DK13IGqaRp38L03TqJOhkH/lc0uMUZ2M7EoY/Ye0M8G//E1ut9v8jd6hjUewI3a5XPI3et9mI9sZzN0Dylz5CaPKXYC6rjO3+AxhVBTAmFUVYHSgoRDCqHJPPgXOwD3VPJy1B5T8J7AqNsHvAAxRADEKIEYBxFgFfVnFKsgYk1LK3OIzhFHlLkDXdZlbfIYwKgpgzKoKUOYQVOZjMZdy9iN72l1JwTJ0v9/nb/SO0uKZnbVW/dD/p+R/qOYy3z2AV7Vtq06GQjmdQP74f0haPZ/PpoDdsd1udzgctDEoaZdDazySNaI9oVXm+YzcVIdEV3ok9Kr8twTWfjPgp5yrUrJ/XZ5+QPbvmXs+YNx/bKZLk1yLfM17hyOGnd/o3xE0PfU8+FM1TfPqdb4QwoKG+8W8ssw5V9d19c0YU1VVv7+WvnVddzwe1ZECAAAAAAAAAAAAAAAAAAAAAAAAANbiE4Z1TdUWDVTEAAAAAElFTkSuQmCC" loading="lazy" src={`https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}?size=128`} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="Profile Picture" width={64} height={64} />
                                        ) : (
                                            <Image placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAACQElEQVR4nO3c25nqIBSGYdxTCOmEdBI7wU5iC1ZArAQswQqci8w8T3bG48Twk8n3XnrDcq1wUCDGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFiajTqA11hrq6qqqmr4YUoppXQ6nVRR/XHWWu99COHySAjBe2+tVYf8V3jvY4wP8/5TjNF7rw5/yX6desowlXNueupHZXDOqb/WQrRt+8bUD9EVHrDWPjPNThFCYH6+zlr73mHnlhgjNRjLln1qcEXm7FODsbnH/VtCCOqvXgDvvST7vbWvi5xzwuz3Vv37QDX4DK13IGqaRp38L03TqJOhkH/lc0uMUZ2M7EoY/Ye0M8G//E1ut9v8jd6hjUewI3a5XPI3et9mI9sZzN0Dylz5CaPKXYC6rjO3+AxhVBTAmFUVYHSgoRDCqHJPPgXOwD3VPJy1B5T8J7AqNsHvAAxRADEKIEYBxFgFfVnFKsgYk1LK3OIzhFHlLkDXdZlbfIYwKgpgzKoKUOYQVOZjMZdy9iN72l1JwTJ0v9/nb/SO0uKZnbVW/dD/p+R/qOYy3z2AV7Vtq06GQjmdQP74f0haPZ/PpoDdsd1udzgctDEoaZdDazySNaI9oVXm+YzcVIdEV3ok9Kr8twTWfjPgp5yrUrJ/XZ5+QPbvmXs+YNx/bKZLk1yLfM17hyOGnd/o3xE0PfU8+FM1TfPqdb4QwoKG+8W8ssw5V9d19c0YU1VVv7+WvnVddzwe1ZECAAAAAAAAAAAAAAAAAAAAAAAAANbiE4Z1TdUWDVTEAAAAAElFTkSuQmCC" loading="lazy" src={`https://cdn.discordapp.com/embed/avatars/${item.avatar}.png`} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="Profile Picture" width={64} height={64} />
                                        )}
                                        <h5 className="ml-2 text-2xl break-all font-bold tracking-tight text-white flex justify-center items-center">{item.username}</h5>
                                    </div>
                                    <hr className="border-b border-gray-700" />
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center">
                                            <svg className="h-6 w-6 text-gray-400 sm:flex hidden" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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
            </div>
        </>
    );
}
