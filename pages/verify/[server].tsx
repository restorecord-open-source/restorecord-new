/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import NavBar from "../../components/landing/NavBar";
import getServer from "../../src/getServer";
import styles from "../../public/styles/index.module.css"
import Link from "next/link";
import Image from "next/future/image";
import Head from "next/head";

export default function Verify({ status, err }: any) {
    const router = useRouter();
    const guildId = router.query.server;
    
    if (!guildId) {
        return (
            <>
                <NavBar />
                <h1 className="text-center">Loading...</h1>
            </>
        )
    }

    const { data, isLoading, error } = useQuery("server", async () => {
        return await getServer(guildId);
    }, { retry: false, refetchOnWindowFocus: false });

    if (isLoading || error) {
        return (
            <>
                <NavBar />
                <h1 className="text-center">Loading...</h1>
            </>
        )
    }

    return (
        <>
            <Head>
                <title>Verify in {guildId}</title>
            </Head>

            <div className="lg:block hidden">
                <NavBar />
            </div>            
            
            {data.success ? (
                <div className={styles.verifyFade}>
                    {err === "403" ? (
                        <div className="flex p-4 mb-4 text-sm rounded-lg bg-red-200 text-red-800" role="alert">
                            <svg className="inline flex-shrink-0 mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                            <div>
                                <span className="font-medium">Error!</span> Seems like this bot hasn&#39;t been setup correctly, please contact the owner telling him the bot is <code className="font-black">Missing Permission</code>
                                <p className="text-blue-500 font-semibold hover:text-blue-400 transition-all"><a target="_blank" href="https://docs.restorecord.com/troubleshooting/missing-permission/" rel="noreferrer">Read More</a></p>
                            </div>
                        </div>
                    ) : (
                        <>
                        </>
                    )}

                    <div className="text-white text-4xl font-bold text-center">
                        {status === "finished" ? (
                            <>
                                You <span className="text-green-400">successfully</span> verified in <span className="text-indigo-600">{data.server.name}</span>
                            </>
                        ) : (
                            <>
                                You&#39;re verifying in <span className="text-indigo-600">{data.server.name}</span>
                            </>
                        )}
                        {/* description */}
                        <p className="text-lg text-gray-600 mt-2">{data.server.description}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-5">
                        <Image src={data.server.picture} width={512} height={512} loading="lazy" className="smx:w-36 smx:h-36 w-24 h-24 rounded-full border-2 border-indigo-600 object-cover" alt="Server Picture" />
                    </div>

                    <div className="smx:pt-6 pt-4">
                        <div className="text-white text-2xl font-bold">
                            {status === "finished" ? (
                                <>
                                </>
                            ) : (
                                <a href={`https://discord.com/oauth2/authorize?client_id=${data.server.clientId}&redirect_uri=${window.location.origin}/api/callback&response_type=code&scope=identify+guilds.join&state=${data.server.guildId}`}>
                                    <button className="focus:ring-4 sm:font-medium font-bold rounded-lg sm:text-sm text-xl px-5 py-2.5 mr-2 mb-2 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-indigo-800 text-white transition-all">
                                        Verify
                                    </button>
                                </a>
                            )}
                            {/* 
                            <button className="focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-red-800 text-white transition-all">
                                Unlink
                            </button> 
                            */}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    <div className="text-white text-4xl font-bold text-center">
                        Server does not exist
                    </div>
                    <button onClick={() => {
                        window.history.back();
                    }} className="transition-all text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-primary-900 my-4">
                        Go Back
                    </button>
                </div>
            )}

            <div className="sticky inset-x-0 p-4 bottom-0 text-center sm:pt-0">
                <div className="text-gray-500 text-medium pt-2 sm:text-sm text-lg">
                    {data.success ? (
                        <>
                            Server created by {data.server.owner} at {new Date(data.server.createdAt).toLocaleString()}
                        </>
                    ) : (
                        <>
                        </>
                    )}
                    <br/>
                    By verifying you agree to the <Link href="/terms" className="text-indigo-600">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-600">Privacy Policy</Link>
                </div>
            </div>
           
        </>
    )
}

export function getServerSideProps({ req }: any) {
    if (req) {
        const cookies = req.headers.cookie ? req.headers.cookie : "";

        // if (cookies.includes("verified=true")) {
        //     return { props: { status: "finished", } }
        // }
        // if (cookies.includes("RC_err=")) {
        //     return { props: { err: cookies.split("RC_err=")[1].split(";")[0] } }
        // }

        return { 
            props: { 
                status: cookies.includes("verified=true") ? "finished" : "verifying",
                err: cookies.includes("RC_err=") ? cookies.split("RC_err=")[1].split(";")[0] : "",
            } 
        }
    }
}
