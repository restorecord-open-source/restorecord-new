import { useQuery } from "react-query";
import getNews from "../../src/dashboard/getNews";
import functions from "../../src/functions";
import { useToken } from "../../src/token"
import dynamic from 'next/dynamic'
import getMembers from "../../src/dashboard/getMembers";
import Image from "next/future/image";
import Link from "next/link";
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });


export default function DashBoard({ user }: any) {
    const [token]: any = useToken();

    const { data, isError, isLoading } = useQuery('news', async () => await getNews({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false });

    const { data: data2, isError: isError2, isLoading: isLoading2 } = useQuery('members', async () => await getMembers({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }), { retry: false });

    if (isLoading || isLoading2) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    if (isError || isError2) {
        functions.ToastAlert("Something went wrong.", "error")
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    const apexChart: any = {
        options: {
            chart: {
                id: 'members',
                type: 'area',
                foreColor: '#fff',
                dropShadow: {
                    enabled: true,
                    top: 0,
                    left: 0,
                    blur: 3,
                    opacity: 0.5
                },
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                colors: ['#3d36b2'],
            },
            legend: {
                horizontalAlign: 'left'
            },
            plotOptions: {
                bar: {
                    columnWidth: '30%',
                    horizontal: false,
                },
            },
            fill: {
                colors: ['#3d36b2'],
            },
            tooltip: {
                theme: 'dark',
            },
            noData: {
                text: 'No data',
            },
            xaxis: {
                labels: {
                    show: false
                },
                tooltip: {
                    enabled: false
                },
                categories: [
                    ...Array.from({ length: 14 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        return date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                        });
                    }).reverse(),
                ]
            },
            yaxis: {
                show: true,
                opposite: true,
                labels: {
                    offsetX: -5,
                    formatter: function (val: any) {
                        return val.toFixed(0);
                    }
                },
            },
            grid: {
                show: false,
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
        },
        series: [
            {
                name: "Verified Members",
                data: [
                    ...Array.from({ length: 14 }, (_, i) => {
                        if (data2) {
                            const date = new Date();
                            date.setDate(date.getDate() - i);
                            return data2.members.filter((member: any) => {
                                const createdAt = new Date(member.createdAt);
                                return createdAt.getDate() === date.getDate() && createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear();
                            }).length;
                        }
                    }).reverse(),
                ]
            }
        ]
    };


    if (!user.username || isLoading) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    return (
        <>
            <div className="sm:mr-28 sm:ml-32 sm:mt-12 ml-6 mr-8 mt-8 w-full">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white sm:text-4xl text-2xl font-bold leading-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
                        Latest news, updates, and statistics.
                    </p>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                        Updates
                    </h2>
                    {Array.isArray(data.news) && data.news.map((item: any) => {
                        return (
                            <>
                                <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700" key={item.id}>
                                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{item.title}</h5>
                                    <p className="mb-3 font-normal text-gray-400 whitespace-pre-line">{item.content}</p>
                                    <hr className="border-b border-gray-700" />
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center">
                                            <svg className="h-6 w-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            <span className="ml-2 text-sm text-gray-500">{new Date(item.createdAt).toUTCString()}</span>
                                            <span style={{borderRight: "2px solid #374151", color: "transparent", marginLeft: "0.5rem"}}>​</span>
                                            <span className="ml-2 text-sm text-gray-500">{item.author}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    })}
                </div>

                <div className="grid lg:grid-cols-2 grid-cols-1 content-start mt-6 gap-4 pb-24">
                    <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                        <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                            Statistics
                        </h2>
                        <p className="text-gray-500 text-base leading-tight">
                            All Members verified within the last 14 days.
                        </p>
                        
                        <Chart options={apexChart.options} series={apexChart.series} type="area" height="425" />
                    </div>

                
                    <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                        <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                            Recent Activity
                        </h2>
                        <p className="text-gray-500 text-base leading-tight mb-6">
                            Last {data2.members.length > 3 ? 3 : data2.members.length} verified members.
                        </p>

                        {Array.isArray(data2.members) && data2.members.map((item: any) => {
                            if (data2.members.indexOf(item) > 2) {
                                return null;
                            }

                            return (
                                <>
                                    <div key={item.userId}>
                                        <div className="mb-6 p-6 rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                            <div className="inline-flex">
                                                {item.avatar.length > 1 ? (
                                                    <Image loading="lazy" src={`https://cdn.discordapp.com/avatars/${item.userId}/${item.avatar}?size=128`} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="Profile Picture" width={64} height={64} />
                                                ) : (
                                                    <Image loading="lazy" src={`https://cdn.discordapp.com/embed/avatars/${item.avatar}.png`} className="w-10 h-10 rounded-full border-2 border-indigo-600" alt="Profile Picture" width={64} height={64} />
                                                )
                                                }
                                                <h5 className="ml-2 text-2xl font-bold tracking-tight text-white flex justify-center items-center">{item.username}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })}

                        {Array.isArray(data2.members) && data2.members.length > 3 && (
                            <Link href="/dashboard/members">
                                <button className=" bg-indigo-600 border-indigo-600 border block w-full rounded-lg p-3 hover:bg-indigo-700 text-white transition-all">
                                    Show More
                                </button>
                            </Link>
                        )}
                    </div>
                </div>


                {/* <div className="max-w-screen p-4 mt-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    <h2 className="text-white sm:text-3xl text-xl font-bold leading-tight mb-4">
                        Recent Activities
                    </h2>
                </div> */}
            </div>
        </>
    )
}