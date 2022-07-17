import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { useToken } from "../../src/token";
import Image from 'next/image'
import { useQuery } from "react-query";
import getMembers from "../../src/dashboard/getMembers";

export default function DashUpgrade({ user }: any) {
    const [token]: any = useToken();
    const router = useRouter();

    const { data, isError, isLoading } = useQuery('members', async () => await getMembers({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }), { retry: false, refetchOnWindowFocus: false });

    if (!user.username || isLoading) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        );
    }

    return (
        <>
            <Toaster />

            <div className="lg:mx-32 lg:mt-12 md:mt-8 md:mx-20 w-full">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
						Verified Members
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
						View all your verified members.
                    </p>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                        Recent verified Members
                    </h2>
                    {Array.isArray(data.members) && data.members.map((item: any) => {
                        return (
                            <>
                                <div key={item.userId}>
                                    <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                        <div className="inline-flex">
                                            <Image src={`https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}?size=128`} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="Profile Picture" width={64} height={64} />
                                            <h5 className="mb-2 ml-2 text-2xl font-bold tracking-tight text-white flex justify-center items-center">{item.username}</h5>
                                        </div>
                                        <hr className="border-b border-gray-700" />
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center">
                                                <svg className="h-6 w-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <span className="ml-2 text-sm text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                                                <span style={{borderRight: "2px solid #374151", color: "transparent", marginLeft: "0.5rem"}}>​</span>
                                                <span className="ml-2 text-sm text-gray-500">{item.guildName} ({item.guildId})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
